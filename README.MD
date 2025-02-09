# URL Shortener API

## Overview
This project provides a URL shortener service with features like:
- Generating short URLs
- Redirecting short URLs to original URLs
- Expiring URLs based on user-defined expiration dates
- Exporting analytics data as CSV
- Implementing basic authentication for security
- Detecting and preventing spam
- Logging API requests and errors

## Features and Implementation

### 1. **Shorten a URL**
**Endpoint:** `POST /shorten`

**Logic:**
- Accepts an `originalUrl` and an optional `expirationDate` from the request body.
- Generates a unique `shortUrl` using `shortid`.
- Saves the mapping in MongoDB.
- If an `expirationDate` is provided, it is stored in the database.
- Returns the shortened URL along with its expiration date (if set).

**Example Request:**
```json
{
  "originalUrl": "https://example.com",
  "expirationDate": "2025-02-15T00:00:00.000Z"
}
```

### 2. **Redirect to Original URL**
**Endpoint:** `GET /:shortUrl`

**Logic:**
- Checks if the `shortUrl` exists in Redis (caching layer).
- If found, redirects immediately and updates the click count.
- If not found, retrieves from MongoDB, checks if expired, and caches it in Redis.
- If expired, returns a `410 Gone` status.
- Otherwise, redirects to the original URL.

### 3. **URL Expiration Handling**
- When retrieving a short URL, the expiration date is checked.
- If expired, it returns a `410 Gone` response.
- Expired URLs are periodically removed from the database.

### 4. **Analytics (Click Tracking)**
**Endpoint:** `GET /analytics/:shortUrl`

**Logic:**
- Fetches the `originalUrl`, total clicks, creation date, and expiration date.
- Returns analytics in JSON format.

### 5. **Export Analytics as CSV**
**Endpoint:** `GET /export/:shortUrl`

**Logic:**
- Retrieves analytics data from MongoDB.
- Converts it into CSV format using `json2csv`.
- Sends the CSV file as a downloadable response.

### 6. **Basic Authentication**
**Implementation:**
- Uses `basic-auth` middleware.
- Extracts credentials from the request header.
- Compares with environment variables (`BASIC_AUTH_USER`, `BASIC_AUTH_PASS`).
- Logs unauthorized access attempts.

### 7. **Spam/Malicious URL Detection**
- Uses a predefined list of blacklisted domains.
- Rejects such URLs with a `400 Bad Request` response.

### 8. **Logging (Monitoring API Usage & Errors)**
**Implementation:**
- Uses `winston` to log API requests and errors.
- Logs successful operations (`info` level) and errors (`error` level).
- Logs unauthorized access attempts (`warn` level).

## Technologies Used
- **Node.js & Express.js** - Backend Framework
- **MongoDB** - Database for storing URLs
- **Redis** - Caching Layer for fast lookups
- **shortid** - Generating unique short URLs
- **json2csv** - Exporting analytics data as CSV
- **basic-auth** - Securing API with authentication
- **winston** - Logging API activity

## Setup & Installation
```sh
git clone https://github.com/your-repo/url-shortener.git
cd url-shortener
npm install
```

### **Environment Variables** (`.env` file)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlShortenerDB
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
BASE_URL=http://localhost:5000
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=secret123
```

## Running the Application
```sh
npm start
```
### Author: Ayushi Gupta 🚀

