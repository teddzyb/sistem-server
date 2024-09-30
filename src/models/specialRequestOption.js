const mongoose = require("mongoose");

const specialRequestOptionSchema = new mongoose.Schema(
    {
        requestTitle: { 
            type: String, 
            required: true 
        },
        eligibleYearLevels: [
            {
                type: String,
            }
        ],
        colorCode : {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true
    }
)

const SpecialRequestOption = mongoose.model(
  "SpecialRequestOption",
  specialRequestOptionSchema
);

module.exports = SpecialRequestOption;