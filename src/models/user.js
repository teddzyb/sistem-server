const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        firstName: { 
            type: String, 
            required: true 
        },
        lastName: { 
            type: String, 
            required: true 
        },
        idNumber: {
            type: String,
            // unique: true
        },
        email: { 
            type: String, 
            // required: true,
            // unique: true
        },
        user_type: { 
            type: String, 
            required: true 
        },
        program : {
            type: String,
        },
        effectiveYear : {
            type: String,
        },
        curriculum: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prospectus",
        },
        yearLevel: {
            type: String,
        },
        position: { 
            type: String, 
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isRetained: {
            type: Boolean,
            default: false
        },
        retentionCourse: {
            type: String,
        },
        hasVerified: {
            type: Boolean,
            default: false
        },
        banToPetition: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }   
);

const User = mongoose.model("User", userSchema);

module.exports = User;
