const route = require('express').Router()
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
// const validator = require('kickbox').client('live_5695ceb4320450a14c97493b21008821fd772f7bff1613b6b5fac62b02ebcff1').kickbox() //new
const validator = require('kickbox').client('live_dd7321757f70b63172c48d5baf31378f39dd0c539fc2fbe35207e957774774ab').kickbox() //old
// const emailValidator = require('deep-email-validator')
const User = require('./../Models/User')
const Request = require('./../Models/Request')
const ForgotPs = require('./../Models/ForgotPs')

// Unsecure API requests
route.post('/checkuser', async (req, res) => {
    try {
        const doc = await User.findOne({ email: req.body.email })
        if (doc != null) {
            const compare = await bcrypt.compare(req.body.password, doc.password)
            if (compare)
                res.json(doc)
            else
                res.json(false)
        } else
            res.json(false)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Something went wrong?!')
    }
})

route.post('/checkforemail', async (req, res) => {
    try {

        const reqs = await Request.find({ email: req.body.email })
        if (reqs.length > 0)
            res.send('reqhas')
        else {
            const users = await User.find({ email: req.body.email })
            if (users.length > 0)
                res.send('thereis')
            else {
                validator.verify(req.body.email, async function (err, valid) {
                    if (err !== null) {
                        res.send('thereisnt')
                        console.log('Email validator has problem?!')
                        // res.status(500).send('Something went wrong?!')
                        return 0
                    }

                    if (valid.body.result === 'deliverable') {
                        res.send('thereisnt')
                    } else {
                        res.send('notvalid')
                    }
                })
            }
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Something went wrong?!')
    }
})

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mtuitios29@gmail.com',
        pass: 'xfjejbylraeloaok'
    }
})

function sendConcodeToEmail(res, email, userFname, code) {
    const h1stlye = `
        text-align: center;
        display: inline-block;
        padding: 0px 10px;
        border-radius: 5px;
        background-image: linear-gradient(45deg, #f6d059, #3584dd, #e825d7);
        font-family: sans-serif;
        font-weight: 800;
        color: white;
        margin: 0px;
    `

    const pstyle = `
        text-align: start;
        font-family: sans-serif;
        font-weight: 600;
        color: gray;
    `

    let mailOptions = {
        from: 'mtuitios29@gmail.com',
        to: email,
        subject: 'MTUIT-IOS29',
        html: `
            <div style="width: 100%; text-align: center;">
                <h1 style="${h1stlye}"> MTUIT-IOS29 </h1>
                <p style="${pstyle}"> Hi ${userFname}, </p>
                <p style="${pstyle}"> Someone tried to login in to your MTUIT-IOS29 account. </p>
                <p style="${pstyle}"> If this was you, please use the following code to confirm your identify: </p>
                <p style="${pstyle} font-size: 30px;"> ${code} </p>
                <p style="${pstyle}"> If this wasn't you, please reset your password to secure your account. </p>
            </div>
        `
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            res.status(500).send('Something went wrong?!')
        } else {
            // console.log('Email sent: ' + info.response)
            res.json('sent')
        }
    })
}

route.post('/concode', async (req, res) => {
    try {
        const users = await User.find({ email: req.body.email })
        if (users.length != 0) {
            const forgotps = await ForgotPs.findOne({ email: req.body.email })

            if (forgotps === null) {

                validator.verify(req.body.email, async function (err, valid) {
                    if (err !== null) {
                        console.log('Email validator has problem?!')
                        res.status(500).send('Something went wrong?!')
                        return 0
                    }

                    if (valid.body.result === 'deliverable') {
                        const data = {
                            email: req.body.email,
                            concode: `${Math.floor(100000 + Math.random() * 900000)}`
                        }
                        const newfrgt = await ForgotPs.create(data)
                        const user = await User.findOne({ email: newfrgt.email })
                        sendConcodeToEmail(res, user.email, user.firstname, newfrgt.concode)
                    } else {
                        res.json('notvalid')
                    }
                })

            } else {
                res.json('thereis')
            }

        } else {
            res.json('notfound')
        }


    } catch (error) {
        console.log(error.message)
        res.status(500).send('Something went wrong?!')
    }
})

route.post('/concodecheck', async (req, res) => {
    try {
        const doc = await ForgotPs.findOne(req.body)
        if (doc == null)
            res.json('wrong')
        else
            res.json('ok')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Something went wrong?!')
    }
})

route.post('/concodechange', async (req, res) => {
    try {

        const filter = {
            email: req.body.email,
            concode: req.body.concode
        }

        const doc = await ForgotPs.findOne(filter)

        if (doc == null)
            throw new Error('ForgotPs element not found?!')

        const salt = await bcrypt.genSalt(10)

        const update = {
            password: await bcrypt.hash(req.body.password, salt)
        }

        const user = await User.findOneAndUpdate({ email: req.body.email }, update)

        if (user == null)
            throw new Error('ForgotPs\' User not found?!')
        else
            res.json('ok')



    } catch (error) {
        console.log(error.message)
        res.status(500).send('Something went wrong?!')
    }
})

route.post('/addreq', async (req, res) => {
    try {
        // Add also email validator, password filter here
        const docs = await Request.find({ email: req.body.email })
        if (docs.length > 0) {
            console.log('Requester tried to avoid checkforemail filter?!')
            res.status(500).send('Something went wrong?!')
        }
        else {
            const docs2 = await User.find({ email: req.body.email })
            if (docs2.length > 0) {
                console.log('Requester tried to avoid checkforemail filter?!')
                res.status(500).send('Something went wrong?!')
            } else {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
                await Request.create(req.body)
                res.json(true)
            }
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Something went wrong?!')
    }
})


module.exports = route 