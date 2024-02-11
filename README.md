 
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center" style="font-size: large">
  Hurricane-analyser |
    Nest.js + Typescript
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description
This program provides insights about the occurrence of hurricanes based on historical data.

using Poisson distribution formula to calculate the probability of hurricane occurrence 
in a given month in the future.
https://en.wikipedia.org/wiki/Poisson_distribution

This backend contains two Rest API endpoints:
 - /api/hurricanes/all
 - /api/hurricanes/expect/:monthString ex: [Jan, Feb, ....]

The program is using the following file as the data source:
https://people.sc.fsu.edu/~jburkardt/data/csv/hurricanes.csv

Assumption:
- user only need to provide a short-month name to get the probability of a hurricane.
- user Authentication and authorization and security aspects are handled using (Middleware & JWT) etc..
- Selected Probability formula: Used Poisson Distribution Formula and used the provided Average in the data source

## Environment Prerequisites
- Node.js >= 20.10.0
- npm >= 10.2.3
- Typescript >= 5.0.0
- in root directory change the name of the file .env.example => to .env 

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


### If I have more time I would do the following:
- Enhance performance by optimizing parseData
- Enhance interfaces
- Transform Request/Response using Interceptors or Middlewares
- Create centralised Exceptions handling using Filters
- Implement 95% + testing code coverage
- Add all constant strings to constants.ts for better errorMessages organizing
- Create .env.dev & .env.stage


### I hope we can talk about it soon!
