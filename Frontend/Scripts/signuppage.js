// const socket = io()

// socket.on('connect', () => {
//     console.log('Your id: ', socket.id)
// })

let pubnub

window.addEventListener('load', async () => {
    pubnub = new PubNub({
        publishKey: "pub-c-eb0db650-b257-433f-8f94-186c68942a99",
        subscribeKey: "sub-c-600f46a5-b233-4ad9-ab1e-b7c52a44e515"
    })

    const listener = {
        status: statusEvent => {
            if (statusEvent.category === 'PNConnectedCategory')
                console.log('Connected')
        },
        message: messageEvent => {
            console.log(messageEvent.message)
        }
    }

    pubnub.addListener(listener)

    setTimeout(() => {
        document.getElementsByClassName('loadWin')[0].classList.add('loadSilence')
    }, 300);
})

const sessLan = sessionStorage.getItem('googtrans')
if (sessLan != null)
    document.cookie = `googtrans=/en/${sessLan};path=${location.pathname}`

const formData = {
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    birth: null,
    // birth: ` ${ new Date().getFullYear()}-${ setzero(new Date().getMonth()+1)}-${ setzero(new Date().getDate())} `,
    language: '',
    universityrank: '',
    dbrank: '',
    agentbuilding: '',
    comment: ''
}

let isEmailRight = false
let isFnameRight = false
let isLnameRight = false
let isPassRight = false

async function postSignupData(event) {
    const btn = event.currentTarget
    btn.disabled = true
    btn.classList.add('btnOnload')
    formData.birth = document.getElementsByName('inpdate')[0].value
    formData.language = document.getElementsByName('selLan')[0].value
    formData.universityrank = document.getElementsByName('selURank')[0].value
    formData.dbrank = document.getElementsByName('selDBRank')[0].value
    formData.agentbuilding = document.getElementsByName('selAgentBuilding')[0].value
    formData.comment = document.getElementsByName('comArea')[0].value

    const res = await fetch('/uns/addreq', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    if (res.ok) {
        const data = await res.json()
        if (data == true) {
            document.getElementsByClassName('signup')[0].style.display = 'none'
            document.getElementsByClassName('resWrapper')[0].style.display = 'block'

            const publishPayload = {
                channel: 'new-reqs-channel',
                message: {
                    f: formData.firstname,
                    l: formData.lastname,
                    u: formData.universityrank
                }
            }

            await pubnub.publish(publishPayload)
        }
    } else {
        res.text().then(data => alert(data))
        btn.disabled = false
        btn.classList.remove('btnOnload')
    }
}


function setFirst() {
    formData.birth = document.getElementsByName('inpdate')[0].value
    formData.universityrank = document.getElementsByName('selURank')[0].value
    formData.dbrank = document.getElementsByName('selDBRank')[0].value
    formData.agentbuilding = document.getElementsByName('selAgentBuilding')[0].value
    formData.comment = document.getElementsByName('comArea')[0].value

    document.getElementsByClassName('signup')[0].innerHTML = `
        <h1> Sign Up </h1>

        <div class="emailFrame" id="emailFrame">
            <input name="email" type="email" placeholder="Email" onchange="filterEmail(event)">
            <div class="spinner"></div>
        </div>
        <input name="fname" type="text" placeholder="Firstname" onchange="filterFname(event)" />
        <input name="lname" type="text" placeholder="Lastname" onchange="filterLname(event)" />
        <input name="password" type="password" name="p" placeholder="Password" onchange="filterPass(event)" />

        <button id="nextbtn" class="btn" onclick="setSecond()" disabled> Next </button>

        <span> Do you have an account? <a href="/login"> Log in </a> </span>
    `
    document.getElementsByName('email')[0].value = formData.email
    document.getElementsByName('fname')[0].value = formData.firstname
    document.getElementsByName('lname')[0].value = formData.lastname
    document.getElementsByName('password')[0].value = formData.password
    enableNextBtn()
}

function setSecond() {
    formData.email = document.getElementsByName('email')[0].value
    formData.firstname = document.getElementsByName('fname')[0].value
    formData.lastname = document.getElementsByName('lname')[0].value
    formData.password = document.getElementsByName('password')[0].value
    document.getElementsByClassName('signup')[0].innerHTML = `
        <h1> Sign Up </h1>
        <input type="date" name="inpdate" onchange="enableSignupBtn()">
        <select name="selLan" class="selLan" onchange="">
            <option value="en" ${checkGoogtrans('en')}> English </option>
            <option value="ru" ${checkGoogtrans('ru')}> Russian </option>
            <option value="ar" ${checkGoogtrans('ar')}> Arabic </option>
            <option value="uz" ${checkGoogtrans('uz')}> Uzbek </option>
        </select>
        <select name="selURank" onchange="enableSignupBtn()">
            <option value="" selected> Select your University rank here </option>
            <option value="Principal"> Principal </option>
            <option value="Dean"> Dean </option>
            <option value="Teacher"> Teacher </option>
            <option value="Security"> Security </option>
        </select>
        <select name="selDBRank" onchange="enableAgentBuilding()">
            <option value="" selected> Select your Platform rank here </option>
            <option value="Owner"> Owner </option>
            <option value="Admin"> Admin </option>
            <option value="Staff"> Staff </option>
            <option value="Agent"> Agent </option>
        </select>
        <select name="selAgentBuilding" class="selAgentBuilding" onchange="enableSignupBtn()">
            <option value="" selected> Select Agent building here </option>
            <option value="cor-a"> Corpus A ("Geofizika") </option>
            <option value="cor-b"> Corpus B ("Trikotaj") </option>
            <option value="dor-a"> Dormitory A ("Geofizika") </option>
            <option value="dor-b"> Dormitory B ("Vokzal") </option>
            <option value="dor-c"> Dormitory c ("Trikotaj") </option>
        </select>
        <textarea name="comArea"
            placeholder="Your request will sended to the Owner. And the Owner will read your data and comment. And decision will decided!"
            cols="50" rows="5" onchange="enableSignupBtn()"></textarea>
        <button id="signupbtn" class="btn" onclick="postSignupData(event)" disabled>
            <p class="txt"> Sign up </p>
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
        <button class="goBackBtn" onclick="setFirst()"> Go Back </button>
    `
    if (formData.birth != '' && formData.birth != null)
        document.getElementsByName('inpdate')[0].value = `${new Date(formData.birth).getFullYear()}-${setzero(new Date(formData.birth).getMonth() + 1)}-${setzero(new Date(formData.birth).getDate())}`
    document.getElementsByName('selURank')[0].value = formData.universityrank
    document.getElementsByName('selDBRank')[0].value = formData.dbrank
    document.getElementsByName('selAgentBuilding')[0].value = formData.agentbuilding
    document.getElementsByName('comArea')[0].value = formData.comment

    enableSignupBtn()
}

function checkGoogtrans(lan) {
    const googtrans = readCookie('googtrans')

    if (googtrans == null && lan == 'en')
        return 'selected'
    else if (googtrans == null && lan != 'en')
        return ''

    const temp = googtrans.split('/')

    if (temp[2] == lan)
        return 'selected'
    else
        return ''
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Filters
function enableNextBtn() {
    const nextbtn = document.getElementById('nextbtn')

    if (isEmailRight && isFnameRight && isLnameRight && isPassRight)
        nextbtn.disabled = false
    else
        nextbtn.disabled = true

}

function enableSignupBtn() {
    const signupbtn = document.getElementById('signupbtn')
    const selDBRank = document.getElementsByName('selDBRank')[0].value

    if (selDBRank == 'Agent') {
        if (document.getElementsByName('selURank')[0].value != "" &&
            document.getElementsByName('selDBRank')[0].value != "" &&
            document.getElementsByName('comArea')[0].value != "" &&
            document.getElementsByName('selAgentBuilding')[0].value != "")
            signupbtn.disabled = false
        else
            signupbtn.disabled = true
    } else {
        if (document.getElementsByName('selURank')[0].value != "" &&
            document.getElementsByName('selDBRank')[0].value != "" &&
            document.getElementsByName('comArea')[0].value != "")
            signupbtn.disabled = false
        else
            signupbtn.disabled = true
    }
}

async function filterEmail(event) {
    event.target.classList.remove('rightInputs')
    event.target.classList.remove('warnInputs')
    const emailFrame = document.getElementById('emailFrame')
    emailFrame.classList.add('emailFrameOnload')
    const value = event.target.value

    if (value.length > 10) {
        let temp = ''
        for (let i = value.length - 10; i < value.length; i++)
            temp += value[i]
        if (temp == '@gmail.com') {
            const res = await fetch('/uns/checkforemail', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ email: value })
            })
            if (res.ok) {
                const data = await res.text()
                if (data == 'notvalid') {
                    showWarnWin('This Email addres is not valid')
                    isEmailRight = false
                } else if (data == 'thereis') {
                    showWarnWin('There is a such User')
                    isEmailRight = false
                } else if (data == 'reqhas') {
                    showWarnWin('There is a such Request')
                    isEmailRight = false
                } else if (data == 'thereisnt') {
                    isEmailRight = true
                }
            } else {
                const data = await res.text()
                alert(data)
                isEmailRight = false
            }
        }
        else {
            showWarnWin('Email form is wrong')
            isEmailRight = false
        }
    } else if (value.length == '') {
        showWarnWin('Email field cannot be empty')
        isEmailRight = false
    } else {
        showWarnWin('Email form is wrong')
        isEmailRight = false
    }


    if (isEmailRight === true) {
        event.target.classList.remove('warnInputs')
        event.target.classList.add('rightInputs')
    } else {
        event.target.classList.remove('rightInputs')
        event.target.classList.add('warnInputs')
    }

    emailFrame.classList.remove('emailFrameOnload')
    enableNextBtn()
}

function filterFname(event) {
    const value = event.target.value

    if (value == '') {
        isFnameRight = false
        showWarnWin('Firstname field cannot be empty')
    } else {
        isFnameRight = true
    }

    if (isFnameRight === true) {
        event.target.classList.remove('warnInputs')
        event.target.classList.add('rightInputs')
    } else {
        event.target.classList.remove('rightInputs')
        event.target.classList.add('warnInputs')
    }

    enableNextBtn()
}

function filterLname(event) {
    const value = event.target.value

    if (value == '') {
        isLnameRight = false
        showWarnWin('Lastname field cannot be empty')
    } else {
        isLnameRight = true
    }

    if (isLnameRight === true) {
        event.target.classList.remove('warnInputs')
        event.target.classList.add('rightInputs')
    } else {
        event.target.classList.remove('rightInputs')
        event.target.classList.add('warnInputs')
    }

    enableNextBtn()
}

function filterPass(event) {
    const value = event.target.value

    if (value == '') {
        showWarnWin('Password field cannot be empty')
        isPassRight = false
    } else if (value.length < 8) {
        showWarnWin('Password must have 8 symbols at least')
        isPassRight = false
    } else {
        isPassRight = true
    }

    if (isPassRight === true) {
        event.target.classList.remove('warnInputs')
        event.target.classList.add('rightInputs')
    } else {
        event.target.classList.remove('rightInputs')
        event.target.classList.add('warnInputs')
    }

    enableNextBtn()
}

function showWarnWin(msg) {
    let warnWin = document.getElementById('warnWin')

    warnWin.innerHTML = msg
    warnWin.classList.add("activeWarnWin")

    setTimeout(() => {
        warnWin.classList.remove("activeWarnWin")
    }, 3000)
}

function setzero(num) {
    if (num < 10)
        return '0' + num
    else
        return num
}

function enableAgentBuilding() {
    const selDBRank = document.getElementsByName('selDBRank')[0].value
    const selAgentBuilding = document.getElementsByName('selAgentBuilding')[0]

    if (selDBRank == 'Agent')
        selAgentBuilding.classList.add('selAgentBuildingActive')
    else
        selAgentBuilding.classList.remove('selAgentBuildingActive')

    enableSignupBtn()
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
    location.reload()
}