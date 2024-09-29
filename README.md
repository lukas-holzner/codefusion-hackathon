# Hackathon CodeFusion

This project combines a FastAPI backend with a React frontend, containerized using Docker.

## Building and Running with Docker

### Production Build

To build and run the production version of the application:

1. Ensure you have Docker installed on your system.

2. Clone this repository and navigate to the project root directory.

3. Build the Docker image:
   ```
   docker build -t fastapi-react-app .
   ```

4. Run the container:
   ```
   docker run -p 8000:8000 fastapi-react-app
   ```

5. Access the application at `http://localhost:8000`


## Project Structure

- `backend/`: Contains the FastAPI application
- `frontend/`: Contains the React application
- `Dockerfile`: Defines the production Docker image

## API Documentation

When running the application, you can access the API documentation at:

- Swagger UI: `http://localhost:8000/api/docs`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`

