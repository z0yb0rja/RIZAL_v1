# VALID8

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Functional Requirements](#2-functional-requirements)
- [3. Non-Functional Requirements](#3-non-functional-requirements)
- [4. Stakeholders](#stakeholders)
- [5. Signature and Approval](#signature-and-approval)

## 1. Project Overview

### Project Description:
- A high-end attendance checker that will automatically displays students who attended the events in JRMSU College of Engineering.

### Target Audience:
- Students

### Project Objectives
- Design an intuitive user interface that allows students to easily access their attendance records, receive real-time notifications, and view upcoming events, ensuring a seamless experience.

## 2. Functional Requirements

User Management: Admins can create, edit, and delete user accounts. Role-based access control for students, SSG officers, event organizers, and admins.
Event Management: Event organizers can create, edit, and delete events. 
Attendance Tracking: SSG Officer verifies student attendance via Face recognition
Attendance Reports: Admins can generate event attendance reports. Students can view their attendance history.
Security & Authentication: User login using credentials or Google/Facebook login. Secure API for communication between the website and backend.

### User Stories/ Use Cases

**As a Student:**
- I want to log in to the app using my email and password
- I want to track my attendance by viewing the events I have participated in.
- I want to check whether there is an upcoming event.
- I want to logout successfully.
  
**As an Student Officer:**
- I want to track my attendance and view the events I have participated in as well as my upcoming events.
- I want to scan students’ face using face recognition so that I can ensure accurate and efficient tracking of attendees.
- I want to track the attendees by manual student ID entry if face recognition fails.
- I want to logout successfully.

**As an Event Organizer:**
- I want to create a new event by entering essential details such as the event name, date, time, location, and assign officer.
- I want to easily edit or update event details whenever necessary.
- I want to delete an event.
- I want to logout successfully.

**As an Administrator:**
- I want to manage user roles (Create, Read, Update, delete students, ssg-officers, event-organizer).
- I want to oversee all events created within the system and review flagged attendance issues so that attendance accuracy is maintained.
- I want to generate and downloads attendance reports (CSV).

### Integration Requirements
- The system should integrate with an email service provider to facilitate automated email notifications for event reminders, confirmations, and updates.
- The system should allow integration with calendar applications.
- It should integrate with the Valid8 system to allow students to check in and view their attendance records on their smartphones.

### Data Requirements 
### 1. User Data:
### Student Information:
- Student ID, name, email address, contact number, enrollment status, and program/major, department.
### Event Organizer Information:
- Organizer ID, name, email address, contact number.

### 2. Event Data:
### Event Details:
- Event ID, name, date, time, location, description, registration deadline, and maximum capacity.
### Event Status:
- Status (upcoming, ongoing, completed, canceled).

### 3. Attendance Data:
### Check-In Records:
- Check-in ID, event ID, student ID, check-in time, mid-event checkpoint, and check-out time.
### Attendance Status:
- Status (present, absent, late).

### 4. Notification Data:
### Email Notifications:
- Notification ID, recipient email, subject, message content, and timestamp.

### 5. Feedback Data:
### Survey Responses:
- Feedback ID, event ID, student ID, rating (e.g., 1-5 stars), comments, and submission timestamp.

### 6. System Logs:
### User Activity Logs:
- Log ID, user ID, user role (e.g., student, admin, SSG officer, event organizer), action performed (e.g., login, check-in, event creation)

## 3. Non-Functional Requirements: 
 ### Performance: 
 - The system should respond quickly to user actions, with minimal latency during event creation, registration, and check-in processes.
 - It should be able to handle thousands of students concurrently without degradation in performance, ensuring a smooth user experience even during peak usage times.
 - Must handle at least 200+ concurrent users without crashing. Attendance verification should take less than 5 seconds per student. 


### Security: 
- The system must implement robust security measures to protect user data and prevent unauthorized access. This includes data encryption, secure authentication methods, and regular security audits.

### Usability: 
- The user interface should be intuitive and user-friendly, allowing users of varying technical expertise to navigate the system easily. 

### Compliance & Standards:
- The system must comply with relevant data protection regulations (e.g., GDPR, FERPA) and industry standards to ensure the privacy and security of user information.

### Reliability: 
- The system should be reliable, with minimal downtime. It should include backup and recovery mechanisms to ensure data integrity and availability in case of failures.

### Deployment and Maintenance: 
- The system should be easy to deploy and maintain, with clear procedures for updates, bug fixes, and user support. Regular maintenance schedules should be established to ensure optimal performance and security.

## Stakeholders
### Project Sponsor
- Engr Richie Lacaya
- Eng. Troy Lasco

### Primary Point of Contact
- Valid8 group

## Signature and Approval
#### By signing below, the sponsor confirms that all information provided is accurate and complete, and authorizes the development team to proceed with the requirements based on this document.

#### Sponsor Name: 
 - Engr Richie Lacaya

###    

#### Signature:

#### Date: 
  
  
