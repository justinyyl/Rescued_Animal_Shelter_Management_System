CREATE TABLE Adopter (
    email CHAR(50),
    name CHAR(50) NOT NULL,
    phone_number CHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY(email)
);

CREATE TABLE Station (
    address CHAR(255)  PRIMARY KEY,
    max_capacity INT NOT NULL,
    environment CHAR(255) NOT NULL
);

CREATE TABLE Animals_Adopt_Shelter (
    aid INT PRIMARY KEY,
    species CHAR(40) NOT NULL,
    found_location CHAR(50) NOT NULL,
    found_date DATE NOT NULL,
    name CHAR(50),
    email CHAR(50),
    address CHAR(255),
    FOREIGN KEY (email) REFERENCES Adopter(email) ON DELETE SET NULL,
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE MedicalRecord_Has (
    recordDate DATE,
    aid INT PRIMARY KEY,
    vaccination CHAR(1),
    FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE
);

CREATE TABLE Staff_Hire (
    email CHAR(50),
    salary DECIMAL(10,2) NOT NULL,
    phone_number CHAR(20) UNIQUE NOT NULL,
    name CHAR(50) NOT NULL,
    address CHAR(255) NOT NULL,
    PRIMARY KEY(email),
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE SET NULL
);

CREATE TABLE Volunteer_Recruit (
	ID INT,
    total_working_hours INT NOT NULL,
    name CHAR(50) NOT NULL,
    schedule INT,
	address CHAR(255) NOT NULL,
  	PRIMARY KEY(ID),
  	FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE Lifecare_Volunteer (
    ID INT,
    domain_of_responsibility CHAR(50) NOT NULL,
    PRIMARY KEY(ID),
    FOREIGN KEY (ID) REFERENCES Volunteer_Recruit(ID) ON DELETE CASCADE
);

CREATE TABLE Donator (
    DID INT,
    name CHAR(50) NOT NULL,
    PRIMARY KEY(DID)
);

CREATE TABLE Donation_Account_Hold (
    accountID INT PRIMARY KEY, 
    balance INT NOT NULL,
    donation_date DATE NOT NULL,
    address CHAR(255),
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE TakeCare (
    aid INT NOT NULL,
    ID INT NOT NULL,
    PRIMARY KEY (aid, ID),
    FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE,
    FOREIGN KEY (ID) REFERENCES Volunteer_Recruit(ID) ON DELETE CASCADE
);

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

INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
VALUES (1, 'Medical Care');

INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
VALUES (3, 'Nutrition');

INSERT INTO Lifecare_Volunteer (ID, domain_of_responsibility)
VALUES (5, 'Behavior Training');

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

INSERT INTO Donation_Account_Hold (accountID, balance, date, address) VALUES
(1001, 5000, '2024-01-10', '123 Main St'),
(1002, 3000, '2024-02-05', '456 Elm St'),
(1003, 7000, '2024-02-20', '789 Oak Ave'),
(1004, 2000, '2024-03-01', '101 Pine Rd'),
(1005, 4500, '2024-03-15', '202 Birch Ln');

INSERT INTO TakeCare (aid, ID)
VALUES (100, 1);

INSERT INTO TakeCare (aid, ID)
VALUES (101, 2);

INSERT INTO TakeCare (aid, ID)
VALUES (102, 3);

INSERT INTO TakeCare (aid, ID)
VALUES (103, 1);

INSERT INTO TakeCare (aid, ID)
VALUES (105, 4);

INSERT INTO MedicalRecord_Has (recordDate, aid, vaccination) VALUES
('2024-02-01', 101, 'Y'),
('2024-02-15', 102, 'N'),
('2024-03-05', 103, 'Y'),
('2024-03-10', 104, 'Y'),
('2024-03-20', 105, 'N');