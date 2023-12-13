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

Postgres database will be available on http://localhost:5440

PgAdmin UI will be available on http://localhost:80

Connect to PgAdmin UI using:

- login in the UI (username: `postgres@gmail.com`, password: `postgres`)
- host: `host.docker.internal`
- port: `5440`
- username/password/maintenance database:`postgres`

## Running the app

Make sure to run the migrations before running the app (see Migrations section below)

### Development:

- To start the project in dev mode, run `npm run start:dev`

### Production:

- To build the project, run `npm run build`
- To start the project in prod mode, run `npm run start:prod`

### Testing:

- Please note the tests setup will use env vars from `.env.test`

- To run all tests once, run `npm run test`
- To run all tests and watch for changes `npm run test:watch`
- To run single test file and watch for changes `npm run test:watch -- src/modules/auth/tests/auth.service.spec.ts`

### Lint:

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

## Swagger

Swagger will be available on http://localhost:3000/docs by default

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
      _Google_ https://developers.google.com/maps/documentation/javascript/examples/distance-matrix (token provided
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
