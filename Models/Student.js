const mongoose = require('mongoose')

const stSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: '',
        lowercase: true
    },
    phonenum: {
        type: String,
        default: ''
    },
    restype: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    grnum: {
        type: String,
        required: true
    },
    imgpath: {
        type: String,
        default: '/src/avatar.jpg'
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
})

// function checkForCorpus(value) {
//     if (value == 'A' || value == 'B')
//         return true
//     else
//         return false
// }

const Student = mongoose.model('Student', stSchema)

module.exports = Student