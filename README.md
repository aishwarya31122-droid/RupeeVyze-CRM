# RupeeVyze Insurance CRM

## Project Overview

The RupeeVyze Insurance CRM is an internal Customer Relationship Management system designed to manage insurance customer leads, advisor recruitment, advisor operations, client information, follow-ups, policy information and business analytics.

The CRM provides a centralized platform for managing the customer and advisor lifecycle.

## Main Objectives

- Centralize insurance customer lead management
- Track advisor recruitment and onboarding
- Manage advisor operations
- Track customer follow-ups
- Manage client and policy information
- Track premium collection
- Provide dashboard and business analytics
- Support role-based access for Admin and Advisors

## Main Modules

1. Dashboard
2. Lead Management
3. Advisor Recruitment
4. Advisor Operations
5. Client Portfolio
6. Follow-up Tracker
7. Reports & Analytics
8. Team Members
9. Performance Tracker
10. Override & Payout Tracker
11. Settings

## Insurance Customer Workflow

New Lead → Qualified → Financial Need Analysis → Product Recommendation → Illustration Shared → Proposal Submitted → Medical → Underwriting → Policy Issued → Premium Collected → Active Client

## Advisor Recruitment Workflow

New Lead → First Contact → Interested → KYC Pending → KYC Complete → Training → Exam → Code Generation → Activation → Business Started

## Role-Based Access

### Admin

Admin users have access to:

- All recruitment records
- All advisors
- All leads
- Dashboard
- CRM management information

### Advisor

Advisors can:

- Add their own customer leads
- Edit their own leads
- Track their own leads
- View their assigned customers

Advisors should not have access to other advisors' customer information or Admin-only information.

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Material UI
- Recharts

### Backend / Database

- Supabase
- PostgreSQL
- Supabase APIs
- Supabase Storage

### Hosting

- Render

### Source Control

- GitHub

## Project Structure

The project is primarily organized into:

- `src/` – React application source code
- `public/` – Public/static assets
- `package.json` – Project dependencies and scripts
- `vite.config.js` – Vite configuration

## Running the Project Locally

Install dependencies:

```bash
npm install
