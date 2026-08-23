const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events.js")
const bookingRoutes = require("./routes/booking.js")

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

mongoose.connect(process.env.MONGODB_URI || process.env.MONDODB_URI || process.env.MONGO_URL)
.then(()=>{
    console.log("MongoDB connected");
})
.catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
