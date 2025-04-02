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

function showFormInsert() {
    //The value from the dropdown
    const selectedTable = document.getElementById("tableSelect").value;
  
    //Hide all insert forms only (IDs starting with "insert-")
    const insertForms = document.querySelectorAll('[id^="insert-"]');
    insertForms.forEach(form => {
      form.style.display = "none";
    });
  
    //Show the selected form
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
        body: JSON.stringify({ email: email, name: name, phone_number: phone_number })
    });

    handleInsertResponse(response, 'adopterInsertResult');
}

// Inserts a record into the Station table
async function insertStation(event) {
    event.preventDefault();

    const address = document.getElementById('stationAddress').value;
    const max_capacity = document.getElementById('stationCapacity').value;
    const environment = document.getElementById('stationEnvironment').value;

    const response = await fetch('/insert-station', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, max_capacity, environment})
    });

    handleInsertResponse(response, 'stationInsertResult');
}

// Inserts a record into the Animals_Adopt_Shelter table
async function insertAnimalsAdoptShelter(event) {
    event.preventDefault();

    const animal_id = document.getElementById('animalId').value;
    const species = document.getElementById('animalSpecies').value;
    const found_location = document.getElementById('foundLocation').value;
    const found_date = document.getElementById('foundDate').value;
    const email = document.getElementById('ADemail').value;
    const address = document.getElementById('STaddress').value;

    const response = await fetch('/insert-animals-adopt-shelter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aid: animal_id, species, found_location,
                               found_date, email, address })
    });

    handleInsertResponse(response, 'animalsAdoptShelterInsertResult');
}

// Inserts a record into the Staff_Hire table
async function insertStaffHire(event) {
    event.preventDefault();

    const email = document.getElementById('staffEmail').value;
    const salary = document.getElementById('staffSalary').value;
    const phone_number = document.getElementById('phoneNUmber').value;
    const name = document.getElementById('staffName').value;
    const address = document.getElementById('stationADDRESS').value;

    const response = await fetch('/insert-staff-hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, salary, phone_number, name, address })
    });

    handleInsertResponse(response, 'staffHireInsertResult');
}

// Inserts a record into the Volunteer_Recruit table
async function insertVolunteerRecruit(event) {
    event.preventDefault();

    const ID = document.getElementById('volunteerID').value;
    const total_working_hours = document.getElementById('workingHours').value;
    const name = document.getElementById('VolunteerName').value;
    const schedule = document.getElementById('schedule').value;
    const st_address = document.getElementById('staAD').value;

    const response = await fetch('/insert-volunteer-recruit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID, total_working_hours, name, schedule, address: st_address })
    });

    handleInsertResponse(response, 'volunteerRecruitInsertResult');
}

// Inserts a record into the Lifecare_Volunteer table
async function insertLifecareVolunteer(event) {
    event.preventDefault();

    const ID = document.getElementById('VolunteerID').value;
    const domain_of_responsibility = document.getElementById('responsibility').value;

    const response = await fetch('/insert-lifecare-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID, domain_of_responsibility })
    });

    handleInsertResponse(response, 'lifecareVolunteerInsertResult');
}

// Inserts a record into the Donator table
async function insertDonator(event) {
    event.preventDefault();

    const donor_id = document.getElementById('donatorId').value;
    const donatorName = document.getElementById('donatorName').value;

    const response = await fetch('/insert-donator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DID: donor_id, name: donatorName })
    }); 

    handleInsertResponse(response, 'donatorInsertResult');
}

// Inserts a record into the Donation_Account_Hold table
async function insertDonationAccountHold(event) {
    event.preventDefault();

    const accountID = document.getElementById('accountId').value;
    const balance = document.getElementById('accountBalance').value;
    const donation_date = document.getElementById('donationDate').value;
    const address = document.getElementById('STAddress').value;

    const response = await fetch('/insert-donation-account-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountID, balance, donation_date, address })
    });

    handleInsertResponse(response, 'donationAccountHoldInsertResult');
}

// Inserts a record into the MedicalRecord_Has table
async function insertMedicalRecordHas(event) {
    event.preventDefault();

    const recordDate = document.getElementById('recordDate').value;
    const aid = document.getElementById('recordAnimalId').value;
    const vaccination = document.getElementById('vaccination').value;

    const response = await fetch('/insert-medicalrecord-has', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordDate, aid, vaccination })
    });

    handleInsertResponse(response, 'medicalRecordInsertResult');
}

// Inserts a record into the TakeCare table
async function insertTakeCare(event) {
    event.preventDefault();

    const caretaker_id = document.getElementById('careVolunteerId').value;
    const animal_id = document.getElementById('careAnimalId').value;

    const response = await fetch('/insert-takecare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aid: animal_id, ID: caretaker_id })
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
        messageElement.textContent = "Duplicate value!";
        messageElement.style.color = "red";
    }
}


// Updates names in selected table.
async function updateValue(event) {
    event.preventDefault();
    const selectedTable = document.getElementById("UpdateSelect").value;
    console.log(selectedTable);
    const Attribute = document.getElementById("selectAttribute").value;
    const oldValue = document.getElementById('updateOldValue').value;
    const newValue = document.getElementById('updateNewValue').value;

    const response = await fetch('/update-value-table', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            table: selectedTable,
            attribute: Attribute,
            oldName: oldValue,
            newName: newValue
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



// Delete Data
function showFormDelete() {
    //The value from the dropdown
    const selectedTable = document.getElementById("DeleteSelect").value;
  
    //Hide all delete forms only
    const deleteForms = document.querySelectorAll('[id^="delete-"]');
    deleteForms.forEach(form => {
      form.style.display = "none";
    });
  
    //Show the selected form
    if (selectedTable) {
      document.getElementById(selectedTable).style.display = "block";
    }
  }



// Handles the response, shows a success or error message, and hides the delete panel.
async function handleDeleteResponse(response, resultElementId) {
    const responseData = await response.json();
    const messageElement = document.getElementById(resultElementId);

    if (responseData.success) {
        messageElement.textContent = "Data deleting successfully!";
        messageElement.style.color = "green";
    } else {
        messageElement.textContent = "Could not find the data, please check the input";
        messageElement.style.color = "red";
    }
}

// delete row of Adopter by email
async function deleteAdopter(event) {
    event.preventDefault();

    const email = document.getElementById('deleteAdopterEmail').value;

    const response = await fetch('/delete-adopter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });

    handleDeleteResponse(response, 'adopterDeleteResult');
}

// delete row of Station by address
async function deleteStation(event) {
    event.preventDefault();

    const address = document.getElementById('deleteStationAddress').value;

    const response = await fetch('/delete-station', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address })
    });

    handleDeleteResponse(response, 'stationDeleteResult');
}

// delete row of Donator by DID
async function deleteDonator(event) {
    event.preventDefault();

    const did = document.getElementById('deleteDID').value;

    const response = await fetch('/delete-donator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DID: did })
    });

    handleDeleteResponse(response, 'donatorDeleteResult');
}

// Delete row from Animals Adopt Shelter by Animal ID
async function deleteAnimalsAdoptShelter(event) {
    event.preventDefault();

    const aid = document.getElementById('deleteAID').value;

    const response = await fetch('/delete-animals-adopt-shelter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aid: aid })
    });

    handleDeleteResponse(response, 'adsDeleteResult');
}

// Delete row from Donation Account Hold by Account ID
async function deleteDonationAccountHold(event) {
    event.preventDefault();

    const accountID = document.getElementById('deleteAccountID').value;

    const response = await fetch('/delete-donation-account-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountID: accountID })
    });

    handleDeleteResponse(response, 'donationAccountDeleteResult');
}

// Delete row from Medical Record Has by Animal ID
async function deleteMedicalRecordHas(event) {
    event.preventDefault();

    const aid = document.getElementById('deleteMDanimalID').value;

    const response = await fetch('/delete-medicalrecord-has', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aid: aid })
    });

    handleDeleteResponse(response, 'MDrecordDeleteResult');
}

// Delete row from Lifecare Volunteer by Volunteer ID
async function deleteLifecareVolunteer(event) {
    event.preventDefault();

    const ID = document.getElementById('deleteLifecareVID').value;

    const response = await fetch('/delete-lifecare-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID: ID })
    });

    handleDeleteResponse(response, 'LCvolunteerDeleteResult');
}

// Delete row from Volunteer Recruit by Volunteer ID
async function deleteVolunteerRecruit(event) {
    event.preventDefault();

    const ID = document.getElementById('deleteVID').value;

    const response = await fetch('/delete-volunteer-recruit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID: ID })
    });

    handleDeleteResponse(response, 'volunteerDeleteResult');
}

// Delete row from Staff Hire by Staff Email
async function deleteStaffHire(event) {
    event.preventDefault();

    const email = document.getElementById('deleteStaffEmail').value;

    const response = await fetch('/delete-staff-hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });

    handleDeleteResponse(response, 'staffDeleteResult');
}

// Delete row from Take Care by Animal ID and Volunteer ID
async function deleteTakeCare(event) {
    event.preventDefault();

    const aid = document.getElementById('deleteTKAID').value;
    const ID = document.getElementById('deleteTKVID').value;

    const response = await fetch('/delete-takecare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aid: aid, ID: ID })
    });

    handleDeleteResponse(response, 'TKDeleteResult');
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
function addCondition() {
    const container = document.getElementById("condition-container");
    const index = container.children.length;
    const selectedTable = document.getElementById("selectTable").value;

    if (!selectedTable) {
        alert("Please select a table first!");
        return;
    }

    const attributesByTable = {
    Adopter: ["email", "name", "phone_number"],
    Station: ["address", "max_capacity", "environment"],
    Donator: ["DID", "name"],
    Animals_Adopt_Shelter: ["aid", "species", "found_location", "found_date", "email", "address"],
    Donation_Account_Hold: ["accountID", "balance", "donation_date", "address"],
    MedicalRecord_Has: ["recordDate", "aid", "vaccination"],
    Lifecare_Volunteer: ["ID", "domain_of_responsibility"],
    Volunteer_Recruit: ["ID", "total_working_hours", "name", "schedule", "address"],
    Staff_Hire: ["email", "salary", "phone_number", "name", "address"],
    TakeCare: ["aid", "ID"]
    //add othere if need
    };

    const attributeOptions = attributesByTable[selectedTable] || [];

    const div = document.createElement("div");
    div.innerHTML = `
        ${index > 0 ? `<select class="connector">
            <option value="AND">AND</option>
            <option value="OR">OR</option>
        </select>` : ''}

        <select class="attribute" style="
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            padding: 10px 40px 10px 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            background-color: #fff;
            background-image: url('data:image/svg+xml;utf8,<svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 0L5 4L9 0" stroke="%23222"/></svg>');
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 12px;
            cursor: pointer;
            margin-right: 10px;">
            ${attributeOptions.map(attr => `<option value="${attr}">${attr}</option>`).join("")}
        </select>

        <select class="operator" style="
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            padding: 10px 40px 10px 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            background-color: #fff;
            background-image: url('data:image/svg+xml;utf8,<svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 0L5 4L9 0" stroke="%23222"/></svg>');
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 12px;
            cursor: pointer;
            margin-right: 10px;">
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value="<"><</option>
            <option value="<="><=</option>
            <option value=">">></option>
            <option value=">=">>=</option>
        </select>

        <input placeholder="Value" class="value" required style="
            padding: 10px 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            margin-right: 10px;
            width: 200px;
            box-sizing: border-box;">
    `;
    container.appendChild(div);
}
function displaySelectionResult(columns, data, tableName) {
    const containerId = "selectionResultTable";

    const parent = document.getElementById("selectionTableContainer");
    parent.innerHTML = "";  // remote the old

    const container = document.createElement("div");
    container.id = containerId;

    if (data.length === 0 || columns.length === 0) {
        container.innerHTML = "<p>No matching results.</p>";
        parent.appendChild(container);
        return;
    }
//show tubles
    const table = document.createElement("table");
    table.border = "1";
    table.style.marginTop = "10px";
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    const tbody = document.createElement("tbody");
    data.forEach(row => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
            const td = tr.insertCell();
            td.textContent = cell;
        });
    });

    table.appendChild(tbody);
    container.appendChild(table);
    parent.appendChild(container);
}

function getTableColumns(tableName) {
    const mapping = {
        Adopter: ["email", "name", "phone_number"],
        Station: ["address", "max_capacity", "environment"],
        Donator: ["DID", "name"],
        Animals_Adopt_Shelter: ["aid", "species", "found_location", "found_date", "email", "address"],
        Donation_Account_Hold: ["accountID", "balance", "donation_date", "address"],
        MedicalRecord_Has: ["recordDate", "aid", "vaccination"],
        Lifecare_Volunteer: ["ID", "domain_of_responsibility"],
        Volunteer_Recruit: ["ID", "total_working_hours", "name", "schedule", "address"],
        Staff_Hire: ["email", "salary", "phone_number", "name", "address"],
        TakeCare: ["aid", "ID"]
    };
    return mapping[tableName] || [];
}

//selection
async function submitSelection() {
    const table = document.getElementById("selectTable").value;
    const rows = document.getElementById("condition-container").children;

    let conditions = Array.from(rows).map((row, index) => {
        const value = row.querySelector(".value").value.trim();

        return {
            attribute: row.querySelector(".attribute").value,
            operator: row.querySelector(".operator").value,
            value: value,
            connector: index > 0 ? row.querySelector(".connector").value : null
        };
    });
    conditions = conditions.filter(cond => cond.value !== "");

    if (conditions.length === 0) {
        alert("Please enter at least one valid condition.");
        return;
    }

    const response = await fetch('/select-tuples', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, conditions })
    });

    const result = await response.json();
    const msg = document.getElementById("selectionResultMsg");

    if (!result.data || result.data.length === 0) {
        msg.textContent = "No matching rows found.";
        msg.style.color = "orange";
        displaySelectionResult([], [], table);
        return;
    }

    msg.textContent = `Found ${result.data.length} matching rows.`;
    msg.style.color = "green";

    const columns = getTableColumns(table);
    displaySelectionResult(columns, result.data, table);
}

const attributesByTable = {
    Adopter: ["email", "name", "phone_number"],
    Station: ["address", "max_capacity", "environment"],
    Donator: ["DID", "name"],
    Animals_Adopt_Shelter: ["aid", "species", "found_location", "found_date", "email", "address"],
    Donation_Account_Hold: ["accountID", "balance", "donation_date", "address"],
    MedicalRecord_Has: ["recordDate", "aid", "vaccination"],
    Lifecare_Volunteer: ["ID", "domain_of_responsibility"],
    Volunteer_Recruit: ["ID", "total_working_hours", "name", "schedule", "address"],
    Staff_Hire: ["email", "salary", "phone_number", "name", "address"],
    TakeCare: ["aid", "ID"]
};

function addAttribute() {
    const container = document.getElementById("attribute-container");
    const selectedTable = document.getElementById("selectProjectionTable").value;

    if (!selectedTable || !attributesByTable[selectedTable]) {
        alert("Please select a valid table first!");
        return;
    }

    const attributeOptions = attributesByTable[selectedTable];

    const div = document.createElement("div");
    div.className = "attribute-row";

    div.innerHTML = `
        <select class="attribute" style="
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            padding: 10px 40px 10px 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            background-color: #fff;
            background-image: url('data:image/svg+xml;utf8,<svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 0L5 4L9 0" stroke="%23222"/></svg>');
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 12px;
            cursor: pointer;
            margin-right: 10px;">
            ${attributeOptions.map(attr => `<option value="${attr}">${attr}</option>`).join("")}
        </select>
        <button type="button" class="remove-btn" style="
            padding: 10px 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            background-color: #6c757d;
            color: white;
            margin-right: 10px;
            width: 200px;
            box-sizing: border-box;">Remove</button>
    `;

    div.querySelector(".remove-btn").onclick = () => container.removeChild(div);

    container.appendChild(div);
}

// Handle projection submission
async function submitProjection() {
    const table = document.getElementById("selectProjectionTable").value;
    const msg = document.getElementById("projectionResultMsg");
    const container = document.getElementById("projectionTableContainer");

    const inputs = document.querySelectorAll(".attribute");
    const attributes = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(attr => attr !== "");

    if (!table) {
        alert("Please select a table.");
        return;
    }

    if (attributes.length === 0) {
        alert("Please enter at least one attribute.");
        return;
    }

    const response = await fetch('/project-columns', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, attributes })
    });

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
        msg.textContent = "No data available for selected columns.";
        msg.style.color = "orange";
        displayProjectionResult([], [], table);
        return;
    }

    msg.textContent = `Displaying ${result.data.length} rows with selected columns.`;
    msg.style.color = "green";
    displayProjectionResult(attributes, result.data, table);
}

// Render Projection result table
function displayProjectionResult(columns, data, tableName) {
    const containerId = "projectionResultTable";

    const parent = document.getElementById("projectionTableContainer");
    parent.innerHTML = "";  // remote the old

    const container = document.createElement("div");
    container.id = containerId;
    if (data.length === 0 || columns.length === 0) {
        container.innerHTML = "<p>No matching results.</p>";
        parent.appendChild(container);
        return;
    }
//show tubles
    const table = document.createElement("table");
    table.border = "1";
    table.style.marginTop = "10px";
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    const tbody = document.createElement("tbody");
    data.forEach(row => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
            const td = tr.insertCell();
            td.textContent = cell;
        });
    });

    table.appendChild(tbody);
    container.appendChild(table);
    parent.appendChild(container);
}

// Handle join submission
async function fetchVolunteerTakeCareAnimals() {
    const input = document.getElementById("animalType").value;
    const msg = document.getElementById("joinResultMsg");
    const container = document.getElementById("joinTableContainer");

    const response = await fetch('/join-search', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
    });

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
        msg.textContent = "No data available for selected species.";
        msg.style.color = "orange";
        displayProjectionResult([], [], container);
        return;
    }

    msg.textContent = `Displaying ${result.data.length} volunteers for "${input}".`;
    msg.style.color = "green";
    const columns = ["ID", "name"];
    displayJoinResult(columns, result.data, container);
}

// Render join result table
function displayJoinResult(columns, data, tableName) {
    const containerId = "projectionResultTable";

    const parent = document.getElementById("joinTableContainer");
    parent.innerHTML = ""; // clear previous

    const container = document.createElement("div");
    container.id = containerId;

    if (data.length === 0 || columns.length === 0) {
        container.innerHTML = "<p>No matching results.</p>";
        parent.appendChild(container);
        return;
    }

//show tubles
    const table = document.createElement("table");
    table.border = "1";
    table.style.marginTop = "10px";
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    const tbody = document.createElement("tbody");
    data.forEach(row => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
            const td = tr.insertCell();
            td.textContent = cell;
        });
    });

    table.appendChild(tbody);
    container.appendChild(table);
    parent.appendChild(container);
}

//aggregation with group by, added alternative choices for using having
//if cond is true, filter all stations that have volunteers less or equal than one
async function fetchVolunteerAvgHours(cond) {
    const response = await fetch(`/group-by-volunteer-hours?cond=${cond}`, {
        method: "GET"
    });
    const result = await response.json();
    const data = result.data;
    const container = document.getElementById("groupByResultTable");
    const msg = document.getElementById("groupByResultMsg");

    container.innerHTML = "";

    if (!data || data.length === 0) {
        msg.textContent = "No data found.";
        msg.style.color = "orange";
        return;
    }

    msg.textContent = `Found ${data.length} address group(s).`;
    msg.style.color = "green";

    const table = document.createElement("table");
    table.border = "1";

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    ["Address", "Avg Hours"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const tbody = document.createElement("tbody");
    data.forEach(row => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
            const td = tr.insertCell();
            td.textContent = cell;
        });
    });

    table.appendChild(tbody);
    container.appendChild(table);
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
async function fetchAdoptersAllSpecies() {
    const res = await fetch("/division-adopters-all-species");
    const result = await res.json();
  
    const data = result.data;
    const msg = document.getElementById("divisionSpeciesMsg");
    const out = document.getElementById("divisionSpeciesResult");
    out.innerHTML = "";
  
    if (!data || data.length === 0) {
      msg.textContent = "No adopters found.";
      return;
    }
  
    msg.textContent = `Found ${data.length} adopter(s).`;
  
    const table = document.createElement("table");
    table.border = "1";
    const header = table.insertRow();
    const th = document.createElement("th");
    th.textContent = "Adopter Email";
    header.appendChild(th);
  
    data.forEach(row => {
      const tr = table.insertRow();
      const td = tr.insertCell();
      td.textContent = row[0];
    });
  //
    out.appendChild(table);
  }
  