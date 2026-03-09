
# Church Management System

A full-stack application designed to digitize church administration processes including membership records, subscriptions, financial tally, events, and content management.

This system replaces the traditional paper-based record system and provides a structured platform for managing church operations.

---

# Project Architecture

The system is built using a modern full-stack architecture.

**Frontend**  
Next.js (React Framework)

**Backend**  
Spring Boot (Java REST API)

**Database**  
PostgreSQL

---

# Repository Structure

```

project-admin
│
├── backend        # Spring Boot backend API
│
├── frontend       # Next.js frontend application
│
├── database       # Database schema and scripts
│   └── schema.sql
│
├── assets         # Static assets and documents
│
└── README.md

````

---

# User Roles

The system supports role-based access control.

**ADMIN**
- Full system access
- Manages users, events, finances, subscriptions, and content

**CHAIRMAN**
- View financial reports and summaries

**SECRETARY**
- Manage church member records
- Manage announcements and content

**TREASURER**
- Manage subscriptions
- Handle income and expense entries
- Generate financial reports

**CHURCH_MEMBER**
- View personal family details
- Access blogs and church magazines

---

# Core Modules

### Membership Management
Manage family records and individual member information.

### Subscriptions
Manage yearly contributions such as:
- Santha
- Ministry
- Main contribution

### Finance / Tally
Track income and expenses.

### Events
Manage church events and event-related financial records.

### Content Management
Blogs, magazines, and gallery.

### Filters and Reports
Birthday and anniversary filters, reporting tools.

---

# Database Setup

Install PostgreSQL.

Create the database:

```bash
createdb churchdb
````

Import the schema:

```bash
psql -U postgres -d churchdb -f database/schema.sql
```

This will create the initial database tables.

---

# Backend Setup (Spring Boot)

Navigate to backend directory:

```bash
cd backend
```

Run the application:

```bash
mvnw.cmd spring-boot:run
```

Or build the project:

```bash
mvnw.cmd clean install
```

Backend server will run at:

```
http://localhost:8080
```

---

# Frontend Setup (Next.js)

Navigate to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# Development Workflow

Clone the repository:

```bash
git clone <repository-url>
```

Setup database:

```bash
psql -U postgres -d churchdb -f database/schema.sql
```

Run backend:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

---

# Technology Stack

**Frontend**

* Next.js
* React
* TypeScript

**Backend**

* Spring Boot
* Spring Security
* JPA / Hibernate

**Database**

* PostgreSQL

**Version Control**

* Git
* GitHub

---

# Future Enhancements

* Role-based dashboards
* Automated financial year creation
* Event audit tracking
* Advanced reporting system
* Mobile-friendly UI
* Document and file storage

---

# Contribution Guidelines

1. Create a new feature branch
2. Commit changes with clear messages
3. Open a pull request for review

---

---

# License

This project is licensed under the **Apache License 2.0**.

You are free to:
- Use the software for any purpose
- Modify the source code
- Distribute copies of the software
- Distribute modified versions of the software

Under the following conditions:
- You must include the original license
- You must state any significant changes made to the code

For more details, see the [LICENSE](LICENSE) file in this repository.
