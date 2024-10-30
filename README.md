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

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/src
  /app             # Next.js app router pages and layouts
  /components      # Reusable UI components
    /ui           # ShadcN UI components
    /forms        # Form-related components
    /layout       # Layout components
  /lib            # Utility functions and shared logic
  /prisma         # Database schema and migrations
/docs             # Project documentation
/public           # Static assets
```

## Security

- Role-based access control
- Secure signature storage
- Data encryption for sensitive information
- Regular backups and audit logging

## License

MIT License - See LICENSE file for details
