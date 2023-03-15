const menuBar = document.getElementById("menu-btn");
const sideBarMenu = document.querySelector(".side-bar");
const closeSideBarMenu = document.getElementById("close-side-bar");
const swiperContainer = document.querySelector(".swiper-wrapper");

menuBar.onclick = () => {
  sideBarMenu.style.left = "0";
  sideBarMenu.style.boxShadow = "0 0 0 100vw rgba(0, 0, 0, 0.7)";
};

closeSideBarMenu.onclick = () => {
  sideBarMenu.style.left = "-120%";
  sideBarMenu.style.boxShadow = "";
};

//errors
const errorContainer = document.querySelector(".errorContainer");
const errorMessages = document.querySelectorAll(".error-message > div");

errorMessages.forEach((e) => {
  e.addEventListener("click", (e) => {
    errorContainer.removeChild(e.target.parentElement);
  });
});
