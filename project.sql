------------------------------------------------------------------------
-- 1) 如果在同一个数据库里多次执行，先删除已存在的表 (可选)
------------------------------------------------------------------------
DROP TABLE TakeCare CASCADE CONSTRAINTS;
DROP TABLE MedicalRecord_Has CASCADE CONSTRAINTS;
DROP TABLE Donation_Account_Hold CASCADE CONSTRAINTS;
DROP TABLE Donator CASCADE CONSTRAINTS;
DROP TABLE Lifecare_Volunteer CASCADE CONSTRAINTS;
DROP TABLE Volunteer_Recruit CASCADE CONSTRAINTS;
DROP TABLE Staff_Hire CASCADE CONSTRAINTS;
DROP TABLE Animals_Adopt_Shelter CASCADE CONSTRAINTS;
DROP TABLE Station CASCADE CONSTRAINTS;
DROP TABLE Adopter CASCADE CONSTRAINTS;

------------------------------------------------------------------------
-- 2) CREATE TABLE
------------------------------------------------------------------------
--hello 
CREATE TABLE Adopter (
    email        CHAR(50),
    name         CHAR(50) NOT NULL,
    phone_number CHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY(email)
);

CREATE TABLE Station (
    address      CHAR(255) PRIMARY KEY,
    max_capacity INT NOT NULL,
    environment  CHAR(255) NOT NULL
);

CREATE TABLE Animals_Adopt_Shelter (
    aid             INT PRIMARY KEY,
    species         CHAR(40) NOT NULL,
    found_location  CHAR(50) NOT NULL,
    found_date      DATE NOT NULL,
    email           CHAR(50),
    address         CHAR(255),
    FOREIGN KEY (email)   REFERENCES Adopter(email)   ON DELETE SET NULL,
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE MedicalRecord_Has (
    recordDate  DATE,
    aid         INT PRIMARY KEY,
    vaccination CHAR(1),
    FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE
);

CREATE TABLE Staff_Hire (
    email        CHAR(50),
    salary       DECIMAL(10,2) NOT NULL,
    phone_number CHAR(20) UNIQUE NOT NULL,
    name         CHAR(50) NOT NULL,
    address      CHAR(255) NOT NULL,
    PRIMARY KEY(email),
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE SET NULL
);

CREATE TABLE Volunteer_Recruit (
    ID                 INT,
    total_working_hours INT NOT NULL,
    name              CHAR(50) NOT NULL,
    schedule          INT,
    address           CHAR(255) NOT NULL,
    PRIMARY KEY(ID),
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE Lifecare_Volunteer (
    ID                       INT,
    domain_of_responsibility CHAR(50) NOT NULL,
    PRIMARY KEY(ID),
    FOREIGN KEY (ID) REFERENCES Volunteer_Recruit(ID) ON DELETE CASCADE
);

CREATE TABLE Donator (
    DID  INT,
    name CHAR(50) NOT NULL,
    PRIMARY KEY(DID)
);

CREATE TABLE Donation_Account_Hold (
    accountID      INT PRIMARY KEY, 
    balance        INT NOT NULL,
    donation_date  DATE NOT NULL,
    address        CHAR(255),
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE TakeCare (
    aid INT NOT NULL,
    ID  INT NOT NULL,
    PRIMARY KEY (aid, ID),
    FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE,
    FOREIGN KEY (ID)  REFERENCES Volunteer_Recruit(ID)      ON DELETE CASCADE
);


-- 3.1 Adopter
INSERT INTO Adopter (email, name, phone_number)
VALUES ('abc@hotmail.com', 'p1', '123-456-7890');

INSERT INTO Adopter (email, name, phone_number)
VALUES ('bcd@gmail.com', 'p2', '234-567-1283');

INSERT INTO Adopter (email, name, phone_number)
VALUES ('cde@gmail.com', 'p3', '345-678-4761');

INSERT INTO Adopter (email, name, phone_number)
VALUES ('def@163.com', 'p4', '456-789-4756');

INSERT INTO Adopter (email, name, phone_number)
VALUES ('efg@gmail.com', 'p5', '125-732-5629');

-- 3.2 Station
INSERT INTO Station (address, max_capacity, environment)
VALUES ('Station A', 50, 'Urban');

INSERT INTO Station (address, max_capacity, environment)
VALUES ('Station B', 30, 'Suburban');

INSERT INTO Station (address, max_capacity, environment)
VALUES ('Station C', 20, 'Rural');

INSERT INTO Station (address, max_capacity, environment)
VALUES ('Station D', 100, 'Urban');

INSERT INTO Station (address, max_capacity, environment)
VALUES ('Station E', 40, 'Coastal');

-- 3.3 Staff_Hire
INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
VALUES ('micheal@rescue.com', 3000.00, '601-145-2345', 'Michael Williams', 'Station A');

INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
VALUES ('sarah@rescue.com', 3500.00, '779-311-2807', 'Sarah Jones', 'Station B');

INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
VALUES ('david@rescue.com', 3200.00, '683-190-3598', 'David Smith', 'Station A');

INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
VALUES ('emma@rescue.com', 2800.00, '106-326-1287', 'Emma Rodriguez', 'Station C');

INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
VALUES ('james@rescue.com', 4000.00, '587-446-1677', 'James Brown', 'Station E');

INSERT INTO Staff_Hire (email, salary, phone_number, name, address)
VALUES ('lucy@rescue.com', 4500.00, '264-267-3640', 'Lucy James', 'Station D');

-- 3.4 Volunteer_Recruit
INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address)
VALUES (1, 20, 'Tom', 1, 'Station A');

INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address)
VALUES (2, 30, 'Jerry', 2, 'Station A');

INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address)
VALUES (3, 15, 'Maggie', 3, 'Station B');

INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address)
VALUES (4, 25, 'Finn', 4, 'Station B');

INSERT INTO Volunteer_Recruit (ID, total_working_hours, name, schedule, address)
VALUES (5, 10, 'Sophie', 5, 'Station C');

-- 3.5 Lifecare_Volunteer
INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
VALUES (1, 'Medical Care');

INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
VALUES (3, 'Nutrition');

INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
VALUES (5, 'Behavior Training');

-- 3.6 Donator
INSERT INTO Donator (DID, name)
VALUES (101, 'Charity Org');

INSERT INTO Donator (DID, name)
VALUES (102, 'John Donor');

INSERT INTO Donator (DID, name)
VALUES (103, 'Jane Donor');

INSERT INTO Donator (DID, name)
VALUES (104, 'ABC Foundation');

INSERT INTO Donator (DID, name)
VALUES (105, 'XYZ Philanthropy');

-- 3.7 Animals Adopt Shelter
INSERT INTO Animals_Adopt_Shelter
(aid, species, found_location, found_date, email, address)
VALUES (100, 'Dog', 'City Park', DATE '2023-01-10', 'abc@hotmail.com', 'Station A');

INSERT INTO Animals_Adopt_Shelter
(aid, species, found_location, found_date, email, address)
VALUES (101, 'Cat', 'Downtown', DATE '2023-01-20', 'bcd@gmail.com', 'Station B');

INSERT INTO Animals_Adopt_Shelter
(aid, species, found_location, found_date, email, address)
VALUES (102, 'Rabbit', 'Suburbs', DATE '2022-12-01', 'cde@gmail.com', 'Station C');

INSERT INTO Animals_Adopt_Shelter
(aid, species, found_location, found_date, email, address)
VALUES (103, 'Parrot', 'TropicalGarden', DATE '2022-11-15', 'def@163.com', 'Station D');

INSERT INTO Animals_Adopt_Shelter
(aid, species, found_location, found_date, email, address)
VALUES (104, 'Dog', 'School Yard', DATE '2023-02-10', 'efg@gmail.com', 'Station E');

-- 3.8 Donation_Account_Hold
--    如果 address 外键要引用Station(address)，就用已有 'Station A' ~ 'Station E'
INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
VALUES (101, 5000, DATE '2024-01-10', 'Station A');

INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
VALUES (102, 3000, DATE '2024-02-05', 'Station B');

INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
VALUES (103, 7000, DATE '2024-02-20', 'Station C');

INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
VALUES (104, 2000, DATE '2024-03-01', 'Station D');

INSERT INTO Donation_Account_Hold (accountID, balance, donation_date, address)
VALUES (105, 4500, DATE '2024-03-15', 'Station E');

-- 3.9 TakeCare
--    aid=101,102,103,104,105 都必须已经在Animals_Adopt_Shelter里插入
INSERT INTO TakeCare (aid, ID)
VALUES (101, 1);

INSERT INTO TakeCare (aid, ID)
VALUES (102, 2);

INSERT INTO TakeCare (aid, ID)
VALUES (103, 3);

INSERT INTO TakeCare (aid, ID)
VALUES (104, 1);

INSERT INTO TakeCare (aid, ID)
VALUES (100, 4);

-- 3.10 MedicalRecord_Has
--     Oracle里多行INSERT只能一条条写
INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
VALUES(DATE '2024-02-01', 101, 'Y');

INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
VALUES(DATE '2024-02-15', 102, 'N');

INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
VALUES(DATE '2024-03-05', 103, 'Y');

INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
VALUES(DATE '2024-03-10', 104, 'Y');

INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination)
VALUES(DATE '2024-03-20', 100, 'N');
