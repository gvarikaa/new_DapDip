# DapDip Social Network

DapDip is a feature-rich social network platform built with modern web technologies, focusing on AI-powered content analysis, real-time interactions, and type-safe development.

## Features

- 👥 **User Profiles**: Customizable profiles with bio, profile pictures, and activity feeds
- 📝 **Posts System**: Create, edit, comment on, and share posts with media support
- 💬 **Real-time Chat**: Message other users with real-time notifications
- 🤖 **AI Analysis**: Content analysis with Gemini 1.5 Pro for sentiment, topics, and engagement prediction
- 🔎 **Personalized Feed**: Content tailored to user interests
- 🌓 **Theme Support**: Light/dark mode and customizable themes
- 🛡️ **Security**: CSRF protection, XSS prevention, and data encryption
- 📱 **Responsive Design**: Works on all device sizes

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 19**
- **TypeScript** with strict typing
- **TailwindCSS** with theme support
- **Radix UI** for accessible components
- **tRPC** for type-safe API calls
- **next-auth** for authentication

### Backend
- **tRPC** for type-safe API procedures
- **Prisma ORM** for database interactions
- **Supabase PostgreSQL** for data storage
- **NextAuth.js** for authentication
- **Pusher** for real-time features
- **Gemini AI** for content analysis
- **Zod** for validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Google API key for Gemini AI
- Pusher account for real-time features
- Bunny.net account for media storage

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/dapdip"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Pusher
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_SECRET="your-pusher-app-secret"
PUSHER_APP_CLUSTER="your-pusher-app-cluster"

# Media Storage
BUNNY_API_KEY="your-bunny-api-key"
BUNNY_STORAGE_NAME="your-bunny-storage-name"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"

# Security
ENCRYPTION_SECRET="your-encryption-secret-key"
```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/dapdip.git
   cd dapdip
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up the database
   ```bash
   npx prisma db push
   ```

4. Generate Prisma client
   ```bash
   npx prisma generate
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/src
  /app                 # Next.js App Router pages
  /components          
    /ai                # AI-related components
    /comment           # Comment components
    /layout            # Layout components
    /post              # Post components
    /profile           # Profile components
    /ui                # UI components library
  /lib
    /ai                # AI service integrations
    /api               # API routes
      /trpc            # tRPC procedures
        /routers       # tRPC routers by feature
    /security          # Security utilities
    /trpc              # tRPC client setup
    /validations       # Zod validation schemas
  /prisma              # Prisma schema and migrations
/public                # Static assets
```

## Development Workflows

### Database Schema Updates

1. Modify the schema in `prisma/schema.prisma`
2. Apply changes to the database:
   ```bash
   npx prisma db push
   ```
3. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

### Adding New Features

1. Create Prisma models if needed
2. Add Zod validation schemas in `/lib/validations`
3. Create tRPC procedures in `/lib/api/trpc/routers`
4. Implement React components in `/components`
5. Add pages in `/app` directory

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Deployment Platforms

- **Vercel**: Recommended for easy deployment
- **Railway**: Good for both frontend and PostgreSQL database
- **Supabase**: For database hosting
- **Docker**: Container deployment available

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Google for Gemini AI API
- All open-source contributors whose libraries make this possible
