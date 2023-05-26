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
                response.json().then(data => writeAllstsdata(data, 0))
            else
                response.text().then(data => alert(data))
        })
}

function writeAllstsdata(data, listStart) {
    const stsListWrapper = document.getElementById('stsListWrapper')

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
                <button onclick="generateQr(event)" id="${st._id}"> Generate </button>
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

async function generateQr(event) {
    const formData = [
        readCookie('usid'),
        event.currentTarget.id
    ]
    const res = await fetch('/sec/getst', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(formData)
    })
    const data = await res.json()
    const resultWin = document.getElementById('resultWin')
    const qrdata = `{~f~:~${data.firstname}~,~l~:~${data.lastname}~,~g~:~${data.grnum}~}`
    resultWin.innerHTML = `
            <div class="card borEffect" id="card">
                <section class="left">
                    <p class="notranslate"> Student card of <br> ${data.firstname} ${data.lastname} </p>
                    <h1 class="notranslate"> MTUIT-IOS29 </h1>
                </section>
                <section class="right">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrdata}">
                </section>
            </div>
            <div class="btns">
                <a id="saveAnchor"> Save </a>
                <button onclick="closeResultWin()"> Close </button>
            </div>
    `
    resultWin.style.display = 'flex'

    let canvasPromise = html2canvas(document.getElementById('card'), {
        allowTaint: true,
        useCORS: true
    })

    canvasPromise
        .then(function (canvas) {
            const base64image = canvas.toDataURL("image/png")
            let anchor = document.getElementById('saveAnchor')
            anchor.setAttribute('href', base64image)
            anchor.setAttribute('download', `${data.firstname}-${data.lastname}-${data.grnum}.png`)
        })
}

function closeResultWin() {
    document.getElementById('resultWin').style.display = 'none'
}

// {/* <span class="material-symbols-rounded" id="${st._id}" onclick="openStInfoWinWrapper(event)"> arrow_outward </span> */ }

// // `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`

// // const wrapper = document.querySelector(".wrapper"),
// // qrInput = wrapper.querySelector(".form input"),
// // generateBtn = wrapper.querySelector(".form button"),
// // qrImg = wrapper.querySelector(".qr-code img");
// // let preValue;

// // generateBtn.addEventListener("click", () => {
// //     let qrValue = qrInput.value.trim();
// //     if(!qrValue || preValue === qrValue) return;
// //     checkst(qrValue)
// //         .then(data => {
// //             if (data == null) {
// //                 alert('There is no such Student?!')
// //                 return 0
// //             } else if (data == 0) {
// //                 return 0
// //             }
// //             qrValue = `${data.firstname} ${data.lastname}`
// //             document.getElementsByClassName('result')[0].innerHTML = `QR code for: ${qrValue}`
// //             preValue = qrValue;
// //             generateBtn.innerText = "Generating QR Code...";
// //             qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`;
// //             qrImg.addEventListener("load", () => {
// //                 wrapper.classList.add("active");
// //                 generateBtn.innerText = "Generate QR Code";
// //             })
// //         })
// // })

// // async function checkst(qrValue) {
// //     const resOfFilter = filter(qrValue)
// //     if (!resOfFilter)
// //         return 0
// //     const formData = [
// //         document.cookie,
// //         resOfFilter
// //     ]
// //     const res = await fetch('/sec/checkst', {
// //         method: 'POST',
// //         headers: {'Content-type': 'application/json'},
// //         body: JSON.stringify(formData)
// //     })
// //     if (res.ok)
// //         return await res.json()
// //     else {
// //         alert(await res.text())
// //         return 0
// //     }
// // }

// // function filter(txt) {
// //     txt = txt.trim()
// //     if (txt=='') {
// //         alert('Input field is empty!')
// //         return false
// //     } else {
// //         let arr = txt.split(" ")
// //         if (arr.length >= 3) {
// //             alert("Probably you've entered elements wrong?!")
// //             return false
// //         } else if (arr.length == 1) {
// //             alert("Please enter both firstname and lastname for more accuracy!")
// //             return false
// //         } else {
// //             return arr
// //         }
// //     }
// // }

// // qrInput.addEventListener("keyup", () => {
// //     if(!qrInput.value.trim()) {
// //         wrapper.classList.remove("active");
// //         preValue = "";
// //     }
// // })