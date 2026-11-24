# RateEase - Service Review Application System (Backend)

The server side of RateEase, a service review application. It is a small REST API built with Node.js and Express that stores services and reviews in MongoDB and serves them to the frontend. User sign-up and login are handled in the frontend with Firebase Authentication; this API does not do authentication.

- **Frontend repository**: https://github.com/nafisahnubah/rateease-client-side

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Author](#author)

## Features
- **Service Management**: list services (with pagination), get featured services, and add, update, and delete services.
- **Review Management**: post reviews for a service, and list, update, and delete a user's reviews.
- **Review details**: a user's reviews are returned together with the reviewed service's name and company details.
- **Data Persistence**: services and reviews are stored in MongoDB (database `rate-ease`, collections `services` and `reviews`).
- **CORS Support**: the frontend can call the API from a different domain.

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB** (official Node.js driver)
- **CORS**
- **dotenv**

## Getting Started

### Requirements
- Node.js 16.20.1 or newer (required by the MongoDB driver)
- A MongoDB Atlas cluster and a database user

### Setup
```bash
npm install
cp .env.example .env   # then fill in DB_USER and DB_PASS
npm start
```

The server listens on `PORT` (default `5000`); `GET /` responds with `RateEase server is active.`

Environment variables (see [`.env.example`](.env.example)):

| Variable | Required | Description |
|---|---|---|
| `DB_USER` | yes | MongoDB Atlas database username |
| `DB_PASS` | yes | MongoDB Atlas database password |
| `PORT` | no | Port to listen on (default `5000`) |

The cluster hostname is set in the connection string in [`index.js`](index.js). To use your own cluster, replace it there.

Routes are registered once the MongoDB connection succeeds. If the database can't be reached, only `GET /` responds and every other route returns 404.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/services?page=&size=` | One page of services (`page` is zero-based) |
| GET | `/servicesCount` | Total number of services: `{ count }` |
| GET | `/featured-services` | The first 6 services |
| GET | `/services/:id` | One service by ID |
| POST | `/add-service` | Add a service (JSON body) |
| GET | `/my-services?email=` | Services added by a user (matched on `user_email`) |
| GET | `/my-services/:id` | One service by ID |
| PUT | `/my-services/:id` | Update a service's company name, logo, website, service name, category, and description |
| DELETE | `/my-services/:id` | Delete a service |
| POST | `/reviews` | Post a review (JSON body) |
| GET | `/reviews/:id` | Reviews for a service (by service ID) |
| GET | `/my-reviews?email=` | A user's reviews, each with the service name, company name, and logo |
| GET | `/my-reviews/:id` | One review by ID |
| PUT | `/my-reviews/:id` | Update a review's rating and text |
| DELETE | `/my-reviews/:id` | Delete a review |

Endpoints are not authenticated: anyone who can reach the API can call them.

## Deployment
The API is deployed to Vercel using [`vercel.json`](vercel.json), which routes all requests to `index.js`. Set `DB_USER` and `DB_PASS` as environment variables in the Vercel project.

## Author
- Name: Nafisah Nubah
- Email: nafisahnubah@gmail.com
