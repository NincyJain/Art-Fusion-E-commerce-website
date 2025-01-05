// config/database.js
const mssql = require('msnodesqlv8');

const connectionstr = "Server=.;Database=Art_fusion_e_commerce_site;Trusted_Connection=Yes;Driver={SQL Server}";

// Helper function for executing queries
function executeQuery(query, params) {
    return new Promise((resolve, reject) => {
        mssql.query(connectionstr, query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Test database connection
function testConnection() {
    return new Promise((resolve, reject) => {
        mssql.query(connectionstr, "SELECT 1", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    connectionstr,
    executeQuery,
    testConnection
};