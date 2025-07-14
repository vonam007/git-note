# GitHub Notes Frontend

This is the React frontend application for the GitHub Notes project.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Profile Management**: Configure GitHub username and token for PR integration
- **Notes Management**: Create, read, update, delete notes with rich UI
- **GitHub PR Integration**: Automatic fetching of PR information when creating notes
- **Search & Filter**: Advanced search functionality for notes
- **Responsive Design**: Mobile-friendly interface using Bootstrap 5

## Prerequisites

- Node.js 16+ and npm
- Backend server running on http://localhost:8080

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at http://localhost:3000

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.js
│   │   ├── NoteCard.js
│   │   ├── Pagination.js
│   │   ├── SearchFilters.js
│   │   └── LoadingSpinner.js
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.js
│   ├── pages/             # Page components
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Profile.js
│   │   ├── Notes.js
│   │   ├── NoteDetail.js
│   │   ├── CreateNote.js
│   │   └── EditNote.js
│   ├── services/          # API service functions
│   │   ├── api.js
│   │   └── noteService.js
│   ├── styles/            # Global styles
│   │   └── global.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the frontend directory to configure the API URL:

```env
REACT_APP_API_URL=http://localhost:8080
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build production version
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Key Features

### Authentication
- JWT-based authentication
- Automatic token refresh on app load
- Protected routes requiring authentication

### Notes Management
- Create notes with title and content
- Link notes to GitHub Pull Requests
- Edit and delete existing notes
- View detailed note information

### GitHub Integration
- Configure GitHub username and token in profile
- Automatic PR information fetching
- Display PR status, author, and links

### Search & Filtering
- Search notes by title and content
- Filter by PR number and state
- Pagination for large result sets

### Responsive UI
- Bootstrap 5 for responsive design
- Mobile-friendly navigation
- Toast notifications for user feedback

## Dependencies

### Core Dependencies
- **React 18**: Frontend framework
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Toastify**: Toast notifications

### UI Dependencies
- **Bootstrap 5**: CSS framework
- **Font Awesome**: Icon library

## API Integration

The frontend communicates with the backend API at http://localhost:8080 with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/notes` - Get notes with pagination/search
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get note by ID
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## GitHub Profile Setup

To use GitHub PR integration:

1. Go to Profile page
2. Enter your GitHub username
3. Generate a Personal Access Token at https://github.com/settings/tokens
4. Required permissions: `public_repo`, `read:user`
5. Save the token in your profile

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure responsive design
