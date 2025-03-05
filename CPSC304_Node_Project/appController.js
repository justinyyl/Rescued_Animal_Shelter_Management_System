// appController.js
const express = require('express');
const appService = require('./appService');

const router = express.Router();

const allowedTables = [
  "Adopter",
  "Station",
  "Donator",
  "Animals_Adopt_Shelter",
  "Donation_Account_Hold",
  "MedicalRecord_Has",
  "Lifecare_Volunteer",
  "Volunteer_Recruit",
  "Staff_Hire",
  "TakeCare"
];
//sss

router.get('/check-db-connection', async (req, res) => {
    const isConnected = await appService.testOracleConnection();
    res.send(isConnected ? 'connected' : 'unable to connect');
});

router.get('/table/:tableName', async (req, res) => {
    const { tableName } = req.params;

    if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: "Table not allowed or not recognized." });
    }

    const tableContent = await appService.fetchTableFromDb(tableName);
    res.json({ data: tableContent });
});

router.post('/initiate-tables', async (req, res) => {
    const success = await appService.initiateTables();
    res.json({ success });
});


router.post('/insert-adopter', async (req, res) => {
    const { email, name, phone_number } = req.body;
    const inserted = await appService.insertAdopter(email, name, phone_number);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Station
router.post('/insert-station', async (req, res) => {
    const { address, max_capacity, environment } = req.body;
    const inserted = await appService.insertStation(address, max_capacity, environment);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Donator
router.post('/insert-donator', async (req, res) => {
    const { DID, name } = req.body;
    const inserted = await appService.insertDonator(DID, name);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Animals_Adopt_Shelter
router.post('/insert-animals-adopt-shelter', async (req, res) => {
    const { aid, species, found_location, found_date, email, address } = req.body;
    const inserted = await appService.insertAnimalsAdoptShelter(
      aid, species, found_location, found_date, email, address
    );
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Donation_Account_Hold
router.post('/insert-donation-account-hold', async (req, res) => {
    const { accountID, balance, donation_date, address } = req.body;
    const inserted = await appService.insertDonationAccountHold(
      accountID, balance, donation_date, address
    );
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Volunteer_Recruit
router.post('/insert-volunteer-recruit', async (req, res) => {
    const { ID, total_working_hours, name, schedule, address } = req.body;
    const inserted = await appService.insertVolunteerRecruit(
      ID, total_working_hours, name, schedule, address
    );
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Lifecare_Volunteer
router.post('/insert-lifecare-volunteer', async (req, res) => {
    const { ID, domain_of_responsibility } = req.body;
    const inserted = await appService.insertLifecareVolunteer(ID, domain_of_responsibility);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into MedicalRecord_Has
router.post('/insert-medicalrecord-has', async (req, res) => {
    const { recordDate, aid, vaccination } = req.body;
    const inserted = await appService.insertMedicalRecordHas(recordDate, aid, vaccination);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into Staff_Hire
router.post('/insert-staff-hire', async (req, res) => {
    const { email, salary, phone_number, name, address } = req.body;
    const inserted = await appService.insertStaffHire(email, salary, phone_number, name, address);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

// Insert into TakeCare
router.post('/insert-takecare', async (req, res) => {
    const { aid, ID } = req.body;
    const inserted = await appService.insertTakeCare(aid, ID);
    if (inserted) res.json({ success: true });
    else         res.status(500).json({ success: false });
});

module.exports = router;
