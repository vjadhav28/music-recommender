# 🎵 Music Recommender

AI-powered music recommendation system built with **React** (frontend) and **Spring Boot + Spring AI** (backend).

## Prerequisites

- **Java 17+** and **Maven**
- **Node.js 18+** and **npm**
- **OpenAI API key**

## Setup

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

By default, the frontend uses its curated fallback catalog so a missing backend
does not show a broken 500 state. To connect the frontend to the Spring backend
through the Vite proxy during development, add:

```bash
VITE_USE_API_PROXY=true
```

For a same-origin deployed API, use:

```bash
VITE_USE_RELATIVE_API=true
```

For a separately hosted API, use:

```bash
VITE_API_BASE_URL=https://your-api.example.com
```

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
