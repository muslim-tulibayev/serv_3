let agentbuilding

// const socket = io()

// socket.on('connect', () => {
//     console.log('Your id: ', socket.id)
// })

window.addEventListener('load', async () => {
    const formData = [
        readCookie('usid'),
        readCookie('usid')
    ]

    const user = await fetch('/sec/getuser', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
    const userData = await user.json()
    agentbuilding = userData.agentbuilding
})

const html5QrCode = new Html5Qrcode("reader", { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] })
const config = { fps: 20, qrbox: { width: 300, height: 300 } };

function startScan() {
    document.getElementsByClassName('right')[0].classList.add('rightActive')
    document.getElementsByClassName('left')[0].classList.add('leftActive')

    html5QrCode.start({ facingMode: "user" }, config, success)
}

function stopScan() {
    document.getElementsByClassName('right')[0].classList.remove('rightActive')
    document.getElementsByClassName('left')[0].classList.remove('leftActive')

    html5QrCode.stop()
}

function resumeScan() {
    const turnsResWin = document.getElementById('turnsResWin')
    turnsResWin.classList.remove('turnsResWinReady')
    turnsResWin.classList.remove('turnsResWinActive')

    html5QrCode.resume()
}

function success(result) {
    try {
        result = result.replace(/~/g, '"')
        result = JSON.parse(result)
        setturnstile(result)
    } catch (error) {
        openAlertWin('There seems to be an error with your student card. Please try again.', function () {
            closeAlertWin()
            html5QrCode.resume()
        })
        // console.log(result)
        console.log(error.message)
    } finally {
        html5QrCode.pause()
    }
}

async function setturnstile(data) {
    const turnsResWin = document.getElementById('turnsResWin')
    turnsResWin.classList.add('turnsResWinActive')
    const turnsResInfo = document.getElementById('turnsResInfo')
    const formData = [
        readCookie('usid'),
        {
            firstname: data.f,
            lastname: data.l,
            grnum: data.g,
            building: agentbuilding
        }
    ]

    const res = await fetch('/sec/turnstile', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })


    if (res.ok) {
        const resData = await res.json()
        const st = resData.student
        const date = new Date(resData.createdAt)

        turnsResInfo.innerHTML = `
            <section class="above">
                <div class="img_wrapper">
                    <img src="${st.imgpath}">
                </div>
                <div class="info_item_wrapper">
                    <span> Student </span>
                    <p> ${st.firstname} ${st.lastname} </p>
                </div>
                <div class="info_item_wrapper">
                    <span> FACULTY </span>
                    <p> ${st.faculty} </p>
                </div>
                <div class="info_item_wrapper">
                    <span> GROUP NUMBER </span>
                    <p> ${st.grnum} </p>
                </div>
            </section>
            <div class="line"> </div>
            <section class="below">
                <div class="info_item_wrapper">
                    <span> BUILDING: </span>
                    <p> ${getFullBuilding(resData.building)} </p>
                </div>
                <div class="info_item_wrapper">
                    <span> Registered time: </span>
                    <p> ${setzero(date.getHours())}:${setzero(date.getMinutes())} </p>
                </div>
                <div class="info_item_wrapper">
                    <span> Turnstile state: </span>
                    <p class="state"> ${resData.state} </p>
                </div>
            </section>
            <p class="feedback"> If you have any question or idea, Please meet The University administration. </p>
            <button onclick="resumeScan()"> OK </button>
        `
        turnsResWin.classList.add('turnsResWinReady')

        // socket.emit('new-turn', {
        //     id: resData._id,
        //     stid: st._id,
        //     f: st.firstname,
        //     l: st.lastname,
        //     s: resData.state,
        //     b: resData.building,
        //     c: resData.createdAt

        // })

        const publishPayload = {
            channel: 'new-turns-channel',
            message: {
                id: resData._id,
                stid: st._id,
                f: st.firstname,
                l: st.lastname,
                s: resData.state,
                b: resData.building,
                c: resData.createdAt
            }
        }

        await pubnub.publish(publishPayload)

    } else {
        turnsResWin.classList.remove('turnsResWinActive')
        turnsResWin.classList.remove('turnsResWinReady')
        const resData = await res.text()
        openAlertWin(resData, function () {
            closeAlertWin()
            html5QrCode.resume()
        })
    }
}

function setzero(num) {
    if (num < 10)
        return '0' + num
    else
        return num
}