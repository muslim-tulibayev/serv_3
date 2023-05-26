const mongoose = require('mongoose')

const forgotPsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    concode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: '10m',
        immutable: true,
        default: new Date()
    }
})

const Request = mongoose.model('forgotps', forgotPsSchema)

module.exports = Request