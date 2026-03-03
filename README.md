# Requirement Traceability Matrix (RTM) Tool

A tool to manage and track requirements, from development to deployment.

## Prerequisites
To host or run this project, you will need:
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port 27017

## Project Structure
- `backend/`: The Express.js backend API connecting to MongoDB
- `frontend/`: The React-based frontend web application

## Running the Project Locally

### 1. Start the Backend
Open a terminal and run the following commands:
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000`.

### 2. Start the Frontend
Open a new terminal and run the following commands:
```bash
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3000`.

## Hosting / Deployment Instructions

To host this project online so that anyone can access it, you will need to host both the backend and frontend separately, and provision a cloud MongoDB database.

### 1. Database Setup
Register for a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
Once your cluster is created, obtain the connection string.
In your `backend/server.js` or via environment variables, update the connection from `mongodb://127.0.0.1:27017/rtm_db` to your Atlas connection string.

### 2. Backend Deployment (e.g., Render, Railway, or Heroku)
- Create a new web service on a platform like Render.
- Connect your GitHub repository.
- Set the root directory to `backend`.
- Set the build command to `npm install`.
- Set the start command to `npm start`.
- Ensure it exposes port `5000` or whatever the platform injects via `process.env.PORT`.

### 3. Frontend Deployment (e.g., Vercel, Netlify)
- Before deploying the frontend, update any API calls in your frontend code (e.g., `fetch("http://localhost:5000/...")`) to point to the live backend URL you just deployed.
- Create a new project on Vercel or Netlify.
- Connect your GitHub repository.
- Set the root directory to `frontend`.
- The platform should automatically detect it's a React app (Create React App) and use `npm run build` as the build command.
- Deploy the frontend.

Once both are deployed and the frontend API points to the live backend, the application will work perfectly!
