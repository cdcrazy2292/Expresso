const lodash = require('lodash');

const convertBodyToInsertQuery = (body) => {
    let sqlColumns = ``;
    let sqlValues = ``;
    lodash.forEach(body, (value, key) => {
        sqlColumns += ` ${key},`;
        if (typeof value === "number") {
            sqlValues += ` ${value},`;
        } else {
            sqlValues += ` '${value}',`;
        }
    });
    sqlColumns = lodash.trimStart(sqlColumns, ' ');
    sqlColumns = lodash.trimEnd(sqlColumns, ',');
    sqlValues = lodash.trimStart(sqlValues, ' ');
    sqlValues = lodash.trimEnd(sqlValues, ',');
    return {
        sqlColumns: sqlColumns,
        sqlValues: sqlValues
    }
};

const convertBodyToUpdateQuery = (body) => {
    let updateSql = '';
    lodash.forEach(body, (value, key) => {
        if (typeof value === "number") {
            updateSql += ` ${key} = ${value},`;
        } else {
            updateSql += ` ${key} = '${value}',`;
        }
    });
    updateSql = lodash.trimEnd(updateSql, ',');
    return updateSql;
};

module.exports = {
    convertBodyToInsertQuery: convertBodyToInsertQuery,
    convertBodyToUpdateQuery: convertBodyToUpdateQuery
};