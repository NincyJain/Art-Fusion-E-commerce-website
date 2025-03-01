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

WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Your app's port (adjust if different)
EXPOSE 8000
CMD ["npm", "start"]