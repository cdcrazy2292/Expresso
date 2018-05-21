const express = require('express');
const dbMigration = require('./migration');

const createTablesRouter = express.Router();

const employeeTableName = 'Employee';
const employeeTableSchema = `(
                              id INTEGER NOT NULL DEFAULT 1  PRIMARY KEY AUTOINCREMENT,
                              name TEXT NOT NULL, 
                              position TEXT NOT NULL,
                              wage INTEGER NOT NULL,
                              is_current_employee INTEGER DEFAULT 1
                              )`;
const timesheetTableName = 'Timesheet';
const timesheetSchema = `(
                          id INTEGER NOT NULL DEFAULT 1  PRIMARY KEY AUTOINCREMENT,
                          hours INTEGER NOT NULL,
                          rate INTEGER NOT NULL,
                          date INTEGER NOT NULL,
                          employee_id INTEGER NOT NULL,
                          FOREIGN KEY (employee_id) REFERENCES Employee(id)
                         )`;
const menuTableName = 'Menu';
const menuTableSchema = `(
                          id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY AUTOINCREMENT,
                          title TEXT NOT NULL
                          )`;
const menuItemTableName = 'MenuItem';
const menuItemTableSchema = `(
                              id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY AUTOINCREMENT,
                              name TEXT NOT NULL,
                              description TEXT, 
                              inventory INTEGER NOT NULL,
                              price INTEGER NOT NULL,
                              menu_id INTEGER NOT NULL, 
                              FOREIGN KEY (menu_id) REFERENCES Menu(id)
                              )`;


createTablesRouter.get('/', (req, res) => {

    dbMigration.createNewTable(employeeTableName, employeeTableSchema)
        .then(() => {
            console.log(`${employeeTableName} has been added to DB`);
            res.status(200);
        }, (rejection) => {
            console.error(`Something went wrong when creating ${employeeTableName}`, rejection);
            res.status(500);
        });

    dbMigration.createNewTable(timesheetTableName, timesheetSchema)
        .then(() => {
            console.log(`${timesheetTableName} has been added to DB`);
            res.status(200);
        }, (rejection) => {
            console.error(`Something went wrong when creating ${timesheetTableName}`, rejection);
            res.status(500);
        });

    dbMigration.createNewTable(menuTableName, menuTableSchema)
        .then(() => {
            console.log(`${menuTableName} has been added to DB`);
            res.status(200);
        }, (rejection) => {
            console.error(`Something went wrong when creating ${menuTableName}`, rejection);
            res.status(500);
        });

    dbMigration.createNewTable(menuItemTableName, menuItemTableSchema)
        .then(() => {
            console.log(`${menuItemTableName} has been added to DB`);
            res.status(200);
        }, (rejection) => {
            console.error(`Something went wrong when creating ${menuTableName}`, rejection);
            res.status(500);
        });

});

module.exports = createTablesRouter;