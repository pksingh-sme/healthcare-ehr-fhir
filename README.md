# Clinic AI- Healthcare Management System Web Application

A comprehensive full-stack healthcare management system built with Next.js, featuring AI-powered scheduling, real-time messaging, billing automation, and HIPAA-compliant patient management.

## 🛠 Local Development Setup

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-organization/clinic-ai.git
cd clinic-ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

## 📁 Project Structure

```
├── docs/                  # Documentation files
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── lib/               # Utility functions and services
│   └── pages/             # Legacy pages (for Socket.io)
├── .env.example           # Environment variables template
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```
**Built with ❤️ for healthcare providers and patients**
