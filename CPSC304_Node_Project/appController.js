const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
const allowedTables = ["Adopter", "Station", "Donator", "Animals_Adopt_Shelter", "Donation_Account_Hold",
                       "MedicalRecord_Has", "Lifecare_Volunteer", "Volunteer_Recruit", "Staff_Hire", "TakeCare"];

router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/table/tableName', async (req, res) => {
    const {tableName} = req.params;
    const tableContent = await appService.fetchTableFromDb(tableName);
    res.json({data: tableContent});
});

router.post("/initiate-tables", async (req, res) => {
    const initiateResult = await appService.initiateTables();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 1. Insert into Adopter
router.post("/insert-adopter", async (req, res) => {
    const { email, name, phone_number } = req.body;
    const insertResult = await appService.insertAdopter(email, name, phone_number);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 2. Insert into Station
router.post("/insert-station", async (req, res) => {
    const { address } = req.body;
    const insertResult = await appService.insertStation(address);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 3. Insert into Animals_Adopt_Shelter
router.post("/insert-animals-adopt-shelter", async (req, res) => {
    const { animal_id, adopter_email } = req.body;
    const insertResult = await appService.insertAnimals_Adopt_Shelter(animal_id, adopter_email);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 4. Insert into Staff_Hire
router.post("/insert-staff-hire", async (req, res) => {
    const { staff_id, hire_date } = req.body;
    const insertResult = await appService.insertStaff_Hire(staff_id, hire_date);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 5. Insert into Volunteer_Recruit
router.post("/insert-volunteer-recruit", async (req, res) => {
    const { volunteer_id, recruit_date } = req.body;
    const insertResult = await appService.insertVolunteer_Recruit(volunteer_id, recruit_date);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 6. Insert into Lifecare_Volunteer
router.post("/insert-lifecare-volunteer", async (req, res) => {
    const { volunteer_id, care_task } = req.body;
    const insertResult = await appService.insertLifecare_Volunteer(volunteer_id, care_task);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 7. Insert into Donator
router.post("/insert-donator", async (req, res) => {
    const { donor_id, donation_amount } = req.body;
    const insertResult = await appService.insertDonator(donor_id, donation_amount);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 8. Insert into Donation_Account_Hold
router.post("/insert-donation-account-hold", async (req, res) => {
    const { account_id, balance } = req.body;
    const insertResult = await appService.insertDonation_Account_Hold(account_id, balance);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 9. Insert into MedicalRecord_Has
router.post("/insert-medicalrecord-has", async (req, res) => {
    const { record_id, details } = req.body;
    const insertResult = await appService.insertMedicalRecord_Has(record_id, details);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// 10. Insert into TakeCare
router.post("/insert-takecare", async (req, res) => {
    const { caretaker_id, animal_id } = req.body;
    const insertResult = await appService.insertTakeCare(caretaker_id, animal_id);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});


module.exports = router;