#!/usr/bin/env bash

if [[ ! -f "./src/db/seeds/create-admins.js" ]]; then
  echo "create-admins.js script was not found!"
  echo "Please open src/db/seeds/create-admins.js.sample and follow the instructions in the comments."
  exit 1
fi

npx babel-node src/db/seeds/create-admins.js