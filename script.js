import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-check.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const logInContainer = document.getElementById("logInContainer");
const houseNameInput = document.getElementById("house-name");
const housePasswordInput = document.getElementById("house-password");
const logInButton = document.getElementById("log-in-Button");

const listContainer = document.getElementById("listContainer");
const itemsList = document.getElementById("items-list");

const newItemInput = document.getElementById("newItemName");
const addButton = document.getElementById("addButton");

const RowButton = document.getElementById("RowButton");
const columnButton = document.getElementById("columnButton");

const houseRule = /^[a-zA-Z0-9]+$/;

const firebaseConfig = {
    apiKey: "AIzaSyA2epBvGh9Xbqc1eBPnXdGZ3ExDeHHRIE4",
    authDomain: "shopping-list-0001-93a5e.firebaseapp.com",
    projectId: "shopping-list-0001-93a5e",
    storageBucket: "shopping-list-0001-93a5e.firebasestorage.app",
    messagingSenderId: "840776721317",
    appId: "1:840776721317:web:faf370d4e5ac785d073e4c",
    measurementId: "G-23DEQX8G41"
};

const app = initializeApp(firebaseConfig);
const dataBase = getDatabase(app);
const analytics = getAnalytics(app);

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LdpoIYtAAAAANbkIB4LIROfXWMxR1MzuUnKldJM'),
    isTokenAutoRefreshEnabled: true
})

let path = "";

let alerting = false;

let gridColumns = 2;

logInButton.addEventListener("click", () => {
    const houseName = houseNameInput.value.trim();
    const password = housePasswordInput.value.trim();

    if (houseName === "" || password === "") {
        createAlert("House name or Password are Missing!");
        return;
    }

    if (!RegExp(houseRule).test(houseName) || !RegExp(houseRule).test(password)) {
        createAlert("You can't use symbols!");
        return;
    }

    path = `houses/${houseName}_${password}/items`;

    listContainer.classList.remove("hidden");
    logInContainer.classList.add("hidden");

    dataBaseConnect();
})

function dataBaseConnect() {
    const itemsRef = ref(dataBase, path);

    onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        itemsList.innerHTML = "";

        if (!data) {
            return;
        }

        Object.keys(data).forEach((id) => {
            const item = data[id];

            const itemHtml = document.createElement("li");
            itemHtml.classList.add("item");

            itemHtml.innerHTML = `
                <p>${item.name}</p>
                <div class="actions">
                    <button class="delete-button" translate="no" title="delete"><span class="material-symbols-outlined">delete</span></button>
                    <button class="info-button" translate="no" title="see info"><span class="material-symbols-outlined">info</span></button>
                    <button class="edit-button" translate="no" title="edit"><span class="material-symbols-outlined">edit</span></button>
                </div>
            `;

            const deleteButton = itemHtml.querySelector(".delete-button");

            deleteButton.addEventListener("click", () => {
                const itemRef = ref(dataBase, `${path}/${id}`);
                remove(itemRef);
            })

            const editButton = itemHtml.querySelector(".edit-button");
            editButton.addEventListener("click", () => {
                const currentName = item.name;
                let editedName = prompt(`Edit the name of ${currentName}`);

                if (editedName === null || editedName === currentName) {
                    createAlert(`The edition of ${currentName} was automatically cancelled`);
                    return;
                }

                editedName = editedName.trim();

                if (editedName === "") {
                    alert("Can't edit empty items!");
                    return;
                }

                if (editedName.length > 25) {
                    alert("Too large name!");
                    return;
                }

                const itemRef = ref(dataBase, `${path}/${id}`);
                update(itemRef, {
                    name: editedName
                })
            })

            const infoButton = itemHtml.querySelector(".info-button");
            infoButton.addEventListener("click", () => {
                createInfoPanel(item.createdAt);
            })

            itemsList.appendChild(itemHtml);
        })
    })
}

addButton.addEventListener("click", () => {
    const newItemName = newItemInput.value.trim();

    if (newItemName === "") {
        createAlert("You can't add empty items!");
        return;
    }

    if (newItemName.length > 25) {
        createAlert("Too large name! Max 25 characters.");
        return;
    }

    const time = new Date();

    const day = time.getDate();
    const month = time.getMonth() + 1;
    const year = time.getFullYear();

    const hours = time.getHours();

    const itemRef = ref(dataBase, path);
    push(itemRef, {
        name: newItemName,
        createdAt: `${day}/${month}/${year} ${hours}H`
    })

    newItemInput.value = "";

    addButton.classList.add("send");

    setTimeout(() => {
        addButton.classList.remove("send");
    }, 2000);
})

setTimeout(() => {
    const screen = document.getElementById("splash");
    screen.style.display = "none";
}, 2750);

function createInfoPanel(createdAt="null date") {
    const dialog = document.createElement("dialog");
    document.body.appendChild(dialog);
    dialog.classList.add("info-panel");

    const title = document.createElement("p");
    title.classList.add("title")
    title.innerHTML = `<span class="material-symbols-outlined info-symbol" translate="no">info</span> Info Panel`;
    dialog.appendChild(title);

    const unorderList = document.createElement("ul");
    unorderList.classList.add("info-list");

    unorderList.innerHTML = `
        <li>
            <p>Created At: ${createdAt}</p>
        </li>
    `;

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<span class="material-symbols-outlined" translate="no" title="close">close</span>`;
    closeButton.classList.add("close-button");

    closeButton.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
    })

    dialog.appendChild(closeButton);

    dialog.appendChild(unorderList);

    dialog.showModal();
}

function createAlert(description="Unknown Error") {

    if (alerting) return;

    alerting = true;

    const div = document.createElement("div");
    div.classList.add("alert-container");

    const para = document.createElement("p");
    para.innerText = `Alert: ${description}`;

    div.appendChild(para);
    document.body.appendChild(div);

    setTimeout(() => {
        div.classList.add("fadeOut");
        
        setTimeout(() => {
            div.remove();
            alerting = !alerting;
        }, 4000);
    }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
    const width = window.innerWidth;

    if (width < 335) {
        columnButton.disabled = true;
        RowButton.classList.add("button-active");
        return;
    }

    if (width <= 610) {
        RowButton.classList.toggle("button-active");
        gridColumns = 1;
    }
    else {
        columnButton.classList.toggle("button-active");
        gridColumns = 2;
    }

    controllListGrid(gridColumns);
})

function controllListGrid(collumns=1) {
    const width = window.innerWidth;

    if (width < 335) {
        itemsList.classList.remove("twoColumns");
        columnButton.disabled = true;
        columnButton.classList.remove("button-active");
        RowButton.classList.add("button-active");
        return;
    }

    if (collumns == 2) {
        itemsList.classList.add("twoColumns");
    }
    else {
        itemsList.classList.remove("twoColumns");
    }
}

RowButton.addEventListener("click", () => {
    gridColumns = 1;
    controllListGrid(gridColumns);

    columnButton.classList.remove("button-active");
    RowButton.classList.add("button-active");
})

columnButton.addEventListener("click", () => {
    gridColumns = 2;
    controllListGrid(gridColumns);

    RowButton.classList.remove("button-active");
    columnButton.classList.add("button-active");
})