window.addEventListener('load', async () => {
    setTimeout(() => {
        document.getElementsByClassName('loadWin')[0].classList.add('loadSilence')
    }, 300);
})

const sessLan = sessionStorage.getItem('googtrans')
if (sessLan != null)
    document.cookie = `googtrans=/en/${sessLan};path=${location.pathname}`

function logincheck(event) {
    btn = event.currentTarget
    btn.classList.add('btnOnload')
    btn.disabled = true
    const formData = {
        email: document.getElementsByName('e')[0].value,
        password: document.getElementsByName('p')[0].value
    }

    fetch('/uns/checkuser', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            if (data != false) {
                writeCookie('usid', data._id, 30)
                if (data.dbrank === 'Agent') {
                    navigateTo('/agent')
                    return 0
                }
                navigateTo('/')
            }
            else {
                btn.classList.remove('btnOnload')
                btn.disabled = false
                openAlertWin('Email or Password is wrong', function () {
                    closeAlertWin()
                })
            }
        })
}

let isLanListOpen = false
function lanList() {
    if (!isLanListOpen) {
        document.getElementsByClassName('lanList')[0].classList.add('lanListActive')
        isLanListOpen = true
    } else {
        document.getElementsByClassName('lanList')[0].classList.remove('lanListActive')
        isLanListOpen = false
    }
}

function chooseLan(lan) {
    sessionStorage.setItem('googtrans', lan)
    // document.cookie = `googtrans=/en/${lan};path=${location.pathname}`
    location.reload()
}

function writeCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";

    return document.cookie = name + "=" + value + expires + ";path=/;SameSite=None;Secure";
}

function navigateTo(url) {
    let origin = location.origin
    location.assign(origin + url)
}

function openAlertWin(msg, callback) {
    const alertWin = document.getElementById('alertWin')
    alertWin.innerHTML = `
            <div class="askwrapper borEffect">
                <p> ${msg} </p>
                <div class="btnwrapper">
                    <button class="blueBtn" onclick="(${callback})()"> Ok </button>
                </div>
            </div>
        `
    alertWin.classList.add('askWinActive')
}

function closeAlertWin() {
    document.getElementById('alertWin').classList.remove('askWinActive')
}

isFrgtWinActive = false
function activeFrgtWin() {
    if (!isFrgtWinActive) {
        document.getElementsByClassName('frgtpWin')[0].classList.add('frgtpWinActive')
        isFrgtWinActive = true
    } else {
        document.getElementsByClassName('frgtpWin')[0].classList.remove('frgtpWinActive')
        isFrgtWinActive = false
    }
}

async function sendConfirmCode(event) {
    const btn = event.currentTarget
    btn.classList.add('btnOnload')
    btn.disabled = true
    const frgtEmail = document.getElementById('frgtEmail').value
    const frgtpsFrame = document.getElementsByClassName('frgtpsFrame')[0]

    const res = await fetch('/uns/concode', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ email: frgtEmail })
    })

    const data = await res.json()

    if (data == 'notfound')
        openAlertWin('Email address not found', function () {
            closeAlertWin()
        })
    else if (data == 'thereis' || data == 'sent') {
        frgtpsFrame.innerHTML = `
            <img src="/src/lock.png">
            <h1> Input the confirmation code </h1>
            <p> We sent you the confirmation code to your email. Please, input it here in 5 minutes.</p>
            <input type="number" id="frgtConCode" placeholder="Code">
            <button onclick="checkConfirmCode(event)">
                <p class="txt"> Confirm </p>
                <div class="loader">
                    <div class="bar1"></div>
                    <div class="bar2"></div>
                    <div class="bar3"></div>
                    <div class="bar4"></div>
                    <div class="bar5"></div>
                    <div class="bar6"></div>
                    <div class="bar7"></div>
                    <div class="bar8"></div>
                    <div class="bar9"></div>
                    <div class="bar10"></div>
                    <div class="bar11"></div>
                    <div class="bar12"></div>
                </div>
            </button>
        `
        sessionStorage.setItem('conemail', frgtEmail)
    } else if (data == 'notvalid')
        openAlertWin('Email address is not valid', function () {
            closeAlertWin()
        })
    btn.classList.remove('btnOnload')
    btn.disabled = false
}

async function checkConfirmCode(event) {
    const btn = event.currentTarget
    btn.classList.add('btnOnload')
    btn.disabled = true
    const concode = document.getElementById('frgtConCode').value
    const frgtpsFrame = document.getElementsByClassName('frgtpsFrame')[0]

    if (concode == '') {
        openAlertWin('Confirmation code field is empty', function () {
            closeAlertWin()
        })
        btn.classList.remove('btnOnload')
        btn.disabled = false
        return 0
    }

    const formData = {
        email: sessionStorage.getItem('conemail'),
        concode: concode
    }

    const res = await fetch('/uns/concodecheck', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (data == 'ok') {
        frgtpsFrame.innerHTML = `
            <img src="/src/lock.png">
            <h1> Change password </h1>
            <p> Change your password here </p>
            <input class id="inpNewPass" type="password" placeholder="Input new password">
            <input class id="conNewPass" type="password" placeholder="Confirm new password">
            <button onclick="changePass(event)"> 
                <p class="txt"> Change </p>
                <div class="loader">
                    <div class="bar1"></div>
                    <div class="bar2"></div>
                    <div class="bar3"></div>
                    <div class="bar4"></div>
                    <div class="bar5"></div>
                    <div class="bar6"></div>
                    <div class="bar7"></div>
                    <div class="bar8"></div>
                    <div class="bar9"></div>
                    <div class="bar10"></div>
                    <div class="bar11"></div>
                    <div class="bar12"></div>
                </div>
            </button>
        `
        sessionStorage.setItem('concode', concode)
    } else if (data == 'wrong')
        openAlertWin('You may be entering the wrong code. Please, try to enter the correct code.', function () {
            closeAlertWin()
        })
    btn.classList.remove('btnOnload')
    btn.disabled = false
}

async function changePass(event) {
    const btn = event.currentTarget
    btn.classList.add('btnOnload')
    btn.disabled = true
    const inpNewPass = document.getElementById('inpNewPass')
    const conNewPass = document.getElementById('conNewPass')
    const frgtpsFrame = document.getElementsByClassName('frgtpsFrame')[0]

    if (inpNewPass.value == '') {
        openAlertWin('Password field cannot be empty', function () {
            closeAlertWin()
        })
        inpNewPass.classList.add('wrong')
        btn.classList.remove('btnOnload')
        btn.disabled = false
        return 0
    } else if (inpNewPass.value.length < 8) {
        openAlertWin('Password must have 8 symbols at least', function () {
            closeAlertWin()
        })
        inpNewPass.classList.add('wrong')
        btn.classList.remove('btnOnload')
        btn.disabled = false
        return 0
    }

    if (inpNewPass.value != conNewPass.value) {
        openAlertWin('The values of the two fields are not equal.', function () {
            closeAlertWin()
        })
        conNewPass.classList.add('wrong')
        btn.classList.remove('btnOnload')
        btn.disabled = false
        return 0
    }

    const formData = {
        email: sessionStorage.getItem('conemail'),
        concode: sessionStorage.getItem('concode'),
        password: conNewPass.value
    }

    const res = await fetch('/uns/concodechange', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (data == 'ok') {
        frgtpsFrame.innerHTML = `
            <img src="/src/lock.png">
            <h1> Congratulatons! </h1>
            <p> Your password changed successfully. Now you can login into your account. </p>
            <span onclick="activeFrgtWin()"> Back to login </span> 
        `
    }
    btn.classList.remove('btnOnload')
    btn.disabled = false
}