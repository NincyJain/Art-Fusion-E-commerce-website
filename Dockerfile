FROM node:20-bullseye

# Install ODBC dependencies 
RUN apt-get update && apt-get install -y \
    gnupg \
    curl \
    unixodbc \
    unixodbc-dev

# Add Microsoft repository using the correct way to add the GPG key in modern Debian
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-archive-keyring.gpg
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/debian/11/prod bullseye main" > /etc/apt/sources.list.d/mssql-release.list

RUN apt-get update
RUN ACCEPT_EULA=Y apt-get install -y msodbcsql18

# Using the root directory structure matching your application
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

# Make sure the entry point exists or print the directory structure if not
RUN ls -la || true

# Detect the entry point file
RUN if [ -f app.js ]; then \
      echo "Found app.js"; \
    elif [ -f index.js ]; then \
      echo "Found index.js"; \
      sed -i 's/node app.js/node index.js/g' package.json; \
    elif [ -f server.js ]; then \
      echo "Found server.js"; \
      sed -i 's/node app.js/node server.js/g' package.json; \
    else \
      echo "No entry file found" && ls -la; \
    fi

# Expose the correct port
EXPOSE 8000

# Use npm start for consistency with your package.json script
CMD ["npm", "start"]