/*==================================================
SMARTBAZAAR PRO 2
FEATURE: HOME PAGE BANNER SYSTEM
==================================================*/

import {
    getBanners
} from "./firebase-banner.js";

import {
    auth
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
DOM ELEMENTS
==================================================*/

const heroSlider =
    document.getElementById("heroSlider");

const heroSliderDots =
    document.getElementById("heroSliderDots");

const heroPrev =
    document.getElementById("heroPrev");

const heroNext =
    document.getElementById("heroNext");

const adminAddBannerButton =
    document.getElementById(
        "adminAddBannerButton"
    );


/*==================================================
FEATURE: ADMIN EMAIL
==================================================*/

/*
   یہاں اپنی Admin Gmail رکھیں۔
   مثال:

   const ADMIN_EMAIL =
       "your-email@gmail.com";

*/

const ADMIN_EMAIL =
    "YOUR_ADMIN_EMAIL@gmail.com";


/*==================================================
FEATURE: CHECK ADMIN
==================================================*/

function isAdmin(user) {

    if (!user) {
        return false;
    }

    return user.email === ADMIN_EMAIL;
}


/*==================================================
FEATURE: AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (
            user &&
            isAdmin(user)
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
FEATURE: BANNER DATA
==================================================*/

let banners = [];

let currentSlide = 0;

let slideTimer = null;


/*==================================================
FEATURE: LOAD BANNERS
==================================================*/

async function loadHomeBanners() {

    try {

        const allBanners =
            await getBanners();


        /*==================================================
        FEATURE: ACTIVE BANNERS ONLY
        ==================================================*/

        banners =
            allBanners.filter(
                banner =>
                    banner.active === true
            );


        /*==================================================
        FEATURE: DATE FILTER
        ==================================================*/

        const now =
            new Date();


        banners =
            banners.filter(
                banner => {

                    if (
                        banner.startDate
                    ) {

                        const start =
                            new Date(
                                banner.startDate
                            );

                        if (
                            now < start
                        ) {

                            return false;

                        }

                    }


                    if (
                        banner.endDate
                    ) {

                        const end =
                            new Date(
                                banner.endDate
                            );

                        if (
                            now > end
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        /*==================================================
        NO BANNERS
        ==================================================*/

        if (!banners.length) {

            showEmptyBanner();

            return;

        }


        /*==================================================
        RENDER BANNERS
        ==================================================*/

        renderBanners();


        /*==================================================
        START SLIDER
        ==================================================*/

        startSlider();

    }

    catch (error) {

        console.error(
            "Banner loading error:",
            error
        );

        showEmptyBanner();

    }

}


/*==================================================
FEATURE: RENDER BANNERS
==================================================*/

function renderBanners() {

    heroSlider.innerHTML = "";


    banners.forEach(
        (banner, index) => {

            const slide =
                document.createElement(
                    "div"
                );

            slide.className =
                "hero-slide";


            if (index === 0) {

                slide.classList.add(
                    "active"
                );

            }


            /*==================================================
            FEATURE: RESPONSIVE IMAGE
            ==================================================*/

            const picture =
                document.createElement(
                    "picture"
                );


            if (
                banner.mobileImageUrl
            ) {

                const source =
                    document.createElement(
                        "source"
                    );

                source.media =
                    "(max-width: 768px)";

                source.srcset =
                    banner.mobileImageUrl;

                picture.appendChild(
                    source
                );

            }


            const image =
                document.createElement(
                    "img"
                );

            image.src =
                banner.imageUrl;

            image.alt =
                banner.title ||
                "SmartBazaar Banner";


            picture.appendChild(
                image
            );


            /*==================================================
            FEATURE: BANNER CONTENT
            ==================================================*/

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "banner-content";


            if (banner.title) {

                const title =
                    document.createElement(
                        "h2"
                    );

                title.textContent =
                    banner.title;

                content.appendChild(
                    title
                );

            }


            if (banner.subtitle) {

                const subtitle =
                    document.createElement(
                        "p"
                    );

                subtitle.textContent =
                    banner.subtitle;

                content.appendChild(
                    subtitle
                );

            }


            if (
                banner.buttonText &&
                banner.buttonLink
            ) {

                const button =
                    document.createElement(
                        "a"
                    );

                button.href =
                    banner.buttonLink;

                button.textContent =
                    banner.buttonText;

                button.className =
                    "banner-button";

                content.appendChild(
                    button
                );

            }


            slide.appendChild(
                picture
            );

            slide.appendChild(
                content
            );


            heroSlider.appendChild(
                slide
            );

        }
    );


    /*==================================================
    FEATURE: RE-ADD ARROWS
    ==================================================*/

    heroSlider.appendChild(
        heroPrev
    );

    heroSlider.appendChild(
        heroNext
    );


    renderDots();

}


/*==================================================
FEATURE: DOTS
==================================================*/

function renderDots() {

    heroSliderDots.innerHTML =
        "";


    banners.forEach(
        (banner, index) => {

            const dot =
                document.createElement(
                    "button"
                );

            dot.type =
                "button";

            dot.className =
                "hero-dot";


            if (index === 0) {

                dot.classList.add(
                    "active"
                );

            }


            dot.addEventListener(
                "click",
                () => {

                    showSlide(index);

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
        heroSlider.querySelectorAll(
            ".hero-slide"
        );

    const dots =
        heroSliderDots.querySelectorAll(
            ".hero-dot"
        );


    if (!slides.length) {
        return;
    }


    if (
        index >= slides.length
    ) {

        index = 0;

    }


    if (index < 0) {

        index =
            slides.length - 1;

    }


    slides.forEach(
        slide =>
            slide.classList.remove(
                "active"
            )
    );


    dots.forEach(
        dot =>
            dot.classList.remove(
                "active"
            )
    );


    slides[index].classList.add(
        "active"
    );


    if (dots[index]) {

        dots[index].classList.add(
            "active"
        );

    }


    currentSlide =
        index;

}


/*==================================================
FEATURE: NEXT
==================================================*/

function nextSlide() {

    showSlide(
        currentSlide + 1
    );

}


/*==================================================
FEATURE: PREVIOUS
==================================================*/

function previousSlide() {

    showSlide(
        currentSlide - 1
    );

}


/*==================================================
FEATURE: ARROWS
==================================================*/

heroNext.addEventListener(
    "click",
    () => {

        nextSlide();

        restartSlider();

    }
);


heroPrev.addEventListener(
    "click",
    () => {

        previousSlide();

        restartSlider();

    }
);


/*==================================================
FEATURE: AUTO SLIDER
==================================================*/

function startSlider() {

    stopSlider();


    if (
        banners.length <= 1
    ) {

        return;

    }


    slideTimer =
        setInterval(
            () => {

                nextSlide();

            },
            7000
        );

}


function stopSlider() {

    if (slideTimer) {

        clearInterval(
            slideTimer
        );

        slideTimer =
            null;

    }

}


function restartSlider() {

    startSlider();

}


/*==================================================
FEATURE: EMPTY BANNER
==================================================*/

function showEmptyBanner() {

    heroSlider.innerHTML = `

        <div class="hero-slide active">

            <div class="banner-image-placeholder">

                <span>
                    No Active Banners
                </span>

            </div>

        </div>

    `;

    heroSliderDots.innerHTML =
        "";

}


/*==================================================
FEATURE: INITIALIZE
==================================================*/

loadHomeBanners();
