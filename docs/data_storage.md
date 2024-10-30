Data Storage and Security

    Database Structure:
        Managed by Prisma with Neon Postgres as the database provider.
        Stores Gatepass records, including timestamps, seal numbers, and all verification details.
        Links driver and truck information for historical tracking.

    Data Security:
        Role-based access control to restrict actions based on the user type.
        Sensitive information such as signatures and license plate numbers stored securely.
        Regular backups and audits for compliance.
