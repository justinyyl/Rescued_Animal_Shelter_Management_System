// appService.js
const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');


const dbConfig = {
  user: envVariables.ORACLE_USER,
  password: envVariables.ORACLE_PASS,
  connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
  poolMin: 1,
  poolMax: 3,
  poolIncrement: 1,
  poolTimeout: 60
};


async function initializeConnectionPool() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Connection pool started');
  } catch (err) {
    console.error('Initialization error:', err.message);
  }
}


async function closePoolAndExit() {
  console.log('\nTerminating');
  try {
    await oracledb.getPool().close(10);
    console.log('Pool closed');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

initializeConnectionPool();
process.once('SIGTERM', closePoolAndExit).once('SIGINT', closePoolAndExit);


async function withOracleDB(action) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    return await action(connection);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error(closeErr);
      }
    }
  }
}


async function testOracleConnection() {
  return await withOracleDB(async () => true).catch(() => false);
}

//
async function fetchTableFromDb(tableName) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(`SELECT * FROM ${tableName}`);
    return result.rows;
  }).catch(() => []);
}

 
const allowedTables = [
  "TakeCare",
  "MedicalRecord_Has",
  "Lifecare_Volunteer",
  "Animals_Adopt_Shelter",
  "Volunteer_Recruit",
  "Donation_Account_Hold",
  "Staff_Hire",
  "Donator",
  "Station",
  "Adopter"
];

async function initiateTables() {
  return await withOracleDB(async (conn) => {
    // 1) Drop existing tables
    for (const tableName of allowedTables) {
      try {
        await conn.execute(`DROP TABLE ${tableName} CASCADE CONSTRAINTS`);
      } catch (err) {
        console.log(`[initiateTables] Table ${tableName} may not exist. Skipping drop.`);
      }
    }

    // 2) Create parent tables first
    await conn.execute(`
      CREATE TABLE Adopter (
          email        CHAR(50),
          name         CHAR(50) NOT NULL,
          phone_number CHAR(20) UNIQUE NOT NULL,
          PRIMARY KEY(email)
      )
    `);

    await conn.execute(`
      CREATE TABLE Station (
          address      CHAR(255) PRIMARY KEY,
          max_capacity INT NOT NULL,
          environment  CHAR(255) NOT NULL
      )
    `);

    await conn.execute(`
      CREATE TABLE Donator (
          DID  INT,
          name CHAR(50) NOT NULL,
          PRIMARY KEY(DID)
      )
    `);

    await conn.execute(`
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

    await conn.execute(`
      CREATE TABLE Donation_Account_Hold (
          accountID      INT PRIMARY KEY,
          balance        INT NOT NULL,
          donation_date  DATE NOT NULL,
          address        CHAR(255),
          FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
      )
    `);

    await conn.execute(`
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

    await conn.execute(`
      CREATE TABLE Lifecare_Volunteer (
          ID                       INT,
          domain_of_responsibility CHAR(50) NOT NULL,
          PRIMARY KEY(ID),
          FOREIGN KEY (ID) REFERENCES Volunteer_Recruit(ID) ON DELETE CASCADE
      )
    `);

    await conn.execute(`
      CREATE TABLE MedicalRecord_Has (
          recordDate  DATE,
          aid         INT PRIMARY KEY,
          vaccination CHAR(1),
          FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE
      )
    `);

    await conn.execute(`
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

    await conn.execute(`
      CREATE TABLE TakeCare (
          aid INT NOT NULL,
          ID  INT NOT NULL,
          PRIMARY KEY (aid, ID),
          FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE,
          FOREIGN KEY (ID)  REFERENCES Volunteer_Recruit(ID) ON DELETE CASCADE
      )
    `);

    await conn.commit();
    console.log("[initiateTables] All tables created successfully!");
    return true;
  }).catch((err) => {
    console.error("[initiateTables] Error initiating tables:", err);
    return false;
  });
}

// --------------------------------------------------
// D) Insert Operations

// Adopter
async function insertAdopter(email, name, phone_number) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Adopter (email, name, phone_number)
       VALUES (:email, :name, :phone_number)`,
      [email, name, phone_number],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Station
async function insertStation(address, max_capacity, environment) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Station (address, max_capacity, environment)
       VALUES (:address, :max_capacity, :environment)`,
      [address, max_capacity, environment],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Donator
async function insertDonator(DID, name) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Donator (DID, name)
       VALUES (:DID, :name)`,
      [DID, name],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Animals_Adopt_Shelter
async function insertAnimalsAdoptShelter(aid, species, found_location, found_date, email, address) {
  return await withOracleDB(async (conn) => {
    // const dateValue = new Date(found_date);
    // const date = dateValue.toISOString().slice(0, 19).replace('T', ' ');
    const result = await conn.execute(
      `INSERT INTO Animals_Adopt_Shelter (aid, species, found_location, found_date, email, address)
       VALUES (:aid, :species, :found_location, TO_DATE(:found_date, 'YYYY-MM-DD'), :email, :address)`,
      [aid, species,found_location,found_date, email, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Donation_Account_Hold
async function insertDonationAccountHold(accountID, balance, donation_date, address) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
       VALUES (:accountID, :balance, :donation_date, :address)`,
      [accountID, balance, donation_date, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Volunteer_Recruit
async function insertVolunteerRecruit(ID, total_working_hours, name, schedule, address) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address)
       VALUES (:ID, :total_working_hours, :name, :schedule, :address)`,
      [ID, total_working_hours, name, schedule, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Lifecare_Volunteer
async function insertLifecareVolunteer(ID, domain_of_responsibility) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
       VALUES (:ID, :domain_of_responsibility)`,
      [ID, domain_of_responsibility],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// MedicalRecord_Has
async function insertMedicalRecordHas(recordDate, aid, vaccination) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
       VALUES (:recordDate, :aid, :vaccination)`,
      [recordDate, aid, vaccination],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Staff_Hire
async function insertStaffHire(email, salary, phone_number, name, address) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
       VALUES (:email, :salary, :phone_number, :name, :address)`,
      [email, salary, phone_number, name, address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// TakeCare
async function insertTakeCare(aid, ID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `INSERT INTO TakeCare (aid, ID)
       VALUES (:aid, :ID)`,
      [aid, ID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// --------------------------------------------------
// Export all
module.exports = {
  testOracleConnection,
  fetchTableFromDb,
  initiateTables,

  insertAdopter,
  insertStation,
  insertDonator,
  insertAnimalsAdoptShelter,
  insertDonationAccountHold,
  insertVolunteerRecruit,
  insertLifecareVolunteer,
  insertMedicalRecordHas,
  insertStaffHire,
  insertTakeCare
};
