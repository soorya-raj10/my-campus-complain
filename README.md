# Campus Resolve

College Complaint Management System

Build a complete, modern, responsive web application called College Complaint Management System.

Project Purpose

The application allows college students to submit complaints about problems in their college and track the progress of those complaints. Administrators can view, manage, assign, prioritize, and resolve complaints.

The application must be a working application, not just a static UI.

User Roles

There must be two user roles:

1. Student

Students should be able to:

Register an account

Log in and log out

Access a student dashboard

Submit a new complaint

Select a complaint category

Enter a complaint title

Enter a detailed complaint description

Enter the location of the problem

Upload an image or file related to the complaint

View all complaints they submitted

View complete complaint details

Track the current complaint status

View complaint history and updates

2. Admin

Admins should be able to:

Log in to an admin dashboard

View all complaints from students

Search complaints

Filter complaints by status, category, and priority

View complete complaint details

Assign a complaint to a department or staff member

Change complaint priority

Add comments and updates

Change the complaint status

Add resolution details

Complaint Categories

Include the following categories:

Classroom

Laboratory

Hostel

Wi-Fi

Transportation

Cleanliness

Infrastructure

Other

Complaint Priority

Each complaint should have one of these priorities:

Low

Medium

High

Critical

Complaint Status Flow

Use the following complaint statuses:

Submitted

Under Review

Assigned

In Progress

Resolved

Closed

Display the status clearly using badges or colored indicators.

Student Pages

Home Page

Create a modern landing page with:

Project name

Short description

Features section

Login button

Register button

Registration Page

Include:

Name

Email

Password

Confirm password

Login Page

Include:

Email

Password

Student Dashboard

Display:

Total complaints

Submitted complaints

In Progress complaints

Resolved complaints

Recent complaints

Include a button to submit a new complaint.

Submit Complaint Page

Include a form with:

Complaint title

Category

Description

Location

Priority

Image or file attachment

Validate all important fields.

My Complaints Page

Display all complaints submitted by the logged-in student.

Show:

Complaint title

Category

Status

Priority

Date created

Allow the student to click a complaint to see full details.

Complaint Details Page

Display:

Complaint title

Category

Description

Location

Attachment

Priority

Current status

Department assigned

Admin comments

Resolution details

Complaint timeline/history

Admin Pages

Admin Dashboard

Display statistics for:

Total complaints

Submitted complaints

Under Review complaints

In Progress complaints

Resolved complaints

Closed complaints

Also display recent complaints.

Complaint Management Page

Show all complaints in a table or card layout.

Include:

Search

Filter by status

Filter by category

Filter by priority

Allow the admin to:

View complaint details

Assign department

Assign staff

Change priority

Change status

Add comments

Add resolution details

Departments

Include these departments:

Administration

Maintenance

IT Department

Hostel Management

Transportation Department

Laboratory Department

Database

Use a proper database.

Create a Users table/collection with:

id

name

email

password/authentication details

role (student or admin)

created_at

Create a Complaints table/collection with:

id

title

category

description

location

priority

status

student_id

assigned_department

assigned_staff

attachment

admin_comments

resolution_details

created_at

updated_at

Create a complaint updates/history system so status changes and admin updates can be tracked.

Authentication

Implement working authentication with:

Student registration

Login

Logout

Protected pages

Role-based access

Students must not be able to access admin pages.

Required Functionality

The application must support working CRUD operations:

Create complaints

Read complaints

Update complaints

Delete complaints where appropriate

The frontend must be connected to the backend/database.

Do not create a static demonstration-only website.

Design Requirements

Create a professional and modern college-themed design.

Requirements:

Responsive for mobile and desktop

Clean navigation

Sidebar dashboard layout

Modern cards

Clear status badges

Good spacing and typography

Loading states

Empty states

Error messages

User-friendly forms

Use a clean professional color scheme suitable for a college management system.

Important Development Instructions

Build the project in a way that all major features actually work.

Start by creating the application structure and authentication.

Then implement:

Student authentication

Student dashboard

Complaint submission

Complaint database storage

My Complaints page

Complaint details and status tracking

Admin dashboard

Admin complaint management

Search and filters

Responsive design and final testing

Do not leave buttons without functionality.

Make sure the application is ready to deploy and demonstrate as a working College Complaint Management System.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://my-campus-complain.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/991b9217-48b8-4f65-902c-8afb5252bef2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
