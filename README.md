# recruitment-node-private 1.3.1

This assignment requires you to implement a feature within the context of the existing setup. The objective isn't merely to impress us but to produce a robust piece of work.<br/>
We believe in the saying: 'If it's worth doing, it's worth doing right.' We expect you to approach this task with diligence, aiming to create something that you'd proudly reference or use even a year from now.

We'll be evaluating the entirety of your code and how effectively you've utilised the existing setup, rather than just checking for functionality. <br/>
If you have reservations about the conventions used in the setup, kindly annotate your concerns instead of altering the provided framework.

⚠️ Please make sure to provide all data needed to start the app.

Good luck!

## Installation

- Install [NodeJS](https://nodejs.org/en/) lts or latest version
- Install [Docker](https://www.docker.com/get-started/)

- In root dir run `npm install`
- In root dir run `docker compose up -d` to run Postgres and PgAdmin docker images for local development
- Create a .env file with the content from .env.dev

## Database

Postgres database will be available on <http://localhost:5440>

PgAdmin UI will be available on <http://localhost:80>

Connect to PgAdmin UI using:

- login in the UI (username: `postgres@gmail.com`, password: `postgres`)
- host: `host.docker.internal`
- port: `5440`
- username/password/maintenance database:`postgres`

## Running the app

Make sure to run the migrations before running the app (see Migrations section below)

### Development

- To start the project in dev mode, run `npm run start:dev`

### Production

- To build the project, run `npm run build`
- To start the project in prod mode, run `npm run start:prod`

### Testing

- Please note the tests setup will use env vars from `.env.test`

- To run all tests once, run `npm run test`
- To run all tests and watch for changes `npm run test:watch`
- To run single test file and watch for changes `npm run test:watch -- src/modules/auth/tests/auth.service.spec.ts`

### Lint

- To run the lint, run `npm run lint`

Application runs on [localhost:3000](http://localhost:3000) by default.

## Migrations

Migration scripts:

- `npm run migration:generate --path=moduleName --name=InitialMigration` - automatically generates migration files with
  schema changes made
- `npm run migration:create --path=moduleName --name=CreateTableUsers` - creates new empty migration file
- `npm run migration:run` - runs migration
- `npm run migration:revert` - reverts last migration
- `npm run migration:show` - shows the list of migrations
- you can also use `npm run test:migration:run`, `npm run test:migration:show` and `npm run test:migration:revert` to
  manage testing database

## Seeding the Database

The project includes a seeding script to populate the database with initial data for development purposes.
To seed the database, run the following command:

```bash
npm run seed
```

## Swagger

Swagger will be available on <http://localhost:3000/docs> by default

You can find swagger documentation [here](https://swagger.io/docs/specification/about/)

# Farms Task - API

## Setup

- Use created app
- Free to add additional packages
- Use existing user authentication. Make sure all added endpoints are only accessible for authenticated users

## Requirements

### General

1. Need to have test

### Model

1. Add `address` & `coordinates` to User
2. Add Farm. A Farm should belong to specific user & have following
   properties: `name`, `address`, `coordinates`, `size` (e.g 21.5) & `yield` (e.g. 8.5)

### API

_Add API that supports following requirements:_

- As a user I want to be able to retrieve a list of all farms **of all users** (max 100 records a time).

  - The list should contain following properties:

    - `name`
    - `address`
    - `owner` (email)
    - `size`
    - `yield`
    - `driving distance` (travel distance from farm to requesting user's address)<br/>
      For **driving distance** you can use Distance-Matrix API of
      _Google_ <https://developers.google.com/maps/documentation/javascript/examples/distance-matrix> (token provided
      in email)
      - Please ignore rate limitations, as they should be explained later (See "Task") and don't need to be coded.

  - The user should be able to get list **sorted** by

    - **name** (a to z)
    - **date** (newest first)
    - **driving distance** (closest first)

  - The user should be able to get list **filtered** by
    - **outliers** (Boolean) (outliers = the yield of a farm is 30% below or above of the average yield of all
      farms).

_Note:_

Part of the challenge of this assignment is to interpret the requirements and make decisions just like you would when working on a real project. For the parts of the assignment that are not specifically mentioned in the requirements, consider what you think is the most effective and efficient solution. There is no single right answer; we are interested in seeing how you tackle problems and devise your solutions. Your decision-making process and the rationale behind your choices are as important as the final code itself.

### Task

- Please explain in the Readme how to handle rate limitation (write it as if you are making a PoC and you want to
  explain it to the rest of your team)
  - Max 25 pr. request
  - Max 10 requests pr. seconds

## Handling Rate Limitations(Task Solution)

It is critical to understand and control rate constraints when incorporating external APIs, like Google's Distance-Matrix API, into our applications.. These limitations, typically defined as the maximum number of requests allowed per second or request, can impact application performance, costs, and user experience if exceeded. Effective rate limit handling involves strategies like throttling (slowing down requests to stay within limits), batching (combining multiple requests into one to reduce frequency), caching (storing and reusing data from previous requests to minimize new requests), and implementing error handling and retry mechanisms. By carefully managing these rate limits, we ensure smooth, uninterrupted service and maintain the integrity of our application's interactions with external services.

Here's a guide on handling rate limitations effectively in our project using the Google's Distance-Matrix API to get driving distnce between one origin and multiple destination; we will be using a sample constraint of a maximum of 25 requests per second and 10 requests per second.

### API Limitations

1. Requests Per Request Limitation: Maximum of 25 requests to the API(external) per individual API(internal) call.
2. Requests Per Second Limitation: Maximum of 10 requests per second.

### Impact

- Exceeding rate limits can result in requests being throttled or denied.
- Surpassing cost limits can lead to unexpected charges and potential service interruption if the budget cap is reached.

## Rate Limit Management System

### System Components

1. **RedisRateLimiter:**
   - A crucial component for managing API rate limits using Redis. It tracks and controls the number of requests made globally per second, ensuring adherence to set limits.
2. **DistanceMatrixAPI:**
   - This wrapper class handles interactions with the Google Distance Matrix API. It is responsible for constructing and executing batched API requests and efficiently managing the interactions with the external API, while respecting rate limits. 
3. **Batch Processing and Rate Limit Management:**
   - The DistanceMatrixAPI class itself manages the batching of destinations, breaking down larger destination lists into smaller batches and utilizing the RedisRateLimiter to ensure each batch complies with the current rate limits.'

### Key Features

- **Scalable Rate Limiting:** The use of Redis ensures that rate limiting is effective even in high-traffic scenarios and across distributed systems.
- **Adaptable Request Handling:** Capable of handling various types of API requests, making it versatile for different use cases.
- **Efficient Batch Processing:** Groups destinations into batches, reducing the number of API calls and efficiently using the rate limit quota.
- **Dynamic Throttling:** Adjusts the rate of API requests based on current traffic and API limits, ensuring compliance with the external API's rate limits.
- **Enhanced User Experience:** By effectively managing API interactions, the system ensures a smooth and responsive user experience, avoiding disruptions due to rate limit errors.

### Code Implementation

`RedisRateLimitter` Class

```typescript

import { createClient} from "redis";
import { promisify } from "util";

export class RedisRateLimiter {
  private readonly maxRequestsPerSecond: number;
  private redisClient;
  private incrAsync: (key: string) => Promise<number>;
  private expireAsync: (key: string, ttl: number) => Promise<number>;

  constructor({ maxRequestsPerSecond, url }: { maxRequestsPerSecond: number; url: string }) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.redisClient = createClient({
      url,
    });

    this.redisClient.on("error", err => {
      console.error("Redis error: " + err);
    });

    this.redisClient.connect();

    this.incrAsync = promisify(this.redisClient.incr).bind(this.redisClient);
    this.expireAsync = promisify(this.redisClient.expire).bind(this.redisClient);
  }

  public async isRequestAllowed() {
    const currentRequests = await this.incrAsync("request_count");
    await this.expireAsync("request_count", 1);

    return currentRequests <= this.maxRequestsPerSecond;
  }
}
```

`DistanceMatrixAPI` Wrapper Class

```typescript
import { DistanceMatrixResponse, TravelMode } from "@googlemaps/google-maps-services-js";
import axios, { AxiosInstance } from "axios";
import { RedisRateLimiter } from "./RedisRateLimiter";

export class DistanceMatrixAPI {
  private axiosInstance: AxiosInstance;
  private rateLimiter: RedisRateLimiter;
  private maxDestinationsPerBatch: number;

  constructor({ apiKey, rateLimiter, maxDestinationsPerBatch = 10 }: { apiKey: string; rateLimiter: RedisRateLimiter; maxDestinationsPerBatch?: number }) {
    this.axiosInstance = axios.create({
      baseURL: "https://maps.googleapis.com/maps/api/distancematrix/json",
      params: {
        key: apiKey,
      },
    });

    this.rateLimiter = rateLimiter;
    this.maxDestinationsPerBatch = maxDestinationsPerBatch;
  }

  public async getDrivingDistance({ origins, destinations }: { origins: string[]; destinations: string[] }): Promise<number[]> {
    const batches = this.createBatches(destinations);
    let allDistances: number[] = [];

    for (const batch of batches) {
      if (!await this.rateLimiter.isRequestAllowed()) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      const distanceResponse: DistanceMatrixResponse = await this.axiosInstance.get("", {
        params: {
          origins: origins.join("|"),
          destinations: batch.join("|"),
          mode: TravelMode.driving,
        },
      });

      const batchDistances = distanceResponse.data.rows[0].elements.map(element => element.distance.value / 1000);
      allDistances = allDistances.concat(batchDistances);
    }

    return allDistances;
  }

  private createBatches(destinations: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < destinations.length; i += this.maxDestinationsPerBatch) {
      batches.push(destinations.slice(i, i + this.maxDestinationsPerBatch));
    }
    return batches;
  }
}

```

### Usage

1. **Setting Up Redis and DistanceMatrixAPI:**
   - Initialize the `RedisRateLimiter` by specifying the maximum requests per second and the Redis server URL.
   - Instantiate the `DistanceMatrixAPI` class by providing the Google API key, the `RedisRateLimiter` instance, and the maximum number of destinations per batch.
2. **Making a Request:**
   - Use the `DistanceMatrixAPI` class to make requests to the Google Distance Matrix API. Pass the origins and an array of destinations to the `getDrivingDistance` method.
   - The method handles the batching of destinations and ensures rate limiting via the `RedisRateLimiter`.

`Example Usage`

```typescript
const API_KEY: string = "YOUR_GOOGLE_API_KEY"; // Replace with your actual API key
const distanceMatrixAPI = new DistanceMatrixAPI({ apiKey: API_KEY, maxDestinationsPerBatch: 25 });
const redisRateLimiter = new RedisRateLimiter({
  maxRequestsPerSecond: 10,
  url: "redis://localhost:6379",
});

const distanceFromOriginArray = await distanceMatrixAPI.getDrivingDistance({
  origins: ["copehagen"],
  destinations: ["berlin", "paris", "rome", "madrid", "lisbon", "london"],
});

console.log(distanceFromOriginArray);
```

### Conclusion

The developed PoC represents a solution for managing API rate limitations, particularly for high-demand environments. By integrating Redis for global rate limit tracking and incorporating batch processing within the DistanceMatrixAPI class, the system efficiently handles API requests, ensuring compliance with rate limits. This modular and streamlined approach underscores the system's adaptability and scalability, making it a good model for applications requiring robust API interaction management.
