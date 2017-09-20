#!/bin/bash -ex

lint() {
  echo "eslint $(node_modules/.bin/eslint --version)"
  #npm list babel-eslint | grep babel-eslint
  REPO_URL="https://raw.githubusercontent.com/ripple/javascript-style-guide"
  curl "$REPO_URL/es6/eslintrc" | grep -v "no-var" > ./eslintrc
  #echo "parser: babel-eslint" >> ./eslintrc
  node_modules/.bin/eslint --no-eslintrc -c ./eslintrc $(git --no-pager diff --name-only -M100% --diff-filter=AM --relative $(git merge-base FETCH_HEAD origin/HEAD) FETCH_HEAD | grep "\.js$")
}

lint
npm test
