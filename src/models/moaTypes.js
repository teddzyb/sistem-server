const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moaTypesSchema = new Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
    },
    {
        timestamps: true
    }
)

const MOATypes = mongoose.model("MOATypes", moaTypesSchema);
module.exports = MOATypes;