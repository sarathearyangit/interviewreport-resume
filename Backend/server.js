require('dotenv').config()
const express = require('express');

const app = require('./src/app')
const ConnectDB = require('./src/config/db')


ConnectDB()

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on Port 3000")
})