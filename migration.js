const sqlite3 = require('sqlite3');
const dbHost = process.env.TEST_DATABASE || './database.sqlite';
const utils = require('./utils');
const db = new sqlite3.Database(dbHost, (err) => {
    if (err) {
        console.error(`Error connecting/creating db `, err);
        return;
    }
    console.log(`sqLite connected to ${dbHost} successfully`);
});

/*************************************************
 *  USING PROMISES FOR BETTER ERROR HANDLING     *
 *  SINCE CALLS TO DB ARE ASYNC                  *
 * ***********************************************/
const createNewTable = (tableName, tableSchema) => {

    return new Promise((resolve, reject) => {
        console.info(`Creating ${tableName} table`);
        if (!tableSchema) {
            reject('Table Schema is Missing');
            return;
        }
        const SQL = ` CREATE TABLE IF NOT EXISTS ${tableName} ` + (tableSchema || ' ');
        // console.log('SQL: ', SQL);

        db.run(SQL, (err) => {
            if (err) {
                console.error(`Error creating table ${tableName}`, err);
                reject(err);
            }
            console.log(`Table ${tableName} has been created successfully`);
            resolve(1);
        });
    });

};

const getAllDataFromTable = (tableName, sqlCondition) => {
    return new Promise((resolve, reject) => {
        let SQL = `SELECT * 
                  FROM ${tableName} ` +
            (sqlCondition || '') + ';';

        db.all(SQL, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });

    });
};

const getAllDataFromTableWithID = (tableName, id) => {
    return new Promise((resolve, reject) => {
        let SQL = `SELECT * 
                   FROM ${tableName} 
                   WHERE id = ${id}`;
        db.each(SQL, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        }, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

const addRowToTable = (tableName, body) => {
    let schema = utils.convertBodyToInsertQuery(body);
    let SQL = `INSERT INTO ${tableName} (${schema.sqlColumns}) VALUES (${schema.sqlValues});`;

    return new Promise((resolve, reject) => {
        db.run(SQL, function (err) {
            if (err) {
                reject(err);
                return;
            }
            db.get(`SELECT * FROM ${tableName} WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });

        });
    })
};

const updateRowWithId = (tableName, id, body) => {

    let updateSql = utils.convertBodyToUpdateQuery(body);
    let SQL = `UPDATE ${tableName}
               SET ${updateSql} 
               WHERE id = ${id}`;

    return new Promise((resolve, reject) => {
       db.run(SQL, function (err) {
           if (err) {
               reject(err);
               return;
           }
           db.get(`SELECT * FROM ${tableName} WHERE id = ${id}`, (err, row) => {
               if (err) {
                   reject(err);
                   return;
               }
               resolve(row);
           });
       })
    })
};

const runCustomQuery = (SQL) => {
  return new Promise((resolve, reject) => {
      db.run(SQL, function (err) {
          if (err) {
              console.error(err);
              reject(err);
              return;
          }
          resolve(this);
      });
  });
};

const getAllDataFromCustomQuery = (SQL) => {
    return new Promise((resolve, reject) => {
       db.all(SQL, (err, rows) => {
           if (err) {
               reject(err);
               return;
           }
           resolve(rows);
       });
    });
};

module.exports = {
    createNewTable: createNewTable,
    getAllDataFromTable: getAllDataFromTable,
    getAllDataFromTableWithID: getAllDataFromTableWithID,
    addRowToTable: addRowToTable,
    updateRowWithId: updateRowWithId,
    runCustomQuery: runCustomQuery,
    getAllDataFromCustomQuery: getAllDataFromCustomQuery
};