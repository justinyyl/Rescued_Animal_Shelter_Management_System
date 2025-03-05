/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

const allowedTables = ["Adopter", "Station", "Donator", "Animals_Adopt_Shelter", "Donation_Account_Hold",
                       "MedicalRecord_Has", "Lifecare_Volunteer", "Volunteer_Recruit", "Staff_Hire", "TakeCare"];

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the table.
async function fetchAndDisplayUsers(tableName) {
    document.querySelectorAll("#table-container table").forEach(table => {
        table.style.display = "none"; // Hide all tables
    });
    const tableElement = document.getElementById(tableName.toLowerCase());
    const tableBody = tableElement.querySelector('tbody');
    tableElement.style.display = "table";

    const response = await fetch(`/table/${tableName}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the tables.
async function resetTables() {
    const response = await fetch("/initiate-tables", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "tables initiated successfully!";
        messageElement.style.color = "green";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

function showForm() {
    selectedTable = document.getElementById("tableSelect").value;
    allForms = document.querySelectorAll(".container");

    allForms.forEach(form => form.style.display = "none");

    if (selectedTable) {
        document.getElementById(selectedTable).style.display = "block";
    }
}

// Inserts a record into the Adopter table
async function insertAdopter(event) {
    event.preventDefault();

    const email = document.getElementById('adopterEmail').value;
    const name = document.getElementById('adopterName').value;
    const phone_number = document.getElementById('adopterPhone').value;

    const response = await fetch('/insert-adopter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, name: name, phone_number })
    });

    handleInsertResponse(response, 'adopterInsertResult');
}

// Inserts a record into the Station table
async function insertStation(event) {
    event.preventDefault();

    const address = document.getElementById('stationAddress').value;

    const response = await fetch('/insert-station', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
    });

    handleInsertResponse(response, 'stationInsertResult');
}

// Inserts a record into the Animals_Adopt_Shelter table
async function insertAnimalsAdoptShelter(event) {
    event.preventDefault();

    const animal_id = document.getElementById('animalId').value;
    const adopter_email = document.getElementById('adopterEmailForAnimal').value;

    const response = await fetch('/insert-animals-adopt-shelter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal_id, adopter_email })
    });

    handleInsertResponse(response, 'animalsAdoptShelterInsertResult');
}

// Inserts a record into the Staff_Hire table
async function insertStaffHire(event) {
    event.preventDefault();

    const staff_id = document.getElementById('staffId').value;
    const hire_date = document.getElementById('hireDate').value;

    const response = await fetch('/insert-staff-hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id, hire_date })
    });

    handleInsertResponse(response, 'staffHireInsertResult');
}

// Inserts a record into the Volunteer_Recruit table
async function insertVolunteerRecruit(event) {
    event.preventDefault();

    const volunteer_id = document.getElementById('volunteerId').value;
    const recruit_date = document.getElementById('recruitDate').value;

    const response = await fetch('/insert-volunteer-recruit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id, recruit_date })
    });

    handleInsertResponse(response, 'volunteerRecruitInsertResult');
}

// Inserts a record into the Lifecare_Volunteer table
async function insertLifecareVolunteer(event) {
    event.preventDefault();

    const volunteer_id = document.getElementById('lifeVolunteerId').value;
    const care_task = document.getElementById('careTask').value;

    const response = await fetch('/insert-lifecare-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id, care_task })
    });

    handleInsertResponse(response, 'lifecareVolunteerInsertResult');
}

// Inserts a record into the Donator table
async function insertDonator(event) {
    event.preventDefault();

    const donor_id = document.getElementById('donorId').value;
    const donation_amount = document.getElementById('donationAmount').value;

    const response = await fetch('/insert-donator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donor_id, donation_amount })
    });

    handleInsertResponse(response, 'donatorInsertResult');
}

// Inserts a record into the Donation_Account_Hold table
async function insertDonationAccountHold(event) {
    event.preventDefault();

    const account_id = document.getElementById('accountId').value;
    const balance = document.getElementById('accountBalance').value;

    const response = await fetch('/insert-donation-account-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id, balance })
    });

    handleInsertResponse(response, 'donationAccountHoldInsertResult');
}

// Inserts a record into the MedicalRecord_Has table
async function insertMedicalRecordHas(event) {
    event.preventDefault();

    const record_id = document.getElementById('recordId').value;
    const details = document.getElementById('medicalDetails').value;

    const response = await fetch('/insert-medicalrecord-has', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_id, details })
    });

    handleInsertResponse(response, 'medicalRecordInsertResult');
}

// Inserts a record into the TakeCare table
async function insertTakeCare(event) {
    event.preventDefault();

    const caretaker_id = document.getElementById('caretakerId').value;
    const animal_id = document.getElementById('careAnimalId').value;

    const response = await fetch('/insert-takecare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caretaker_id, animal_id })
    });

    handleInsertResponse(response, 'takeCareInsertResult');
}

// Handles the response, shows a success or error message, and hides the insert panel.
async function handleInsertResponse(response, resultElementId) {
    const responseData = await response.json();
    const messageElement = document.getElementById(resultElementId);

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        messageElement.style.color = "green";
    } else {
        messageElement.textContent = "Error inserting data!";
        messageElement.style.color = "red";
    }
}

// Updates names in the demotable.
async function updateNameDemotable(event) {
    event.preventDefault();

    const oldNameValue = document.getElementById('updateOldName').value;
    const newNameValue = document.getElementById('updateNewName').value;

    const response = await fetch('/update-name-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldName: oldNameValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
//    document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
//    document.getElementById("countDemotable").addEventListener("click", countDemotable);

};
document.getElementById("resetTables").addEventListener("click", function () {
    resetTables();
});
document.getElementById("Adopter").addEventListener("click", function () {
    fetchAndDisplayUsers('Adopter');
});
document.getElementById("Station").addEventListener("click", function () {
    fetchAndDisplayUsers('Station');
});
document.getElementById("Donator").addEventListener("click", function () {
    fetchAndDisplayUsers('Donator');
});
document.getElementById("Animals_Adopt_Shelter").addEventListener("click", function () {
    fetchAndDisplayUsers('Animals_Adopt_Shelter');
});
document.getElementById("Donation_Account_Hold").addEventListener("click", function () {
    fetchAndDisplayUsers('Donation_Account_Hold');
});
document.getElementById("MedicalRecord_Has").addEventListener("click", function () {
    fetchAndDisplayUsers('MedicalRecord_Has');
});
document.getElementById("Lifecare_Volunteer").addEventListener("click", function () {
    fetchAndDisplayUsers('Lifecare_Volunteer');
});
document.getElementById("Volunteer_Recruit").addEventListener("click", function () {
    fetchAndDisplayUsers('Volunteer_Recruit');
});
document.getElementById("Staff_Hire").addEventListener("click", function () {
    fetchAndDisplayUsers('Staff_Hire');
});
document.getElementById("TakeCare").addEventListener("click", function () {
    fetchAndDisplayUsers('TakeCare');
});

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    for (const tableName of allowedTables) {
        fetchAndDisplayUsers(tableName); // use await -> stack at DB connection
    }
    document.querySelectorAll("#table-container table").forEach(table => {
            table.style.display = "none"; // Hide all tables
    });
}
