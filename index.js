require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
// const http = require('http').Server(app)
// const io = require('socket.io')(http)

const PORT = process.env.PORT || 5050

// Body parser
require('body-parser')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.set('strictQuery', false)
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

// Statics
app.use('/script', express.static(path.join(__dirname, './Frontend/Scripts')))
app.use('/style', express.static(path.join(__dirname, './Frontend/Styles')))
app.use('/src', express.static(path.join(__dirname, './Src')))
// app.use('/image', express.static(path.join(__dirname, './Images')))

// Route
const secapi = require('./Routers/secure_api_route')
app.use('/sec', secapi)
const unsapi = require('./Routers/unsecure_api_route')
app.use('/uns', unsapi)
const uploads = require('./Routers/uploads')
app.use('/upload', uploads)

// Requests
app.get('/', (req, res) => {
    res.redirect('/home')
})
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, './Frontend/Views/homepage.html'))
})
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/welcomepage.html'))
})
app.get('/addnewst', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/addnewstpage.html'))
})
app.get('/allstsdata', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/allstsdatapage.html'))
})
app.get('/generateqr', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/generateqrpage.html'))
})
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/loginpage.html'))
})
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/signuppage.html'))
})
app.get('/ststate', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/ststatepage.html'))
})
app.get('/allusersdata', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/allusersdatapage.html'))
})

// Scaner
app.get('/agent', (req, res) => {
    res.sendFile(path.join(__dirname, './Frontend/Agent/index.html'))
})
app.get('/agent/style', (req, res) => {
    res.sendFile(path.join(__dirname, './Frontend/Agent/CSS/style.css'))
})
app.get('/agent/script', (req, res) => {
    res.sendFile(path.join(__dirname, './Frontend/Agent/script.js'))
})

// Temporary
app.get('/sudemo', (req, res) => {
    res.sendFile(path.join(__dirname, '/Frontend/Views/signuppageDemo.html'))
})

// io.on('connection', socket => {
//     console.log(socket.id)

//     socket.on('new-turn', data => {
//         // console.log(data)
//         socket.broadcast.emit('new-turn', data)
//     })

//     socket.on('new-req', data => {
//         console.log(data)
//         // socket.broadcast.emit('new-req', data)
//         socket.to('owner').emit('new-req', data)
//     })

//     socket.on('join-room', (room, cb) => {
//         socket.join(room)
//         cb('Joined: ' + room)
//     })
// })

// Listen
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App is being listened on the port ${PORT}`)
        })

        // http.listen(PORT, () => {
        //     console.log(`App is being listened on the port ${PORT}`)
        // })
    })