# Gatepass Web Application

A modern web application for digitizing truck gate management processes. Replaces paper-based systems with a streamlined digital workflow for managing truck entry, dispatch verification, and exit procedures.

## Features

### Core Features

- Role-based authentication (Guard, Dispatch, Warehouse, Admin)
- Digital Gatepass form with validation
- Real-time form preview
- List view with search and filtering
- 6-digit alphanumeric gatepass numbers
- Digital signature capture and storage

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
- **Signature Capture:** SignaturePad integration
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
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with test data:

   ```bash
   # Basic seeding with default values
   npx prisma db seed

   # Custom seeding with specific counts
   npx prisma db seed -- --gatepass-count 50 --user-count 5
   ```

   Seeding options:

   - `--gatepass-count` or `-g`: Number of gatepasses to generate (default: 10)
   - `--user-count` or `-u`: Number of additional users per role (default: 2)

   The seed script will create:

   - One default user for each role
   - Additional users per role based on --user-count
   - Random gatepasses with realistic data based on --gatepass-count

6. Start the development server:
   ```bash
   npm run dev
   ```

## Test Users

The following test accounts are available after seeding:

- **Admin**

  - Email: admin@example.com
  - Password: password123

- **Security Guard**

  - Email: guard@example.com
  - Password: password123

- **Dispatch Officer**

  - Email: dispatch@example.com
  - Password: password123

- **Warehouse Manager**
  - Email: warehouse@example.com
  - Password: password123

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── forms/       # Form components
│   ├── gatepass/    # Gatepass-specific components
│   ├── guard/       # Guard interface components
│   ├── dispatch/    # Dispatch interface components
│   ├── layout/      # Layout components
│   ├── theme/       # Theme components
│   └── ui/          # UI components
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions
```

## Workflow

1. **Guard Entry**

   - Guard enters initial driver and truck details
   - Creates new gatepass for arriving truck
   - Directs driver to dispatch

2. **Dispatch Verification**

   - Verifies information against BOL paperwork
   - Checks truck into yard management system
   - Assigns pickup door for live loads
   - Manages truck status throughout the process

3. **Warehouse Processing** (Coming Soon)

   - Handles document processing
   - Manages seal assignments
   - Captures driver signatures

4. **Exit Verification** (Coming Soon)
   - Guard performs final checks
   - Verifies seals and requirements
   - Completes truck exit process

## Development Status

- [x] Initial project setup
- [x] Authentication system
- [x] Core form implementation
- [x] Digital signatures
- [x] Theme support and dark mode
- [x] Mobile responsiveness
- [x] Guard interface
- [x] Dispatch interface
- [ ] Warehouse interface
- [ ] Exit verification
- [ ] Export and print features
- [ ] Security & optimization
- [ ] Testing & documentation

## License

MIT
