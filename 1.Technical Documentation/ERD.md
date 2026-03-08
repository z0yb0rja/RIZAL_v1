# 🌊 ERD (Entity Relationship Diagram)

## What is ERD?

- An ERD visually represents the entities in a system, their attributes, and the relationships between them, providing a clear blueprint for database design.

-----

## ERD Version 1

- https://github.com/KHRISTMAE/VALID8/blob/main/ERD/ERD%20V.1.jpg

- This ERD connects users, events, and attendance records to manage the Facial Recognition School Event Attendance System efficiently.

- 1️⃣ Users (Students, Admins, Organizers, SSG Officers) log in using the User table, which assigns them roles (Role table).

- 2️⃣ Students belong to a course (Course table) and can attend multiple events (Attendance table).

- 3️⃣ Event Organizers create events (Event table), which students can register for and attend.

- 4️⃣ SSG Officers assist in event management, and their participation is tracked using a bridge table (Officer_Event).

- 5️⃣ Admins oversee the system, managing users and event records.

- This structure ensures secure authentication, event tracking, and role-based access to the system.

-----

## ERD Version 2

- (https://github.com/KHRISTMAE/VALID8/blob/main/ERD/ERD%20V.2.jpg)

- Version 2 ERD introduces several enhancements and refinements compared to Version 1, making the system more structured and improving its ability to handle user roles, facial recognition, and event attendance.

- New Additions in ERD Version 2 (Compared to Version 1)

- 1️⃣ Face Entity Table – Stores facial recognition data linked to users.

- 2️⃣ User Roles Table – Enables a many-to-many relationship between users and roles.

- 3️⃣ Check-in Time, Check-out Time, Checkpoint, and Status fields in the Attendance table – Provides more detailed attendance tracking.

- 4️⃣ Username and FaceID (FK) fields in the User table – Supports facial recognition login.

- 5️⃣ UserID (FK) in multiple tables (SSG Officer, Event Organizer, etc.) – Ensures unified user management.

- These additions improve role flexibility, attendance monitoring, and facial recognition integration.

-------

## ERD Version 3

- (https://github.com/KHRISTMAE/VALID8/blob/main/ERD/ERD%20V.3.jpg)

- Version 3 ERD builds upon the refinements of Version 2, further enhancing data normalization, attendance tracking, and academic program structuring.

- New Additions in ERD Version 3 (Compared to Version 2)

- 1️⃣ Course renamed to Program – Better reflects academic structures.

- 2️⃣ Student Table Enhancement – Added "Photo" attribute for facial recognition.

- 3️⃣ Refined Student-Program Relationship – Enforces "Many-to-One" rule.

- 4️⃣ Improved Attendance Tracking – More fields for detailed event check-ins.

- 5️⃣ Better Officer_Event Mapping – SSG Officers explicitly linked to events.

