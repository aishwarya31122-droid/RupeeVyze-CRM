# RupeeVyze Insurance CRM

## Project Overview

The **RupeeVyze Insurance CRM** is an internal Customer Relationship Management system developed to support insurance customer management, advisor recruitment, advisor operations, client management, follow-ups, policy information, and business analytics.

The CRM provides a centralized platform for managing both the **insurance customer lifecycle** and **advisor recruitment lifecycle**, helping the team organize records and track progress through defined stages.

---

## Main Objectives

* Centralize insurance customer lead management
* Track advisor recruitment and onboarding
* Manage advisor operations
* Track customer and advisor follow-ups
* Manage client and policy information
* Track premium collection
* Provide dashboard and business analytics
* Support role-based access for Admin and Advisors
* Maintain structured recruitment and customer workflows

---

## Main Modules

The CRM consists of the following modules:

1. **Dashboard**
2. **Lead Management**
3. **Advisor Recruitment**
4. **Advisor Operations**
5. **Client Portfolio**
6. **Follow-up Tracker**
7. **Reports & Analytics**
8. **Team Members**
9. **Performance Tracker**
10. **Override & Payout Tracker**
11. **Settings**

---

## Insurance Customer Workflow

The insurance customer lifecycle is managed through the following stages:

```text
New Lead
   ↓
Qualified
   ↓
Financial Need Analysis
   ↓
Product Recommendation
   ↓
Illustration Shared
   ↓
Proposal Submitted
   ↓
Medical
   ↓
Underwriting
   ↓
Policy Issued
   ↓
Premium Collected
   ↓
Active Client
```

Each stage allows relevant customer information to be maintained as the lead progresses through the insurance process.

---

## Advisor Recruitment Workflow

The advisor recruitment lifecycle is managed through the following stages:

```text
New Lead
   ↓
First Contact
   ↓
Interested
   ↓
KYC Pending
   ↓
KYC Complete
   ↓
Training
   ↓
Exam
   ↓
Code Generation
   ↓
Activation
   ↓
Business Started
```

The recruitment workflow allows the team to track candidates from the initial lead stage through onboarding and business commencement.

---

## Role-Based Access

The CRM supports different access levels for Admin and Advisor users.

### Admin

Admin users have access to:

* All recruitment records
* All advisor records
* All customer leads
* Client information
* Dashboard and analytics
* CRM management information
* Team-related information
* Reports and performance information

### Advisor

Advisor users have access to information relevant to their assigned customers and leads.

Advisors can:

* Add their own customer leads
* Edit permitted lead information
* Track their own leads
* View their assigned customers
* Manage relevant follow-ups

Advisors should not have access to other advisors' customer information or Admin-only information.

---

## Policy Management

The CRM supports the maintenance of policy-related information after a policy is issued.

Policy information includes:

* Policy Number
* Insurance Company
* Policy Type
* Policy Start Date
* Policy End Date
* Premium Frequency
* Sum Assured
* Nominee Name
* Remarks

---

## Premium Collection

The CRM also supports recording premium collection information.

Relevant information includes:

* Premium Amount
* Collection Date
* Payment Mode
* Transaction ID
* Receipt Number
* Collected By
* Remarks

---

## Dashboard & Analytics

The Dashboard provides a centralized overview of CRM activities and business information.

It includes areas such as:

* Lead statistics
* Recruitment overview
* Recruitment funnel
* Client information
* Advisor information
* Performance metrics
* Business-related analytics

The Reports & Analytics and Performance Tracker modules provide additional views for monitoring CRM activities and performance.

---

## Technology Stack

### Frontend

* React
* Vite
* React Router
* Material UI
* Recharts
* JavaScript
* HTML
* CSS

### Backend / Database

* Supabase
* PostgreSQL
* Supabase APIs
* Supabase Storage

### Hosting

* Render

### Source Control

* GitHub

---

## Project Structure

The project is primarily organized into the following directories and files:

```text
RupeeVyze-CRM/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── data/
│   └── ...
│
├── public/
│
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
├── index.css
├── README.md
└── .gitignore
```

### Important Directories and Files

* `src/` – Main React application source code
* `public/` – Static and public assets
* `package.json` – Project dependencies and scripts
* `vite.config.js` – Vite configuration
* `index.html` – Main HTML entry point
* `index.css` – Global styling
* `README.md` – Project documentation

---

## Running the Project Locally

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/rupeevyze/RupeeVyze-CRM.git
```

### 2. Navigate to the Project

```bash
cd RupeeVyze-CRM
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The terminal will display the local development URL provided by Vite.

---

## Environment Configuration

If environment variables are required for Supabase or other services, create a local `.env` file and configure the required values.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Do not commit `.env` files or private API keys to the GitHub repository.

---

## Deployment

The current CRM application is deployed using **Render**.

### Live Application

https://rupeevyze-crm.onrender.com/login

### Source Repository

https://github.com/rupeevyze/RupeeVyze-CRM

The GitHub repository is used for source-code management, while Render is used for the current application deployment.

---

## Data Management

The application uses **Supabase** for database and related backend services.

Supabase provides:

* PostgreSQL database
* API access
* Data storage
* Supabase Storage for supported files and assets

Application data is managed through the configured Supabase services and application logic.

---

## Development Notes

* The CRM is an internal application developed for RupeeVyze.
* The current deployment platform is Render.
* GitHub is the primary source-control repository.
* Supabase is used for database and backend services.
* Access to the application, repository, and backend services should be provided only to authorized team members.
* Environment variables and service credentials should not be committed to the repository.

---

## Project Resources

| Resource          | Link                                       |
| ----------------- | ------------------------------------------ |
| GitHub Repository | https://github.com/rupeevyze/RupeeVyze-CRM |
| Live Application  | https://rupeevyze-crm.onrender.com/login   |

---

## Conclusion

The RupeeVyze Insurance CRM provides a centralized platform for managing insurance customer leads, advisor recruitment, advisor operations, client information, follow-ups, policy details, premium collection, and business analytics.

The structured workflows and role-based access help organize CRM activities according to the responsibilities of Admin and Advisor users. The application is maintained through GitHub, uses Supabase for data and backend services, and is currently deployed on Render.
