CREATE TABLE Adopter (
    email CHAR(50),
    name CHAR(50) NOT NULL,
    phone_number CHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY(email)
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
    recordDate DATE PRIMARY KEY,
    aid INT PRIMARY KEY,
    vaccination CHAR(1),
    FOREIGN KEY (aid) REFERENCES Animals_Adopt_Shelter(aid) ON DELETE CASCADE
);

CREATE TABLE Station (
    address CHAR(255),
    max_capacity INT NOT NULL,
    environment CHAR(255) NOT NULL,
    PRIMARY KEY(address)
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
    date DATE NOT NULL,
    address CHAR(255),
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE Donation (
    DonationID INT,
    DID INT NOT NULL,
    accountID INT NOT NULL,
    donated_amount DECIMAL(15,2) NOT NULL,
    donation_date DATE NOT NULL,
    PRIMARY KEY (DonationID),
    FOREIGN KEY (DID) REFERENCES Donator(DID) ON DELETE CASCADE,
    FOREIGN KEY (accountID) REFERENCES Donation_Account_Hold(accountID) ON DELETE CASCADE
);

CREATE TABLE Shelter (
    animalID INT NOT NULL,
    address CHAR(255) NOT NULL,
    PRIMARY KEY (animalID, address),
    FOREIGN KEY (animalID) REFERENCES Animals_Adopt_Shelter(animalID) ON DELETE CASCADE,
    FOREIGN KEY (address) REFERENCES Station(address) ON DELETE CASCADE
);

CREATE TABLE TakeCare (
    animalID INT NOT NULL,
    ID INT NOT NULL,
    PRIMARY KEY (animalID, ID),
    FOREIGN KEY (animalID) REFERENCES Animals_Adopt_Shelter(animalID) ON DELETE CASCADE,
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

INSERT INTO Animal_Has
(animalID, species, found_location, found_date, vaccination_date, vaccination)
VALUES (100, 'Dog', 'City Park', DATE '2023-01-10', DATE '2023-01-15', 'Y');

INSERT INTO Animal_Has
(animalID, species, found_location, found_date, vaccination_date, vaccination)
VALUES (101, 'Cat', 'Downtown', DATE '2023-01-20', DATE '2023-02-01', 'Y');

INSERT INTO Animal_Has
(animalID, species, found_location, found_date, vaccination_date, vaccination)
VALUES (102, 'Rabbit', 'Suburbs', DATE '2022-12-01', NULL, 'N');

INSERT INTO Animal_Has
(animalID, species, found_location, found_date, vaccination_date, vaccination)
VALUES (103, 'Parrot', 'TropicalGarden', DATE '2022-11-15', DATE '2022-11-20', 'Y');

INSERT INTO Animal_Has
(animalID, species, found_location, found_date, vaccination_date, vaccination)
VALUES (104, 'Dog', 'School Yard', DATE '2023-02-10', NULL, 'N');

INSERT INTO Animal_Has
(animalID, species, found_location, found_date, vaccination_date, vaccination)
VALUES (105, 'Dog', 'Highway Road', DATE '2023-03-01', DATE '2023-03-05', 'Y');


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

INSERT INTO Donation_Account (accountID, balance)
VALUES (1000, 5000);

INSERT INTO Donation_Account (accountID, balance)
VALUES (1001, 2000);

INSERT INTO Donation_Account (accountID, balance)
VALUES (1002, 10000);

INSERT INTO Donation_Account (accountID, balance)
VALUES (1003, 1500);

INSERT INTO Donation_Account (accountID, balance)
VALUES (1004, 7500);

INSERT INTO Donation (DonationID, DID, accountID, donated_amount, donation_date)
VALUES (1, 101, 1000, 1000.00, DATE '2023-01-05');

INSERT INTO Donation (DonationID, DID, accountID, donated_amount, donation_date)
VALUES (2, 102, 1001, 500.00, DATE '2023-02-10');

INSERT INTO Donation (DonationID, DID, accountID, donated_amount, donation_date)
VALUES (3, 103, 1002, 2000.00, DATE '2023-03-15');

INSERT INTO Donation (DonationID, DID, accountID, donated_amount, donation_date)
VALUES (4, 104, 1003, 300.00, DATE '2023-04-20');

INSERT INTO Donation (DonationID, DID, accountID, donated_amount, donation_date)
VALUES (5, 105, 1004, 1500.00, DATE '2023-05-25');

INSERT INTO Hold (accountID, address)
VALUES (1000, 'Station A');

INSERT INTO Hold (accountID, address)
VALUES (1001, 'Station B');

INSERT INTO Hold (accountID, address)
VALUES (1002, 'Station C');

INSERT INTO Hold (accountID, address)
VALUES (1003, 'Station D');

INSERT INTO Hold (accountID, address)
VALUES (1004, 'Station E');

INSERT INTO Shelter (animalID, address)
VALUES (100, 'Station A');

INSERT INTO Shelter (animalID, address)
VALUES (101, 'Station A');

INSERT INTO Shelter (animalID, address)
VALUES (102, 'Station B');

INSERT INTO Shelter (animalID, address)
VALUES (103, 'Station C');

INSERT INTO Shelter (animalID, address)
VALUES (104, 'Station D');

INSERT INTO Shelter (animalID, address)
VALUES (105, 'Station E');

INSERT INTO TakeCare (animalID, ID)
VALUES (100, 1);

INSERT INTO TakeCare (animalID, ID)
VALUES (101, 2);

INSERT INTO TakeCare (animalID, ID)
VALUES (102, 3);

INSERT INTO TakeCare (animalID, ID)
VALUES (103, 1);

INSERT INTO TakeCare (animalID, ID)
VALUES (105, 4);
