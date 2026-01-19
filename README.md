# The Prophet's Legacy - Backend API

Production-grade RESTful backend for The Prophet's Legacy Islamic learning platform.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage

## Features

- JWT-based authentication with role-based access control
- Complete CRUD operations for lessons, challenges, and user management
- Gamification system with leaderboards, achievements, and streaks
- Personal and global reminder system
- Social sharing functionality
- Admin panel endpoints for content management
- Internal worker endpoints for background jobs
- Rate limiting and security middleware
- **Complete Swagger/OpenAPI documentation with interactive UI**

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Supabase account with project configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env` file (already set up)

3. Database is already configured with all tables, RLS policies, and triggers

4. **Email Configuration** (Optional for development):
   - In development, Supabase shows confirmation links in the dashboard
   - For production, configure SMTP in Supabase Dashboard
   - See `EMAIL_CONFIGURATION_GUIDE.md` for detailed setup

5. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

**Interactive Swagger UI Documentation:** `http://localhost:3000/api-docs`

The complete OpenAPI 3.0 specification with interactive documentation is available at the `/api-docs` endpoint. You can:
- View all 78 endpoints with detailed descriptions
- See request/response schemas for every endpoint
- Test endpoints directly from the browser
- Authenticate using JWT tokens
- View all data models and error responses

## API Endpoints

All endpoints follow the specification in `backend.md`. Base URL: `http://localhost:3000/api`

### Authentication
- `POST /api/auth/parent/register` - Register parent account
- `POST /api/auth/parent/confirm` - Confirm email
- `POST /api/auth/login` - Login (parent/admin)
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset

### Parents
- `GET /api/parents/me` - Get parent profile
- `GET /api/parents/me/dashboard` - Get dashboard data
- `POST /api/parents/me/notifications/read` - Mark notifications as read

### Children
- `POST /api/children/register` - Register child profile
- `GET /api/children/me` - Get child profile
- `GET /api/children/me/favorites` - Get favorite lessons
- `POST /api/children/me/favorites` - Add favorite
- `DELETE /api/children/me/favorites/:lessonId` - Remove favorite

### Lessons
- `GET /api/lesson-categories` - Get lesson categories
- `GET /api/lessons` - Get lessons by category and level
- `GET /api/lessons/:id` - Get lesson detail
- `POST /api/lessons/:id/complete` - Mark lesson complete

### Challenges
- `GET /api/challenge-categories` - Get challenge categories
- `POST /api/attempt-sessions` - Start challenge session
- `GET /api/attempt-sessions/:sessionId/next-question` - Get next question
- `POST /api/attempt-sessions/:sessionId/answers` - Submit answer
- `POST /api/attempt-sessions/:sessionId/finish` - Finish session

### Progress & Leaderboard
- `GET /api/progress/me/summary` - Get progress summary
- `GET /api/leaderboard?period=daily|weekly|monthly` - Get leaderboard

### Reminders
- `GET /api/children/me/reminders` - Get personal reminders
- `POST /api/children/me/reminders` - Create reminder
- `PUT /api/children/me/reminders/:id` - Update reminder
- `DELETE /api/children/me/reminders/:id` - Delete reminder

### Share
- `POST /api/share/render` - Create shareable asset
- `GET /api/share/:shareId` - Get shareable status
- `POST /api/share/:shareId/track` - Track social share

### Admin Endpoints
- Lesson management: `/api/admin/lessons`, `/api/admin/lesson-categories`
- Challenge management: `/api/admin/challenge-categories`, `/api/admin/challenge-categories/:id/questions`
- Media management: `/api/admin/sfx`, `/api/admin/animations`
- Notifications: `/api/admin/notification-templates`, `/api/admin/notifications/campaigns`

### System
- `GET /api/health` - Health check
- `GET /api/version` - API version

## Database Structure

All tables have Row Level Security (RLS) enabled with proper access policies:

- `parents` - Parent accounts
- `children` - Child profiles
- `lessons`, `lesson_categories` - Educational content
- `challenges`, `challenge_questions`, `attempt_sessions` - Quiz system
- `achievements`, `leaderboards` - Gamification
- `reminders` - Personal and global reminders
- `notifications` - Parent notifications
- `shareables` - Social sharing

## Storage Buckets

- `lesson-assets` - Lesson images, audio, video
- `avatars` - User avatars
- `backgrounds` - App backgrounds
- `sfx` - Sound effects
- `animations` - Celebration animations
- `shareables` - Rendered share assets

## Security

- All endpoints (except auth and system) require JWT authentication
- Role-based access control (parent, child, admin, internal)
- Rate limiting on sensitive endpoints
- Helmet.js for security headers
- CORS enabled
- Row Level Security on all database tables

## Building

Run the build command:
```bash
npm run build
```

## Troubleshooting

### Swagger Documentation Not Loading
- Ensure server is running: `npm start`
- Visit: `http://localhost:3000/api-docs`
- Check console for YAML parsing errors
- See `FIXES_APPLIED.md` for resolved issues

### Database Connection Issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Ensure all migrations have been applied successfully

### Authentication Errors
- Check JWT token format: `Bearer TOKEN`
- Verify token hasn't expired
- Ensure user has correct role for endpoint
- Review RLS policies in Supabase dashboard

### Common Issues and Solutions
See `FIXES_APPLIED.md` for detailed fixes including:
- Swagger YAML syntax errors
- Parent registration RLS policy issues
- Error logging improvements.

## License

Private - The Prophet's Legacy
