const express = require("express")
const app = express();
const rootRouter = require('./routes/index')
const cors = require('cors')

// Load environment variables from .env and override any existing ones (like system env)
require('dotenv').config({ override: true });
console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));
  
app.options("*", cors());
app.use(express.json());

app.use("/api/v1" , rootRouter)


app.get('/health', (req,res) => {
    res.status(200).json({message: "Working"})
})

app.listen(3000,()=>{
    console.log(`Backend is running on port 3000`)
})