# Nano Feed

NanoFeed is a minimal micro-social network specifically designed for developers. It focuses on text-based interactions, developer verification, and a clean, high-contrast user interface tailored for technical communities.

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* PostgreSQL Database (Local or Cloud-based like Neon)
* GitHub OAuth Application Credentials

### Installation

1. Clone the repository to your local machine.
2. Install the project dependencies:
   ```bash
   npm install
   ```
3. Initialize the database schema and generate the Prisma Client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`. You must configure the following variables for the application to function correctly:

## Project Progress and Roadmap

- [x] Nuxt 4 Core Architecture Implementation.
- [x] GitHub OAuth Integration via Auth.js.
- [x] Responsive Sidebar and Navigation System.
- [x] Hashtag Parsing for Posts and Feeds.
- [x] User Verification Request and Approval Workflow.
- [x] Owner Dashboard for User Management and Content Moderation.
- [x] Account Restriction System with Global Publicity Banners.
- [x] Terms of Service and Privacy Policy Pages.
- [ ] Direct Messaging System between Verified Users.
- [ ] Advanced Content Recommendation Engine.
- [ ] Multi-Organization Feed Support.
- [ ] Enhanced Statistical Visualization for Owners.
- [ ] More features will be added soon.

## License

This project is licensed under the MIT License.
