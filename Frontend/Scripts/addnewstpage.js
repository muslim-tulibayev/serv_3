let isEmailRight = 'empty'
let isPhoneRight = 'empty'
let isFnameRight = false
let isLnameRight = false
let isCheckRight = false

function enableAddStBtn() {
    const addStBtn = document.getElementById('addStBtn')
    const restype = document.getElementById('sel_type').value
    const faculty = document.getElementById('sel_faculty').value
    const address = document.getElementById('address').value
    const grnum = document.getElementById('sel_grnum').value

    if ((isFnameRight && isLnameRight && isCheckRight) &&
        (isEmailRight === true || isPhoneRight === true) &&
        (restype !== "" && faculty !== "" && address !== "" && grnum !== "")) {

        addStBtn.disabled = false
        addStBtn.classList.add('active')

    } else {
        addStBtn.disabled = true
        addStBtn.classList.remove('active')
    }
}

function filterPhone(value) {
    const wrapper = document.getElementsByClassName('phoneWrapper')[0]
    const label = wrapper.getElementsByTagName('label')[0]
    const input = wrapper.getElementsByTagName('input')[0]

    if (value.length == 0) {
        label.innerHTML = 'Phone Number'
        isPhoneRight = 'empty'

    } else if (value.length >= 7) {

        for (let i = 0; i < value.length; i++) {
            if (i == 0) {
                if (value[i] == '+')
                    continue
                else if (0 <= Number(value[i]) && Number(value[i]) <= 9)
                    continue
                else {
                    isPhoneRight = false
                    label.innerHTML = 'Phone number form is wrong'
                    break
                }
            } else if (i == value.length - 1) {
                if (0 <= Number(value[i]) && Number(value[i]) <= 9) {
                    isPhoneRight = true
                    label.innerHTML = 'Phone number'
                } else {
                    isPhoneRight = false
                    label.innerHTML = 'Phone number form is wrong'
                    break
                }
            } else if (value[i] == " ") {
                continue
            } else if (0 <= Number(value[i]) && Number(value[i]) <= 9) {
                continue
            } else {
                isPhoneRight = false
                label.innerHTML = 'Phone number form is wrong'
                break
            }
        }

    } else {
        label.innerHTML = 'Phone number must be at least 7 digits long'
        isPhoneRight = false
    }

    if (isPhoneRight === true || isPhoneRight === 'empty') {
        label.classList.remove('warningLabel')
        input.classList.remove('warningInput')
    } else if (isPhoneRight === false) {
        label.classList.add('warningLabel')
        input.classList.add('warningInput')
    }

    enableAddStBtn()
}

function filterLname(value) {
    const wrapper = document.getElementsByClassName('lastnameWrapper')[0]
    const label = wrapper.getElementsByTagName('label')[0]
    const input = wrapper.getElementsByTagName('input')[0]

    if (value.length == 0) {
        label.innerHTML = 'Lastname field cannot be empty'
        isLnameRight = false
    } else {
        label.innerHTML = 'last name'
        isLnameRight = true
    }

    if (isLnameRight === true) {
        label.classList.remove('warningLabel')
        input.classList.remove('warningInput')
    } else if (isLnameRight === false) {
        label.classList.add('warningLabel')
        input.classList.add('warningInput')
    }

    enableAddStBtn()
}

function filterFname(value) {
    const wrapper = document.getElementsByClassName('firstnameWrapper')[0]
    const label = wrapper.getElementsByTagName('label')[0]
    const input = wrapper.getElementsByTagName('input')[0]

    if (value.length == 0) {
        label.innerHTML = 'Firstname field cannot be empty'
        isFnameRight = false
    } else {
        label.innerHTML = 'First name'
        isFnameRight = true
    }

    if (isFnameRight === true) {
        label.classList.remove('warningLabel')
        input.classList.remove('warningInput')
    } else if (isFnameRight === false) {
        label.classList.add('warningLabel')
        input.classList.add('warningInput')
    }

    enableAddStBtn()
}

async function filterEmail(value) {
    const wrapper = document.getElementsByClassName('emailWrapper')[0]
    const label = wrapper.getElementsByTagName('label')[0]
    const input = wrapper.getElementsByTagName('input')[0]

    if (value.length > 10) {
        let temp = ''
        for (let i = value.length - 10; i < value.length; i++)
            temp += value[i]

        if (temp == '@gmail.com') {
            const formData = [
                readCookie('usid'), 'email', value.toLowerCase()
            ]

            const res = await fetch('/sec/stfilter', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (data == 'thereis') {
                label.innerHTML = 'There is such Email'
                isEmailRight = false

            } else if (data == 'thereisnt') {
                label.innerHTML = 'Email'
                isEmailRight = true
            }

        } else {
            label.innerHTML = 'Email form is wrong'
            isEmailRight = false
        }

    } else if (value.length == '') {
        label.innerHTML = 'Email'
        // label.innerHTML = 'Email field cannot be empty'
        isEmailRight = 'empty'

    } else {
        label.innerHTML = 'Email form is wrong'
        isEmailRight = false
    }

    if (isEmailRight === true || isEmailRight === 'empty') {
        label.classList.remove('warningLabel')
        input.classList.remove('warningInput')
    } else if (isEmailRight === false) {
        label.classList.add('warningLabel')
        input.classList.add('warningInput')
    }

    enableAddStBtn()
}

function setImg(event) {
    let dir = URL.createObjectURL(event.target.files[0])
    document.getElementById('img-chosen').src = dir
}

function checkState() {
    if (!isCheckRight)
        isCheckRight = true
    else
        isCheckRight = false

    enableAddStBtn()
}

async function sendstdata() {
    const btn = document.getElementById('addStBtn')
    btn.classList.add('onload')
    btn.disabled = true

    if (!await checkStExist()) {
        btn.classList.remove('onload')
        btn.disabled = false
        return 0
    }

    let st_img = document.getElementById('chs-img').files[0]
    const data = [
        readCookie('usid'),
        {
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            phonenum: document.getElementById('phonenum').value,
            restype: document.getElementById('sel_type').value,
            faculty: document.getElementById('sel_faculty').value,
            address: document.getElementById('address').value,
            grnum: document.getElementById('sel_grnum').value,
            imgpath: '/src/avatar.jpg'
        }
    ]

    function createnewst() {
        fetch('/sec/createnewst', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(data => {
                btn.classList.remove('onload')
                btn.disabled = false
                if (data == 'true') {
                    openAlertWin('New student created successfully!', function () {
                        location.reload()
                    })
                } else
                    openAlertWin(data, function () {
                        closeAlertWin()
                    })
            })
    }

    if (st_img == undefined) {
        createnewst()

    } else {
        const formData = new FormData()
        formData.append('image', st_img)
        const ajax = new XMLHttpRequest()
        ajax.open('POST', '/upload/img')
        ajax.onload = function () {
            data[1].imgpath = ajax.response
            createnewst()
        }
        ajax.send(formData)
    }
}

async function checkStExist() {

    const formData = [
        readCookie('usid'),
        'exist',
        {
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            grnum: document.getElementById('sel_grnum').value
        }
    ]

    const res = await fetch('/sec/stfilter', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (data === 'thereisnt')
        return true

    else {
        openAlertWin('There is such student! <br> Please, Check student information again.', function () {
            closeAlertWin()
        })
        return false
    }
}