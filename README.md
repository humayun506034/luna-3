# Luna3Server

A Node.js/Express server application built with TypeScript, featuring authentication, file uploads, and MongoDB integration.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Cloudinary integration for file storage
- **Email**: Nodemailer integration for email functionality
- **Firebase Admin**: Firebase admin SDK support
- **Validation**: Zod schema validation
- **Task Scheduling**: Node-cron for scheduled tasks
- **TypeScript**: Full TypeScript support with type definitions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account
- Firebase project (if using Firebase features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Luna3Server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
   - `NODE_ENV`: Environment (development/production)
   - `PORT`: Server port (default: 5000)
   - `MONGOOSE_URI`: MongoDB connection string
   - `JWT_TOKEN_SECRET`: Secret for JWT tokens
   - `JWT_REFRESHTOKEN_SECRET`: Secret for refresh tokens
   - `CLOUDNARY_NAME`: Cloudinary cloud name
   - `CLOUDNARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `COMPANY_GMAIL`: Gmail address for sending emails
   - `GMAIL_APP_PASSWORD`: Gmail app password

## Scripts

### Development
```bash
npm run start:dev    # Start development server with hot reload
npm run dev          # Start with TypeScript watch mode and nodemon
```

### Production
```bash
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run start:prod   # Alternative production start
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint and auto-fix issues
npm run format       # Format code with Prettier
```

### Module Generation
```bash
npm run generate          # Generate new module
npm run generateModule    # Alternative module generator
```

## Project Structure

```
Luna3Server/
├── src/
│   ├── config/          # Configuration files
│   ├── constents/       # Constants and enums
│   ├── error/           # Error handling
│   ├── firebaseSetup/   # Firebase configuration
│   ├── interface/       # TypeScript interfaces
│   ├── middleware/      # Express middlewares
│   ├── modules/         # Feature modules
│   ├── routes/          # API routes
│   ├── seeder/          # Database seeders
│   └── util/            # Utility functions
├── scripts/             # Build and utility scripts
├── uploads/             # Temporary upload directory
├── dist/                # Compiled JavaScript (generated)
└── .env                 # Environment variables
```

## API Endpoints

Configure your API routes in the `src/routes` directory. The server will be available at `http://localhost:5000` (or your configured PORT).

## Development

The application uses:
- **Express** for the web framework
- **Mongoose** for MongoDB object modeling
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for cloud storage
- **Zod** for runtime type checking
- **Node-cron** for scheduled tasks
