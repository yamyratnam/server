const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')

app.use(cors())

dotenv.config()

const PORT = 5000

mongoose.connect(process.env.MONGO_URI)
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
    console.log("Error connecting to MongoDB", err)
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

app.listen(PORT, () => {
    console.log("Server is running on", PORT)
})