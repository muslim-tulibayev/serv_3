// const socket = io()

// socket.on('connect', () => {
//     console.log('Your id: ', socket.id)
// })

// socket.on('new-turn', data => {
//     addNewTurn(data)
// })

// socket.on('new-req', data => {
//     console.log(data)
//     const newNotifFrame = document.getElementById('newNotifFrame')
//     newNotifFrame.innerHTML = `
//         <span class="material-symbols-rounded notranslate" > notifications </span>
//         <p class="title"> New request: </p>
//         <p> ${data.f} ${data.l} </p>
//         <p> ${data.u} </p>
//     `
//     newNotifFrame.classList.add('newNotifFrameActive')
//     document.getElementById('notifAudio').play()
//     setTimeout(() => {
//         newNotifFrame.classList.remove('newNotifFrameActive')
//     }, 3000)
// })

let pubnub

window.addEventListener('load', async () => {
    if (readCookie('usid') == null) {
        navigateTo('/welcome')
    } else {
        const formData = [
            readCookie('usid'),
            readCookie('usid')
        ]
        // Set user frame and Set user dbrank
        const user = await fetch('/sec/getuser', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const userData = await user.json()
        const dbrank = userData.dbrank

        if (location.pathname != '/agent' && dbrank == 'Agent') {
            navigateTo('/agent')
            return 0
        } else if (location.pathname == '/agent' && dbrank != 'Agent') {
            navigateTo('/')
            return 0
        }

        document.getElementById('userProfileImg').src = userData.imgpath
        setUserframe(userData)

        // Add All users data page And Notifications only for The Owner
        if (dbrank == 'Owner') {
            const requests = await fetch('/sec/requests', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const requestsData = await requests.json()
            addNotification(requestsData)
            document.getElementById('allusersdataAnchor').style.display = 'flex'
        }

        document.cookie = `googtrans=/en/${userData.language};path=${location.pathname}`

        let googleTranslateScript = document.createElement('script');
        googleTranslateScript.type = 'text/javascript';
        googleTranslateScript.async = true;
        googleTranslateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(googleTranslateScript);

        const inputs = document.getElementsByTagName('input')
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('keypress', event => inpBlur(event))
        }

        pubnub = new PubNub({
            publishKey: "pub-c-eb0db650-b257-433f-8f94-186c68942a99",
            subscribeKey: "sub-c-600f46a5-b233-4ad9-ab1e-b7c52a44e515"
        })

        const listener = {
            status: statusEvent => {
                if (statusEvent.category === 'PNConnectedCategory')
                    console.log('pubnub is listening to Sign Up requests...')
            },
            message: messageEvent => {
                const data = messageEvent.message
                // console.log(data)
                const newNotifFrame = document.getElementById('newNotifFrame')
                newNotifFrame.innerHTML = `
                    <span class="material-symbols-rounded notranslate" > notifications </span>
                    <p class="title"> New request: </p>
                    <p> ${data.f} ${data.l} </p>
                    <p> ${data.u} </p>
                `
                newNotifFrame.classList.add('newNotifFrameActive')
                document.getElementById('notifAudio').play()
                setTimeout(() => {
                    newNotifFrame.classList.remove('newNotifFrameActive')
                }, 3000)
            }
        }

        pubnub.addListener(listener)

        // if (dbrank == 'Owner') {
        //     socket.emit('join-room', 'owner', message => {
        //         alert(message)
        //     })
        // }

        if (dbrank == 'Owner') {
            pubnub.subscribe({
                channels: ['new-reqs-channel']
            })
        }

        setTimeout(() => {
            document.getElementsByClassName('loadWin')[0].classList.add('loadSilence')
        }, 300)
    }
})

function getFullBuilding(val) {
    if (val == 'cor-a')
        return 'Corpus A'
    // return 'Corpus A ("Geofizika")'
    else if (val == 'cor-b')
        return 'Corpus B'
    // return 'Corpus B ("Trikotaj")'
    else if (val == 'dor-a')
        return 'Dormitory A'
    // return 'Dormitory A ("Geofizika")'
    else if (val == 'dor-b')
        return 'Dormitory B'
    // return 'Dormitory B ("Vokzal")'
    else if (val == 'dor-c')
        return 'Dormitory C'
    // return 'Dormitory C ("Trikotaj")'
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

window.addEventListener('online', () => {
    console.log('System is online')
    document.getElementById("onoff").classList.remove('offline')
})

window.addEventListener('offline', () => {
    console.log('System is offline')
    document.getElementById("onoff").classList.add('offline')
})

function setUserframe(data) {
    document.getElementsByClassName('userframeWin')[0].innerHTML = `
        <img src="${data.imgpath}">
        <div class="userName"> ${data.firstname} ${data.lastname} </div>
        <p class="nstitles"> Email: </p>
        <p class="nsitems"> ${data.email} </p>
        <p class="nstitles"> Phonenum: </p>
        <p class="nsitems"> ${data.phonenum} </p>
        <p class="nstitles"> University Rank: </p>
        <p class="nsitems"> ${data.universityrank} </p>
        <p class="nstitles"> Platform Rank: </p>
        <p class="nsitems"> ${data.dbrank} </p>
        <p class="nstitles"> Language: </p>
        <p class="nsitems"> ${lanFull(data.language)} </p>
        <div class="nsbuttons">
            <button onclick="logout()"> Log out </button>
            <button onclick="openEditAccountWin(event)"> Edit </button>
        </div>
    `
}

function lanFull(lan) {
    if (lan == 'en')
        return 'English'
    else if (lan == 'ru')
        return 'Russian'
    else if (lan == 'ar')
        return 'Arabic'
    else if (lan == 'uz')
        return 'Uzbek'
}

async function openEditAccountWin(event) {
    event.stopPropagation()

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

    const editAccountWin = document.getElementById('editAccountWin')

    editAccountWin.innerHTML = `
            <div class="main borEffect">
                <div class="imgInputWrapperChange">
                    <img id="imgChosenChange" src2="${userData.imgpath}" src="${userData.imgpath}">
                    <input id="chsImgChange" type="file" onchange="setImgChange(event)">
                    <label for="chsImgChange"> Choose </label>
                </div>

                <div class="items">
                    <p class="title">Firstname: </p>
                    <input id="fname" class="values" value="${userData.firstname}" onchange="enableSaveUserChangesBtn()" onkeypress="inpBlur(event)"/>
                </div>
                <div class="items">
                    <p class="title">Lastname: </p>
                    <input id="lname" class="values" value="${userData.lastname}" onchange="enableSaveUserChangesBtn()" onkeypress="inpBlur(event)"/>
                </div>
                <div class="items">
                    <p class="title">Email: </p>
                    <input id="emailChange" class="values" value="${userData.email}" onchange="enableSaveUserChangesBtn()" onkeypress="inpBlur(event)"/>
                </div><div class="items">
                    <p class="title">Phone Number: </p>
                    <input id="phonenumChange" class="values" value="${userData.phonenum}" onchange="enableSaveUserChangesBtn()" onkeypress="inpBlur(event)"/>
                </div>
                <div class="items">
                    <p class="title">University Rank: </p>
                    <select id="urank" class="values" onchange="enableSaveUserChangesBtn()">
                        <option value="Principal" ${checkForSelect(userData.universityrank, 'Principal')}> Principal </option>
                        <option value="Dean" ${checkForSelect(userData.universityrank, 'Dean')}> Dean </option>
                        <option value="Teacher" ${checkForSelect(userData.universityrank, 'Teacher')}> Teacher </option>
                        <option value="Security" ${checkForSelect(userData.universityrank, 'Security')}> Security </option>
                    </select>
                </div>

                <div class="items">
                    <p class="title"> Language: </p>
                    <select id="editlan" class="values" onchange="enableSaveUserChangesBtn()">
                        <option value="en" ${checkForSelect(userData.language, 'en')}> English </option>
                        <option value="ru" ${checkForSelect(userData.language, 'ru')}> Russian </option>
                        <option value="ar" ${checkForSelect(userData.language, 'ar')}> Arabic </option>
                        <option value="uz" ${checkForSelect(userData.language, 'uz')}> Uzbek </option>
                    </select>
                </div>

                <div class="items items-pass" onclick="showPassWrapper()">
                    <p class="title"> Change password </p>
                    <span class="material-symbols-rounded notranslate"> expand_more </span>
                </div>
                <div class="changePassWrapper">
                    <input id="insertPass" type="password" placeholder="Insert new password" onkeypress="inpBlur(event)">
                    <input id="confirmPass" type="password" placeholder="Confirm password" onchange="checkChangedPass()" onkeypress="inpBlur(event)">
                </div>

                <div class="btnsWrapper">
                    <button class="save" id="saveUserChangesBtn" onclick="postUserChanges(event)" disabled> 
                        <p class="txt"> Save </p>
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
                    <button class="cancel" onclick="cancelEditAccount()"> Cancel </button>
                </div>

            </div>
    `
    editAccountWin.style.display = 'flex'
}

function setImgChange(event) {
    let dir = URL.createObjectURL(event.target.files[0])
    document.getElementById('imgChosenChange').src = dir

    enableSaveUserChangesBtn()
}

function postUserChanges(event) {
    const btn = event.currentTarget
    btn.classList.add('btnOnload')
    btn.disabled = true

    let st_img = document.getElementById('chsImgChange').files[0]
    const data = [
        readCookie('usid'),
        {
            imgpath: document.getElementById('imgChosenChange').getAttribute('src2'),
            firstname: document.getElementById('fname').value,
            lastname: document.getElementById('lname').value,
            email: document.getElementById('emailChange').value,
            phonenum: document.getElementById('phonenumChange').value,
            universityrank: document.getElementById('urank').value,
            language: document.getElementById('editlan').value,
            password: document.getElementById('confirmPass').value
        }
    ]

    function updateuser() {
        fetch('/sec/updateuser', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data == true) {
                    btn.classList.remove('btnOnload')
                    btn.disabled = false
                    openAlertWin('Your changes has been updated successfully!', function () {
                        location.reload()
                    })
                } else {
                    btn.classList.remove('btnOnload')
                    btn.disabled = false
                    openAlertWin(data, function () {
                        closeAlertWin()
                    })
                }
            })
    }

    if (st_img == undefined) {
        updateuser()

    } else {
        const formData = new FormData()
        formData.append('image', st_img)
        const ajax = new XMLHttpRequest()
        ajax.open('POST', '/upload/img')
        ajax.onload = function () {
            data[1].imgpath = ajax.response
            updateuser()
        }
        ajax.send(formData)
    }
}

let isChangePassOpen = false
function showPassWrapper() {
    if (!isChangePassOpen) {
        document.getElementsByClassName('changePassWrapper')[0].classList.add('changePassWrapperActive')
        isChangePassOpen = true
    } else {
        document.getElementsByClassName('changePassWrapper')[0].classList.remove('changePassWrapperActive')
        isChangePassOpen = false
    }
}

function cancelEditAccount() {
    const editAccountWin = document.getElementById('editAccountWin')

    editAccountWin.style.display = 'none'
    editAccountWin.innerHTML = ''
}

function enableSaveUserChangesBtn() {
    document.getElementById('saveUserChangesBtn').disabled = false
}

function checkChangedPass() {
    const insertPass = document.getElementById('insertPass')
    const confirmPass = document.getElementById('confirmPass')

    if (insertPass.value !== confirmPass.value) {
        confirmPass.classList.add('wrong')
        document.getElementById('saveUserChangesBtn').disabled = true
    } else {
        confirmPass.classList.remove('wrong')
        document.getElementById('saveUserChangesBtn').disabled = false
    }
}

let isNavigatorPanelOpen = false
let navigatorPanel = document.getElementById('navigatorPanel')
let timeout

function toggleNavigatorPanel(event) {
    if (isNavigatorPanelOpen === false) {
        event.currentTarget.classList.add("active")
        isNavigatorPanelOpen = true
    } else if (isNavigatorPanelOpen === 'wait') {
        clearTimeout(timeout)
        isNavigatorPanelOpen = true
    } else if (isNavigatorPanelOpen === true) {
        isNavigatorPanelOpen = 'wait'
        timeout = setTimeout(() => {
            navigatorPanel.classList.remove("active")
            isNavigatorPanelOpen = false
        }, 3000)
    }
}

function allowReq() {
    const formData = [
        readCookie('usid'),
        sessionStorage.getItem('reqid')
    ]
    fetch('/sec/allowreq', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => {
            res.text().then(data => {
                alert(data)
                closeAskWin()
                document.getElementsByClassName('notification')[0].classList.remove('active')
            })
        })
}

function denyReq() {
    const formData = [
        readCookie('usid'),
        sessionStorage.getItem('reqid')
    ]
    fetch('/sec/denyreq', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    }).then(res => {
        res.text().then(data => {
            alert(data)
            closeAskWin()
            document.getElementsByClassName('notification')[0].classList.remove('active')
        })
    })
}

function navigateTo(url) {
    let origin = location.origin
    location.assign(origin + url)
}

function logout() {
    writeCookie('usid', 0, -1)
    sessionStorage.setItem('googtrans', 'en')
    navigateTo('/welcome')
}

function addNotification(data) {
    if (data == null)
        return 0
    else {
        sessionStorage.setItem('reqid', data._id)
        const notification = document.getElementsByClassName('notification')[0]
        notification.classList.add("active")
        notification.addEventListener('click', onNotificationBtnClick)
        notification.innerHTML += `
            <div class="nswrapper borEffect" onclick="onThisWindowClick(event)">
                <p class="nstitles"> Firstname: </p>
                <p class="nsitems"> ${data.firstname} </p>
                <p class="nstitles"> Lastname: </p>
                <p class="nsitems"> ${data.lastname} </p>
                <p class="nstitles"> Email: </p>
                <p class="nsitems"> ${data.email} </p>
                <p class="nstitles"> University Rank: </p>
                <p class="nsitems"> ${data.universityrank} </p>

                <p class="nstitles"> Platform Rank: </p>
                <div class="editableItems">
                    <select id="editableItem" onchange="enableSave()" disabled>
                        <option value="Owner" ${checkForSelect(data.dbrank, 'Owner')}> Owner </option>
                        <option value="Admin" ${checkForSelect(data.dbrank, 'Admin')}> Admin </option>
                        <option value="Staff" ${checkForSelect(data.dbrank, 'Staff')}> Staff </option>
                        <option value="Agent" ${checkForSelect(data.dbrank, 'Agent')}> Agent </option>
                    </select>
                    <button class="edit" onclick="changeReq()"> Edit </button>
                    <button id="saveReqBtn" onclick="postReqChanges()" class="save" disabled> Save </button>
                </div>

                <p class="nstitles"> Comment </p>
                <p class="nsitems nscomment">
                    ${data.comment}
                </p>
                <div class="nsbuttons">
                    <button onclick="openAskWin('Do you really want to deny this request?', 'denyReq()')"> Deny </button>
                    <button onclick="openAskWin('Do you really want to allow this request?', 'allowReq()')"> Allow </button>
                </div>
            </div>
        `
    }
}

function changeReq() {
    document.getElementById('editableItem').disabled = false
    document.getElementsByClassName('editableItems')[0].classList.add('editableItemsActive')
}

function enableSave() {
    document.getElementById('saveReqBtn').disabled = false
}

function postReqChanges() {
    const editableItem = document.getElementById('editableItem').value

    const formData = [
        readCookie('usid'),
        {
            reqid: sessionStorage.getItem('reqid'),
            dbrank: editableItem
        }
    ]

    fetch('/sec/changereq', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            if (data == true) {
                document.getElementById('editableItem').disabled = true
                document.getElementsByClassName('editableItems')[0].classList.remove('editableItemsActive')
                document.getElementById('saveReqBtn').disabled = true
            }
        })

}

function checkForSelect(dbVal, selVal) {
    if (dbVal == selVal)
        return 'selected'
    else
        return ''
}

function openAskWin(msg, callback) {
    const askWin = document.getElementById('askWin')
    askWin.innerHTML = `
        <div class="askwrapper borEffect">
            <p> ${msg} </p>
            <div class="btnwrapper">
                <button class="greenBtn" onclick="${callback}"> Yes </button>
                <button class="redBtn" onclick="closeAskWin()"> No </button>
            </div>
        </div>
    `
    askWin.classList.add('askWinActive')
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

function closeAskWin() {
    document.getElementById('askWin').classList.remove('askWinActive')
}

function closeAlertWin() {
    document.getElementById('alertWin').classList.remove('askWinActive')
}

//-------------------------------------------------------------------------------------//

const isFrameOpenObj = {
    isUserBtnWindowOpen: false,
    isNotificationWindowOpen: false,
    isPlatInfoWindowOpen: false
}

function onThisWindowClick(event) {
    event.stopPropagation()
}

function onUserBtnClick(event) {
    event.stopPropagation()
    if (!isFrameOpenObj.isUserBtnWindowOpen)
        closeOpenedFrames()
    toggleFrames('isUserBtnWindowOpen', 'userframeWin')
}
function onNotificationBtnClick(event) {
    event.stopPropagation()
    if (!isFrameOpenObj.isNotificationWindowOpen)
        closeOpenedFrames()
    toggleFrames('isNotificationWindowOpen', 'nswrapper')
}
function onPlatInfoBtnClick(event) {
    event.stopPropagation()
    if (!isFrameOpenObj.isPlatInfoWindowOpen)
        closeOpenedFrames()
    toggleFrames('isPlatInfoWindowOpen', 'platformInfo')
}

function toggleFrames(isOpenName, frameName) {
    isFrameOpenObj[isOpenName] = !isFrameOpenObj[isOpenName]
    const frame = document.getElementsByClassName(frameName)[0]

    if (isFrameOpenObj[isOpenName]) {
        frame.classList.add("active")
        document.onclick = event => {
            event.stopPropagation()
            toggleFrames(isOpenName, frameName)
        }
    } else {
        frame.classList.remove("active")
        document.onclick = ''
    }
}

function closeOpenedFrames() {
    if (isFrameOpenObj.isUserBtnWindowOpen)
        toggleFrames('isUserBtnWindowOpen', 'userframeWin')
    else if (isFrameOpenObj.isNotificationWindowOpen)
        toggleFrames('isNotificationWindowOpen', 'nswrapper')
    else if (isFrameOpenObj.isPlatInfoWindowOpen)
        toggleFrames('isPlatInfoWindowOpen', 'platformInfo')
}

function inpBlur(event) {
    if (event.key == 'Enter')
        event.target.blur()
}