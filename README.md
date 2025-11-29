# LangHub - Real-time Language Exchange Platform

A full-stack language exchange platform connecting learners with native speakers for real-time practice sessions.

## Features

- **Real-time Chat**: Socket.io-powered live messaging between language partners
- **Smart Matching**: Find language exchange partners based on native and learning languages
- **Authentication**: Secure JWT-based authentication with OAuth support (Google/Facebook)
- **Profile Management**: Comprehensive user profiles with language preferences and interests
- **Learning Resources**: Curated resources for language learning
- **Responsive Design**: Modern UI built with React and TailwindCSS


## Tech Stack

### Backend
- Node.js with Express.js
- Socket.io for real-time communication
- MongoDB with Mongoose
- JWT authentication
- Passport.js for OAuth (Google/Facebook)
- bcryptjs for password hashing

### Frontend
- React.js
- TailwindCSS for styling
- React Router for navigation
- Socket.io-client for real-time features
- Axios for API calls

## Project Structure

```
langhub/
├── server/                 # Backend server
│   ├── config/            # Configuration files
│   ├── middleware/        # Authentication middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── index.js          # Server entry point
├── client/                # React frontend
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       ├── context/      # React contexts
│       ├── pages/        # Page components
│       └── utils/        # Utility functions
└── package.json          # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google OAuth credentials (optional, for OAuth login)
- Facebook App credentials (optional, for OAuth login)

### Installation

1. **Clone the repository**
   ```bash
   cd langhub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/langhub
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # Facebook OAuth (optional)
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # From root directory
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend (port 3000).

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/facebook` - Facebook OAuth login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/match/partners` - Find language exchange partners
- `GET /api/users/:id/chats` - Get user's chats

### Chats
- `POST /api/chats` - Create or get existing chat
- `GET /api/chats/:id` - Get chat by ID
- `GET /api/chats/:id/messages` - Get chat messages
- `PATCH /api/chats/:id/archive` - Archive chat

### Resources
- `GET /api/resources` - Get all resources (with filters)
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (authenticated)
- `PATCH /api/resources/:id/like` - Like/unlike resource

## Socket.io Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server to Client
- `new_message` - New message received
- `user_typing` - User is typing indicator
- `user_stopped_typing` - User stopped typing indicator
- `error` - Error occurred

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm start  # Runs on http://localhost:3000
```

## Production Build

### Build Frontend
```bash
cd client
npm run build
```

### Run Production Server
```bash
cd server
NODE_ENV=production npm start
```

## License

MIT

