const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,  
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,  
    },
    password: {
        type: String,   
        required: true,
    },
    otp: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otpExpiration: {
        type: Date,
        required: false,
    },
});

module.exports = mongoose.model("User", userSchema);
