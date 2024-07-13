# Use an official Node.js runtime as a parent image
FROM  node:20-alphine

# Set the working directory in the container
WORKDIR /home/emmanuel/kitchen/backend-projects/realtime-chat-backend

# Copy package.json and package-lock.json to the working directory
COPY package*. json./

# Install dependencies
RUN pnpm install 

# Expose the port the app runs on
EXPOSE 7000

# Start the application
CMD ["pnpm", "start"]