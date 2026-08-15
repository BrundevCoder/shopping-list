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

logInButton.addEventListener("click", () => {
    const houseName = houseNameInput.value.trim();
    const password = housePasswordInput.value.trim();

    if (houseName === "" || password === "") {
        alert("House Name or Password are Missing!");
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
                    <button class="delete-button" translate="no"><span class="material-symbols-outlined">delete</span></button>
                    <button class="edit-button" translate="no"><span class="material-symbols-outlined">edit</span></button>
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
                const editedName = prompt(`Edit the name of ${currentName}`).trim();

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

            itemsList.appendChild(itemHtml);
        })
    })
}

addButton.addEventListener("click", () => {
    const newItemName = newItemInput.value.trim();

    if (newItemName === "") {
        alert("Can't add empty items!");
        return;
    }

    if (newItemName.length > 25) {
        alert("Too large name!");
        return;
    }

    const itemRef = ref(dataBase, path);
    push(itemRef, {
        name: newItemName
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