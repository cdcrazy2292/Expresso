const express = require('express');
const dbMigration = require('./migration');
const lodash = require('lodash');
const menuApiRouter = express.Router();

const menuTableName = 'Menu';
const menuItemTableName = 'MenuItem';

menuApiRouter.get('/', (req, res) => {
    dbMigration.getAllDataFromTable(menuTableName).then((result) => {
        let data = {
            menus: {}
        };
        data.menus = result;
        res.status(200).json(data);
    }, (err) => {
        console.error(`Error while retrieving menus from ${menuTableName}`, err);
        res.status(500);
    })
});

menuApiRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.status(500).send('ID must be a number');
        return;
    }
    let data = {
        menu: {}
    };

    dbMigration.getAllDataFromTableWithID(menuTableName, id).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send(`menu with id ${id} is not in DB`);
            return;
        }
        data.menu = result;
        res.status(200).json(data);
    }, (err) => {
        console.error(`Error while retrieving menu with id ${id} from ${menuTableName}`, err);
    })
});

menuApiRouter.post('/', (req, res) => {
    let body = req.body;
    if (lodash.isEmpty(body)) {
        res.status(500).send('Body cannot be empty');
        return;
    }
    let data = {
        menu: {}
    };
    dbMigration.addRowToTable(menuTableName, body.menu).then((result) => {
        data.menu = result;
        res.status(201).json(data);
    }, (err) => {
        res.status(400).send(`Could not INSERT row into table. ${err}`);
    });
});

menuApiRouter.put('/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    if (lodash.isEmpty(body) || lodash.isEmpty(body.menu.title)) {
        res.status(400).send('Body cannot be empty');
        return;
    }

    let data = {
        menu: {}
    };

    dbMigration.updateRowWithId(menuTableName, id, body.menu).then((result) => {
        data.menu = result;
        res.status(200).json(data);
    }, (err) => {
        console.error(`Could not update table ${menuTableName} on id ${id}`, err);
        res.status(400).send(`Could not UPDATE row in table ${menuTableName}. ${err}`);
    })
});

menuApiRouter.delete('/:id', (req, res) => {
    let id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    let isMenuLinkedToItem = false;
    let SQL = `DELETE FROM ${menuTableName} WHERE id = ${id}`;
    dbMigration.getAllDataFromTable(menuItemTableName).then((result) => {

        lodash.forEach(result, (each) => {
            if (each.menu_id === id) {
               isMenuLinkedToItem = true;
               return false;
            }
        });

        if (isMenuLinkedToItem) {
            res.status(400).send('Menu is associated with menuItems');
            return;
        }
        dbMigration.runCustomQuery(SQL).then(() => {
            res.status(204).send('Deleted');
        }, (err) => {
            res.status(500).send(err);
        });

    }, (err) => {
        res.status(500).send(err);
    });
});

menuApiRouter.get('/:id/menu-items', (req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }

    let data = {
        menuItems: {}
    };

    let SQL = `SELECT * FROM ${menuItemTableName} WHERE menu_id = ${id}`;

    dbMigration.getAllDataFromCustomQuery(SQL).then((result) => {
        data.menuItems = result;
        if (lodash.isEmpty(result)) {
            res.status(404).json(data);
            return;
        }
        res.status(200).json(data);
    }, (err) => {
        console.error('Error', err);
        res.status(404).send(`Error retrieving meniItems ${err}`);
    });
});

menuApiRouter.post('/:id/menu-items', (req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    let body = req.body;
    body.menuItem.menu_id = id;
    let data = {
        menuItems: {}
    };

    dbMigration.getAllDataFromTableWithID(menuTableName, id).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        dbMigration.addRowToTable(menuItemTableName, body.menuItem).then((result) => {
            data.menuItem = result;
            res.status(201).json(data);
        }, (err) => {
            res.status(400).send(err);
        });
    }, (err) => {
        res.status(404).send(err);
    });
});

menuApiRouter.put('/:id/menu-items/:menuItemId', (req, res) => {
    let menuId = req.params.id;
    let menuItemId = req.params.menuItemId;
    if (isNaN(menuId)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    if (isNaN(menuItemId)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    let body = req.body;

    body.menuItem.id = menuItemId;
    body.menuItem.menu_id = menuId;

    let data = {
        menuItem: {}
    };

    dbMigration.getAllDataFromTableWithID(menuTableName, menuId).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        dbMigration.getAllDataFromTableWithID(menuItemTableName, menuItemId).then((result) => {
            if (lodash.isEmpty(result)) {
                res.status(404).send('Not in DB');
                return;
            }
            if (lodash.isEmpty(body) || !body.menuItem.name ||
                !body.menuItem.inventory ||
                !body.menuItem.price) {
                res.status(400).send('Body cannot be empty');
                return;
            }
            dbMigration.updateRowWithId(menuItemTableName, menuItemId, body.menuItem).then((result) => {
                data.menuItem = result;
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

menuApiRouter.delete('/:id/menu-items/:menuItemId', (req, res) => {
    let menuId = req.params.id;
    let menuItemId = req.params.menuItemId;
    if (isNaN(menuId)) {
        res.status(400).send('Id must be a Number');
        return;
    }
    if (isNaN(menuItemId)) {
        res.status(400).send('Id must be a Number');
        return;
    }

    dbMigration.getAllDataFromTableWithID(menuTableName, menuId).then((result) => {
        if (lodash.isEmpty(result)) {
            res.status(404).send('Not in DB');
            return;
        }
        dbMigration.getAllDataFromTableWithID(menuItemTableName, menuItemId).then((result) => {
            if (lodash.isEmpty(result)) {
                res.status(404).send('Not in DB');
                return;
            }
            let customQuery = `DELETE FROM ${menuItemTableName} WHERE id = ${menuItemId}`;
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

module.exports = menuApiRouter;