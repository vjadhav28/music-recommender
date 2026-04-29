# 🎵 Music Recommender

AI-powered music recommendation system built with **React** (frontend) and **Spring Boot + Spring AI** (backend).

## Prerequisites

- **Java 17+** and **Maven**
- **Node.js 18+** and **npm**
- **OpenAI API key**

## Production Demo Deployment

The recommended deployment path is a single Node service. The React app is built into
`frontend/dist`, and `backend-node/server.js` serves both the static frontend and
the `/api` endpoints.

### Environment

```bash
NODE_ENV=production
PORT=3001
APP_ORIGIN=https://your-domain.example
DATA_DIR=/persistent/data/path
```

- `APP_ORIGIN` is the only allowed browser origin for cross-origin requests.
- `DATA_DIR` stores the SQLite database. Point this at a persistent volume in production.
- The backend requires Node `>=22.5.0` because it uses Node's built-in SQLite module.

### Build and Run

```bash
cd frontend
npm install
npm run build

cd ../backend-node
npm install
NODE_ENV=production APP_ORIGIN=https://your-domain.example npm start
```

Health check:

```bash
curl https://your-domain.example/health
```

## Local Setup

### 1. Backend (Spring Boot)

```bash
cd backend

# Set your OpenAI API key
export SPRING_AI_OPENAI_API_KEY=sk-your-key-here

# Run the backend
./mvnw spring-boot:run
# Or if you have Maven installed:
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

### 2. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend starts on **http://localhost:5173**.

## API

### POST /api/recommendations

**Request body:**
```json
{
  "mood": "Happy",
  "genre": "Jazz",
  "activity": "Studying"
}
```

**Response:**
```json
{
  "summary": "Uplifting jazz tracks perfect for a focused study session",
  "songs": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "genre": "Jazz",
      "reason": "Why this song fits"
    }
  ]
}
```

## Project Structure

```
music-recommender/
├── backend/                    # Spring Boot + Spring AI
│   ├── src/main/java/com/music/recommender/
│   │   ├── MusicRecommenderApplication.java
│   │   ├── config/WebConfig.java
│   │   ├── controller/RecommendationController.java
│   │   ├── model/
│   │   └── service/RecommendationService.java
│   └── pom.xml
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── MoodInput.jsx
│   │   │   └── RecommendationList.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```
