#!/bin/sh
# Run backend tests without relying on npm
node backend/node_modules/jest/bin/jest.js "${@}"
