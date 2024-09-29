# Start with a Node.js base image for building the frontend
FROM node:20 AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Start a new stage with a Python base image for the backend
FROM python:3.10

# Set working directory for backend
WORKDIR /app

# Copy backend requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Copy the built frontend files to the backend's static directory
COPY --from=frontend-build /app/frontend/build /app/frontend

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
