# Gatepass Web Application

A modern web application for digitizing truck gate management processes. Replaces paper-based systems with a streamlined digital workflow for managing truck entry, dispatch verification, and exit procedures.

## Features

### Core Features

- Role-based authentication (Guard, Dispatch, Warehouse, Admin)
- Digital Gatepass form with validation
- Real-time form preview
- List view with search and filtering
- 6-digit alphanumeric gatepass numbers
- Digital signature capture and storage with:
  - Real-time drawing detection
  - Image compression
  - Clear visual feedback
  - Save/update functionality
  - Touch and pointer event support

### User Interface

- Dark mode support with theme persistence
- Fully responsive design for mobile devices
- Mobile-friendly navigation
- Role-specific dashboards

### Guard Interface

- Quick entry form for arriving trucks
- Recent entries list for reference
- Clear workflow instructions
- Initial driver and truck information capture

### Dispatch Interface

- BOL verification system
- Yard management with check-in functionality
- Pickup door assignment
- Comprehensive status management
- Real-time status updates

## Tech Stack

- **Frontend:** Next.js 14 with TypeScript
- **UI Components:** Tailwind CSS with theme support
- **Database:** Neon Postgres with Prisma ORM
- **Authentication:** NextAuth.js with role-based access
- **Signature Capture:** Enhanced SignaturePad integration with:
  - Multi-touch support
  - Automatic compression
  - Real-time state management
  - Event-based drawing detection
- **Mobile Support:** Responsive design with mobile-first approach

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   DATABASE_URL=your_postgres_url
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   SEED_DEFAULT_PASSWORD=your_secure_password  # Optional: For database seeding
   ```
   [Rest of README remains unchanged...]
