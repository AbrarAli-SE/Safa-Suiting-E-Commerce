CREATE TABLE employees ( 
    employee_id NUMBER, 
    first_name VARCHAR2(100), 
    last_name VARCHAR2(100), 
    job_id VARCHAR2(50), 
    salary NUMBER, 
    department_id NUMBER 
); 

desc employees;


NSERT INTO employees (employee_id, first_name, last_name, job_id, 
salary, department_id) VALUES (101, 'Alice', 'Borland', 'ST_CLERK', 
1500, 10); 
    
INSERT INTO employees (employee_id, first_name, last_name, job_id, 
salary, department_id) VALUES (102, 'Saad', 'Ali', 'ST_CLERK', 1400, 
20); 
    
INSERT INTO employees (employee_id, first_name, last_name, job_id, 
salary, department_id) VALUES (103, 'Squid', 'Game', 'IT_PROG', 2000, 
10); 
    
INSERT INTO employees (employee_id, first_name, last_name, job_id, 
salary, department_id) VALUES (104, 'Shan', 'Ali', 'IT_PROG', 2200, 
20); 
    
INSERT INTO employees (employee_id, first_name, last_name, job_id, 
salary, department_id) VALUES (105, 'Eve', 'Brown', 'HR_REP', 1800, 30); 

SELECT  
first_name,  
job_id,  
LENGTH(first_name) AS name_length,  
INSTR(first_name, 'M') AS position_of_M 
FROM  
employees 
WHERE  
job_id = 'ST_CLERK'; 






SELECT  
UPPER(first_name || ' ' || last_name) AS name_uppercase, 
LOWER(first_name || ' ' || last_name) AS name_lowercase, 
INITCAP(first_name || ' ' || last_name) AS name_initcap 
FROM  
employees; 






SELECT  
employee_id, 
first_name || ' ' || last_name AS full_name, 
salary, 
ROUND(salary * 1.15) AS "New Salary" 
FROM  
employees; 



ALTER TABLE employees ADD (Hire_Date DATE);


UPDATE employees SET hire_date = TO_DATE('2021-01-10', 'YYYY-MM-DD') 
WHERE employee_id = 101; 
 
UPDATE employees SET hire_date = TO_DATE('2020-05-15', 'YYYY-MM-DD') 
WHERE employee_id = 102; 
 
UPDATE employees SET hire_date = TO_DATE('2019-08-20', 'YYYY-MM-DD') 
WHERE employee_id = 103; 
 
UPDATE employees SET hire_date = TO_DATE('2018-11-25', 'YYYY-MM-DD') 
WHERE employee_id = 104; 
 
UPDATE employees SET hire_date = TO_DATE('2017-12-30', 'YYYY-MM-DD') 
WHERE employee_id = 105; 

ALTER TABLE employees ADD (COMMISSION_PCT NUMBER);


UPDATE employees SET commission_pct = 10 WHERE employee_id = 101; 
 
UPDATE employees SET commission_pct = 15 WHERE employee_id = 102; 
 
UPDATE employees SET commission_pct = NULL WHERE employee_id = 103; 
 
UPDATE employees SET commission_pct = 20 WHERE employee_id = 104; 
 
UPDATE employees SET commission_pct = NULL WHERE employee_id = 105;





SELECT  
first_name || ' ' || last_name AS full_name, 
CEIL(MONTHS_BETWEEN(SYSDATE, hire_date)) AS MONTHS_WORKED 
FROM  
employees 
ORDER BY  
MONTHS_WORKED DESC;




SELECT 
first_name || ' ' || last_name AS full_name, 
NVL(TO_CHAR(commission_pct), '99') AS commission_pct 
FROM  
employees;









task 2 

-- 2. Determine the number of managers without listing them
-- Assuming managers are employees with JOB_ID like '%MGR%' or supervisory roles
-- Since no explicit MANAGER_ID, I'll count distinct JOB_IDs as a proxy
SELECT COUNT(DISTINCT JOB_ID) AS "Number of Managers"
FROM employees;

-- 3. Difference between highest and lowest salaries
SELECT MAX(SALARY) - MIN(SALARY) AS "DIFFERENCE"
FROM employees;

-- 4. Highest, lowest, sum, and average salary of all employees
SELECT 
    MAX(SALARY) AS "Maximum",
    MIN(SALARY) AS "Minimum",
    SUM(SALARY) AS "Sum",
    ROUND(AVG(SALARY), 2) AS "Average"
FROM employees;

-- 5. Min, max, sum, and average salary for each job type
SELECT 
    JOB_ID,
    MAX(SALARY) AS "Maximum",
    MIN(SALARY) AS "Minimum",
    SUM(SALARY) AS "Sum",
    ROUND(AVG(SALARY), 2) AS "Average"
FROM employees
GROUP BY JOB_ID;

-- 6. Number of people with the same job
SELECT 
    JOB_ID,
    COUNT(*) AS "Number of Employees"
FROM employees
GROUP BY JOB_ID;

task 3


CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL,
    location_id INT NOT NULL
);



INSERT INTO departments (department_id, department_name, location_id) 
VALUES (10, 'Administration', 1500);

INSERT INTO departments (department_id, department_name, location_id) 
VALUES (20, 'Marketing', 1600);

INSERT INTO departments (department_id, department_name, location_id) 
VALUES (30, 'Human Resources', 1700);

INSERT INTO departments (department_id, department_name, location_id) 
VALUES (40, 'Finance', 1800);

INSERT INTO departments (department_id, department_name, location_id) 
VALUES (50, 'Executive', 1900);

INSERT INTO departments (department_id, department_name, location_id) 
VALUES (60, 'Sales', 2000);


SELECT employee_id, last_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary ASC;


SELECT DISTINCT e.employee_id, e.last_name
FROM employees e
WHERE e.department_id IN (
    SELECT DISTINCT e1.department_id
    FROM employees e1
    WHERE e1.last_name LIKE '%u%'
);


SELECT e.last_name, e.department_id, e.job_id
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE d.location_id = 1700;


SELECT e.last_name, e.salary
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id
WHERE m.last_name = 'King';



SELECT e.department_id, e.last_name, e.job_id
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE d.department_name = 'Executive';



QUIZ No 1 


SELECT * FROM Employees WHERE LAST_Name LIKE '%aa%';



SELECT FIRST_NAME, LAST_NAME
FROM EMPLOYEES
WHERE SALARY > (SELECT MAX(SALARY) 
FROM EMPLOYEES 
WHERE LAST_NAME LIKE '%aa%');



SELECT MAX(SALARY) AS SECOND_HIGHEST_SALARY
FROM EMPLOYEES
WHERE SALARY < (SELECT MAX(SALARY) FROM EMPLOYEES);


SELECT FIRST_NAME, LAST_NAME, JOB_ID
FROM EMPLOYEES
WHERE SALARY BETWEEN 10000 AND 15000
ORDER BY LAST_NAME DESC, FIRST_NAME DESC;


SELECT LAST_NAME, JOB_ID, SALARY
FROM EMPLOYEES
WHERE LAST_NAME IN ('Sully', 'Taylor')
AND SALARY NOT IN (2600, 3900, 3100);

SELECT MANAGER_ID, MIN(SALARY) AS MIN_SALARY
FROM EMPLOYEES
WHERE MANAGER_ID IN (122, 123, 124)
GROUP BY MANAGER_ID
HAVING MIN(SALARY) > 2200
ORDER BY MIN_SALARY DESC;


SELECT LAST_NAME || ', ' || FIRST_NAME AS FULL_NAME, 
       JOB_ID AS JOB, 
       SALARY
FROM EMPLOYEES
WHERE JOB_ID IN ('SA_REP', 'ST_CLERK')
AND SALARY NOT IN (2500, 3500, 7000);


SELECT FIRST_NAME, EMPLOYEE_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN (100, 110)
ORDER BY FIRST_NAME DESC;


SELECT UPPER(LAST_NAME) AS ALL_CAPS,
       LOWER(LAST_NAME) AS ALL_SMALL,
       INITCAP(LAST_NAME) AS FIRST_CAP
FROM EMPLOYEES;


SELECT AVG(SALARY) AS AVG_SALARY,
       MIN(SALARY) AS MIN_SALARY
FROM EMPLOYEES
WHERE SALARY BETWEEN 5000 AND 10000;