// utils/dbHelpers.js
const mssql = require('msnodesqlv8');
const { connectionstr } = require('../config/database');

/**
 * Executes a stored procedure with the given parameters
 * @param {string} procName - Name of the stored procedure
 * @param {Object} params - Parameters for the stored procedure
 * @returns {Promise<Array>} - Results from the stored procedure
 */
function executeStoredProcedure(procName, params) {
    return new Promise((resolve, reject) => {
        let query = `EXEC ${procName} `;
        const paramValues = [];
        
        // Build the parameter string and values array
        Object.entries(params).forEach(([key, value], index) => {
            query += `@${key} = ?, `;
            paramValues.push(value);
        });
        
        // Remove the trailing comma and space
        query = query.slice(0, -2);
        
        mssql.query(connectionstr, query, paramValues, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    executeStoredProcedure
};