# SilenceSense

SilenceSense is a web application that detects silences in audio files using **Voice Activity Detection (VAD)**. The project consists of a React frontend for the user interface and a Flask backend for processing audio files.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)

## Prerequisites

Ensure you have the following installed:

- Python 3.x
- Node.js and npm (or Yarn)

## Backend Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/silencesense.git
    cd silencesense
    ```

2. **Navigate to the `backend` directory:**

    ```bash
    cd backend
    ```

3. **Install the required Python packages:**

    ```bash
    pip install -r requirements.txt
    ```

4. **Run the Flask application:**

    ```bash
    python app.py
    ```

   The backend will be running on `http://localhost:5000`.

## Frontend Setup

1. **Navigate to the `frontend` directory:**

    ```bash
    cd ../frontend
    ```

2. **Install the required Node.js packages:**

    ```bash
    npm install
    ```

    Or if you use Yarn:

    ```bash
    yarn install
    ```

3. **Start the React application:**

    ```bash
    npm start
    ```

    Or if you use Yarn:

    ```bash
    yarn start
    ```

   The frontend will be running on `http://localhost:3000`.

## Running the Application

1. Ensure both the Flask backend and the React frontend are running.
2. Open your browser and go to `http://localhost:3000` to interact with the application.

## Testing

For testing the backend, you can use tools like `curl` or Postman to send requests to the Flask API.

For frontend testing, use the built-in React testing utilities or other libraries like Jest.

## Deployment

To deploy the application, consider the following steps:

1. **Backend Deployment:**
   - Use platforms like Heroku, AWS, or Google Cloud to host the Flask application.

2. **Frontend Deployment:**
   - Deploy the React application using Vercel, Netlify, or any static site hosting service.

3. **Configure Environment Variables:**
   - Ensure that environment variables for production are set correctly in both the frontend and backend deployments.

