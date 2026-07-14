# IXORIUM 

A modern learning platform designed to simplify complex university concepts through clear explanations, interactive content, and student-focused learning experiences.

IXORIUM helps students understand difficult academic concepts through structured courses, lesson modules, and progress tracking features.

---

## Features

### Authentication & Security
- User Registration and Login
- JWT-based authentication
- Password encryption using bcryptjs
- Role-based access control (Student / Teacher)

### Course Management
- Create and manage courses
- Teacher-based course ownership
- View available courses
- MongoDB-based course storage

### Learning Modules
- Add lesson modules to courses
- Store learning notes and explanations
- Support for voice explanation links
- Organized course-based learning structure

### Progress Tracking
- Mark completed modules
- Track individual student learning progress
- Calculate course completion percentage
- Store completed module history

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose ODM

### Authentication & Security
- JWT (JSON Web Token)
- bcryptjs

---

## Current API Modules

### Authentication
/api/auth

Handles:
- User registration
- User login
- JWT token generation


### Courses
/api/courses

Handles:
- View courses
- Course management
- Teacher course creation


### Progress
/api/progress

Handles:
- Mark module completion
- Calculate course progress
- Retrieve completed modules

---

## Development Progress

    Backend server setup  
    MongoDB database connection  
    User authentication system  
    JWT authentication  
    Course management system  
    Learning module structure  
    Student progress tracking  

---

## Future Improvements

- React-based frontend interface
- Teacher dashboard
- Student learning dashboard
- Audio upload and management system
- Course search and filtering
- AI-powered concept explanation tools
- Multilingual voice explanations (English / Sinhala / Tamil)

---

## Project Status

🚧 Currently under development

IXORIUM is continuously evolving into a complete student-focused learning management platform.