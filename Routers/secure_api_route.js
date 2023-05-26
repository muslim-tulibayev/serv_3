const route = require('express').Router()
const Student = require('./../Models/Student')
const Turnstile = require('./../Models/Turnstile')
const User = require('./../Models/User')
const Request = require('./../Models/Request')
const bcrypt = require('bcrypt')

async function checkForUser(req, res, next) {
    try {
        const user = await User.findById(req.body[0])
        if (user != null)
            next()
        else
            res.status(500).send('Oops!!! You may not be a user?!')
    } catch (err) {
        res.status(500).send('Oops!!! Your identification number may be wrong?!')
    }
}

async function checkForAgent(req, res, next) {
    try {
        const user = await User.findById(req.body[0])
        if (user != null) {
            if (user.dbrank == 'Agent')
                next()
            else
                res.status(500).send('Oops!!! You may not be an Agent ?!')
        } else {
            res.status(500).send('Oops!!! You may not be a User?!')
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}

async function checkForOwner(req, res, next) {
    try {
        const user = await User.findById(req.body[0])
        if (user != null) {
            if (user.dbrank == 'Owner')
                next()
            else
                res.status(500).send('Oops!!! You may not be the Owner?!')
        } else {
            res.status(500).send('Oops!!! You may not be a User?!')
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}

async function checkForAdmin(req, res, next) {
    try {
        const user = await User.findById(req.body[0])
        if (user != null) {
            if (user.dbrank == 'Admin' || user.dbrank == 'Owner')
                next()
            else
                res.status(500).send('Oops!!! You may not be an Admin?!')
        } else {
            res.status(500).send('Oops!!! You may not be a User?!')
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}

async function createUser(req) {
    try {
        const check = await User.find({ email: req.email })

        if (check.length == 0) {
            const user = new User()
            user.firstname = req.firstname
            user.lastname = req.lastname
            user.email = req.email
            user.password = req.password
            user.phonenum = req.phonenum
            user.imgpath = req.imgpath
            user.universityrank = req.universityrank
            user.dbrank = req.dbrank
            user.language = req.language
            user.agentbuilding = req.agentbuilding
            user.birth = req.birth
            await user.save()
            await Request.findByIdAndDelete(req._id)
            return true
        } else {
            // Ask from The owner to delete exist request
            await Request.findByIdAndDelete(req._id)
            return false
        }

    } catch (err) {
        console.log(err.message)
        return 'err'
    }
}

async function search(arr) {
    const doc1 = await Student.where("firstname").equals(new RegExp(arr[0], 'i'))
    const doc2 = await Student.where("lastname").equals(new RegExp(arr[0], 'i'))
    return doc1.concat(doc2)
}
async function search2(arr) {
    const doc1 = await Student.where("firstname").equals(new RegExp(arr[0], 'i'))
        .where("lastname").equals(new RegExp(arr[1], 'i'))
    const doc2 = await Student.where("firstname").equals(new RegExp(arr[1], 'i'))
        .where("lastname").equals(new RegExp(arr[0], 'i'))
    return doc1.concat(doc2)
}

async function findByLnameOrFname(req, res) {
    try {
        const doc1 = await Student.findOne({ firstname: new RegExp(req[0], 'i'), lastname: new RegExp(req[1], 'i') })
        if (doc1 !== null) {
            await res.json(doc1)
            return 0
        }
        const doc2 = await Student.findOne({ firstname: new RegExp(req[1], 'i'), lastname: new RegExp(req[0], 'i') })
        if (doc2 !== null) {
            await res.json(doc2)
            return 0
        }
        await res.json(null)
        return 0
    } catch (err) {
        await res.status(500).send('Something went wrong?!')
    }
}

function filterAllStsData(docs, property, value) {
    let temp = []
    docs.forEach(doc => {
        if (doc[property] == value)
            temp.push(doc)
    })
    return temp
}

// Secure API requests

// Student APIs
route.post('/createnewst', (req, res) => {
    checkForUser(req, res, async () => {
        // Filter req.body[1] for safety
        try {

            const filter = {
                firstname: req.body[1].firstname,
                lastname: req.body[1].lastname,
                faculty: req.body[1].faculty,
                grnum: req.body[1].grnum
            }
            const check = await Student.find(filter)

            if (check.length == 0) {
                await Student.create(req.body[1])
                res.send('true')
            } else {
                throw new Error('This Student was enrolled already.')
            }

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

route.post('/updatest', (req, res) => {
    checkForAdmin(req, res, async () => {
        try {
            const stid = req.body[1].stid
            const update = {
                email: req.body[1].email,
                phonenum: req.body[1].phonenum,
                restype: req.body[1].restype,
                address: req.body[1].address,
            }

            const doc = await Student.findByIdAndUpdate(stid, update)

            if (doc == null)
                throw new Error('There is not such student.')
            else
                res.json(true)
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

route.post('/deletest', (req, res) => {
    checkForAdmin(req, res, async () => {
        try {
            const user = await Student.findByIdAndDelete(req.body[1])
            await Turnstile.deleteMany({ student: req.body[1] })

            if (user == null)
                throw new Error('Student not found')
            else
                res.json(true)

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

route.post('/clearstturns', (req, res) => {
    checkForAdmin(req, res, async () => {
        try {

            const user = await Student.findById(req.body[1])
            if (user == null)
                throw new Error('Student not found')

            const turns = await Turnstile.deleteMany({ student: req.body[1] })
            res.json(turns.deletedCount)

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

route.post('/getstsdata', (req, res) => {
    checkForUser(req, res, async () => {
        try {

            // console.log(req.body[2])

            let docs

            const searchVal = req.body[2].searchVal
            if (Array.isArray(searchVal)) {
                if (searchVal.length == 1)
                    docs = await search(searchVal)
                else if (searchVal.length == 2)
                    docs = await search2(searchVal)
            } else {
                docs = await Student.find()
            }

            if (req.body[2].faculty != '')
                docs = filterAllStsData(docs, 'faculty', req.body[2].faculty)
            if (req.body[2].grnum != '')
                docs = filterAllStsData(docs, 'grnum', req.body[2].grnum)
            if (req.body[2].restype != '')
                docs = filterAllStsData(docs, 'restype', req.body[2].restype)

            let temp = docs.slice(req.body[1].start, req.body[1].end)
            temp.unshift(docs.length)
            res.send(temp)

        } catch (err) {
            console.log(err.message)
        }
    })
})

// route.post('/checkst', (req, res) => {
//     checkForUser(req, res, () => {
//         findByLnameOrFname(req.body[1], res)
//     })
// })

route.post('/stfilter', (req, res) => {
    checkForUser(req, res, async () => {
        try {
            let doc

            if (req.body[1] === 'email')
                doc = await Student.findOne({ email: req.body[2] })

            else if (req.body[1] = 'exist')
                doc = await Student.findOne(req.body[2])

            if (doc === null)
                res.json('thereisnt')
            else
                res.json('thereis')

        } catch (err) {
            res.status(500).send('Something went wrong?!')
            console.log(err.message)
        }
    })
})

route.post('/getaction', (req, res) => {
    checkForUser(req, res, async () => {
        try {
            const formData = req.body
            let docs

            // Date Filter
            if (formData[2].dateFil === '') {
                docs = await Turnstile.find().populate('student')

            } else {
                let timeInterval

                if (formData[2].dateFil === 'today')
                    timeInterval = Date.now()
                else if (formData[2].dateFil === 'week')
                    timeInterval = Date.now() - 1000 * 60 * 60 * 24 * 7
                else if (formData[2].dateFil === 'month')
                    timeInterval = Date.now() - 1000 * 60 * 60 * 24 * 30

                timeInterval = new Date(timeInterval)
                timeInterval.setHours(0, 0, 0, 0)
                docs = await Turnstile.find().where('createdAt').gte(timeInterval).populate('student')
            }

            docs.reverse()

            // State Filter
            if (formData[2].stateFil != '')
                docs = filterAllStsData(docs, 'state', formData[2].stateFil)

            // Building Filter
            if (formData[2].buildingFil != '')
                docs = filterAllStsData(docs, 'building', formData[2].buildingFil)

            docs.sort(function (a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt)
            })

            let temp = docs.slice(formData[1].start, formData[1].end)
            temp.unshift(docs.length)
            res.json(temp)

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

route.post('/getst', (req, res) => {
    checkForUser(req, res, async () => {
        try {
            let enter = 0
            let exit = 0
            let late = 0
            let doc = await Student.findById(req.body[1])
            const turns = await Turnstile.find({ student: doc._id })
            turns.forEach(item => {
                if (item.state == 'enter')
                    enter++
                else if (item.state == 'exit')
                    exit++
                else if (item.state == 'late')
                    late++
            })
            const temp = {
                _id: doc._id,
                firstname: doc.firstname,
                lastname: doc.lastname,
                email: doc.email,
                phonenum: doc.phonenum,
                restype: doc.restype,
                address: doc.address,
                faculty: doc.faculty,
                grnum: doc.grnum,
                imgpath: doc.imgpath,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                enter: enter,
                exit: exit,
                late: late
            }
            res.send(temp)
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

// User APIs

route.post('/getuser', (req, res) => {
    checkForUser(req, res, () => {
        User.findById(req.body)
            .then(doc => {
                res.json(doc)
            })
            .catch(err => res.status(500).send('Something went wrong?!'))
    })
})

route.post('/updateuser', (req, res) => {
    checkForUser(req, res, async () => {
        if (req.body[1].password === '') {
            const user = await User.findById(req.body[0])
            req.body[1].password = user.password
        } else {
            const salt = await bcrypt.genSalt(10)
            req.body[1].password = await bcrypt.hash(req.body[1].password, salt)
        }

        await User.findByIdAndUpdate(req.body[0], req.body[1])
        res.json(true)
    })
})

route.post('/updateuserbyowner', (req, res) => {
    checkForOwner(req, res, async () => {

        const update = {
            dbrank: req.body[1].dbrank,
            agentcorpus: req.body[1].agentcorpus
        }

        await User.findByIdAndUpdate(req.body[1].userid, update)
        res.json(true)
    })
})

route.post('/deleteuser', (req, res) => {
    checkForOwner(req, res, async () => {
        try {
            const user = await User.findByIdAndDelete(req.body[1])

            if (user == null)
                throw new Error('User not found')
            else
                res.json(true)

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

route.post('/getusersdata', (req, res) => {
    checkForOwner(req, res, async () => {

        if (req.body[1] === 'all') {
            const user = await User.find()
            // delete user["password"]
            res.json(user)
        } else if (req.body[1] === 'single') {
            const user = await User.findById(req.body[2])
            res.json(user)
        }

    })
})

route.post('/requests', (req, res) => {
    checkForOwner(req, res, () => {
        Request.find()
            .then(docs => {
                if (docs.length > 0)
                    res.json(docs[0])
                else
                    res.json(null)
            })
            .catch(err => res.status(500).send('Something went wrong?!'))
    })
})

route.post('/changereq', (req, res) => {
    checkForOwner(req, res, async () => {
        const reqid = req.body[1].reqid
        const update = {
            dbrank: req.body[1].dbrank,
        }
        const doc = await Request.findByIdAndUpdate(reqid, update)
        res.json(true)
    })
})

route.post('/denyreq', (req, res) => {
    checkForOwner(req, res, () => {
        Request.findByIdAndDelete(req.body[1])
            .then(doc => {
                if (doc == null)
                    res.status(500).send('Request can not be found?!')
                else
                    res.send('The request has been denied successfully.')
            })
            .catch(err => {
                console.log(err.message)
                res.status(500).send('Something went wrong?!')
            })
    })
})

route.post('/allowreq', (req, res) => {
    checkForOwner(req, res, () => {
        Request.findById(req.body[1])
            .then(doc => {
                if (doc == null) {
                    res.status(500).send('The request can not be found?!')
                } else {
                    createUser(doc)
                        .then(data => {
                            if (data === true)
                                res.send('This User created successfully.')
                            else if (data === false)
                                res.send('The email was used already.\n That\'s why the request is deleted automatically.')
                            else
                                res.status(500).send('Something went wrong?!')
                        })
                        .catch(err => {
                            console.log(err.message)
                            res.status(500).send('Something went wrong?!')
                        })
                }
            })
    })
})

// Turnstile

route.post('/gettrns', (req, res) => {
    checkForUser(req, res, () => {
        Turnstile.find({ student: req.body[1] })
            .then(docs => {
                docs.sort(function (a, b) {
                    return new Date(b.createdAt) - new Date(a.createdAt)
                })
                res.json(docs)
            })
            .catch(err => {
                console.log(err.message)
                res.status(500).send('Something went wrong?!')
            })
    })
})

route.post('/turnstile', (req, res) => {
    checkForAgent(req, res, async () => {
        try {
            const filter = {
                firstname: req.body[1].firstname,
                lastname: req.body[1].lastname,
                grnum: req.body[1].grnum
            }
            const doc = await Student.findOne(filter)
            if (doc == null)
                res.status(500).send('There is no such student!?')
            else {
                const date = new Date()
                // const date = new Date('October 13 2014 05:59:00')
                let currentState

                // console.log(`date: ${date.getHours()}:${date.getMinutes()}`)
                // console.log('len: ', allTurns.length)

                if (date.getHours() >= 22 || date.getHours() < 6) {
                    currentState = 'late'
                } else {
                    const allTurns = await Turnstile.find({ student: doc._id })
                    if (allTurns.length % 2 == 0)
                        currentState = 'enter'
                    else if (allTurns.length % 2 == 1)
                        currentState = 'exit'
                }

                const trnsdata = {
                    student: doc._id.toString(),
                    state: currentState,
                    building: req.body[1].building
                }
                const newTurn = await Turnstile.create(trnsdata)
                res.json(await newTurn.populate('student'))
            }
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Something went wrong?!')
        }
    })
})

module.exports = route