#!/bin/bash

# Set the base URL
BASE_URL="http://127.0.0.1:8000"

# Function to make a POST request
make_post_request() {
    local endpoint=$1
    local data=$2
    curl -X 'POST' \
      "${BASE_URL}${endpoint}" \
      -H 'accept: application/json' \
      -H 'Content-Type: application/json' \
      -d "${data}"
    echo  # Add a newline for better readability
}

# Initialize meetings
echo "Initializing meetings..."
make_post_request "/meetings/" '{
  "title": "Daily Scrum",
  "description": "This is the daily scrum meeting of the frontend team.",
  "date": "2024-09-30T09:00:00.000Z",
  "meeting_type": "daily"
}'

make_post_request "/meetings/" '{
  "title": "Sprint Planning",
  "description": "Bi-weekly sprint planning session.",
  "date": "2024-10-01T14:00:00.000Z",
  "meeting_type": "planning"
}'

make_post_request "/meetings/" '{
  "title": "GCP Onboarding Discussion",
  "description": "Meeting to discuss the process and benefits of onboarding Google Cloud Platform (GCP) for our company.",
  "date": "2024-10-03T11:00:00.000Z",
  "meeting_type": "discussion"
}'

make_post_request "/meetings/" '{
  "title": "Backend Architecture Review",
  "description": "Quarterly review of our backend architecture and discussion of potential improvements.",
  "date": "2024-10-05T13:30:00.000Z",
  "meeting_type": "review"
}'

make_post_request "/meetings/" '{
  "title": "Product Demo",
  "description": "Monthly product demonstration for stakeholders.",
  "date": "2024-10-10T15:00:00.000Z",
  "meeting_type": "demo"
}'

# Initialize users
echo "Initializing users..."
make_post_request "/users/" '{"username": "Lukas"}'
make_post_request "/users/" '{"username": "Anna"}'
make_post_request "/users/" '{"username": "Max"}'
make_post_request "/users/" '{"username": "Sophie"}'
make_post_request "/users/" '{"username": "David"}'

echo "Database initialization complete."