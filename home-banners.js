/*==================================================
SMARTBAZAAR PRO 2
HOME-BANNERS.JS
FEATURE: COMPLETE DYNAMIC HERO BANNER SYSTEM

FEATURES:
- Firebase Realtime Database
- Dynamic Banner Loading
- Desktop + Mobile Images
- Active / Inactive Control
- Start / End Date
- Banner Order
- Slider
- Previous / Next
- Dots
- Auto Slide
- Touch Swipe
- Mouse Drag
- Admin Add Banner Button
==================================================*/


/*==================================================
FIREBASE IMPORTS
==================================================*/

import {
    database,
    auth
} from "./firebase-config.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: ADMIN CONFIG
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: FIREBASE BANNER DATABASE PATH
==================================================*/

const BANNER_DATABASE_PATH =
    "smartbazaar_pro_2/banners";


const bannersRef =
    ref(
        database,
        BANNER_DATABASE_PATH
    );


/*==================================================
FEATURE: GLOBAL BANNER STATE
==================================================*/

let banners = [];

let currentSlide = 0;

let autoSlideTimer = null;

let heroSliderInitialized = false;


/*==================================================
FEATURE: SAFE HTML
==================================================*/

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
FEATURE: SAFE URL
==================================================*/

function safeURL(value) {

    const url =
        String(value ?? "").trim();


    if (!url) {

        return "#";

    }


    const lower =
        url.toLowerCase();


    if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:")
    ) {

        return "#";

    }


    return url;

}


/*==================================================
FEATURE: GET DESKTOP IMAGE
==================================================*/

function getBannerImage(banner) {

    return (
        banner.imageUrl ||
        banner.desktopImageUrl ||
        banner.image ||
        ""
    );

}


/*==================================================
FEATURE: GET MOBILE IMAGE
==================================================*/

function getMobileBannerImage(banner) {

    return (
        banner.mobileImageUrl ||
        banner.mobileImage ||
        getBannerImage(banner)
    );

}


/*==================================================
FEATURE: CHECK BANNER SCHEDULE
==================================================*/

function isBannerWithinSchedule(banner) {

    const now =
        Date.now();


    /*==================================================
    START DATE
    ==================================================*/

    if (banner.startDate) {

        const start =
            new Date(
                banner.startDate
            ).getTime();


        if (
            !Number.isNaN(start) &&
            now < start
        ) {

            return false;

        }

    }


    /*==================================================
    END DATE
    ==================================================*/

    if (banner.endDate) {

        const end =
            new Date(
                banner.endDate
            ).getTime();


        if (
            !Number.isNaN(end) &&
            now > end
        ) {

            return false;

        }

    }


    return true;

}


/*==================================================
FEATURE: ADMIN ADD BANNER BUTTON
==================================================*/

function initializeAdminBannerAccess() {

    const addBannerButton =
        document.getElementById(
            "adminAddBannerButton"
        );


    if (!addBannerButton) {

        console.warn(
            "SmartBazaar Pro 2: #adminAddBannerButton not found."
        );

        return;

    }


    /*==================================================
    DEFAULT HIDDEN
    ==================================================*/

    addBannerButton.style.display =
        "none";


    /*==================================================
    FIREBASE AUTH CHECK
    ==================================================*/

    onAuthStateChanged(
        auth,
        function (user) {

            if (
                user &&
                user.email &&
                user.email.toLowerCase() ===
                ADMIN_EMAIL.toLowerCase()
            ) {

                addBannerButton.style.display =
                    "flex";


                console.log(
                    "✓ SmartBazaar Pro 2: Admin banner button enabled."
                );

            } else {

                addBannerButton.style.display =
                    "none";


                console.log(
                    "SmartBazaar Pro 2: Normal user - banner button hidden."
                );

            }

        }
    );

}


/*==================================================
FEATURE: LOAD BANNERS FROM FIREBASE
==================================================*/

async function loadHomeBanners() {

    const heroBanner =
        document.querySelector(
            ".hero-banner"
        );


    const slidesContainer =
        document.querySelector(
            ".hero-banner .slides"
        );


    const dotsContainer =
        document.querySelector(
            ".hero-banner .slider-dots"
        );


    if (
        !heroBanner ||
        !slidesContainer
    ) {

        console.error(
            "SmartBazaar Pro 2: Hero banner HTML not found."
        );

        return;

    }


    console.log(
        "SmartBazaar Pro 2: Loading home banners..."
    );


    try {

        const snapshot =
            await get(
                bannersRef
            );


        console.log(
            "SmartBazaar Pro 2: Firebase snapshot exists =",
            snapshot.exists()
        );


        banners = [];


        /*==================================================
        NO FIREBASE DATA
        ==================================================*/

        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            console.log(
                "SmartBazaar Pro 2: Firebase banner data =",
                data
            );


            /*==================================================
            READ BANNERS
            ==================================================*/

            Object.entries(
                data
            ).forEach(
                function (
                    [id, banner]
                ) {

                    if (!banner) {

                        return;

                    }


                    /*==================================================
                    ACTIVE CONTROL
                    ==================================================*/

                    if (
                        banner.active === false
                    ) {

                        return;

                    }


                    /*==================================================
                    IMAGE
                    ==================================================*/

                    const imageUrl =
                        getBannerImage(
                            banner
                        );


                    if (!imageUrl) {

                        console.warn(
                            "SmartBazaar Pro 2: Banner skipped - image missing:",
                            id
                        );

                        return;

                    }


                    /*==================================================
                    DATE
                    ==================================================*/

                    if (
                        !isBannerWithinSchedule(
                            banner
                        )
                    ) {

                        return;

                    }


                    /*==================================================
                    ADD BANNER
                    ==================================================*/

                    banners.push({

                        id:
                            id,

                        title:
                            banner.title || "",

                        subtitle:
                            banner.subtitle || "",

                        description:
                            banner.description || "",

                        buttonText:
                            banner.buttonText || "",

                        buttonLink:
                            banner.buttonLink || "",

                        imageUrl:
                            imageUrl,

                        mobileImageUrl:
                            getMobileBannerImage(
                                banner
                            ),

                        order:
                            Number(
                                banner.order || 0
                            ),

                        createdAt:
                            Number(
                                banner.createdAt || 0
                            )

                    });

                }
            );

        }


        /*==================================================
        SORT BANNERS
        ==================================================*/

        banners.sort(
            function (
                a,
                b
            ) {

                const orderDifference =
                    a.order -
                    b.order;


                if (
                    orderDifference !== 0
                ) {

                    return orderDifference;

                }


                return (
                    a.createdAt -
                    b.createdAt
                );

            }
        );


        console.log(
            "SmartBazaar Pro 2: Final banners:",
            banners
        );


        /*==================================================
        RENDER
        ==================================================*/

        renderHomeBanners();


    } catch (error) {

        console.error(
            "SmartBazaar Pro 2: Banner loading error:",
            error
        );


        showBannerError();

    }

}


/*==================================================
FEATURE: RENDER BANNERS
==================================================*/

function renderHomeBanners() {

    const slidesContainer =
        document.querySelector(
            ".hero-banner .slides"
        );


    const dotsContainer =
        document.querySelector(
            ".hero-banner .slider-dots"
        );


    if (
        !slidesContainer
    ) {

        return;

    }


    stopAutoSlide();


    /*==================================================
    CLEAR OLD CONTENT
    ==================================================*/

    slidesContainer.innerHTML =
        "";


    if (dotsContainer) {

        dotsContainer.innerHTML =
            "";

    }


    /*==================================================
    NO BANNERS
    ==================================================*/

    if (
        !banners.length
    ) {

        slidesContainer.innerHTML = `

            <div
                class="banner-slide active">

                <div
                    class="banner-image-placeholder">

                    <span>
                        No Banners Available
                    </span>

                </div>

            </div>

        `;


        currentSlide =
            0;


        return;

    }


    /*==================================================
    CREATE SLIDES
    ==================================================*/

    banners.forEach(
        function (
            banner,
            index
        ) {

            const imageUrl =
                escapeHTML(
                    banner.imageUrl
                );


            const mobileImageUrl =
                escapeHTML(
                    banner.mobileImageUrl
                );


            const title =
                escapeHTML(
                    banner.title
                );


            const subtitle =
                escapeHTML(
                    banner.subtitle
                );


            const description =
                escapeHTML(
                    banner.description
                );


            const buttonText =
                escapeHTML(
                    banner.buttonText
                );


            const buttonLink =
                escapeHTML(
                    safeURL(
                        banner.buttonLink
                    )
                );


            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "banner-slide";


            if (
                index === 0
            ) {

                slide.classList.add(
                    "active"
                );

            }


            slide.dataset.slideIndex =
                index;


            slide.innerHTML = `

                <a
                    href="${buttonLink}"
                    class="home-banner-link"
                    ${
                        buttonLink === "#"
                            ? 'onclick="return false;"'
                            : ""
                    }>

                    <picture>

                        <source
                            media="(max-width: 768px)"
                            srcset="${mobileImageUrl}">

                        <img
                            src="${imageUrl}"
                            alt="${
                                title ||
                                "SmartBazaar Pro Banner"
                            }"
                            class="home-banner-image"
                            loading="${
                                index === 0
                                    ? "eager"
                                    : "lazy"
                            }"
                            draggable="false">

                    </picture>


                    ${
                        title ||
                        subtitle ||
                        description ||
                        buttonText
                            ? `

                                <div
                                    class="home-banner-content">

                                    ${
                                        title
                                            ? `
                                                <span
                                                    class="banner-tag">

                                                    ${title}

                                                </span>
                                              `
                                            : ""
                                    }


                                    ${
                                        subtitle
                                            ? `
                                                <h2>

                                                    ${subtitle}

                                                </h2>
                                              `
                                            : ""
                                    }


                                    ${
                                        description
                                            ? `
                                                <p>

                                                    ${description}

                                                </p>
                                              `
                                            : ""
                                    }


                                    ${
                                        buttonText
                                            ? `
                                                <span
                                                    class="banner-btn">

                                                    ${buttonText}

                                                </span>
                                              `
                                            : ""
                                    }

                                </div>

                              `
                            : ""
                    }

                </a>

            `;


            slidesContainer.appendChild(
                slide
            );


            /*==================================================
            DOT
            ==================================================*/

            if (
                dotsContainer
            ) {

                const dot =
                    document.createElement(
                        "button"
                    );


                dot.type =
                    "button";


                dot.className =
                    "slider-dot";


                if (
                    index === 0
                ) {

                    dot.classList.add(
                        "active"
                    );

                }


                dot.dataset.slide =
                    index;


                dot.setAttribute(
                    "aria-label",
                    `Go to banner ${index + 1}`
                );


                dotsContainer.appendChild(
                    dot
                );

            }

        }
    );


    /*==================================================
    INITIALIZE SLIDER
    ==================================================*/

    initializeHomeBannerSlider();

}


/*==================================================
FEATURE: SHOW ERROR
==================================================*/

function showBannerError() {

    const slidesContainer =
        document.querySelector(
            ".hero-banner .slides"
        );


    if (
        !slidesContainer
    ) {

        return;

    }


    slidesContainer.innerHTML = `

        <div
            class="banner-slide active">

            <div
                class="banner-image-placeholder">

                <span>
                    Unable to load banners.
                </span>

            </div>

        </div>

    `;

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
FEATURE: INITIALIZE SLIDER
==================================================*/

function initializeHomeBannerSlider() {

    const heroBanner =
        document.querySelector(
            ".hero-banner"
        );


    const slides =
        document.querySelectorAll(
            ".hero-banner .banner-slide"
        );


    const dots =
        document.querySelectorAll(
            ".hero-banner .slider-dot"
        );


    if (
        !heroBanner ||
        !slides.length
    ) {

        return;

    }


    currentSlide =
        0;


    heroSliderInitialized =
        true;


    /*==================================================
    SHOW SLIDE
    ==================================================*/

    function showSlide(index) {

        if (
            index < 0
        ) {

            index =
                slides.length - 1;

        }


        if (
            index >= slides.length
        ) {

            index =
                0;

        }


        slides.forEach(
            function (
                slide,
                slideIndex
            ) {

                slide.classList.toggle(
                    "active",
                    slideIndex === index
                );

            }
        );


        dots.forEach(
            function (
                dot,
                dotIndex
            ) {

                dot.classList.toggle(
                    "active",
                    dotIndex === index
                );

            }
        );


        currentSlide =
            index;

    }


    /*==================================================
    NEXT
    ==================================================*/

    function nextSlide() {

        if (
            slides.length <= 1
        ) {

            return;

        }


        showSlide(
            currentSlide + 1
        );

    }


    /*==================================================
    PREVIOUS
    ==================================================*/

    function previousSlide() {

        if (
            slides.length <= 1
        ) {

            return;

        }


        showSlide(
            currentSlide - 1
        );

    }


    /*==================================================
    AUTO SLIDE
    7 SECONDS
    ==================================================*/

    function startAutoSlide() {

        stopAutoSlide();


        if (
            slides.length <= 1
        ) {

            return;

        }


        autoSlideTimer =
            setInterval(
                function () {

                    nextSlide();

                },
                7000
            );

    }


    /*==================================================
    FEATURE: CREATE ARROWS
    ==================================================

    آپ کی نئی HTML میں arrows نہیں تھے،
    اس لیے JavaScript خود بنائے گا۔
    ==================================================*/

    let previousButton =
        heroBanner.querySelector(
            ".home-banner-prev"
        );


    let nextButton =
        heroBanner.querySelector(
            ".home-banner-next"
        );


    if (
        !previousButton
    ) {

        previousButton =
            document.createElement(
                "button"
            );


        previousButton.type =
            "button";


        previousButton.className =
            "home-banner-prev";


        previousButton.setAttribute(
            "aria-label",
            "Previous Banner"
        );


        previousButton.innerHTML =
            '<i class="fa-solid fa-chevron-left"></i>';


        heroBanner.appendChild(
            previousButton
        );

    }


    if (
        !nextButton
    ) {

        nextButton =
            document.createElement(
                "button"
            );


        nextButton.type =
            "button";


        nextButton.className =
            "home-banner-next";


        nextButton.setAttribute(
            "aria-label",
            "Next Banner"
        );


        nextButton.innerHTML =
            '<i class="fa-solid fa-chevron-right"></i>';


        heroBanner.appendChild(
            nextButton
        );

    }


    /*==================================================
    ARROW EVENTS
    ==================================================*/

    nextButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            nextSlide();

            startAutoSlide();

        }
    );


    previousButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            previousSlide();

            startAutoSlide();

        }
    );


    /*==================================================
    DOT EVENTS
    ==================================================*/

    dots.forEach(
        function (dot) {

            dot.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const index =
                        Number(
                            dot.dataset.slide
                        );


                    showSlide(
                        index
                    );


                    startAutoSlide();

                }
            );

        }
    );


    /*==================================================
    PAUSE ON DESKTOP HOVER
    ==================================================*/

    heroBanner.addEventListener(
        "mouseenter",
        function () {

            if (
                window.innerWidth > 768
            ) {

                stopAutoSlide();

            }

        }
    );


    heroBanner.addEventListener(
        "mouseleave",
        function () {

            if (
                window.innerWidth > 768
            ) {

                startAutoSlide();

            }

        }
    );


    /*==================================================
    TOUCH SWIPE
    ==================================================*/

    let touchStartX =
        0;


    let touchStartY =
        0;


    heroBanner.addEventListener(
        "touchstart",
        function (event) {

            if (
                !event.touches.length
            ) {

                return;

            }


            touchStartX =
                event.touches[0].clientX;


            touchStartY =
                event.touches[0].clientY;


            stopAutoSlide();

        },
        {
            passive: true
        }
    );


    heroBanner.addEventListener(
        "touchend",
        function (event) {

            if (
                !event.changedTouches.length
            ) {

                return;

            }


            const touchEndX =
                event.changedTouches[0].clientX;


            const touchEndY =
                event.changedTouches[0].clientY;


            const distanceX =
                touchEndX -
                touchStartX;


            const distanceY =
                touchEndY -
                touchStartY;


            if (
                Math.abs(distanceX) > 50 &&
                Math.abs(distanceX) >
                Math.abs(distanceY)
            ) {

                if (
                    distanceX < 0
                ) {

                    nextSlide();

                } else {

                    previousSlide();

                }

            }


            startAutoSlide();

        },
        {
            passive: true
        }
    );


    /*==================================================
    MOUSE DRAG
    ==================================================*/

    let mouseStartX =
        0;


    let mouseEndX =
        0;


    let isDragging =
        false;


    heroBanner.addEventListener(
        "mousedown",
        function (event) {

            if (
                event.button !== 0
            ) {

                return;

            }


            isDragging =
                true;


            mouseStartX =
                event.clientX;


            mouseEndX =
                event.clientX;


            heroBanner.classList.add(
                "is-dragging"
            );


            stopAutoSlide();

        }
    );


    heroBanner.addEventListener(
        "mousemove",
        function (event) {

            if (
                !isDragging
            ) {

                return;

            }


            mouseEndX =
                event.clientX;

        }
    );


    function finishMouseDrag() {

        if (
            !isDragging
        ) {

            return;

        }


        isDragging =
            false;


        heroBanner.classList.remove(
            "is-dragging"
        );


        const distance =
            mouseEndX -
            mouseStartX;


        if (
            Math.abs(distance) >= 50
        ) {

            if (
                distance < 0
            ) {

                nextSlide();

            } else {

                previousSlide();

            }

        }


        startAutoSlide();

    }


    heroBanner.addEventListener(
        "mouseup",
        finishMouseDrag
    );


    heroBanner.addEventListener(
        "mouseleave",
        finishMouseDrag
    );


    /*==================================================
    KEYBOARD
    ==================================================*/

    if (
        !heroBanner.dataset.keyboardBound
    ) {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "ArrowRight"
                ) {

                    nextSlide();

                    startAutoSlide();

                }


                if (
                    event.key === "ArrowLeft"
                ) {

                    previousSlide();

                    startAutoSlide();

                }

            }
        );


        heroBanner.dataset.keyboardBound =
            "true";

    }


    /*==================================================
    INITIAL SLIDE
    ==================================================*/

    showSlide(
        0
    );


    startAutoSlide();


    console.log(
        "✓ SmartBazaar Pro 2 Home Banner Slider Initialized:",
        slides.length,
        "banner(s)"
    );

}


/*==================================================
FEATURE: START HOME BANNER SYSTEM
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "✓ SmartBazaar Pro 2 Home Banners Starting..."
        );


        /*==================================================
        ADMIN PLUS BUTTON
        ==================================================*/

        initializeAdminBannerAccess();


        /*==================================================
        LOAD FIREBASE BANNERS
        ==================================================*/

        loadHomeBanners();

    }
);


