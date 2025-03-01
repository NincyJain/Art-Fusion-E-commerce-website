#!/usr/bin/env bash
# Install ODBC drivers and development libraries
apt-get update
apt-get install -y unixodbc unixodbc-dev

# Now run the regular build command
npm install