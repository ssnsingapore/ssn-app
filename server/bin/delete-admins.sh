#!/usr/bin/env bash

if [[ ! -f "./src/db/seeds/delete-admins.js" ]]; then
  echo "delete-admins.js script was not found!"
  echo "Please open src/db/seeds/delete-admins.js.sample and follow the instructions in the comments."
  exit 1
fi

npx babel-node src/db/seeds/delete-admins.js