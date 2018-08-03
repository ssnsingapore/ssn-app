# SSN App
- Built with:
  - Create React App + Material UI
  - NodeJS + Express
  - MongoDB with Mongoose
  - PassportJS for authentication + authorization

## Architecture


## Notes
### React
In Create React App, we can enable absolute imports by setting the `NODE_PATH` environment variable. This is read by the webpack config as the root path to resolve modules from. To add environment variables in development, add them to a `.env` file (see [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env))

### Express
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