# Pulp Portal Backend

This is the backend server for the Pulp Portal application, handling document submission, file uploads, and user authentication.

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**

   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration:
     - `MONGO_URI`: Your MongoDB connection string
     - `DATABASE_NAME`: Your database name
     - `COLLECTION_NAME`: Your collection name
     - `PORT`: Server port (default: 3001)
     - `JWT_SECRET`: Your JWT secret key

3. **Start the Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token

### Documents

- `POST /api/submit` - Submit a new document
- `POST /api/upload` - Upload a file
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get a specific document
- `GET /api/download/:fileName` - Download a file

## Deployment

The application can be deployed on Railway:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set up environment variables
4. Deploy the application

## Security Notes

- Never commit `.env` file to version control
- Keep JWT_SECRET secure and unique
- Use HTTPS in production
- Implement proper CORS policies
