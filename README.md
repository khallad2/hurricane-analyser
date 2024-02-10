 
<p align="center">

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>
<p align="center">
  Hurricane-analyser
</p>
#### Nest.js + Typescript
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
- user only need to provide the month name to get the probability of a hurricane.
- user Authentication and authorization and security aspects are handled using (Middleware & JWT) etc..

If I have more time:
- Use Interceptors to transform Request/Response
- Implement 95% + testing code coverage
- create .env.dev & .env.stage

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




Run the application (please have a look to scripts in package.json )
in the root dir of the project root 'hurricane-analyser'
- to install dependencies $- npm install
- to run in dev mode  $- npm start dev
- to run in debug mode  $- npm start debug
- on deployment $- npm run build start prod $- npm start prod

Testing the application
in the root dir of the project root 'hurricane-analyser'
-  run unit-tests $- npm test
-  run tests with Coverage info $- npm run test:cov
-  run e2e test $- npm run test:e2e


if i have more time

i will Use Interceptors
i will cover the test code 95% +
