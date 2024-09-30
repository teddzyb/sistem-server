const mongoose = require("mongoose");

const moaSchema = new mongoose.Schema(
    {
        type:{
            type: String,
            required: true
        },
        companyName: { 
            type: String, 
            required: true 
        },
        dateSigned: { 
            type: Date, 
            required: true 
        },
        expiryDate: { 
            type: Date, 
            required: true 
        },
        file : {
            fileURL: { 
                type: String, 
                required: true 
            },
            filePath: { 
                type: String, 
                required: true 
            },
        },
        uploadedBy: { 
            type: String, 
            required: true 
        },
        uploadedDate: { 
            type: Date, 
            required: true 
        },
    },
    {
        timestamps: true
    }
)

const MOA = mongoose.model("MOA", moaSchema);

module.exports = MOA;