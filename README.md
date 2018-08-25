# SSN App
- Built with:
  - Create React App + Material UI
  - NodeJS + Express
  - MongoDB with Mongoose
  - PassportJS for authentication + authorization

## Local Setup
 - Install dependencies with command:
 ```
 npm i
 ```
 - Create .env files within `client` and `server` folders
 - Set up environment variables following `.env.sample` files found in respective folders
 - To run application in development mode, start server with command:
 ```
 npm run server
 ```
 - Start client separately with command:
 ```
npm start --prefix ./client
 ```


## Architecture


## Notes
### Continuous Integration (CI) with Travis

### ESLint
We use [ESLint](https://eslint.org/) to lint our code and highlight any syntax or stylistic errors. This helps us to easily stick to a set of conventions in our code across the team and minimize errors caused by small and annoying things like typos etc. that are sometimes hard to spot by eye. ESLint is also capable of autofixing simple errors (eg. extra whitespaces, newlines, missing semicolons etc.) Our ESLint rules can be configured in a `.eslintrc.json` file (we have one for the client code and one for the server code).

### Client

#### React
In Create React App, we can enable absolute imports by setting the `NODE_PATH` environment variable. This is read by the webpack config as the root path to resolve modules from. To add environment variables in development, add them to a `.env` file (see [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env))


### Server
#### Babel
We are using [babel 7](https://babeljs.io/) to transpile the server code to support ES6 imports (to normalize the code written on the client and server side). [`babel-plugin-module-resolver`](https://github.com/tleunen/babel-plugin-module-resolver) is used to allow us to resolve absolute imports from a certain root path (so that our imports are less fragile). For ESLint to recognize these absolute imports (instead of highlighting them as errors), we need to use [`eslint-plugin-import`](https://github.com/benmosher/eslint-plugin-import) and  [`eslint-import-resolver-babel-module`](https://github.com/tleunen/eslint-import-resolver-babel-module) with the appropriate configuration in our `.eslintrc.json`.

#### Express
* Handling async errors - see [here](https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#usinges7asyncawait)

### MongoDB

Starting the mongodb server:

```
mongod --dbpath <path-to-database>
```

If MongoDB was installed via Homebrew the default path is `/usr/local/var/mongodb`. The default `dbpath` of the `mongod` command is `/data/db`.

Connect to the database with the `mongo` shell:

```
mongo
```

To use a new database in the shell, run:

```
use <my-new-db-name>
```

The database will not actually be created until records are saved to it.

See [the docs](https://docs.mongodb.com/manual/core/databases-and-collections/).

To see a list of all database:

```
show dbs
```

To show the current database:

```
db
```

To show all the collections in the current database:

```
show collections
```