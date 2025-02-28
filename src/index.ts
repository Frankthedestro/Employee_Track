import inquirer from "inquirer";
import { pool, connectToDb } from './connection.js';

//I am presented with the following options: view all departments,
//view all roles, view all employees, add a department, add a role,
//add an employee, and update an employee role
function startPrompt(){

inquirer
.prompt([
  {
    type: 'list',
    name: 'action',
    message: 'Select an option',
    choices: [
        'view all departments',
        'view all roles',
        'view all employees',
        'add a department',
        'add a role',
        'add an employee',
        'update an employee role',
        'exit'
    ]
  }
])
.then((answers) => {
  const selectOption = answers.action;
  if (selectOption === 'view all departments'){
    viewDepartments();
  } 
  else if (selectOption === 'view all roles'){
    viewRoles();
  }
  else if (selectOption === 'view all employees'){
    viewEmployees();
  }
  else if (selectOption === 'add a department'){
    addDepartment();
  }
  else if (selectOption === 'add a role'){
    addRole();
  }
  else if (selectOption === 'add an employee'){
    addEmployee();
  }
  else if (selectOption === 'update an employee role'){
    updateEmployee();
  }
  else if (selectOption === 'exit'){
    console.log('Exiting the employee tracker. Hope you enjoyed the free demo.');
    process.exit(0);
  }
});
  
}
//WHEN I choose to view all departments
//THEN I am presented with a formatted table
//showing department names and department ids.
async function viewDepartments() {
  try{
    const printTable = await pool.query('SELECT * FROM department');
    console.log('| ==== DEPARTMENTS ==== |');
    console.table(printTable.rows);

startPrompt();
}
catch (err) {
  console.error('Error when viewing departments:', err);
startPrompt();
  }
}

//WHEN I choose to view all roles
//THEM I am presented with the job title, role id,
//the department that role belongs to,
//and the salary for that role.

async function viewRoles() {
  try{
    const query = 'SELECT r.id, r.title, r.salery, d.name AS department FROM role r JOIN department d ON r.department_id = d.id';

    const printTable = await pool.query(query);

    console.log('| ==== ROLES ==== |');
    console.table(printTable.rows);
startPrompt();
}
catch (err) {
  console.error('Error when viewing Roles:', err);
startPrompt();
  }
}

//WHEN I choose to view all employees
//THEN I am presented with a formatted table showing employee data, 
//including employee ids, first names, last names,
//job titles, departments, salaries, and managers
//that the employees report to.

async function viewEmployees() {
  try{
    const query = 
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, 
    r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e LEFT JOIN role r ON e.role_id = r.id 
    LEFT JOIN department d ON r.department_id = d.id 
    LEFT JOIN employee m ON e.manager_id = m.id`;
    const printTable = await pool.query(query);

    console.log('==== EMPLOYEES ====');
    console.table(printTable.rows);
    startPrompt();
  }
  catch (err) {
    console.error('Error when viewing Employees:', err);
  startPrompt();
    }
  }

//WHEN I choose to add a department
//THEN I am prompted to enter the name 
//of the department and that department is added to the database.

  async function addDepartment() {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'imput',
          name: 'addDepartmentName',
          message: 'Please enter name for department.',
          validate: imput => {
            if (imput.trim() === ''){
              return 'Department has to have a name, dummy'
            }
            return true;
          }
        }
      ]);

      const Departmentname = answers.addDepartmentName;
      await pool.query('INSERT INTO department (name) VALUES ($1)', [Departmentname]);

      console.log(`added ${Departmentname} to departments`);

    startPrompt();
}
catch (err) {
  console.error('Error when viewing Roles:', err);
startPrompt();
  }
}


//WHEN I choose to add a role
//THEN I am prompted to enter the name, salary, 
//and department for the role and that 
//role is added to the database.

async function addRole() {
  try{
    const departmentRec = await pool.query('SELECT * FROM department');
    const departments = departmentRec.rows;

    if (departments.length === 0) {
      console.log('\nYou need to add a department before you can add a role.\n');
      return startPrompt();
}

const answers = await inquirer.prompt([
  {
    type: 'input',
    name: 'title',
    message: 'What is the role title?',
    validate: input => input.trim() !== '' ? true : 'Role title cannot be empty, Boss'
  },
  {
    type: 'input',
    name: 'salary',
    message: 'What is the salary?',
    validate: input => {
      const num = parseFloat(input);
      return !isNaN(num) && num > 0 ? true : 'That is not a salary... try again! (number greater than 0) Remember they have to eat.';
    }
  },
  {
    type: 'list',
    name: 'departmentId',
    message: 'Which department ist this role?',
    choices: departments.map(dept => ({
      name: dept.name,
      value: dept.id
    }))
  }
]);

await pool.query(
  'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
  [answers.title, answers.salary, answers.departmentId]
);

console.log(`Added ${answers.title} role with a salary of $${answers.salary}`);


startPrompt();
} catch (err) {
console.error('Error adding role:', err);
startPrompt();
}

}
//WHEN I choose to add an employee
//THEN I am prompted to enter the employee's first name, last name, 
//role, and manager, and that employee is added to the database.
async function addEmployee() {
  try {
    // Get roles for the selection menu
    const rolesRes = await pool.query('SELECT id, title FROM role');
    const roles = rolesRes.rows;
    
    if (roles.length === 0) {
      console.log('add roles before you can add employees.');
      return startPrompt();
    }
    
    // Grab employees for manager
    const employeesRes = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employees = employeesRes.rows;
    
    // Create manager
    const managerChoices = [
      { name: 'None', value: null },
      ...employees.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }))
    ];
  
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: input => input.trim() !== '' ? true : "Gotta have a first name!"
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is their last name?",
        validate: input => input.trim() !== '' ? true : "Gotta have a last name!"
      },
      {
        type: 'list',
        name: 'roleId',
        message: "What is their role?",
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Who is their manager?",
        choices: managerChoices
      }
    ]);

    await pool.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [answers.firstName, answers.lastName, answers.roleId, answers.managerId]
    );
    
    console.log(`Added ${answers.firstName} ${answers.lastName} to employees`);
    
  
    startPrompt();
  } catch (err) {
    console.error('Error adding employee:', err);
    startPrompt();
  }
}

//WHEN I choose to update an employee role
//THEN I am prompted to select an employee to update and their
//new role and this information is updated in the database.
async function updateEmployee() {
  try {
    // Grab all employees
    const employeesRes = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employees = employeesRes.rows;
    
    if (employees.length === 0) {
      console.log('No employees found. Please hire someone first.');
      return startPrompt();
    }
    
    // Grab roles.
    const rolesRes = await pool.query('SELECT id, title FROM role');
    const roles = rolesRes.rows;
    
    if (roles.length === 0) {
      console.log('No roles found, add some');
      return startPrompt();
    }
  
    // select an employee and a new role.
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee\'s role do you want to update?',
        choices: employees.map(emp => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id
        }))
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Which role are they being assigned?',
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]);
  
    await pool.query(
      'UPDATE employee SET role_id = $1 WHERE id = $2',
      [answers.roleId, answers.employeeId]
    );
  
   
    const employee = employees.find(emp => emp.id === answers.employeeId);
    const role = roles.find(role => role.id === answers.roleId);
    
    console.log(`\nUpdated ${employee.first_name} ${employee.last_name}'s role to ${role.title}\n`);
    
   
    startPrompt();
  } catch (err) {
    console.error('Error updating the employee role:', err);
    startPrompt();
  }
}

startPrompt();
