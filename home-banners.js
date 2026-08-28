/*==================================================
SMARTBAZAAR PRO 2
FEATURE: HOME DYNAMIC BANNER SYSTEM
FINAL REPLACEMENT VERSION
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
FEATURE: CONFIGURATION
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";

const BANNER_DATABASE_PATH =
    "smartbazaar_pro_2/banners";

const AUTO_SLIDE_TIME =
    7000;


/*==================================================
FEATURE: SLIDER STATE
==================================================*/

let banners = [];

let currentSlide = 0;

let autoSlideTimer = null;


/*==================================================
FEATURE: INITIAL CHECK
==================================================*/

if (!heroSlider) {

    console.error(
        "SmartBazaar Pro 2: #heroSlider not found."
    );

}


/*==================================================
FEATURE: ADMIN ACCESS
==================================================*/

if (auth && adminAddBannerButton) {

    onAuthStateChanged(
        auth,
        (user) => {

            const isAdmin =
                user &&
                user.email &&
                user.email.toLowerCase() ===
                ADMIN_EMAIL.toLowerCase();


            adminAddBannerButton.style.display =
                isAdmin ? "flex" : "none";

        }
    );

}


/*==================================================
FEATURE: LOAD BANNERS
FIREBASE REALTIME LISTENER
==================================================*/

function loadBanners() {

    if (!database) {

        showBannerMessage(
            "Firebase Database Not Available"
        );

        return;

    }


    const bannersRef =
        ref(
            database,
            BANNER_DATABASE_PATH
        );


    onValue(

        bannersRef,

        (snapshot) => {

            try {

                const data =
                    snapshot.val();


                console.log(
                    "SmartBazaar Pro 2 Firebase Banner Data:",
                    data
                );


                banners = [];


                /*==========================================
                FEATURE: CHECK DATA
                ==========================================*/

                if (
                    !data ||
                    typeof data !== "object"
                ) {

                    renderBanners();

                    return;

                }


                /*==========================================
                FEATURE: READ BANNERS
                ==========================================*/

                Object.entries(data).forEach(
                    ([id, banner]) => {

                        if (
                            !banner ||
                            typeof banner !== "object"
                        ) {

                            return;

                        }


                        /*==================================
                        FEATURE: NORMALIZE DATA
                        ==================================*/

                        const normalizedBanner = {

                            id:

                                banner.id ||
                                id,

                            imageUrl:

                                String(
                                    banner.imageUrl ||
                                    ""
                                ).trim(),

                            mobileImageUrl:

                                String(
                                    banner.mobileImageUrl ||
                                    ""
                                ).trim(),

                            title:

                                String(
                                    banner.title ||
                                    ""
                                ).trim(),

                            subtitle:

                                String(
                                    banner.subtitle ||
                                    ""
                                ).trim(),

                            buttonText:

                                String(
                                    banner.buttonText ||
                                    ""
                                ).trim(),

                            buttonLink:

                                String(
                                    banner.buttonLink ||
                                    ""
                                ).trim(),

                            order:

                                Number(
                                    banner.order || 0
                                ),

                            active:

                                banner.active !== false,

                            startDate:

                                String(
                                    banner.startDate ||
                                    ""
                                ).trim(),

                            endDate:

                                String(
                                    banner.endDate ||
                                    ""
                                ).trim(),

                            createdAt:

                                banner.createdAt ||
                                0,

                            updatedAt:

                                banner.updatedAt ||
                                0

                        };


                        /*==================================
                        FEATURE: IMAGE VALIDATION
                        ==================================*/

                        if (
                            !normalizedBanner.imageUrl &&
                            !normalizedBanner.mobileImageUrl
                        ) {

                            console.warn(
                                "SmartBazaar Pro 2: Banner skipped because no image URL exists:",
                                normalizedBanner
                            );

                            return;

                        }


                        /*==================================
                        FEATURE: ACTIVE STATUS
                        ==================================*/

                        if (
                            normalizedBanner.active !== true
                        ) {

                            return;

                        }


                        /*==================================
                        FEATURE: DATE FILTER
                        ==================================*/

                        if (
                            !isBannerWithinDateRange(
                                normalizedBanner
                            )
                        ) {

                            return;

                        }


                        /*==================================
                        FEATURE: ADD VALID BANNER
                        ==================================*/

                        banners.push(
                            normalizedBanner
                        );

                    }
                );


                /*==========================================
                FEATURE: SORT BY ORDER
                ==========================================*/

                banners.sort(
                    (a, b) => {

                        const orderA =
                            Number(a.order || 0);

                        const orderB =
                            Number(b.order || 0);


                        if (
                            orderA !== orderB
                        ) {

                            return (
                                orderA -
                                orderB
                            );

                        }


                        return (
                            Number(a.createdAt || 0) -
                            Number(b.createdAt || 0)
                        );

                    }
                );


                /*==========================================
                FEATURE: RENDER
                ==========================================*/

                renderBanners();


            } catch (error) {

                console.error(
                    "SmartBazaar Pro 2 Banner Render Error:",
                    error
                );


                showBannerMessage(
                    "Unable to Load Banners"
                );

            }

        },

        (error) => {

            console.error(
                "SmartBazaar Pro 2 Firebase Banner Error:",
                error
            );


            showBannerMessage(
                "Unable to Load Banners"
            );

        }

    );

}


/*==================================================
FEATURE: DATE CONTROL
==================================================*/

function isBannerWithinDateRange(
    banner
) {

    const now =
        Date.now();


    /*==============================================
    START DATE
    ==============================================*/

    if (
        banner.startDate
    ) {

        const startTime =
            parseBannerDate(
                banner.startDate
            );


        if (
            startTime !== null &&
            now < startTime
        ) {

            return false;

        }

    }


    /*==============================================
    END DATE
    ==============================================*/

    if (
        banner.endDate
    ) {

        const endTime =
            parseBannerDate(
                banner.endDate
            );


        if (
            endTime !== null &&
            now > endTime
        ) {

            return false;

        }

    }


    return true;

}


/*==================================================
FEATURE: SAFE DATE PARSER
==================================================*/

function parseBannerDate(
    value
) {

    if (!value) {
        return null;
    }


    const time =
        new Date(value).getTime();


    if (
        Number.isNaN(time)
    ) {

        console.warn(
            "SmartBazaar Pro 2: Invalid banner date:",
            value
        );

        return null;

    }


    return time;

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
    FEATURE: REMOVE OLD DYNAMIC SLIDES
    ==============================================*/

    heroSlider
        .querySelectorAll(
            ".hero-slide"
        )
        .forEach(
            slide => slide.remove()
        );


    /*==============================================
    FEATURE: RESET DOTS
    ==============================================*/

    if (heroSliderDots) {

        heroSliderDots.innerHTML =
            "";

    }


    /*==============================================
    FEATURE: NO BANNERS
    ==============================================*/

    if (
        banners.length === 0
    ) {

        currentSlide = 0;


        showBannerMessage(
            "No Banners Available"
        );


        return;

    }


    /*==============================================
    FEATURE: CREATE SLIDES
    ==============================================*/

    banners.forEach(
        (banner, index) => {

            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "hero-slide";


            if (
                index === 0
            ) {

                slide.classList.add(
                    "active"
                );

            }


            /*======================================
            FEATURE: IMAGE SELECTION
            ======================================*/

            const desktopImage =
                banner.imageUrl ||
                banner.mobileImageUrl ||
                "";


            const mobileImage =
                banner.mobileImageUrl ||
                banner.imageUrl ||
                "";


            /*======================================
            FEATURE: LINK
            ======================================*/

            const link =
                sanitizeUrl(
                    banner.buttonLink
                );


            const hasLink =
                Boolean(link);


            /*======================================
            FEATURE: IMAGE ALT
            ======================================*/

            const altText =
                banner.title ||
                "SmartBazaar Pro Banner";


            /*======================================
            FEATURE: BUILD HTML
            ======================================*/

            slide.innerHTML = `

                ${
                    hasLink
                        ? `
                            <a
                                href="${escapeHtml(link)}"
                                class="banner-link"
                            >
                        `
                        : `
                            <div class="banner-link">
                        `
                }

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
                                altText
                            )}"
                            loading="${
                                index === 0
                                    ? "eager"
                                    : "lazy"
                            }"
                            decoding="async"
                        >

                    </picture>

                ${
                    hasLink
                        ? "</a>"
                        : "</div>"
                }

            `;


            /*======================================
            FEATURE: INSERT SLIDE
            ======================================*/

            const firstArrow =
                heroSlider.querySelector(
                    ".hero-slider-arrow"
                );


            if (firstArrow) {

                heroSlider.insertBefore(
                    slide,
                    firstArrow
                );

            } else {

                heroSlider.appendChild(
                    slide
                );

            }


            /*======================================
            FEATURE: IMAGE ERROR HANDLING
            ======================================*/

            const image =
                slide.querySelector(
                    "img"
                );


            if (image) {

                image.addEventListener(
                    "error",
                    () => {

                        console.error(
                            "SmartBazaar Pro 2: Banner image failed:",
                            image.src
                        );


                        image.style.display =
                            "none";


                        const fallback =
                            document.createElement(
                                "div"
                            );


                        fallback.className =
                            "banner-image-placeholder";


                        fallback.innerHTML = `

                            <span>
                                Banner Image Unavailable
                            </span>

                        `;


                        slide
                            .querySelector(
                                ".banner-link"
                            )
                            ?.appendChild(
                                fallback
                            );

                    }
                );

            }

        }
    );


    /*==============================================
    FEATURE: CREATE DOTS
    ==============================================*/

    createDots();


    /*==============================================
    FEATURE: SHOW FIRST SLIDE
    ==============================================*/

    currentSlide = 0;


    showSlide(
        currentSlide
    );


    /*==============================================
    FEATURE: START AUTO SLIDER
    ==============================================*/

    startAutoSlide();


    /*==============================================
    FEATURE: ARROW VISIBILITY
    ==============================================*/

    updateArrowVisibility();

}


/*==================================================
FEATURE: EMPTY / ERROR MESSAGE
==================================================*/

function showBannerMessage(
    message
) {

    if (!heroSlider) {
        return;
    }


    heroSlider
        .querySelectorAll(
            ".hero-slide"
        )
        .forEach(
            slide => slide.remove()
        );


    currentSlide = 0;


    const slide =
        document.createElement(
            "div"
        );


    slide.className =
        "hero-slide active";


    slide.innerHTML = `

        <div
            class="banner-image-placeholder"
        >

            <span>
                ${escapeHtml(message)}
            </span>

        </div>

    `;


    const firstArrow =
        heroSlider.querySelector(
            ".hero-slider-arrow"
        );


    if (firstArrow) {

        heroSlider.insertBefore(
            slide,
            firstArrow
        );

    } else {

        heroSlider.appendChild(
            slide
        );

    }


    if (heroSliderDots) {

        heroSliderDots.innerHTML =
            "";

    }


    updateArrowVisibility();

}


/*==================================================
FEATURE: CREATE DOTS
==================================================*/

function createDots() {

    if (!heroSliderDots) {
        return;
    }


    heroSliderDots.innerHTML =
        "";


    banners.forEach(
        (_, index) => {

            const dot =
                document.createElement(
                    "button"
                );


            dot.type =
                "button";


            dot.className =
                "hero-dot";


            dot.setAttribute(
                "aria-label",
                `Go to Banner ${index + 1}`
            );


            dot.setAttribute(
                "aria-current",
                index === 0
                    ? "true"
                    : "false"
            );


            if (
                index === 0
            ) {

                dot.classList.add(
                    "active"
                );

            }


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

function showSlide(
    index
) {

    if (!heroSlider) {
        return;
    }


    const slides =
        heroSlider.querySelectorAll(
            ".hero-slide"
        );


    if (
        slides.length === 0 ||
        banners.length === 0
    ) {

        return;

    }


    /*==============================================
    FEATURE: NORMALIZE INDEX
    ==============================================*/

    if (
        index < 0
    ) {

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


    /*==============================================
    FEATURE: ACTIVE SLIDE
    ==============================================*/

    slides.forEach(
        (slide, slideIndex) => {

            slide.classList.toggle(
                "active",
                slideIndex === currentSlide
            );

        }
    );


    /*==============================================
    FEATURE: ACTIVE DOT
    ==============================================*/

    if (heroSliderDots) {

        heroSliderDots
            .querySelectorAll(
                ".hero-dot"
            )
            .forEach(
                (dot, dotIndex) => {

                    const active =
                        dotIndex ===
                        currentSlide;


                    dot.classList.toggle(
                        "active",
                        active
                    );


                    dot.setAttribute(
                        "aria-current",
                        active
                            ? "true"
                            : "false"
                    );

                }
            );

    }

}


/*==================================================
FEATURE: NEXT SLIDE
==================================================*/

function nextSlide() {

    if (
        banners.length <= 1
    ) {

        return;

    }


    const nextIndex =
        (
            currentSlide + 1
        ) %
        banners.length;


    showSlide(
        nextIndex
    );

}


/*==================================================
FEATURE: PREVIOUS SLIDE
==================================================*/

function previousSlide() {

    if (
        banners.length <= 1
    ) {

        return;

    }


    const previousIndex =
        (
            currentSlide -
            1 +
            banners.length
        ) %
        banners.length;


    showSlide(
        previousIndex
    );

}


/*==================================================
FEATURE: START AUTO SLIDE
==================================================*/

function startAutoSlide() {

    stopAutoSlide();


    if (
        banners.length <= 1
    ) {

        return;

    }


    autoSlideTimer =
        setInterval(
            () => {

                nextSlide();

            },
            AUTO_SLIDE_TIME
        );

}


/*==================================================
FEATURE: STOP AUTO SLIDE
==================================================*/

function stopAutoSlide() {

    if (
        autoSlideTimer !== null
    ) {

        clearInterval(
            autoSlideTimer
        );


        autoSlideTimer =
            null;

    }

}


/*==================================================
FEATURE: RESTART AUTO SLIDE
==================================================*/

function restartAutoSlide() {

    startAutoSlide();

}


/*==================================================
FEATURE: ARROW EVENTS
==================================================*/

heroNext?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();


        nextSlide();


        restartAutoSlide();

    }
);


heroPrev?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();


        previousSlide();


        restartAutoSlide();

    }
);


/*==================================================
FEATURE: ARROW VISIBILITY
==================================================*/

function updateArrowVisibility() {

    const shouldShow =
        banners.length > 1;


    if (heroPrev) {

        heroPrev.style.display =
            shouldShow
                ? "flex"
                : "none";

    }


    if (heroNext) {

        heroNext.style.display =
            shouldShow
                ? "flex"
                : "none";

    }

}


/*==================================================
FEATURE: SAFE URL
==================================================*/

function sanitizeUrl(
    value
) {

    if (!value) {
        return "";
    }


    const url =
        String(value).trim();


    if (
        url === "#" ||
        url === "javascript:void(0)"
    ) {

        return "";

    }


    /*==============================================
    ALLOW NORMAL WEB LINKS
    ==============================================*/

    if (
        url.startsWith("/") ||
        url.startsWith("./") ||
        url.startsWith("../") ||
        url.startsWith("#") ||
        url.startsWith("https://") ||
        url.startsWith("http://") ||
        url.startsWith("mailto:")
    ) {

        return url;

    }


    return "";

}


/*==================================================
FEATURE: ESCAPE HTML
==================================================*/

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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
FEATURE: PAUSE ON HOVER
DESKTOP UX
==================================================*/

if (heroSlider) {

    heroSlider.addEventListener(
        "mouseenter",
        () => {

            stopAutoSlide();

        }
    );


    heroSlider.addEventListener(
        "mouseleave",
        () => {

            startAutoSlide();

        }
    );

}


/*==================================================
FEATURE: VISIBILITY CONTROL
STOP SLIDER WHEN TAB HIDDEN
==================================================*/

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            stopAutoSlide();

        } else {

            startAutoSlide();

        }

    }
);


/*==================================================
FEATURE: INITIALIZE
==================================================*/

loadBanners();


/*==================================================
SMARTBAZAAR PRO 2
END OF FINAL HOME BANNER SYSTEM
==================================================*/
