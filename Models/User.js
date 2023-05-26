const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phonenum: {
        type: String,
        default: ''
    },
    imgpath: {
        type: String,
        default: '/src/avatar.jpg'
    },
    language: {
        type: String,
        required: true
    },
    universityrank: {
        type: String,
        required: true,
        validate: {
            validator: checkForUniversityRank,
            message: 'This universityrank is not defined?!'
        }
    },
    dbrank: {
        type: String,
        required: true,
        validate: {
            validator: checkForDbRank,
            message: 'This dbrank is not defined?!'
        }
    },
    agentbuilding: {
        type: String,
        default: '',
        validate: {
            validator: checkForBuilding,
            message: 'This building is not defined?!'
        }
    },
    birth: {
        type: Date,
        default: new Date()
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

function checkForUniversityRank(value) {
    if (value == 'Principal' || value == 'Dean' || value == 'Teacher' || value == 'Security')
        return true
    else
        return false
}

function checkForDbRank(value) {
    if (value == 'Owner' || value == 'Admin' || value == 'Staff' || value == 'Agent')
        return true
    else
        return false
}

function checkForBuilding(value) {
    if (value == '' || value == 'cor-a' || value == 'cor-b' || value == 'dor-a' || value == 'dor-b' || value == 'dor-c')
        return true
    else
        return false
}

const User = mongoose.model('User', userSchema)

module.exports = User