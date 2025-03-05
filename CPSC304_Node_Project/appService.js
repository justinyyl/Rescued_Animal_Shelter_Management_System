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
                await connection.execute(`DROP TABLE ${tableName} CASCADE CONSTRAINTS`);
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

// Inserts a new Adopter record.
async function insertAdopter(email, name, phone_number) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO ADOPTER (email, name, phone_number) VALUES (:email, :name, :phone_number)`,
      [email, name, phone_number],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Station record.
async function insertStation(address, max_capacity, environment) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO STATION (address, max_capacity, environment) VALUES (:address, :max_capacity, :environment)`,
      [address, max_capacity, environment],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Donator record.
async function insertDonator(DID, name) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO DONATOR (DID, name) VALUES (:DID, :name)`,
      [DID, name],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Animals_Adopt_Shelter record.
async function insertAnimalsAdoptShelter(aid, species, found_location, found_date, email, address) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO ANIMALS_ADOPT_SHELTER (aid, species, found_location, found_date, email, address)
       VALUES (:aid, :species, :found_location, :found_date, :email, :address)`,
      [aid, species, found_location, found_date, email, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Donation_Account_Hold record.
async function insertDonationAccountHold(accountID, balance, donation_date, address) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO DONATION_ACCOUNT_HOLD (accountID, balance, donation_date, address)
       VALUES (:accountID, :balance, :donation_date, :address)`,
      [accountID, balance, donation_date, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new MedicalRecord_Has record.
async function insertMedicalRecordHas(recordDate, aid, vaccination) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO MEDICALRECORD_HAS (recordDate, aid, vaccination)
       VALUES (:recordDate, :aid, :vaccination)`,
      [recordDate, aid, vaccination],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Volunteer_Recruit record.
async function insertVolunteerRecruit(ID, total_working_hours, name, schedule, address) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO VOLUNTEER_RECRUIT (ID, total_working_hours, name, schedule, address)
       VALUES (:ID, :total_working_hours, :name, :schedule, :address)`,
      [ID, total_working_hours, name, schedule, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Lifecare_Volunteer record.
async function insertLifecareVolunteer(ID, domain_of_responsibility) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO LIFECARE_VOLUNTEER (ID, domain_of_responsibility)
       VALUES (:ID, :domain_of_responsibility)`,
      [ID, domain_of_responsibility],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new Staff_Hire record.
async function insertStaffHire(email, salary, phone_number, name, address) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO STAFF_HIRE (email, salary, phone_number, name, address)
       VALUES (:email, :salary, :phone_number, :name, :address)`,
      [email, salary, phone_number, name, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Inserts a new TakeCare record.
async function insertTakeCare(aid, ID) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO TAKECARE (aid, ID)
       VALUES (:aid, :ID)`,
      [aid, ID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
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
  updateNameDemotable,
  countDemotable,
  insertAdopter,
  insertStation,
  insertDonator,
  insertAnimalsAdoptShelter,
  insertDonationAccountHold,
  insertMedicalRecordHas,
  insertVolunteerRecruit,
  insertLifecareVolunteer,
  insertStaffHire,
  insertTakeCare
};