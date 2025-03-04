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
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const nameValue = document.getElementById('insertName').value;

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
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
