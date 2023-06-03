let isAnchorsVisible = true
let pubnubForHome

// socket.on('new-turn', data => {
//     addNewTurn(data)
// })

function addNewTurn(data) {
    const enteringListWrapper = document.getElementById('enteringListWrapper')
    const d = new Date(data.c)

    const navigatorNums = document.getElementsByClassName('navigatorNums')[2]
    navigatorNums.innerHTML = Number(navigatorNums.innerHTML) + 1

    enteringListWrapper.children[0].classList.remove('newEnteringitems')

    if (enteringListWrapper.children.length == 20)
        enteringListWrapper.removeChild(enteringListWrapper.children[19])

    enteringListWrapper.innerHTML = `
        <div class="enteringitems newEnteringitems" id="${data.id}">
            <div class="turnInfos">
                <div class="fullname"> ${data.f} ${data.l} </div>
                <div class="state"> <li class="${data.s}"> ${data.s} </li> </div>
                <div class="building"> ${getFullBuilding(data.b)} </div>
                <div class="datecolumn">
                    <div class="datewrapper">
                        <div class="date"> ${setzero(d.getDate())}.${setzero(d.getMonth() + 1)}.${d.getFullYear()} </div>
                        <div class="clock"> ${setzero(d.getHours())}:${setzero(d.getMinutes())} </div>
                    </div>
                    <span class="material-symbols-rounded notranslate" onclick="stCommandsBtnClick('${data.id}', event)"> expand_more </span>
                </div>
            </div>
            <div class="turnBtns">
                <div id="${data.stid}" onclick="goToAllStsData(event)"> Open this student's data </div>
                <div id="${data.stid}" onclick="goToTurnstile(event)"> Open this student's turnstiles </div>
            </div>
        </div>
        ${enteringListWrapper.innerHTML}
    `
}

window.addEventListener('load', event => {
    const formData = [
        readCookie('usid')
    ]
    //Actions
    getaction('onload')

    pubnubForHome = new PubNub({
        publishKey: "pub-c-eb0db650-b257-433f-8f94-186c68942a99",
        subscribeKey: "sub-c-600f46a5-b233-4ad9-ab1e-b7c52a44e515"
    })

    const listener = {
        status: statusEvent => {
            // console.log('statusEvent: ', statusEvent)
            if (statusEvent.category === 'PNConnectedCategory')
                console.log('pubnub is listening new turns channel...')
        },
        message: messageEvent => {
            // console.log(messageEvent.message)
            addNewTurn(messageEvent.message)
        },
        // presence: presenceEvent => {
        //     // handle presence
        //     console.log(presenceEvent)
        // }
    }

    pubnubForHome.addListener(listener)

    pubnubForHome.subscribe({
        channels: ['new-turns-channel']
    })
})

function showAnchors(event) {

    if (isAnchorsVisible) {
        event.target.classList.add('rotate')
        document.getElementsByClassName('anchors')[0].classList.add('hidden')
        isAnchorsVisible = false
    }
    else {
        event.target.classList.remove('rotate')
        document.getElementsByClassName('anchors')[0].classList.remove('hidden')
        isAnchorsVisible = true
    }
}

function setzero(num) {
    if (num < 10)
        return '0' + num
    else
        return num
}

let listStart
let listEnd

function getaction(cmd) {
    const topLoader = document.getElementById('topLoader')
    topLoader.classList.add('topLoaderActive')
    if (cmd == 'onload' || cmd == 'filter') {
        listStart = 0
        listEnd = 20
    } else if (cmd == 'prev') {
        listStart -= 20
        listEnd -= 20
    } else if (cmd == 'next') {
        listStart += 20
        listEnd += 20
    }

    const formData = [
        readCookie('usid'),
        {
            start: listStart,
            end: listEnd
        },
        {
            stateFil: document.getElementsByName('stateFil')[0].value,
            buildingFil: document.getElementsByName('buildingFil')[0].value,
            dateFil: document.getElementsByName('dateFil')[0].value
        }
    ]

    fetch('/sec/getaction', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => setEnteringitems(data, listStart))
            } else
                res.text().then(data => console.log(data))
            topLoader.classList.remove('topLoaderActive')
        })
}

function setEnteringitems(data, listStart) {
    const enteringListWrapper = document.getElementById('enteringListWrapper')
    const navigatorNums = document.getElementsByClassName('navigatorNums')
    const navigatorArrows = document.getElementsByClassName('navigatorArrows')
    // Set navigator numbers
    if (data[0] === 0)
        navigatorNums[0].innerHTML = `${0}`
    else
        navigatorNums[0].innerHTML = `${listStart + 1}`
    if (listEnd > data[0])
        navigatorNums[1].innerHTML = `${data[0]}`
    else
        navigatorNums[1].innerHTML = `${listEnd}`
    navigatorNums[2].innerHTML = `${data[0]}`
    // Set navigator arrows
    if (listStart == 0)
        navigatorArrows[0].disabled = true
    else
        navigatorArrows[0].disabled = false
    if (listEnd >= data[0])
        navigatorArrows[1].disabled = true
    else
        navigatorArrows[1].disabled = false

    // Set Entering List Body
    enteringListWrapper.innerHTML = ''
    let element
    for (let i = 1; i < data.length; i++) {
        listStart++
        element = data[i]
        const d = new Date(element.createdAt)
        enteringListWrapper.innerHTML += `
            <div class="enteringitems" id="${element._id}">
                <div class="turnInfos">
                    <div class="fullname"> ${element.student.firstname} ${element.student.lastname} </div>
                    <div class="state"> <li class="${element.state}"> ${element.state} </li> </div>
                    <div class="building"> ${getFullBuilding(element.building)} </div>
                    <div class="datecolumn">
                        <div class="datewrapper">
                            <div class="date"> ${setzero(d.getDate())}.${setzero(d.getMonth() + 1)}.${d.getFullYear()} </div>
                            <div class="clock"> ${setzero(d.getHours())}:${setzero(d.getMinutes())} </div>
                        </div>
                        <span class="material-symbols-rounded notranslate" onclick="stCommandsBtnClick('${element._id}', event)"> expand_more </span>
                    </div>
                </div>
                <div class="turnBtns">
                    <div id="${element.student._id}" onclick="goToAllStsData(event)"> Open this student's data </div>
                    <div id="${element.student._id}" onclick="goToTurnstile(event)"> Open this student's turnstiles </div>
                </div>
            </div>
        `
    }
}

let filterWinIsOpen = false

function showFilters() {
    const filterWrapper = document.getElementsByClassName('filterWrapper')[0]
    const filterBtn = document.getElementsByClassName('filterBtn')[0]

    filterWinIsOpen = !filterWinIsOpen

    if (filterWinIsOpen) {
        filterWrapper.classList.add("filterWrapperActive")
        filterBtn.classList.add('active')
    } else {
        filterWrapper.classList.remove("filterWrapperActive")
        filterBtn.classList.remove('active')
    }
}

function stCommandsBtnClick(elid, event) {
    event.stopPropagation()
    document.getElementById(elid).classList.remove('newEnteringitems')
    toggleStCommandsFrame(elid, event)
}

function onDocClickForStCommands() {
    toggleStCommandsFrame(null, 'ondoc')
}

let lastStCommandsFrame = null
let lastStCommandsBtn = null
function toggleStCommandsFrame(elid, event) {
    if (event === 'ondoc') {
        lastStCommandsFrame.classList.remove("enteringItemsExpand")
        lastStCommandsFrame = null
        lastStCommandsBtn.innerHTML = "expand_more"
        lastStCommandsBtn = null
        document.removeEventListener('click', onDocClickForStCommands)
        return 0
    }

    const stCommands = document.getElementById(elid)

    if (lastStCommandsFrame === null) {
        stCommands.classList.add("enteringItemsExpand")
        lastStCommandsFrame = stCommands
        event.target.innerHTML = "expand_less"
        lastStCommandsBtn = event.target
        document.addEventListener('click', onDocClickForStCommands)

    } else if (lastStCommandsFrame.id === stCommands.id) {
        stCommands.classList.remove("enteringItemsExpand")
        lastStCommandsFrame = null
        lastStCommandsBtn.innerHTML = 'expand_more'
        lastStCommandsBtn = null
        document.removeEventListener('click', onDocClickForStCommands)


    } else if (lastStCommandsFrame !== null) {
        lastStCommandsFrame.classList.remove("enteringItemsExpand")
        stCommands.classList.add("enteringItemsExpand")
        lastStCommandsFrame = stCommands
        lastStCommandsBtn.innerHTML = 'expand_more'
        event.target.innerHTML = 'expand_less'
        lastStCommandsBtn = event.target
        document.addEventListener('click', onDocClickForStCommands)

    }

}

function goToTurnstile(event) {
    event.stopPropagation()
    sessionStorage.setItem('gototurn', event.currentTarget.id)
    navigateTo('/ststate')
}

function goToAllStsData(event) {
    event.stopPropagation()
    sessionStorage.setItem('gotostdt', event.currentTarget.id)
    navigateTo('/allstsdata')
}