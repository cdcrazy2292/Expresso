const express = require('express');
const dbMigration = require('./migration');
const lodash = require('lodash');
const employeeApiRouter = express.Router();

const employeeTableName = 'Employee';
const timesheetsTableName = 'Timesheet';

employeeApiRouter.get('/', (req, res) => {

    let sqlCondition = `WHERE is_current_employee =1`;
    dbMigration.getAllDataFromTable(employeeTableName, sqlCondition).then((result) => {
        let data = {
            employees: {}
        };
        data.employees = result;
        res.status(200).json(data);
    }, (err) => {
        console.error(`Error Retrieving all data from ${employeeTableName}`, err);
        res.status(500);
    })
});

employeeApiRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    let data = {
        employee: {}
    };
    if (isNaN(id)) {
        res.status(500).send('Id must be a Number');
        return;
    }
    dbMigration.getAllDataFromTableWithID(employeeTableName, id).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        data.employee = result;
        res.status(200).json(data);
    }, (err) => {
        console.error(`Error while getting data from ${employeeTableName} with id: ${id}`, err);
        res.status(500);
    });
});

employeeApiRouter.post('/', (req, res) => {
    let body = req.body;
    if (lodash.isEmpty(body)) {
        res.status(500).send('Body cannot be empty');
        return;
    }
    let data = {
        employee: {}
    };
    dbMigration.addRowToTable(employeeTableName, body.employee).then((result) => {
        data.employee = result;
        res.status(201).json(data);
    }, (err) => {
        res.status(400).send(`Could not INSERT row into table. ${err}`);
    });
});

employeeApiRouter.put('/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    if (lodash.isEmpty(body) || lodash.isEmpty(body.employee.name) || lodash.isEmpty(body.employee.position) ||
        lodash.isEmpty(lodash.toString(body.employee.wage))) {
        res.status(400).send('Body cannot be empty');
        return;
    }

    let data = {
        employee: {}
    };

    dbMigration.updateRowWithId(employeeTableName, id, body.employee).then((result) => {
        data.employee = result;
        res.status(200).json(data);
    }, (err) => {
        console.error(`Could not update table ${employeeTableName} on id ${id}`, err);
        res.status(400).send(`Could not UPDATE row in table ${employeeTableName}. ${err}`);
    })
});

employeeApiRouter.delete('/:id', (req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }

    let data = {
        employee: {}
    };

    let SQL = `UPDATE ${employeeTableName} SET is_current_employee = 0 WHERE id = ${id}`;

    dbMigration.runCustomQuery(SQL).then(() => {
        dbMigration.getAllDataFromTableWithID(employeeTableName, id).then((result) => {
            data.employee = result;
            res.status(200).json(data);
        }, (err) => {
            console.error(`Could not retrieve deleted row with id ${id}`, err);
            res.status(400).send(err);
        });
    }, (err) => {
        console.error(`Could not delete row with id ${id}`, err);
        res.status(400).send(err);
    })
});

employeeApiRouter.get('/:id/timesheets', (req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }

    let data = {
        timesheets: {}
    };

    let SQL = `SELECT * FROM ${timesheetsTableName} WHERE employee_id = ${id}`;

    dbMigration.getAllDataFromCustomQuery(SQL).then((result) => {
        data.timesheets = result;
        if (lodash.isEmpty(result)) {
            res.status(404).json(data);
            return;
        }
        res.status(200).json(data);
    }, (err) => {
        console.error('Error', err);
        res.status(404).send(`Error retrieving timesheets ${err}`);
    });
});

employeeApiRouter.post('/:id/timesheets', (req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    let body = req.body;
    body.timesheet.employee_id = id;
    let data = {
        timesheet: {}
    };

    dbMigration.getAllDataFromTableWithID(employeeTableName, id).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        dbMigration.addRowToTable(timesheetsTableName, body.timesheet).then((result) => {
            data.timesheet = result;
            res.status(201).json(data);
        }, (err) => {
            res.status(400).send(err);
        });
    }, (err) => {
        res.status(404).send(err);
    });
});

employeeApiRouter.put('/:id/timesheets/:timesheetId', (req, res) => {
    let employeeId = req.params.id;
    let timesheetId = req.params.timesheetId;
    if (isNaN(employeeId)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    if (isNaN(timesheetId)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    let body = req.body;

    body.timesheet.id = timesheetId;
    body.timesheet.employee_id = employeeId;

    let data = {
        timesheet: {}
    };

    dbMigration.getAllDataFromTableWithID(employeeTableName, employeeId).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        dbMigration.getAllDataFromTableWithID(timesheetsTableName, timesheetId).then((result) => {
            if (lodash.isEmpty(result)) {
                res.status(404).send('Not in DB');
                return;
            }
            if (lodash.isEmpty(body) || !body.timesheet.hours ||
                !body.timesheet.rate ||
                !body.timesheet.date) {
                res.status(400).send('Body cannot be empty');
                return;
            }
            dbMigration.updateRowWithId(timesheetsTableName, timesheetId, body.timesheet).then((result) => {
                data.timesheet = result;
                res.status(200).json(data);
            }, (err) => {
                res.status(404).send(err);
            });
        }, (err) => {
            res.status(404).send(err);
        });
    }, (err) => {
        res.status(404).send(err);
    });
});

employeeApiRouter.delete('/:id/timesheets/:timesheetId', (req, res) => {
    let employeeId = req.params.id;
    let timesheetId = req.params.timesheetId;
    if (isNaN(employeeId)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    if (isNaN(timesheetId)) {
        res.status(400).send('Id must be a Number');
        return;
    }

    dbMigration.getAllDataFromTableWithID(employeeTableName, employeeId).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        dbMigration.getAllDataFromTableWithID(timesheetsTableName, timesheetId).then((result) => {
            if (lodash.isEmpty(result)) {
                res.status(404).send('Not in DB');
                return;
            }
            let customQuery = `DELETE FROM ${timesheetsTableName} WHERE id = ${timesheetId}`;
            dbMigration.runCustomQuery(customQuery).then(() => {
                res.status(204).send('Deleted');
            }, (err) => {
                res.stat(500).send(err);
            })
        }, (err) => {
            res.status(500).send(err);
        });
    }, (err) => {
            res.status(500).send(err);
    });
});

module.exports = employeeApiRouter;