# TaskNetAPI

# Requirements
1. Node 22.11.0 or later
1. NPM 10.9.0 or later
1. Your `firebase-admin.json` you received following the instructions in the TaskNetWeb repository

# How to run
1. run `npm i`
1. create a `.env` file in the project root
1. Add the folowing properties to the .env
    1. `PORT=1020`
    1. `ORIGIN=http://localhost:3000`
    1. `PRIVATE_KEY_ID=<your private_key_id from your firebase-admin.json>`
    1. `PRIVATE_KEY=<your private_key from your firebase-admin.json>`
1. Replace `firebase-admin.json` with the one you received
1. Run `npm run dev` to run the API locally on `http://localhost:1020`