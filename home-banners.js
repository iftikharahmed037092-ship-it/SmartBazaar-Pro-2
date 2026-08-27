/*==================================================
SMARTBAZAAR PRO 2
FEATURE: HOME DYNAMIC BANNER SYSTEM
==================================================*/

import {
    database,
    auth
} from "./firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const heroSlider =
    document.getElementById("heroSlider");

const heroSliderDots =
    document.getElementById("heroSliderDots");

const adminAddBannerButton =
    document.getElementById("adminAddBannerButton");

const heroPrev =
    document.getElementById("heroPrev");

const heroNext =
    document.getElementById("heroNext");


/*==================================================
FEATURE: BANNER STATE
==================================================*/

let banners = [];

let currentSlide = 0;

let autoSlideTimer = null;


/*==================================================
FEATURE: ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: FIREBASE BANNER PATH

یہی path firebase-banner.js میں بھی استعمال ہو رہا ہے۔
==================================================*/

const BANNER_DATABASE_PATH =
    "smartbazaar_pro_2/banners";


/*==================================================
FEATURE: ADMIN ACCESS CHECK

صرف مخصوص Admin email کو Add Banner button
دکھایا جائے گا۔
==================================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (!adminAddBannerButton) {
            return;
        }


        if (
            user &&
            user.email &&
            user.email.toLowerCase() ===
            ADMIN_EMAIL.toLowerCase()
        ) {

            adminAddBannerButton.style.display =
                "flex";

        } else {

            adminAddBannerButton.style.display =
                "none";

        }

    }
);


/*==================================================
FEATURE: LOAD BANNERS FROM FIREBASE
==================================================*/

function loadBanners() {

    const bannersRef =
        ref(
            database,
            BANNER_DATABASE_PATH
        );


    onValue(
        bannersRef,

        (snapshot) => {

            const data =
                snapshot.val();


            banners = [];


            /*==========================================
            FEATURE: READ FIREBASE DATA
            ==========================================*/

            if (data) {

                Object.entries(data).forEach(
                    ([id, banner]) => {

                        if (
                            !banner ||
                            banner.active === false
                        ) {
                            return;
                        }


                        /*==================================
                        FEATURE: DATE CONTROL
                        ==================================*/

                        const now =
                            Date.now();


                        const startTime =
                            banner.startDate
                                ? new Date(
                                    banner.startDate
                                ).getTime()
                                : null;


                        const endTime =
                            banner.endDate
                                ? new Date(
                                    banner.endDate
                                ).getTime()
                                : null;


                        if (
                            startTime &&
                            !isNaN(startTime) &&
                            now < startTime
                        ) {
                            return;
                        }


                        if (
                            endTime &&
                            !isNaN(endTime) &&
                            now > endTime
                        ) {
                            return;
                        }


                        /*==================================
                        FEATURE: ADD BANNER
                        ==================================*/

                        banners.push({

                            id: id,

                            ...banner

                        });

                    }
                );

            }


            /*==========================================
            FEATURE: SORT BANNERS
            ==========================================*/

            banners.sort(
                (a, b) =>
                    Number(a.order || 0) -
                    Number(b.order || 0)
            );


            renderBanners();

        },

        (error) => {

            console.error(
                "SmartBazaar Pro 2 Banner Loading Error:",
                error
            );

        }
    );

}


/*==================================================
FEATURE: RENDER BANNERS
==================================================*/

function renderBanners() {

    if (!heroSlider) {
        return;
    }


    stopAutoSlide();


    /*==============================================
    REMOVE OLD DYNAMIC SLIDES
    ==============================================*/

    heroSlider
        .querySelectorAll(
            ".hero-slide"
        )
        .forEach(
            slide => slide.remove()
        );


    /*==============================================
    NO BANNERS
    ==============================================*/

    if (banners.length === 0) {

        const emptySlide =
            document.createElement("div");


        emptySlide.className =
            "hero-slide active";


        emptySlide.innerHTML = `

            <div class="banner-image-placeholder">

                <span>
                    No Banners Available
                </span>

            </div>

        `;


        heroSlider.insertBefore(
            emptySlide,
            heroSlider.querySelector(
                ".hero-slider-arrow"
            )
        );


        if (heroSliderDots) {

            heroSliderDots.innerHTML = "";

        }


        return;

    }


    /*==============================================
    FEATURE: CREATE DYNAMIC SLIDES
    ==============================================*/

    banners.forEach(
        (banner, index) => {

            const slide =
                document.createElement("div");


            slide.className =
                "hero-slide";


            if (index === 0) {

                slide.classList.add(
                    "active"
                );

            }


            /*======================================
            FEATURE: BANNER LINK
            ======================================*/

            const link =
                banner.buttonLink ||
                "#";


            /*======================================
            FEATURE: DESKTOP IMAGE
            ======================================*/

            const desktopImage =
                banner.imageUrl ||
                "";


            /*======================================
            FEATURE: MOBILE IMAGE
            ======================================*/

            const mobileImage =
                banner.mobileImageUrl ||
                desktopImage;


            /*======================================
            FEATURE: BANNER CONTENT
            ======================================*/

            slide.innerHTML = `

                <a
                    href="${escapeHtml(link)}"
                    class="banner-link"
                    ${link === "#"
                        ? "onclick=\"return false;\""
                        : ""}
                >

                    <picture>

                        <source
                            media="(max-width: 768px)"
                            srcset="${escapeHtml(
                                mobileImage
                            )}"
                        >

                        <img
                            src="${escapeHtml(
                                desktopImage
                            )}"
                            alt="${escapeHtml(
                                banner.title ||
                                "SmartBazaar Pro Banner"
                            )}"
                            loading="${
                                index === 0
                                    ? "eager"
                                    : "lazy"
                            }"
                        >

                    </picture>

                </a>

            `;


            /*======================================
            FEATURE: INSERT BEFORE ARROWS
            ======================================*/

            heroSlider.insertBefore(
                slide,
                heroSlider.querySelector(
                    ".hero-slider-arrow"
                )
            );

        }
    );


    /*==============================================
    FEATURE: RESET SLIDER
    ==============================================*/

    currentSlide = 0;


    createDots();


    showSlide(
        0
    );


    startAutoSlide();

}


/*==================================================
FEATURE: CREATE SLIDER DOTS
==================================================*/

function createDots() {

    if (!heroSliderDots) {
        return;
    }


    heroSliderDots.innerHTML = "";


    banners.forEach(
        (_, index) => {

            const dot =
                document.createElement("button");


            dot.type =
                "button";


            dot.className =
                "hero-dot";


            if (index === 0) {

                dot.classList.add(
                    "active"
                );

            }


            dot.setAttribute(
                "aria-label",
                `Banner ${index + 1}`
            );


            dot.addEventListener(
                "click",
                () => {

                    currentSlide =
                        index;


                    showSlide(
                        currentSlide
                    );


                    restartAutoSlide();

                }
            );


            heroSliderDots.appendChild(
                dot
            );

        }
    );

}


/*==================================================
FEATURE: SHOW SLIDE
==================================================*/

function showSlide(index) {

    const slides =
        heroSlider?.querySelectorAll(
            ".hero-slide"
        );


    if (
        !slides ||
        slides.length === 0
    ) {
        return;
    }


    if (index < 0) {

        index =
            banners.length - 1;

    }


    if (
        index >= banners.length
    ) {

        index = 0;

    }


    currentSlide =
        index;


    slides.forEach(
        (slide, slideIndex) => {

            slide.classList.toggle(
                "active",
                slideIndex === currentSlide
            );

        }
    );


    const dots =
        heroSliderDots?.querySelectorAll(
            ".hero-dot"
        );


    dots?.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex === currentSlide
            );

        }
    );

}


/*==================================================
FEATURE: NEXT SLIDE
==================================================*/

function nextSlide() {

    if (banners.length <= 1) {
        return;
    }


    currentSlide =
        (
            currentSlide + 1
        ) %
        banners.length;


    showSlide(
        currentSlide
    );

}


/*==================================================
FEATURE: PREVIOUS SLIDE
==================================================*/

function previousSlide() {

    if (banners.length <= 1) {
        return;
    }


    currentSlide =
        (
            currentSlide -
            1 +
            banners.length
        ) %
        banners.length;


    showSlide(
        currentSlide
    );

}


/*==================================================
FEATURE: AUTO SLIDER
==================================================*/

function startAutoSlide() {

    stopAutoSlide();


    if (banners.length <= 1) {
        return;
    }


    autoSlideTimer =
        setInterval(
            () => {

                nextSlide();

            },
            7000
        );

}


/*==================================================
FEATURE: RESTART AUTO SLIDER
==================================================*/

function restartAutoSlide() {

    startAutoSlide();

}


/*==================================================
FEATURE: STOP AUTO SLIDER
==================================================*/

function stopAutoSlide() {

    if (autoSlideTimer) {

        clearInterval(
            autoSlideTimer
        );

        autoSlideTimer = null;

    }

}


/*==================================================
FEATURE: ARROW EVENTS
==================================================*/

heroNext?.addEventListener(
    "click",
    () => {

        nextSlide();

        restartAutoSlide();

    }
);


heroPrev?.addEventListener(
    "click",
    () => {

        previousSlide();

        restartAutoSlide();

    }
);


/*==================================================
FEATURE: SAFE HTML
==================================================*/

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/*==================================================
FEATURE: INITIALIZE
==================================================*/

loadBanners();
