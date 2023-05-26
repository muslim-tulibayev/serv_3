const route = require('express').Router()
const multer = require('multer')
const path = require('path')

const firebase = require('firebase/app')
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage')

const firebaseConfig = {
    apiKey: "AIzaSyBxueQvnpzJJKbvulZvtIck-ysH7ZdeFJI",
    authDomain: "tutorial-78191.firebaseapp.com",
    projectId: "tutorial-78191",
    storageBucket: "tutorial-78191.appspot.com",
    messagingSenderId: "518791900148",
    appId: "1:518791900148:web:8b7506f168b1cfbafc27a1",
    measurementId: "G-JQ4NLWZ4RS"
}

firebase.initializeApp(firebaseConfig)
const storage = getStorage()

const upload = multer({ storage: multer.memoryStorage() })

route.post('/img', upload.single('image'), async (req, res) => {
    const storageRef = ref(storage, `Images/${Date.now() + path.extname(req.file.originalname)}`)

    const metadata = {
        contentType: 'image/jpeg'
    }

    const snapshot = await uploadBytes(storageRef, req.file.buffer, metadata)
    const downloadURL = await getDownloadURL(snapshot.ref)
    res.send(downloadURL)
})

module.exports = route














// function uploadFunc(pathname) {
//     const storage = multer.diskStorage({
//         destination: (req, file, callback) => {
//             callback(null, pathname)
//         },
//         filename: (req, file, callback) => {
//             callback(null, Date.now() + path.extname(file.originalname) )
//         }
//     })

//     const upload = multer({
//         storage: storage,
//         // fileFilter: (req, file, callback) => {
//         //     let ext = path.extname(file.originalname)
//         //     if (ext != ".mp3")
//         //         callback(new Error('Only audios are allowed!'))
//         //     else
//         //         callback(null, true)
//         // }
//     }).single('image')

//     return upload
// }

// route.post('/img', (req, res) => {
//     uploadFunc(req, res, err => {
//         if (err) {
//             console.log( err )
//             res.send(err.message)
//         } else {
//             console.log( req.file )
//             res.send(req.file.filename)
//         }
//     })
// })