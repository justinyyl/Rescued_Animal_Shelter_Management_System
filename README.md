# 🐾 Rescued Animal Shelter Management System

## 🐶 Overview
Our project focuses on building a comprehensive **database management system for rescued animals**. It is designed to support a wide range of shelter operations, including tracking animal details, volunteer contributions, adopter records, medical care, and resource coordination.

---

## 🐕 Key Features

### 🐱 Data Management
- **Animal Records**: Store details like species, rescue history, and shelter location.
- **Volunteer Operations**: Track schedules and specialized roles for all volunteers.
- **Adopters**: Maintain adopter profiles and their adoption history.
- **Medical Care**: Record vaccinations and medical treatments.
- **Shelter Resources**: Monitor station capacity and donation fund usage.

### 🐾 User Interface
- A user-friendly **HTML interface** enables:
  - Inserting new entries
  - Updating existing values
  - Deleting records using primary keys
  - Filtering rows based on user-input values
  - Selecting attributes to display without searching
- All operations are implemented **dynamically** based on user inputs.

---

## 🦴 Database Queries

### 🐕‍🦺 Join Query
- We implemented a **join** to find the ID and name of all volunteers who care for a specific species.
- This query joins the `Volunteer_Recruit`, `TakeCare`, and `Animals_Adopt_Shelter` tables.

### 🦁 Aggregation Query
- Calculate **average working hours by station** in the `Volunteer_Recruit` table.
- Use a **HAVING clause** to filter out outliers.
- Identify the **station with the minimum average working hours**.
- This helps assess workload distribution across shelter locations.

### 🐢 Division Query
- Find **adopters who have adopted animals of *every* species** currently present in the shelter.

---

## 🐾 Reference
For setup and integration resources, we referred to the following:  
[Node.js & Oracle Setup Guide](https://www.students.cs.ubc.ca/~cs-304/resources/javascript-oracle-resources/node-setup.html)
