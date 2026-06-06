# TaskTracker

A full-stack collaborative task tracking application. Create teams, assign work, discuss in comments, upload files, get real-time notifications, and use AI to generate task descriptions.

## Tech Stack

**Backend:** Node.js, Express.js, TypeScript, Prisma, PostgreSQL, Socket.io, JWT, Zod, Multer

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, React Hook Form, Socket.io-client

**AI:** Cerebras API (gpt-oss-120b) via OpenAI SDK

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- A Cerebras API key (optional, for AI descriptions)

### Setup

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start PostgreSQL
docker compose up -d

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Cerebras API key for AI features

# Run database migrations
npx prisma migrate dev

# Start the backend (port 3000)
npm run dev

# In another terminal, start the frontend (port 3001)
cd frontend && npm run dev
```

Open http://localhost:3001 to use the app.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `CEREBRAS_API_KEY` | No | Cerebras API key for AI task descriptions |
| `PORT` | No | Backend port (default: 3000) |

## Features

### Authentication
- Register and login with email and password
- JWT stored in httpOnly cookies with 7-day expiry
- Password hashing with bcrypt

### Task Management
- Create, view, update, and delete tasks
- Filter by status, priority, and team
- Search across titles and descriptions
- Sort by due date, creation date, priority, or status
- Paginated results
- Mark tasks as Open, In Progress, or Completed

### Teams & Collaboration
- Create teams and add members by email
- Three roles: Owner, Admin, Member
- Promote or demote members, remove people from teams
- All team members can view and interact with team tasks

### Comments & Attachments
- Comment on any task within your teams
- Delete your own comments (team admins and owners can remove any)
- Upload files as task attachments — images, PDFs, documents, and more
- Download or delete attachments

### Real-time Notifications
- Get instant toast notifications when someone assigns you a task
- Notified when someone comments on a task you own or are assigned to
- Bell icon in the top-right corner with unread count badge
- Notification history with clickable links to relevant tasks
- Notifications are stored even when you're offline

### AI-Powered Task Descriptions
- Click "Generate with AI" on the task creation form
- Takes your task title and writes a professional description
- Powered by Cerebras API using the gpt-oss-120b model

## API Overview

All endpoints are prefixed with `/api`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Sign out |
| GET | `/auth/me` | Get current user |

### Tasks
| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List tasks (filter, sort, search, paginate) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get task details |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/status` | Change task status |
| PATCH | `/tasks/:id/assign` | Assign task to a user |

### Teams
| Method | Path | Description |
|---|---|---|
| GET | `/teams` | List your teams |
| POST | `/teams` | Create team |
| GET | `/teams/:id` | Get team with members |
| POST | `/teams/:id/members` | Add member by email |
| DELETE | `/teams/:id/members/:userId` | Remove member |
| PATCH | `/teams/:id/members/:userId` | Update member role |

### Comments & Attachments
| Method | Path | Description |
|---|---|---|
| GET | `/tasks/:taskId/comments` | List comments |
| POST | `/tasks/:taskId/comments` | Add comment |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete comment |
| GET | `/tasks/:taskId/comments/attachments` | List attachments |
| POST | `/tasks/:taskId/comments/attachments` | Upload file (multipart) |
| DELETE | `/tasks/:taskId/comments/attachments/:id` | Delete attachment |

### Notifications
| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | Get recent notifications |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### AI
| Method | Path | Description |
|---|---|---|
| POST | `/ai/generate-description` | Generate task description from title |

## Stopping the App

```bash
# Stop PostgreSQL
docker compose down

# To also delete the database volume and start fresh
docker compose down -v
```
