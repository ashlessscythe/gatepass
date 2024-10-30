# Gatepass Web Application

A modern web application for digitizing truck gate management processes. Replaces paper-based systems with a streamlined digital workflow for managing truck entry, dispatch verification, and exit procedures.

## Features

- Digital Gatepass form processing
- Role-based access control (Guard, Dispatch, Warehouse, Driver)
- Digital signature capture
- Real-time workflow tracking
- Document printing and export (PDF/CSV)
- Secure data storage and audit trails

## Tech Stack

- **Frontend:** Next.js with ShadcN UI components
- **Backend:** Prisma ORM
- **Database:** Neon Postgres
- **Authentication:** Role-based access control

## System Requirements

- Node.js (Latest LTS version)
- PostgreSQL database (Neon)
- Modern web browser with touch support for signatures

## Getting Started

Instructions for setup and deployment will be added as development progresses.

## Project Structure

The application follows a modular architecture with clear separation of concerns:

- `/app` - Next.js application routes and pages
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/styles` - Global styles and themes

## Security

- Role-based access control
- Secure signature storage
- Data encryption for sensitive information
- Regular backups and audit logging

## License

MIT License - See LICENSE file for details
