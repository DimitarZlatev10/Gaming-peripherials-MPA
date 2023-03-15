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
