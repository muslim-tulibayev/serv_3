let isFilterPanelOpen = false
let isSearchPanelOpen = false
let listStart
let listEnd
let dbrank

const preValues = {
    stid: '',
    email: '',
    phonenum: '',
    restype: '',
    address: ''
}

window.addEventListener('load', async () => {
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
    dbrank = userData.dbrank

    getstsdata('onload')

    const gotostdt = sessionStorage.getItem('gotostdt')
    if (gotostdt != null) {
        const e = {
            target: {
                id: gotostdt
            }
        }
        openStInfoWinWrapper(e)
        sessionStorage.clear()
    }
})

function getstsdata(cmd) {
    const topLoader = document.getElementById('topLoader')
    topLoader.classList.add('topLoaderActive')

    if (cmd == 'onload' || cmd == 'filter' || cmd == 'search') {
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
            searchVal: '',
            faculty: document.getElementById('filFaculty').value,
            grnum: document.getElementById('filGrnum').value,
            restype: document.getElementById('filRestype').value,
        }
    ]

    const resOfFilter = filter(document.getElementsByClassName('searchbox-input')[0].value)
    if (Array.isArray(resOfFilter))
        formData[2].searchVal = resOfFilter

    fetch('/sec/getstsdata', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(response => {
            topLoader.classList.remove('topLoaderActive')
            if (response.ok)
                response.json().then(data => writeAllstsdata(data, listStart))
            else
                response.text().then(data => alert(data))
        })
}

function writeAllstsdata(data, listStart) {
    const stsListWrapper = document.getElementById('stsListWrapper')
    const navigatorNums = document.getElementsByClassName('navigatorNums')
    const navigatorArrows = document.getElementsByClassName('navigatorArrows')
    // Set navigator numbers
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
    // Set Students List body
    stsListWrapper.innerHTML = ''
    let st
    for (let i = 1; i < data.length; i++) {
        listStart++
        st = data[i]
        stsListWrapper.innerHTML += `
            <li>
                <div class="liNum"> ${listStart} </div>
                <div class="imgwrapper"> <img src="${st.imgpath}"> </div>
                <div class="fullname"> ${st.firstname} ${st.lastname} </div>
                <div class="faculty"> ${st.faculty} </div>
                <div class="grnum"> ${st.grnum} </div>
                <div class="restype"> ${getFullRestype(st.restype)} </div>
                <button onclick="goToTurnstile(event)" id="${st._id}"> Turnstile </button>
                <span class="material-symbols-rounded notranslate" id="${st._id}" onclick="openStInfoWinWrapper(event)"> arrow_outward </span>
            </li>
        `
    }
    stsListWrapper.innerHTML += `<li class="pseudoSpace"> </li>`
}

function getFullRestype(val) {
    if (val == 'home')
        return 'Own home'
    else if (val == 'rent')
        return 'Rented flat'
    else if (val == 'dormitory')
        return 'Dormitory'
    else
        return ''
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
            getstsdata('search')
        }
    }
}

function checkrestype(dbrestype, selVal) {
    if (dbrestype == selVal)
        return 'selected'
    else
        return ''
}

function closeStInfoWinWrapper() {
    document.getElementById('stInfoWinWrapper').style.display = 'none'
}

async function openStInfoWinWrapper(event) {
    const formData = [
        readCookie('usid'),
        event.target.id
    ]
    const res = await fetch('/sec/getst', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
    const data = await res.json()
    const stInfoWinWrapper = document.getElementById('stInfoWinWrapper')
    preValues.stid = data._id
    preValues.email = data.email
    preValues.phonenum = data.phonenum
    preValues.restype = data.restype
    preValues.address = data.address
    stInfoWinWrapper.innerHTML = `
            <div class="stInfoWin borEffect">
                <span class="material-symbols-rounded redbtn close notranslate" onclick="closeStInfoWinWrapper()"> close </span>
                <section class="left">
                    <div class="img_wrapper">
                        <img src="${data.imgpath}">
                    </div>
                    <div class="stnames_wrapper">
                        <span> Student </span>
                        <p> ${data.firstname} ${data.lastname} </p>
                    </div>
                    <span class="pseudospace"></span>
                    <div class="btns_wrapper"> 
                        <button class="invisibleBtns" id="save" onclick="saveStInfo()"> Save </button>
                        <button class="invisibleBtns" id="cancel" onclick="cancelEditing()"> Cancel </button>
                        <button id="edit" onclick="editStInfos()" ${checkForUrank()}> Edit </button>
                        <button id="del" onclick="openAskWin('Do you really want to delete this Student?', 'delSt()')" ${checkForUrank()}> Delete </button>
                    </div>
                </section>
                <section class="right">
                    <p class="secRightTitle"> Additional Information </p>
                    <div class="addInfosWrapper">
                        <div class="info_item_wrapper"> 
                            <span> FACULTY </span>    
                            <p> ${data.faculty} </p>
                        </div>
                        <div class="info_item_wrapper"> 
                            <span> GROUP NUMBER </span>  
                            <p> ${data.grnum} </p>
                        </div>
                        <div class="info_item_wrapper"> 
                            <span> EMAIL </span> 
                            <input class="editableFields" id="info_item_email" type="text" value="${data.email}" disabled>
                            <button class="info_item_btns"> Edit </button>
                        </div>
                        <div class="info_item_wrapper"> 
                            <span> PHONE NUMBER </span>
                            <input class="editableFields" id="info_item_phonenum" type="text" value="${data.phonenum}" disabled>
                            <button class="info_item_btns"> Edit </button>
                        </div>
                        <div class="info_item_wrapper"> 
                            <span> RESIDENCE TYPE </span>
                            <select class="editableFields" id="info_item_restype" disabled>
                                <option value="home" ${checkrestype(data.restype, 'home')}> Own Home </option>
                                <option value="rent" ${checkrestype(data.restype, 'rent')}> Rented Flat </option>
                                <option value="dormitory" ${checkrestype(data.restype, 'dormitory')}> Dormitory </option>
                            </select>
                            <button class="info_item_btns"> Edit </button>
                        </div>
                        <div class="info_item_wrapper"> 
                            <span> ADDRESS </span>    
                            <input class="editableFields" id="info_item_address" type="text" value="${data.address}" disabled>
                            <button class="info_item_btns"> Edit </button>
                        </div>
                    </div>
                    <span class="pseudospace"></span>
                    <div class="statesWrapper">
                        <div> 
                            <span class="title"> Enter </span> 
                            <span class="num"> ${data.enter} </span> 
                        </div>
                        <div> 
                            <span class="title"> Exit </span> 
                            <span class="num"> ${data.exit} </span> 
                        </div>
                        <div> 
                            <span class="title"> Late </span> 
                            <span class="num"> ${data.late} </span> 
                        </div>
                    </div>
                </section>
            </div>
    `
    stInfoWinWrapper.style.display = 'flex'
}

function checkForUrank() {
    if (dbrank == 'Owner' || dbrank == 'Admin')
        return ''
    else
        return 'disabled'
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

function clearStsListWrapper() {
    const stsListWrapper = document.getElementById('stsListWrapper')
    stsListWrapper.innerHTML = ''
}

async function goToTurnstile(event) {
    sessionStorage.setItem('gototurn', event.target.id)
    navigateTo('/ststate')
}

function toggleSearchAndFilter(event, cmd) {
    if (cmd == 'filter') {
        if (!isFilterPanelOpen) {
            event.currentTarget.classList.add("active")
            document.getElementsByClassName('filtersWrapper')[0].style.height = "26px"
            isFilterPanelOpen = true
        } else {
            event.currentTarget.classList.remove("active")
            document.getElementsByClassName('filtersWrapper')[0].style.height = "0px"
            document.getElementById('filFaculty').value = ''
            document.getElementById('filGrnum').value = ''
            document.getElementById('filRestype').value = ''
            isFilterPanelOpen = false
        }
    } else if (cmd == 'search') {
        if (!isSearchPanelOpen) {
            event.currentTarget.classList.add("active")
            document.getElementsByClassName('searchwrapper')[0].classList.add("activeSearch")
            isSearchPanelOpen = true
        } else {
            event.currentTarget.classList.remove("active")
            document.getElementsByClassName('searchwrapper')[0].classList.remove("activeSearch")
            document.getElementsByClassName('searchbox-input')[0].value = ''
            isSearchPanelOpen = false
        }
    }
}

function delSt() {
    const formData = [
        readCookie('usid'),
        preValues.stid
    ]

    fetch('/sec/deletest', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            if (data === true)
                openAlertWin('Student deleted successfully.', function () {
                    location.reload()
                })
        })
}

function editStInfos() {
    const editableFields = document.getElementsByClassName('editableFields')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const edit = document.getElementById('edit')
    const del = document.getElementById('del')

    save.classList.remove('invisibleBtns')
    cancel.classList.remove('invisibleBtns')
    // edit.classList.add('unactiveBtns')
    // del.classList.add('unactiveBtns')
    edit.disabled = true
    del.disabled = true

    for (let i = 0; i < editableFields.length; i++) {
        editableFields[i].disabled = false
    }
}

function cancelEditing() {
    const editableFields = document.getElementsByClassName('editableFields')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const edit = document.getElementById('edit')
    const del = document.getElementById('del')

    save.classList.add('invisibleBtns')
    cancel.classList.add('invisibleBtns')
    // edit.classList.remove('unactiveBtns')
    // del.classList.remove('unactiveBtns')
    edit.disabled = false
    del.disabled = false

    editableFields[0].value = preValues.email
    editableFields[1].value = preValues.phonenum
    editableFields[2].value = preValues.restype
    editableFields[3].value = preValues.address

    for (let i = 0; i < editableFields.length; i++) {
        editableFields[i].disabled = true
    }
}

async function saveStInfo() {
    const editableFields = document.getElementsByClassName('editableFields')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const edit = document.getElementById('edit')
    const del = document.getElementById('del')

    const formData = [
        readCookie('usid'),
        {
            stid: preValues.stid,
            email: editableFields[0].value,
            phonenum: editableFields[1].value,
            restype: editableFields[2].value,
            address: editableFields[3].value,
        }
    ]

    if (preValues.email == formData[1].email &&
        preValues.phonenum == formData[1].phonenum &&
        preValues.restype == formData[1].restype &&
        preValues.address == formData[1].address) {
        openAlertWin('Any information not changed yet', function () {
            closeAlertWin()
        })
        return 0
    }

    const res = await fetch('/sec/updatest', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (data == true) {
        for (let i = 0; i < editableFields.length; i++) {
            editableFields[i].disabled = true
        }
        save.classList.add('invisibleBtns')
        cancel.classList.add('invisibleBtns')
        // edit.classList.remove('unactiveBtns')
        // del.classList.remove('unactiveBtns')
        edit.disabled = false
        del.disabled = false
        openAlertWin('Student information changed successfully', function () {
            closeAlertWin()
        })
    }
}