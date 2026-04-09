# SmartHire — AI-Powered Job Portal

A full-stack MERN application with skill-based job recommendation engine.

## Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

## Quick Start

### 1. Start MongoDB
Make sure MongoDB is running locally.

### 2. Start the Backend
```bash
cd server
npm run dev
```
Server runs on: http://localhost:5000

### 3. Start the Frontend
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:5173

## Features

- 🤖 AI-powered skill-based job matching (≥40% match threshold)
- 🔐 JWT authentication with role-based access (Seeker / Recruiter)
- 📋 Full application lifecycle tracking
- 🔖 Job bookmarking / wishlist
- 🔍 Debounced search + multi-filter job listings
- 📊 Recruiter dashboard with applicant management
- 📱 Fully responsive dark-mode UI

## Environment Variables (server/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smarthire
JWT_SECRET=smarthire_super_secret_jwt_key_2024
```
