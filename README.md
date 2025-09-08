
# Feedback Collection Platform

**A modern MERN stack app for creating, sharing, and analyzing feedback forms. Admins build forms, users submit responses via public links, and results are shown in a dashboard.**

## How to Run Locally

1. Install Node.js and MongoDB
2. Clone this repo:
   ```bash
   git clone https://github.com/9keystrokes/Feedback-Collection-Platform.git
   cd Feedback-Collection-Platform
   ```
3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```
5. Add `.env` files:
   - `server/.env`:
     ```env
     PORT=5000
     MONGODB_URI={your-uri}
     JWT_SECRET={your-secret}
     ```
   - `client/.env`:
     ```env
     REACT_APP_API_URL=http://localhost:5000/api
     ```
6. Start MongoDB (if local):
   ```bash
   mongod
   ```
7. Start backend:
   ```bash
   cd server
   npm run dev
   ```
8. Start frontend:
   ```bash
   cd client
   npm start
   ```
9. Open [http://localhost:3000](http://localhost:3000)

## Approach & Design Decisions

- **MERN Stack**: MongoDB, Express, React, Node.js for fast development and scalability.
- **JWT Auth**: Secure login and protected routes for admins.
- **Form Builder**: Admins create forms (3-5 questions, text/multiple-choice, required toggle).
- **Public Forms**: Anyone can submit feedback via a public link, no login needed.
- **Response Analytics**: Dashboard shows responses in table and summary view, with CSV export.
- **Material-UI**: Clean, mobile-friendly UI.
- **Validation**: All forms and responses are validated on both client and server.
- **Error Handling**: User-friendly error messages throughout.
- **Environment Config**: `.env` files for secrets and URLs.

## Features

- Admin registration/login
- Create, edit, delete forms
- Mark questions as required
- Share forms via public URL
- Collect and view responses
- Analytics dashboard (table + summary)
- Export responses to CSV
- Responsive design

## Folder Structure

- `server/` - Express backend, MongoDB models, API routes
- `client/` - React frontend, pages, components, API service
