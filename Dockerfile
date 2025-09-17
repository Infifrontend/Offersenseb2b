FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install


# Set the default command
CMD ["npm", "run", "dev"]
