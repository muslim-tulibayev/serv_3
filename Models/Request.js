const mongoose = require('mongoose')

const reqSchema = new mongoose.Schema({
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
        required: true,
        validate: {
            validator: checkEmailForm,
            message: 'Email form is wrong?!'
        }

    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: checkForPass,
            message: 'Password symbols too short?!'
        }
    },
    phonenum: {
        type: String,
        default: ''
    },
    imgpath: {
        type: String,
        default: '/src/avatar.jpg'
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
    language: {
        type: String,
        required: true
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
        default: new Date(),
        validate: {
            validator: checkForBirth,
            message: 'Birth date form is wrong?!'
        }
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        immutable: true,
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

function checkEmailForm(value) {
    if (value.length > 10) {
        let temp = ''
        for (let i = value.length - 10; i < value.length; i++)
            temp += value[i]
        if (temp == '@gmail.com')
            return true
        else
            return false
    } else
        return false
}

function checkForPass(value) {
    if (value.length < 8)
        return false
    else
        return true
}

function checkForBirth(value) {
    if (value == null) {
        this.birth = new Date()
        return true
    }
}

function checkForBuilding(value) {
    if (value == '' || value == 'cor-a' || value == 'cor-b' || value == 'dor-a' || value == 'dor-b' || value == 'dor-c')
        return true
    else
        return false
}

const Request = mongoose.model('Request', reqSchema)

module.exports = Request