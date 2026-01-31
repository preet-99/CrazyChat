const themeToggle = document.getElementById("themeToggle");


//   Load saved theme 
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "🔆";
}



themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "🔆";
    }
    else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
    }
})



const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");


const overlay = document.getElementById("overlay");
menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
})

overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
})


document.querySelectorAll(".chat_item").forEach(item => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove("open")
            overlay.classList.remove("show")
        }
    })
})



