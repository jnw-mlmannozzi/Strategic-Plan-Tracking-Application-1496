# StrategyPilot - Strategic Planning Application

A comprehensive strategic planning platform built for JNW Consulting LLC that helps organizations create, manage, and track their strategic initiatives over 3-year periods.

## Features

### Core Functionality
- **Strategic Plan Management**: Create and organize strategic plans with priorities, objectives, and action items
- **Team Collaboration**: Assign tasks to team members and track progress
- **Progress Tracking**: Real-time dashboard with completion metrics and status updates
- **CSV Import/Export**: Upload existing strategic plans and export data
- **Status Reporting**: Generate and print comprehensive status reports

### User Management
- **Organization-based Access**: Email domain-based organization assignment
- **Role-based Permissions**: Admin and user roles with appropriate access levels
- **User Profiles**: Manage personal information and account settings

### Subscription Management
- **Stripe Integration**: Secure payment processing with 7-day free trial
- **Multiple Plans**: Monthly ($99), Annual ($89/month), and Nonprofit ($49/month) pricing
- **Admin-only Access**: Only organization admins can manage subscriptions

### Dashboard Features
- **Monthly Filtering**: View progress by specific months
- **Multiple Views**: Toggle between "By Status" and "Priority & Objective" views
- **Progress Metrics**: Track completed, in-progress, at-risk, and overdue items
- **Visual Charts**: Interactive charts powered by ECharts

### Additional Features
- **AI Chatbot**: 24/7 assistance for user questions
- **Support Center**: Comprehensive FAQ and onboarding guides
- **Mobile Responsive**: Optimized for all devices
- **Security**: Row-level security policies in Supabase

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Charts**: ECharts
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Routing**: React Router DOM

## Brand Colors

- Primary: `#556d70`
- Secondary: `#545454`
- Accent: `#dacc3e`
- Muted: `#939fa1`
- Background: `#f5f4f1`

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase and Stripe keys:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. Set up the database:
   - Run the SQL schema in `src/sql/supabase-schema.sql` in your Supabase SQL editor
   - This creates all necessary tables and Row Level Security policies

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:

- **organizations**: Company/organization information
- **users**: User profiles and roles
- **subscriptions**: Stripe subscription data
- **strategic_plans**: Main strategic planning documents
- **strategic_priorities**: High-level priorities within plans
- **defining_objectives**: Measurable objectives under priorities
- **action_items**: Specific tasks with assignments and due dates
- **status_updates**: Progress updates on action items

## Row Level Security

All tables implement Row Level Security (RLS) policies to ensure:
- Users can only access data within their organization
- Admins have full access to their organization's data
- Regular users can only edit their assigned action items
- Subscription data is only accessible to organization admins

## User Roles

### Admin
- Create and edit strategic plans, priorities, and objectives
- Manage organization subscriptions
- Add users to the organization
- View all data within the organization

### User
- View all strategic plans and data
- Edit only assigned action items
- Add status updates
- Manage their own profile

## Subscription Plans

### Monthly Plan - $99/month
- Unlimited strategic plans
- Team collaboration tools
- Progress tracking & reporting
- CSV import/export
- Email support
- 7-day free trial

### Annual Plan - $89/month (billed annually)
- All monthly features
- Priority support
- Advanced analytics
- Custom reporting
- 2 months free
- 7-day free trial

### Nonprofit Plan - $49/month
- All standard features
- Special nonprofit pricing
- Dedicated support
- Impact tracking tools
- Grant reporting assistance
- 7-day free trial

## Support

For support inquiries, contact: help@jnwconsulting.org

## License

© 2024 JNW Consulting LLC. All rights reserved.