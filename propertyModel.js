
const mongoose = require("mongoose")
const propertySchema = mongoose.Schema({
    title: {type: String, require: true},
    price : {type: String, require: true},
    location: {type: String, require: true},
    image: {type: String, default: ""},
    agent: {type: String, require: true}
}, {timestamps: true})

const Property = new mongoose.model("Property", propertySchema)

module.exports = Property