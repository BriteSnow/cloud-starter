

This is a example of a web UI test using Puppeteer, Mocha, and ts-node.

It is designed to run locally (not in a docker for now).

## Install

- Go to this directory, and type `npm install` (this is not build/updated by vdev)

## Run test

From this directory. 

```sh
# Run all test
npm run test

# Run only some
npm run test -- -g login

# Run and Watch (usually only a given unit test)
npm run testw -- -g login-admin

```