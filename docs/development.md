# Development Guidelines

## Type System

All TypeScript types should be centralized in the `src/types` directory. This includes:

- Domain types (e.g., Gatepass related types)
- Component prop types
- API types
- Utility types

This centralization helps maintain consistency and makes it easier to:

- Share types across components
- Update types in one place
- Track type changes
- Maintain type documentation

## Pre-Commit Checklist

Before committing any changes, ensure:

1. Development Server

   - Run `npm run dev` and verify no console errors
   - Test all new features in development environment
   - Ensure all components using hooks (useSession, etc.) are wrapped in necessary providers

2. Build Verification

   - Run `npm run build` to check for build errors
   - Address any TypeScript or linting issues
   - Verify no runtime errors in production build

3. Testing

   - Test with different user roles
   - Verify protected routes work correctly
   - Check all new features with different screen sizes

4. Common Issues to Watch For
   - Client Components: Ensure "use client" directive is added where needed
   - Authentication: Components using useSession must be wrapped in SessionProvider
   - API Routes: Verify proper error handling and response types
   - Database: Test all database operations with proper error handling

## Development Workflow

1. Feature Development

   - Create feature branch
   - Implement changes
   - Run through pre-commit checklist
   - Test in development environment

2. Code Review

   - Self-review changes
   - Run build and tests
   - Check for proper error handling
   - Verify TypeScript types

3. Deployment
   - Merge to development branch
   - Verify in staging environment
   - Deploy to production
   - Monitor for any issues

## Best Practices

1. Component Structure

   - Keep components focused and single-responsibility
   - Use proper TypeScript types
   - Handle loading and error states
   - Implement proper client/server component separation

2. Authentication

   - Always wrap client components using auth hooks in SessionProvider
   - Implement proper role-based access control
   - Handle unauthorized access gracefully

3. Error Handling

   - Implement proper error boundaries
   - Handle API errors gracefully
   - Provide user-friendly error messages

4. Performance
   - Optimize component re-renders
   - Implement proper loading states
   - Use proper caching strategies
