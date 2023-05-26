let stidForClearTs

window.addEventListener('load', event => {
    // Check session storage for Turnstile request from another pages
    const gototurn = sessionStorage.getItem('gototurn')
    if (gototurn != null) {
        writestandentering(gototurn)
        sessionStorage.removeItem('gototurn')
    }
})

function getstsdata(resOfFil) {
    const topLoader = document.getElementById('topLoader')
    topLoader.classList.add('topLoaderActive')
    const formData = [
        readCookie('usid'),
        {
            start: 0,
            end: 20
        },
        {
            searchVal: resOfFil,
            faculty: '',
            grnum: '',
            restype: ''
        }
    ]

    fetch('/sec/getstsdata', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(response => {
            topLoader.classList.remove('topLoaderActive')
            if (response.ok)
                response.json().then(data => {
                    const stlist = document.getElementsByClassName('stlist')[0]
                    stlist.innerHTML = ''
                    if (data.length == 0)
                        alert('There is no such Student?!')
                    else {
                        let item
                        for (let i = 1; i < data.length; i++) {
                            item = data[i]
                            stlist.innerHTML += `
                            <li class="st" onclick="writestandentering(this.id)" id="${item._id}">
                                <img src="${item.imgpath}">
                                <div class="stnameAndGrnumWrapper">
                                    <p class="stname"> ${item.firstname} ${item.lastname} </p>
                                    <p class="grnum"> Group: ${item.grnum} </p>
                                </div>
                            </li>
                        `
                        }
                        stlist.innerHTML += '<li class="pseudospace"></li>'
                    }
                })
            else
                response.text().then(data => alert(data))
        })
}

function searchSt(event) {
    if (event.key == 'Enter') {
        let resOfFil = filter(event.target.value)
        if (resOfFil === 'empty') {
            alert('Input field is empty!')
            return 0
        } else if (resOfFil === 'tooMany') {
            alert("Probably you've entered elements wrong?!")
            return 0
        } else if (Array.isArray(resOfFil)) {
            getstsdata(resOfFil)
        }
    }
}

function filter(txt) {
    txt = txt.trim()
    if (txt == '') {
        return 'empty'
    } else {
        let arr = txt.split(" ")
        if (arr.length > 2) {
            return 'tooMany'
        } else {
            return arr
        }
    }
}

async function writestandentering(stid) {
    const topLoader = document.getElementById('topLoader')
    topLoader.classList.add('topLoaderActive')
    const standentering = document.getElementsByClassName('standentering')[0]
    const st = [
        readCookie('usid'),
        stid
    ]
    const res = await fetch('/sec/getst', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(st)
    })
    if (res.ok) {
        const data = await res.json()
        stidForClearTs = data._id
        standentering.innerHTML = `
            <div class="stdata">
                <img src="${data.imgpath}">
                <div class="stdataname"> ${data.firstname} ${data.lastname} </div>
                <div class="space"></div>
                <span class="material-symbols-rounded notranslate" onclick="onStCommandsBtnClick(event)"> more_horiz </span>
                <ul class="stCommands">
                    <li id="${data._id}" onclick="goToAllStsData(event)"> Student Data </li>
                    <li onclick="openAskWin('Do you really want to clear this student all turnstiles?', 'clearStTurns()')"> Clear Turnstiles </li>
                </ul>
            </div>
            <div class="stenteringlistwrapper">
                <div class="listtitles">
                    <div class="state"> State </div>
                    <div class="building"> Building </div>
                    <div class="datecolumn"> Date </div>
                </div>
                <div class="stenteringlist"> </div>
            </div>
        `
    } else {
        const data = await res.text()
        alert(data)
        return 0
    }

    const res1 = await fetch('/sec/gettrns', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(st)
    })
    if (res1.ok) {
        const data1 = await res1.json()
        const stenteringlist = document.getElementsByClassName('stenteringlist')[0]
        data1.forEach(item => {
            const d = new Date(item.createdAt)
            stenteringlist.innerHTML += `
                <div class="enteringitems">
                    <div class="state"> <li class="${item.state} notranslate"> ${item.state} </li> </div>
                    <div class="building notranslate"> ${getFullBuilding(item.building)} </div>
                    <div class="datecolumn">
                        <div class="date"> ${setzero(d.getDate())}.${setzero(d.getMonth() + 1)}.${d.getFullYear()} </div>
                        <div class="clock"> ${setzero(d.getHours())}:${setzero(d.getMinutes())} </div>
                    </div>
                </div>
            `
        })
        stenteringlist.innerHTML += '<div class="pseudospace"> </div>'
    } else {
        const data1 = await res1.text()
        alert(data1)
        return 0
    }
    topLoader.classList.remove('topLoaderActive')
}

function setzero(num) {
    if (num < 10)
        return '0' + num
    else
        return num
}

function goToAllStsData(event) {
    event.stopPropagation()
    sessionStorage.setItem('gotostdt', event.target.id)
    navigateTo('/allstsdata')
}

async function clearStTurns() {
    const formData = [
        readCookie('usid'),
        stidForClearTs
    ]
    const res = await fetch('/sec/clearstturns', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    openAlertWin(`${data} turnstiles has been cleared.`, function () {
        document.getElementsByClassName('stenteringlist')[0].innerHTML = ''
        closeAskWin()
        closeAlertWin()
    })

}

let isStCommandsFrameOpen = false

function onStCommandsBtnClick(event) {
    event.stopPropagation()
    toggleStCommandsFrame()
}

function toggleStCommandsFrame() {
    isStCommandsFrameOpen = !isStCommandsFrameOpen
    const frame = document.getElementsByClassName('stCommands')[0]

    if (isStCommandsFrameOpen) {
        frame.classList.add("active")
        document.onclick = event => {
            event.stopPropagation()
            toggleStCommandsFrame()
        }
    } else {
        frame.classList.remove("active")
        document.onclick = ''
    }
}