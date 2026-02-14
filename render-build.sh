#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Instala o Chrome no cache do Render
npx puppeteer browsers install chrome
