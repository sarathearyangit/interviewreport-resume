const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');


const app = express();


app.use(express.json())  
app.use(cookieParser()); // Parse cookies
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://interviewreport-resume-frontend.onrender.com"
        ],
    credentials: true
}))

const authRouter = require('./routes/authRoutes');
const interviewRouter = require("./routes/interviewRoutes");

app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);



app.get('/', (req, res) => {
    res.send('R-GenAI API is running');
});

module.exports = app;
