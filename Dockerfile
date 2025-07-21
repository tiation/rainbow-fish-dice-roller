# Dockerfile for Rainbow Fish Dice Roller

# Use an official Node.js runtime as the parent image
FROM node:current-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application code
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Run the application
CMD [ "npm", "start" ]

