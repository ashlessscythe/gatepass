# Gatepass Web Application

A modern web application for digitizing truck gate management processes. Replaces paper-based systems with a streamlined digital workflow for managing truck entry, dispatch verification, and exit procedures.

## Features

- Role-based authentication (Guard, Dispatch, Warehouse, Admin)
- Digital Gatepass form with validation
- Real-time form preview
- List view with search and filtering
- 6-digit alphanumeric gatepass numbers
- Secure data storage
- Role-specific dashboards

## Tech Stack

- **Frontend:** Next.js 14 with TypeScript
- **UI Components:** Tailwind CSS
- **Database:** Neon Postgres with Prisma ORM
- **Authentication:** NextAuth.js with role-based access

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
5. Seed the database with test users:
   ```bash
   npx prisma db seed
   ```
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
│   ├── layout/      # Layout components
│   └── ui/          # UI components
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions
```

## Development Status

- [x] Initial project setup
- [x] Authentication system
- [x] Core form implementation
- [ ] Digital signatures
- [ ] Workflow implementation
- [ ] Export and print features
- [ ] Security & optimization
- [ ] Testing & documentation

## License

MIT
