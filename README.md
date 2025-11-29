# SocialAI Pro - Agency Content Platform

A production-ready React application for generating and scheduling social media content using Google Gemini AI.

## 🚀 Features

- **Dashboard**: Real-time analytics and KPIs.
- **AI Generator**: Text content generation for LinkedIn, Twitter, Instagram using `gemini-2.5-flash`.
- **Creative Designer**: AI Image generation prompts and visualization using `gemini-2.5-flash-image`.
- **Scheduler**: Monthly content calendar.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts.
- **AI**: Google GenAI SDK (`@google/genai`).
- **State**: React Hooks + LocalStorage (Mock Persistence).

## 🏃‍♂️ Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root:
   ```env
   # Get your key from https://aistudio.google.com/
   API_KEY=your_gemini_api_key_here
   ```
   *Note: In a Vite setup, prefix with `VITE_` and update the code access `import.meta.env.VITE_API_KEY`.*

3. **Run Development Server**
   ```bash
   npm start
   ```

## 🐳 Docker & Backend Architecture (Full Stack Guide)

Although this repository demonstrates the Client-Side application, a full production deployment requires the following backend services.

### Recommended Folder Structure
```
/root
  /client (This React App)
  /server (Node.js/Express)
  /docker
  docker-compose.yml
```

### Docker Compose Configuration
Create `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  # Frontend Service
  client:
    build: 
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:5000/api
  
  # Backend Service
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/socialai
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=${API_KEY}
    depends_on:
      - mongo
      - redis

  # Database
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  # Job Queue (BullMQ)
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

### Backend Deployment Strategy

1. **Database**: Use **MongoDB Atlas** for production instead of a local container.
2. **Backend**: Deploy the Node.js API to **Render** or **Railway**.
   - Use `BullMQ` for scheduling posts (Producer adds job to Redis, Worker processes it at scheduled time).
3. **Frontend**: Deploy to **Vercel** or **Netlify**.
4. **CI/CD**: Use GitHub Actions to build docker images and push to AWS ECR / Azure Container Registry if using cloud-native hosting (ECS/App Service).

## 🔐 Security Note

This demo uses `process.env.API_KEY` directly in the frontend for demonstration purposes. In a real production environment, **NEVER** expose your Gemini API key in the frontend code. Proxy all AI requests through your backend server.
