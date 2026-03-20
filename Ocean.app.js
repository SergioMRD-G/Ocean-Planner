/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   Pastel Ocean Planner Core Script
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

let tasks = JSON.parse(localStorage.getItem("tasks") || "{}");
let tabs = JSON.parse(localStorage.getItem("tabs") || 
    ["GI", "GLI", "GSL", "University", "Personal"]);
let nonNegs = JSON.parse(localStorage.getItem("nonNegs") || "[]");

let activeTab = tabs[0];
let weekStartsOn = localStorage.getItem("weekStart") || "monday";

const selectedDate = document.getElementById("selectedDate");
selectedDate.valueAsDate = new Date();

const taskList = document.getElementById("taskList");
const weeklyView = document.getElementById("weeklyView");

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   SAVE FUNCTIONS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function saveTabs() {
    localStorage.setItem("tabs", JSON.stringify(tabs));
}
function saveNonNegs() {
    localStorage.setItem("nonNegs", JSON.stringify(nonNegs));
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   TABS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function drawTabs() {
    const c = document.getElementById("tabsContainer");
    c.innerHTML = "";
    tabs.forEach((t, i) => {
        const tab = document.createElement("div");
        tab.className = "tab";
        tab.style.background = pastel(i);
        tab.innerText = t;
        tab.onclick = () => {
            activeTab = t;
            loadTasks();
        };
        c.appendChild(tab);
    });
}
function pastel(i) {
    const colours = ["#ffd1dc", "#d7f7ff", "#deffd6", "#fffacb", "#e5d6ff"];
    return colours[i % colours.length];
}
drawTabs();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   LOAD TASKS FOR THE DAY
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function loadTasks() {
    const day = selectedDate.value;
    const key = `${activeTab}-${day}`;

    taskList.innerHTML = "";

    const todays = tasks[key] || [];

    todays.forEach((t, index) => {
        const li = document.createElement("li");
        li.className = "task-item";

        li.innerHTML = `
            <span>${t.time ? t.time + " — " : ""}${t.text}</span>
            <div>
                <span class="edit">✏️</span>
                <span class="delete">🗑️</span>
            </div>
        `;

        li.querySelector(".edit").onclick = () => editTask(key, index);
        li.querySelector(".delete").onclick = () => deleteTask(key, index);

        li.onclick = (e) => {
            if (e.target.classList.contains("edit") || e.target.classList.contains("delete")) return;
            completeTask(key, index, li);
        };

        taskList.appendChild(li);
    });
}
loadTasks();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   ADD TASK
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
document.getElementById("addTask").onclick = () => {
    const text = document.getElementById("taskText").value.trim();
    const time = document.getElementById("taskTime").value;

    if (!text) return;

    const key = `${activeTab}-${selectedDate.value}`;

    if (!tasks[key]) tasks[key] = [];
    tasks[key].push({ text, time });

    saveTasks();
    loadTasks();

    document.getElementById("taskText").value = "";
    document.getElementById("taskTime").value = "";
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   EDIT TASK
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function editTask(key, i) {
    const newText = prompt("Edit task:", tasks[key][i].text);
    if (newText === null) return;
    tasks[key][i].text = newText;
    saveTasks();
    loadTasks();
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   DELETE TASK
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function deleteTask(key, i) {
    tasks[key].splice(i, 1);
    saveTasks();
    loadTasks();
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   COMPLETE TASK (Splash Animation)
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function completeTask(key, i, element) {
    element.style.transition = "opacity 0.5s";
    element.style.opacity = "0";
    setTimeout(() => {
        tasks[key].splice(i, 1);
        saveTasks();
        loadTasks();
    }, 500);
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   WEEKLY VIEW
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
document.getElementById("toggleWeeklyView").onclick = () => {
    weeklyView.classList.toggle("hidden");
    taskList.classList.toggle("hidden");

    if (!weeklyView.classList.contains("hidden")) drawWeekly();
};

function drawWeekly() {
    const base = new Date(selectedDate.value);
    const week = [];

    let day = new Date(base);
    const offset = weekStartsOn === "monday" ? (day.getDay() || 7) - 1 : day.getDay();
    day.setDate(day.getDate() - offset);

    for (let i = 0; i < 7; i++) {
        const dStr = day.toISOString().split("T")[0];
        const key = `${activeTab}-${dStr}`;
        week.push({
            date: dStr,
            tasks: (tasks[key] || [])
        });
        day.setDate(day.getDate() + 1);
    }

    weeklyView.innerHTML = week.map(w =>
        `<h4>${w.date}</h4>` +
        `<ul>${w.tasks.map(t => `<li>${t.time ? t.time + " — " : ""}${t.text}</li>`).join("")}</ul>`
    ).join("");
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   SETTINGS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
document.getElementById("openSettings").onclick = () =>
    document.getElementById("settingsPanel").classList.remove("hidden");

document.getElementById("closeSettings").onclick = () =>
    document.getElementById("settingsPanel").classList.add("hidden");

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   BACKGROUND CANVAS ANIMATION
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
const canvas = document.getElementById("seaBackground");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.onresize = resizeCanvas;

const animals = [];
const animalImages = [];

const animalSources = [
    "https://i.imgur.com/WtXHkR8.png", // jellyfish
    "https://i.imgur.com/dFTxZ9B.png", // turtle
    "https://i.imgur.com/5dfxvQi.png", // whale
    "https://i.imgur.com/8BpiY0U.png"  // dolphin
];

animalSources.forEach(src => {
    const img = new Image();
    img.src = src;
    animalImages.push(img);
});

function spawnAnimals() {
    for (let i = 0; i < 8; i++) {
        animals.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            img: animalImages[Math.floor(Math.random()*animalImages.length)],
            speed: 0.3 + Math.random()*0.4,
            offset: Math.random()*100
        });
    }
}
spawnAnimals();

function animateBackground() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    animals.forEach(a => {
        a.y += Math.sin((Date.now()/2000)+a.offset)*0.2;
        ctx.globalAlpha = 0.18;
        ctx.drawImage(a.img, a.x, a.y, 90, 90);
    });
    requestAnimationFrame(animateBackground);
}
animateBackground();