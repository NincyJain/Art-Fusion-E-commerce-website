FROM node:20-bullseye

# Install ODBC dependencies 
RUN apt-get update && apt-get install -y \
    gnupg \
    curl \
    unixodbc \
    unixodbc-dev

# Add Microsoft repository and install Microsoft ODBC driver for SQL Server
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 52E16F86FEE04B979B07E28DB02C46DF417A0893
RUN curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list
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