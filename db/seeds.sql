
--seed data for DB--

INSERT INTO department (name)
VALUES 
('HR'),
('Engeneering'),
('Finance'),
('Legal');

INSERT INTO role (title, salary, department_id)
VALUES 
('HR Lead', 180000, 1),
('HR Assistant', 80000, 1),
('Lead Engineer', 170000, 2),
('Engineer', 150000, 2),
('Junior Engineer', 100000, 2),
('Accountant Manager', 120000, 3),
('Accountant', 100000, 3),
('The Law Man', 7438055, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Liddy', 'Gate', 8, null),
('James', 'Allyoucaneat', 6, null),
('Ima', 'Robert', 7, 2),
('Robert', 'Builder', 3, null),
('Bob', 'Robertson', 4, 4),
('Bobbert', 'Robertsonson', 5, 5),
('Polly', 'Correct', 1, null),
('howard', 'Bethyname', 2, 1);

