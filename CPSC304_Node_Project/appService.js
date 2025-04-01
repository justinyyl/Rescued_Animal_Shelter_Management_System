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

    
// INSERT DATA from Milestone 2
await conn.executeMany(`
  INSERT INTO Adopter (email, name, phone_number) VALUES (:1, :2, :3)
`, [
  ['abc@hotmail.com', 'p1', '123-456-7890'],
  ['bcd@gmail.com', 'p2', '234-567-1283'],
  ['cde@gmail.com', 'p3', '345-678-4761'],
  ['def@163.com', 'p4', '456-789-4756'],
  ['efg@gmail.com', 'p5', '125-732-5629']
]);

await conn.executeMany(`
  INSERT INTO Station (address, max_capacity, environment) VALUES (:1, :2, :3)
`, [
  ['Station A', 50, 'Urban'],
  ['Station B', 30, 'Suburban'],
  ['Station C', 20, 'Rural'],
  ['Station D', 100, 'Urban'],
  ['Station E', 40, 'Coastal']
]);

await conn.executeMany(`
  INSERT INTO Staff_Hire (email, salary, phone_number, name, address) VALUES (:1, :2, :3, :4, :5)
`, [
  ['micheal@rescue.com', 3000.00, '601-145-2345', 'Michael Williams', 'Station A'],
  ['sarah@rescue.com', 3500.00, '779-311-2807', 'Sarah Jones', 'Station B'],
  ['david@rescue.com', 3200.00, '683-190-3598', 'David Smith', 'Station A'],
  ['emma@rescue.com', 2800.00, '106-326-1287', 'Emma Rodriguez', 'Station C'],
  ['james@rescue.com', 4000.00, '587-446-1677', 'James Brown', 'Station E'],
  ['lucy@rescue.com', 4500.00, '264-267-3640', 'Lucy James', 'Station D']
]);

await conn.executeMany(`
  INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address) VALUES (:1, :2, :3, :4, :5)
`, [
  [1, 20, 'Tom', 1, 'Station A'],
  [2, 30, 'Jerry', 2, 'Station A'],
  [3, 15, 'Maggie', 3, 'Station B'],
  [4, 25, 'Finn', 4, 'Station B'],
  [5, 10, 'Sophie', 5, 'Station C']
]);

await conn.executeMany(`
  INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility) VALUES (:1, :2)
`, [
  [1, 'Medical Care'],
  [2, 'Nutrition'],
  [3, 'Behavior Training'],
  [4, 'Behavior Training'],
  [5, 'Behavior Training']
]);

await conn.executeMany(`
  INSERT INTO Donator (DID, name) VALUES (:1, :2)
`, [
  [101, 'Charity Org'],
  [102, 'John Donor'],
  [103, 'Jane Donor'],
  [104, 'ABC Foundation'],
  [105, 'XYZ Philanthropy']
]);

await conn.executeMany(`
  INSERT INTO Animals_Adopt_Shelter (aid, species, found_location, found_date, email, address)
  VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), :5, :6)
`, [
  [100, 'Dog', 'City Park', '2023-01-10', 'abc@hotmail.com', 'Station A'],
  [101, 'Cat', 'Downtown', '2023-01-20', 'bcd@gmail.com', 'Station B'],
  [102, 'Rabbit', 'Suburbs', '2022-12-01', 'cde@gmail.com', 'Station C'],
  [103, 'Parrot', 'TropicalGarden', '2022-11-15', 'def@163.com', 'Station D'],
  [104, 'Dog', 'School Yard', '2023-02-10', 'efg@gmail.com', 'Station E'],
  [201, 'Cat', 'Suburbs', '2023-05-01', 'abc@hotmail.com', 'Station A'],
  [202, 'Rabbit', 'Downtown', '2023-05-02', 'abc@hotmail.com', 'Station A'],
  [203, 'Parrot', 'City', '2023-05-03', 'abc@hotmail.com', 'Station A']
]);

await conn.executeMany(`
  INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
  VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4)
`, [
  [101, 5000, '2024-01-10', 'Station A'],
  [102, 3000, '2024-02-05', 'Station B'],
  [103, 7000, '2024-02-20', 'Station C'],
  [104, 2000, '2024-03-01', 'Station D'],
  [105, 4500, '2024-03-15', 'Station E']
]);

await conn.executeMany(`
  INSERT INTO TakeCare (aid, ID) VALUES (:1, :2)
`, [
  [101, 1],
  [102, 2],
  [103, 3],
  [104, 1],
  [100, 4]
]);

await conn.executeMany(`
  INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
  VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3)
`, [
  ['2024-02-01', 101, 'Y'],
  ['2024-02-15', 102, 'N'],
  ['2024-03-05', 103, 'Y'],
  ['2024-03-10', 104, 'Y'],
  ['2024-03-20', 100, 'N']
]);

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
       VALUES (:accountID, :balance, TO_DATE(:donation_date, 'YYYY-MM-DD'), :address)`,
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
       VALUES (TO_DATE(:recordDate, 'YYYY-MM-DD'), :aid, :vaccination)`,
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

//implement Update Table value
async function updateValue(table, attribute, oldName, newName) {
  console.log(table, attribute, oldName, newName);

  return await withOracleDB(async (conn) => {
    const sql = `
      UPDATE ${table}
      SET ${attribute} = :newName
      WHERE TRIM(${attribute}) = :oldName
    `;
    console.log(sql);

    const result = await conn.execute(
      sql,
      {
        oldName: oldName,
        newName: newName,
      },
      { autoCommit: true }
    );

    console.log("Execute result:", result);
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch((err) => {
    console.error("DB Error:", err);
    return false;
  });
}



//implementation of Delete Operations
// Delete AnimalsAdoptShelter
async function deleteAnimalsAdoptShelter(aid) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Animals_Adopt_Shelter
       WHERE aid = :aid`,
      [aid],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}
// Delete Adoptor
async function deleteAdoptor(email) {
  return await withOracleDB(async (conn) => {
    try {
      const result = await conn.execute(
        `DELETE FROM Adopter WHERE TRIM(email) = :email`,
        [email],
        { autoCommit: true }
      );

      if (result.rowsAffected > 0) {
        console.log(`[deleteAdopter] Successfully deleted adopter with email: ${email}`);//test to find where is the error
        return true;
      } else {
        console.warn(`[deleteAdopter] No rows deleted. Email might not exist: ${email}`);
        return false;
      }
    } catch (err) {
      console.error(`[deleteAdopter] Error deleting adopter: ${err.message}`);
      throw err; // Rethrow error so it's logged in appController
    }
  }).catch((err) => {
    console.error(`[deleteAdopter] Catch block error:`, err);
    return false;
  });
}

// Delete Volunteer_recruit
async function deleteVolunteerRecruit(address,VolunteerID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Volunteer_recruit
       WHERE address = :address AND VolunteerID = VolunteerID`,
      [address,VolunteerID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}
// Delete MedicalRecord_Has
async function deleteMedicalRecord_Has( recordDate,animalID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM MedicalRecord_Has
       WHERE recordDate = :recordDate AND animalID = animalID`,
      [recordDate,animalID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Delete Station
async function deleteStation(address) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Station
       WHERE TRIM(address) = :address`,
      [address],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Delete Donator
async function deleteDonator(DID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Donator WHERE DID = :DID`,
      [DID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Delete Donation_Account_Hold
async function deleteDonationAccountHold(accountID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Donation_Account_Hold WHERE accountID = :accountID`,
      [accountID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}


// Delete Lifecare_Volunteer
async function deleteLifecareVolunteer(ID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Lifecare_Volunteer WHERE ID = :ID`,
      [ID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Delete Staff_Hire
async function deleteStaffHire(email) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM Staff_Hire WHERE TRIM(email) = :email`,
      [email],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}

// Delete TakeCare
async function deleteTakeCare(aid, ID) {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(
      `DELETE FROM TakeCare WHERE aid = :aid AND ID = :ID`,
      [aid, ID],
      { autoCommit: true }
    );
    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => false);
}
// Selection query with AND/OR clauses
async function selectTuples(table, conditions) {
  return await withOracleDB(async (conn) => {
      let sql = `SELECT * FROM ${table}`;
      const values = {};
      if (conditions.length > 0) {
          const whereClauses = [];
          conditions.forEach((cond, index) => {
            const placeholder = `val${index}`;
            whereClauses.push(`TRIM(${cond.attribute}) ${cond.operator} :${placeholder}`);
            values[placeholder] = cond.value;
        });
        //or and
          let fullWhere = whereClauses[0];
          for (let i = 1; i < whereClauses.length; i++) {
              fullWhere += ` ${conditions[i].connector || 'AND'} ${whereClauses[i]}`;
          }

          sql += ` WHERE ${fullWhere}`;
      }

      const result = await conn.execute(sql, values);
      return result.rows;
  }).catch((err) => {
      console.error("Selection Error:", err);
      return [];
  });
}

// Projection query for specific attributes
async function projectColumns(table, attributes) {
  return await withOracleDB(async (conn) => {
    if (!Array.isArray(attributes) || attributes.length === 0) {
      throw new Error("No attributes provided for projection.");
    }

    const sql = `SELECT ${attributes.join(", ")} FROM ${table}`;
    const result = await conn.execute(sql);
    return result.rows;
  }).catch((err) => {
    console.error("Projection Error:", err);
    return [];
  });
}

// Join Animal_Adopt_Shelter, Volunteer_Recruit and TakeCare to find all names and IDs
// for volunteer which take care specific animal species
async function findVolunteersByAnimalType(input) {
  return await withOracleDB(async (conn) => {

    const result = await conn.execute(
        `SELECT DISTINCT v.ID, v.name
         FROM Volunteer_Recruit v
         JOIN TakeCare av ON v.ID = av.ID
         JOIN Animals_Adopt_Shelter a ON av.aid = a.aid
         WHERE TRIM(LOWER(a.species)) = TRIM(LOWER(:species))`,
          [input],
          { autoCommit: true }
     );
    return result.rows;
  }).catch((err) => {
    console.error("Join Error:", err);
    return [];
  });
}

//caculate average of work hour for volunteers group by address of station
async function getVolunteerAvgHoursByStation(cond) {
  if (!cond){
    sql = `
      SELECT address, ROUND(AVG(total_working_hours), 2) AS avg_hours
      FROM Volunteer_Recruit
      GROUP BY address
    `;
  } else {
    sql = `
      SELECT address, ROUND(AVG(total_working_hours), 2) AS avg_hours
      FROM Volunteer_Recruit
      GROUP BY address
      HAVING COUNT(*) > 1
    `;
  }
  console.log(sql);
  
  return await withOracleDB(async (conn) => {
      const result = await conn.execute(sql);
      return result.rows;
  }).catch((err) => {
      console.error("Aggregation Error:", err);
      return [];
  });
}
async function getAdoptersWhoAdoptedAllSpecies() {
  return await withOracleDB(async (conn) => {
    const result = await conn.execute(`
      SELECT DISTINCT A.email
      FROM Adopter A
      WHERE NOT EXISTS (
          SELECT DISTINCT species
          FROM Animals_Adopt_Shelter
          MINUS
          SELECT DISTINCT S.species
          FROM Animals_Adopt_Shelter S
          WHERE S.email = A.email
      )
    `);
    return result.rows;
  }).catch((err) => {
    console.error("Division Query Error:", err);
    return [];
  });
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
  insertTakeCare,

  updateValue,

  deleteAdoptor,
  deleteAnimalsAdoptShelter,
  deleteVolunteerRecruit,
  deleteMedicalRecord_Has,
  deleteStation,
  deleteDonator,
  deleteDonationAccountHold,
  deleteLifecareVolunteer,
  deleteStaffHire,
  deleteTakeCare,

  selectTuples,
  projectColumns,
  findVolunteersByAnimalType,
  getVolunteerAvgHoursByStation,
  getAdoptersWhoAdoptedAllSpecies

};
