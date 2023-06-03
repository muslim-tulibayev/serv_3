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
        // run()
        app.listen(PORT, () => {
            console.log(`App is being listened on the port ${PORT}`)
        })

        // http.listen(PORT, () => {
        //     console.log(`App is being listened on the port ${PORT}`)
        // })
    })

// const Student = require('./Models/Student')
// const Turnstile = require('./Models/Turnstile')

// const sts = [
//     {
//         id: "646454533ba37378ebca06ab",
//         state: 0
//     },
//     {
//         id: "646456a65bfad0e4c202e87a",
//         state: 0
//     },
//     {
//         id: "646457c368b346b73b2ea6ff",
//         state: 0
//     },
//     {
//         id: "64645e754a18ee19db95b219",
//         state: 0
//     },
//     {
//         id: "64645ee92e2481a40994e510",
//         state: 0
//     },
//     {
//         id: "64648edcc3ba08136c6781b2",
//         state: 0
//     },
//     {
//         id: "64648f40e79d0ae126b5f8df",
//         state: 0
//     },
//     {
//         id: "64648fe02882b8e913691b07",
//         state: 0
//     },
//     {
//         id: "646490d6c3ba08136c6781be",
//         state: 0
//     },
//     {
//         id: "646492157b6747b72710811a",
//         state: 0
//     },
//     {
//         id: "6464928c2882b8e913691b13",
//         state: 0
//     },
//     {
//         id: "646492fa9581991227918afd",
//         state: 0
//     },
//     {
//         id: "646493625647b0efd8e0d797",
//         state: 0
//     },
//     {
//         id: "646493ce3fe85a81438716e3",
//         state: 0
//     },
//     {
//         id: "646494627b6747b72710812c",
//         state: 0
//     },
//     {
//         id: "646494b451b7f6cb43e4d31d",
//         state: 0
//     },
//     {
//         id: "6464952f6fb756b0e78946ee",
//         state: 0
//     },
//     {
//         id: "6475c32d0c6770e1fb8fa855",
//         state: 0
//     }
// ]

// // "October 13, 2014 11:13:00"

// const clocks = [
//     "05:59:00", "06:00:00", "07:13:00", "07:30:00", "07:34:00",
//     "07:50:00", "08:00:00", "09:00:00", "10:30:00", "11:13:00",
//     "12:10:00", "12:30:00", "12:40:00", "12:58:00", "13:00:00",
//     "14:10:00", "15:23:00", "16:30:00", "17:09:00", "18:56:00",
//     "19:03:00", "20:39:00", "21:11:00", "21:59:00", "22:00:00"
// ]

// const bs = [
//     'cor-a', 'cor-b', 'dor-a', 'dor-b', 'dor-c'
// ]

// const months = [
//     'March', 'April', 'May', 'June'
// ]

// async function run() {
//     // console.log(await Student.find().select('_id'))
//     console.log('---------------------------------------------------------------');

//     const data = []

//     let rand_sts
//     for (let j = 0; j < 10; j++) {
//         rand_sts = Math.floor((Math.random() * 100) % sts.length)
//         data.push({
//             student: sts[rand_sts].id,
//             state: getState(sts[rand_sts].state++, "June " + 3 + ", 2023 " + clocks[j]),
//             building: bs[Math.floor((Math.random() * 100) % bs.length)],
//             createdAt: new Date("June " + 3 + ", 2023 " + clocks[j])
//         })
//     }

//     console.log(sts)

//     const res = await Turnstile.insertMany(data)
//     console.log(res)
// }

// function getState(state, d) {
//     const date = new Date(d)
//     let currentState

//     if (date.getHours() >= 22 || date.getHours() < 6) {
//         currentState = 'late'
//     } else {
//         if (state % 2 == 0)
//             currentState = 'enter'
//         else if (state % 2 == 1)
//             currentState = 'exit'
//     }

//     return currentState

//     // const trnsdata = {
//     //     student: doc._id.toString(),
//     //     state: currentState,
//     //     building: req.body[1].building
//     // }
//     // const newTurn = await Turnstile.create(trnsdata)
//     // res.json(await newTurn.populate('student'))
// }