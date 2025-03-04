const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
const allowedTables = ["Adopter", "Station", "Donator", "Animals_Adopt_Shelter", "Donation_Account_Hold",
                       "MedicalRecord_Has", "Lifecare_Volunteer", "Volunteer_Recruit", "Staff_Hire", "TakeCare"];

async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchTableFromDb(tableName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM ${tableName}`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateTables() {
    return await withOracleDB(async (connection) => {
        for (const tableName of allowedTables) {
            try {
                await connection.execute(`DROP TABLE ${tableName}  CASCADE CONSTRAINTS`);
            } catch (err) {
                console.log('Table might not exist, proceeding to create...');
            }
        }

        await connection.execute(`
            CREATE TABLE Adopter (
                email        CHAR(50),
                name         CHAR(50) NOT NULL,
                phone_number CHAR(20) UNIQUE NOT NULL,
                PRIMARY KEY(email)
            )
        `);
        await connection.execute(`
            CREATE TABLE Station (
                address      CHAR(255) PRIMARY KEY,
                max_capacity INT NOT NULL,
                environment  CHAR(255) NOT NULL
            )
        `);
        await connection.execute(`
            CREATE TABLE Animals_Adopt_Shelter (
                aid             INT PRIMARY KEY,
                species         CHAR(40) NOT NULL,
                found_location  CHAR(50) NOT NULL,
                found_date      DATE NOT NULL,
                email           CHAR(50),
                address         CHAR(255),
                FOREIGN KEY (email)   REFERENCES Adopter(email)   ON DELETE SET NULL,
                FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE MedicalRecord_Has (
                recordDate  DATE,
                aid         INT PRIMARY KEY,
                vaccination CHAR(1),
                FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE Staff_Hire (
                email        CHAR(50),
                salary       DECIMAL(10,2) NOT NULL,
                phone_number CHAR(20) UNIQUE NOT NULL,
                name         CHAR(50) NOT NULL,
                address      CHAR(255) NOT NULL,
                PRIMARY KEY(email),
                FOREIGN KEY (address) REFERENCES Station(address) ON DELETE SET NULL
            )
        `);
        await connection.execute(`
            CREATE TABLE Volunteer_Recruit (
                ID                 INT,
                total_working_hours INT NOT NULL,
                name              CHAR(50) NOT NULL,
                schedule          INT,
                address           CHAR(255) NOT NULL,
                PRIMARY KEY(ID),
                FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE Lifecare_Volunteer (
                ID                       INT,
                domain_of_responsibility CHAR(50) NOT NULL,
                PRIMARY KEY(ID),
                FOREIGN KEY (ID) REFERENCES Volunteer_Recruit(ID) ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE Donator (
                DID  INT,
                name CHAR(50) NOT NULL,
                PRIMARY KEY(DID)
            )
        `);
        await connection.execute(`
            CREATE TABLE Donation_Account_Hold (
                accountID      INT PRIMARY KEY,
                balance        INT NOT NULL,
                donation_date  DATE NOT NULL,
                address        CHAR(255),
                FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE TakeCare (
                aid INT NOT NULL,
                ID  INT NOT NULL,
                PRIMARY KEY (aid, ID),
                FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE,
                FOREIGN KEY (ID)  REFERENCES Volunteer_Recruit(ID)      ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    testOracleConnection,
    fetchTableFromDb,
    initiateTables,
    insertDemotable, 
    updateNameDemotable, 
    countDemotable
};