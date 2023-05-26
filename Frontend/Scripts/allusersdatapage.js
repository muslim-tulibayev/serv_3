const preValues = {
    userid: '',
    dbrank: '',
    agentbuilding: ''
}

window.addEventListener('load', async () => {
    // const formData = [
    //     document.cookie,
    //     document.cookie
    // ]
    // // Set user frame and Set user dbrank
    // const user = await fetch('/sec/getuser', {
    //     method: 'POST',
    //     headers: { 'Content-type': 'application/json' },
    //     body: JSON.stringify(formData)
    // })
    // const userData = await user.json()
    // const dbrank = userData.dbrank

    // if (dbrank !== 'Owner')

    getusersdata()

    const e = {
        target: {
            id: '64592ef9afd5fddacabfe440'
        }
    }

    // openUserInfoWinWrapper(e)

})

async function openUserInfoWinWrapper(event) {
    const formData = [
        readCookie('usid'),
        'single',
        event.target.id
    ]
    const res = await fetch('/sec/getusersdata', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    preValues.userid = data._id
    preValues.dbrank = data.dbrank
    preValues.agentbuilding = data.agentbuilding

    const userInfoWinWrapper = document.getElementById('userInfoWinWrapper')
    userInfoWinWrapper.innerHTML = `
        <div class="stInfoWin borEffect">
            <span class="material-symbols-rounded redbtn close notranslate" onclick="closeUserInfoWinWrapper()"> close </span>
            <section class="left">
                <div class="img_wrapper">
                    <img src="${data.imgpath}">
                </div>
                <div class="stnames_wrapper">
                    <span> User </span>
                    <p> ${data.firstname} ${data.lastname} </p>
                </div>
                <span class="pseudospace"></span>
                <div class="btns_wrapper"> 
                    <button class="invisibleBtns" id="save" onclick="saveUserInfo()" disabled> Save </button>
                    <button class="invisibleBtns" id="cancel" onclick="cancelEditing()"> Cancel </button>
                    <button id="edit" onclick="editUserInfos()"> Edit </button>
                    <button id="del" onclick="openAskWin('Do you really want to delete this User?', 'delUser()')"> Delete </button>
                </div>
            </section>
            <section class="right">
                <p class="secRightTitle"> Additional Information </p>
                <div class="addInfosWrapper">
                    <div class="info_item_wrapper"> 
                        <span> EMAIL </span> 
                        <input id="info_item_email" type="text" value="${data.email}" disabled>
                    </div>
                    <div class="info_item_wrapper"> 
                        <span> PHONE NUMBER </span>
                        <input id="info_item_phonenum" type="text" value="${data.phonenum}" disabled>
                    </div>
                    <div class="info_item_wrapper">
                        <span> UNIVERSITY RANK </span>
                        <p> ${data.universityrank} </p>
                    </div>


                    <div class="info_item_wrapper">
                        <span> PLATFORM RANK </span>
                        <select class="editableFields" onchange="enableSaveBtn(this.value)" disabled>
                            <option value="Owner" ${selectThis(data.dbrank, 'Owner')}> Owner </option>
                            <option value="Admin" ${selectThis(data.dbrank, 'Admin')}> Admin </option>
                            <option value="Staff" ${selectThis(data.dbrank, 'Staff')}> Staff </option>
                            <option value="Agent" ${selectThis(data.dbrank, 'Agent')}> Agent </option>
                        </select>
                    </div>

                    <div class="info_item_wrapper agent_building_wrapper ${(() => { if (data.dbrank == 'Agent') { return 'agent_building_wrapper_active' } else { return '' } })()}">
                        <span> AGENT BUILDING </span>
                        <select class="editableFields" onchange="enableSaveBtn(this.value)" disabled>
                            <option value="" ${selectThis(data.agentbuilding, '')}> No building </option>
                            <option value="A" ${selectThis(data.agentbuilding, 'cor-a')}> Corpus A ("Geofizika") </option>
                            <option value="A" ${selectThis(data.agentbuilding, 'cor-b')}> Corpus B ("Vokzal") </option>
                            <option value="A" ${selectThis(data.agentbuilding, 'dor-a')}> Dormitory A ("Geofizika") </option>
                            <option value="A" ${selectThis(data.agentbuilding, 'dor-b')}> Dormitory B ("Vokzal") </option>
                            <option value="A" ${selectThis(data.agentbuilding, 'dor-c')}> Dormitory C ("Trikotaj") </option>
                        </select>
                    </div>
                </div>
            </section>
        </div>
    `
    userInfoWinWrapper.style.display = 'flex'
}

function delUser() {
    const formData = [
        readCookie('usid'),
        preValues.userid
    ]

    fetch('/sec/deleteuser', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            if (data === true)
                openAlertWin('User deleted successfully.', function () {
                    location.reload()
                })
        })
}

function selectThis(dbVal, selVal) {
    if (dbVal == selVal)
        return 'selected'
    else
        return ''
}

async function saveUserInfo() {
    const editableFields = document.getElementsByClassName('editableFields')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const edit = document.getElementById('edit')
    const del = document.getElementById('del')

    if (editableFields[0].value !== 'Agent')
        editableFields[1].value = ''

    const formData = [
        readCookie('usid'),
        {
            userid: preValues.userid,
            dbrank: editableFields[0].value,
            agentbuilding: editableFields[1].value
        }
    ]

    const res = await fetch('/sec/updateuserbyowner', {
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
        openAlertWin('User information changed successfully', function () {
            closeAlertWin()
        })
    }
}

function cancelEditing() {
    const editableFields = document.getElementsByClassName('editableFields')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const edit = document.getElementById('edit')
    const del = document.getElementById('del')

    save.disabled = true
    save.classList.add('invisibleBtns')
    cancel.classList.add('invisibleBtns')
    // edit.classList.remove('unactiveBtns')
    // del.classList.remove('unactiveBtns')
    edit.disabled = false
    del.disabled = false

    editableFields[0].value = preValues.dbrank
    editableFields[1].value = preValues.agentbuilding

    for (let i = 0; i < editableFields.length; i++) {
        editableFields[i].disabled = true
    }
}

function editUserInfos() {
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

function enableSaveBtn(value) {
    const agent_building_wrapper = document.getElementsByClassName('agent_building_wrapper')[0]
    const save = document.getElementById('save')

    if (value == 'Agent') {
        agent_building_wrapper.classList.add('agent_building_wrapper_active')
        save.disabled = true
    } else if (value == 'Owner' || value == 'Admin' || value == 'Staff') {
        agent_building_wrapper.classList.remove('agent_building_wrapper_active')
        save.disabled = false
    } else if (value == 'A' || value == 'B') {
        save.disabled = false
    }
}

function getusersdata() {
    const formData = [
        readCookie('usid'),
        'all'
    ]

    fetch('/sec/getusersdata', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (response.ok)
                response.json().then(data => writeAllUsersData(data))
            else
                response.text().then(data => alert(data))
        })
}

function writeAllUsersData(data, listStart) {
    const usersListBody = document.getElementById('usersListBody')
    // Set Users List body
    usersListBody.innerHTML = ''
    let user
    for (let i = 0; i < data.length; i++) {
        user = data[i]
        usersListBody.innerHTML += `
            <li>
                <div class="liNum"> ${i + 1} </div>
                <div class="imgwrapper"> <img src="${user.imgpath}"> </div>
                <div class="fullname"> ${user.firstname} ${user.lastname} </div>
                <div class="phone"> ${user.phonenum} </div>
                <div class="building"> ${user.universityrank} </div>
                <div class="room"> ${user.dbrank} </div>
                <span class="material-symbols-rounded notranslate" id="${user._id}" onclick="openUserInfoWinWrapper(event)"> arrow_outward </span>
            </li>
        `
    }
    usersListBody.innerHTML += `<li class="pseudoSpace"> </li>`
}

function closeUserInfoWinWrapper() {
    document.getElementById('userInfoWinWrapper').style.display = 'none'
}