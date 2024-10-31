# Gatepass Web App

A digital solution for managing truck gate passes, replacing the traditional paper-based system.

## Features

- Role-based authentication system
- Digital form processing
- Signature capture and verification
- Workflow management
- Export and print capabilities

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: Tailwind CSS
- **Database**: Neon Postgres with Prisma ORM
- **Authentication**: NextAuth.js

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
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions
```

## Development Status

- [x] Initial project setup
- [x] Authentication system
- [ ] Core form implementation
- [ ] Digital signatures
- [ ] Workflow implementation
- [ ] Export and print features
- [ ] Security & optimization
- [ ] Testing & documentation

## License

MIT
