# ACADEX - AI-Powered School Management Platform

## Overview
ACADEX is a frontend React application for school management, providing dashboards for administrators, teachers, students, and parents. It was originally built on Lovable and migrated to Replit.

## Recent Changes
- 2026-02-13: Migrated from Lovable to Replit environment
  - Updated Vite config to serve on port 5000 with allowedHosts
  - Removed lovable-tagger plugin dependency from Vite config

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: react-router-dom v6
- **State/Data**: @tanstack/react-query
- **Animations**: framer-motion

## Project Structure
```
src/
  App.tsx              - Main app with routing
  main.tsx             - Entry point
  index.css            - Global styles and CSS variables
  pages/
    Landing.tsx        - Landing page
    Login.tsx          - Login page
    AdminDashboard.tsx - Admin dashboard
    TeacherDashboard.tsx - Teacher dashboard
    StudentDashboard.tsx - Student dashboard
    ParentDashboard.tsx  - Parent dashboard
    NotFound.tsx       - 404 page
  components/
    DashboardLayout.tsx - Shared dashboard layout
    NavLink.tsx        - Navigation link component
    StatCard.tsx       - Statistics card component
    ui/               - shadcn/ui components
  hooks/              - Custom hooks
  lib/                - Utility functions
```

## Running the Project
- The workflow "Start application" runs `npm run dev` which starts the Vite dev server on port 5000.

## User Preferences
- None recorded yet.
