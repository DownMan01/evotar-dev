## Login Credentials for Testing

## Available Test Accounts

All accounts use the password: **password123**

### Admin Account
- **Student ID:** ADMIN001
- **Password:** password123
- **Role:** Admin
- **Name:** System Administrator
- **Email:** admin@university.edu

### Staff Account
- **Student ID:** STAFF001
- **Password:** password123
- **Role:** Staff
- **Name:** Election Staff
- **Email:** staff@university.edu

### Student/Voter Accounts

#### Computer Science Students
- **Student ID:** CS-2021-001
- **Password:** password123
- **Name:** John Doe
- **Department:** Computer Science
- **Year:** 3rd Year

- **Student ID:** CS-2023-006
- **Password:** password123
- **Name:** Lisa Garcia
- **Department:** Computer Science
- **Year:** 1st Year

#### Engineering Student
- **Student ID:** ENG-2020-002
- **Password:** password123
- **Name:** Jane Smith
- **Department:** Engineering
- **Year:** 4th Year

#### Business Student
- **Student ID:** BA-2022-003
- **Password:** password123
- **Name:** Mike Johnson
- **Department:** Business Administration
- **Year:** 2nd Year

#### Liberal Arts Student
- **Student ID:** LA-2021-004
- **Password:** password123
- **Name:** Sarah Wilson
- **Department:** Liberal Arts
- **Year:** 3rd Year

#### Medicine Student
- **Student ID:** MED-2019-005
- **Password:** password123
- **Name:** David Brown
- **Department:** Medicine
- **Year:** 5th Year

## Quick Test Instructions

1. Run the complete database setup script: `database/complete_setup_with_passwords.sql`
2. Use any of the above credentials to login
3. Different roles will see different dashboards and have different permissions

## Features to Test by Role

### Admin (ADMIN001)
- View all elections and results
- Manage users and system settings
- Access system logs
- Create and manage elections

### Staff (STAFF001)
- Create and manage elections
- View election results
- Manage candidates
- Access some system functions

### Voters (All student accounts)
- View active elections
- Cast votes in elections they're eligible for
- View their voting history
- Update their profile

## Database Functions Available

The system includes these database functions:
- `find_user_by_student_id(student_id)` - Find user by student ID
- `verify_user_password(user_id, password)` - Verify user password
- `get_voter_count()` - Get total number of active voters
- `get_voters_voted_count(election_id)` - Get number of voters who voted in an election
