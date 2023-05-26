const mongoose = require('mongoose')

const trnsSchema = new mongoose.Schema({
    student: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Student",
        immutable: true
    },
    state: {
        type: String,
        lowercase: true,
        immutable: true,
        validate: {
            validator: checkForState,
            message: 'This universityrank is not defined?!'
        }
    },
    building: {
        type: String,
        immutable: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: new Date()
    }
})

function checkForState(value) {
    if (value == 'late' || value == 'exit' || value == 'enter')
        return true
    else
        return false
}

const Turnstile = mongoose.model('Turnstile', trnsSchema)

module.exports = Turnstile