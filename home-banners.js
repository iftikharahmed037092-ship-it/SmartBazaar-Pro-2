/*==================================================
SMARTBAZAAR PRO 2
HOME BANNERS JAVASCRIPT
FEATURE: DYNAMIC HERO BANNER SYSTEM
FIREBASE REALTIME DATABASE
==================================================*/


/*==================================================
FIREBASE IMPORTS
==================================================*/

import {
    database
} from "./firebase-config.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: FIREBASE BANNER PATH
==================================================*/

const BANNER_DATABASE_PATH =
    "smartbazaar_pro_2/banners";


const bannersRef =
    ref(
        database,
        BANNER_DATABASE_PATH
    );


/*==================================================
FEATURE: BANNER STATE
==================================================*/

let banners = [];

let currentSlide = 0;

let autoSlideTimer = null;


/*==================================================
FEATURE: DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHomeBanners();

    }
);


/*==================================================
FEATURE: GET BANNER IMAGE
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
FEATURE: ESCAPE HTML
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
FEATURE: LOAD HOME BANNERS
==================================================*/

async function loadHomeBanners() {

    const slidesContainer =
        document.querySelector(
            ".hero-banner .slides"
        );


    const dotsContainer =
        document.querySelector(
            ".hero-banner .slider-dots"
        );


    if (!slidesContainer) {

        console.error(
            "SmartBazaar Pro 2: .slides container not found."
        );

        return;

    }


    try {

        console.log(
            "SmartBazaar Pro 2: Loading home banners..."
        );


        const snapshot =
            await get(
                bannersRef
            );


        banners = [];


        /*==================================================
        FEATURE: FIREBASE DATA
        ==================================================*/

        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            Object.entries(
                data
            ).forEach(
                function (
                    [id, banner]
                ) {

                    if (!banner) {
                        return;
                    }


                    /* ACTIVE */

                    if (
                        banner.active === false
                    ) {

                        return;

                    }


                    /* IMAGE */

                    const imageUrl =
                        getBannerImage(
                            banner
                        );


                    if (!imageUrl) {

                        console.warn(
                            "Banner skipped. Image missing:",
                            id
                        );

                        return;

                    }


                    /* DATE */

                    if (
                        !isBannerWithinSchedule(
                            banner
                        )
                    ) {

                        return;

                    }


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

                        badge:
                            banner.badge ||
                            banner.tag ||
                            "SPECIAL OFFER",

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
        FEATURE: SORT BANNERS
        ==================================================*/

        banners.sort(
            function (a, b) {

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
            "SmartBazaar Pro 2: Loaded banners:",
            banners
        );


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
FEATURE: RENDER HOME BANNERS
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


    const bannerContent =
        document.querySelector(
            ".hero-banner .banner-content"
        );


    if (!slidesContainer) {
        return;
    }


    stopAutoSlide();


    /*==================================================
    FEATURE: NO BANNERS
    ==================================================*/

    if (
        !banners.length
    ) {

        slidesContainer.innerHTML = `

            <div class="slide active">

                <div class="banner-image-placeholder">

                    <span>
                        No Banners Available
                    </span>

                </div>

            </div>

        `;


        if (dotsContainer) {

            dotsContainer.innerHTML = "";

        }


        updateBannerContent(null);

        return;

    }


    /*==================================================
    FEATURE: CREATE SLIDES
    ==================================================*/

    slidesContainer.innerHTML =
        banners.map(
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


                const safeLink =
                    escapeHTML(
                        safeURL(
                            banner.buttonLink
                        )
                    );


                return `

                    <div
                        class="slide ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-index="${index}">

                        <a
                            href="${safeLink}"
                            class="banner-slide-link"
                            ${
                                safeLink === "#"
                                    ? 'onclick="return false;"'
                                    : ""
                            }
                        >

                            <picture>

                                <source
                                    media="(max-width: 768px)"
                                    srcset="${mobileImageUrl}"
                                >

                                <img
                                    src="${imageUrl}"
                                    alt="${escapeHTML(
                                        banner.title ||
                                        "SmartBazaar Pro Banner"
                                    )}"
                                    draggable="false"
                                    loading="${
                                        index === 0
                                            ? "eager"
                                            : "lazy"
                                    }"
                                >

                            </picture>

                        </a>

                    </div>

                `;

            }
        ).join("");


    /*==================================================
    FEATURE: CREATE DOTS
    ==================================================*/

    if (dotsContainer) {

        dotsContainer.innerHTML =
            banners.map(
                function (
                    banner,
                    index
                ) {

                    return `

                        <button
                            type="button"
                            class="slider-dot ${
                                index === 0
                                    ? "active"
                                    : ""
                            }"
                            data-slide="${index}"
                            aria-label="Banner ${
                                index + 1
                            }">
                        </button>

                    `;

                }
            ).join("");

    }


    /*==================================================
    FEATURE: INITIAL CONTENT
    ==================================================*/

    updateBannerContent(
        banners[0]
    );


    /*==================================================
    FEATURE: INITIALIZE SLIDER
    ==================================================*/

    initializeSlider();

}


/*==================================================
FEATURE: UPDATE BANNER CONTENT
==================================================*/

function updateBannerContent(banner) {

    if (!banner) {
        return;
    }


    const badge =
        document.getElementById(
            "homeBannerBadge"
        );


    const title =
        document.getElementById(
            "homeBannerTitle"
        );


    const description =
        document.getElementById(
            "homeBannerDescription"
        );


    const button =
        document.getElementById(
            "homeBannerButton"
        );


    if (badge) {

        badge.textContent =
            banner.badge ||
            "SPECIAL OFFER";

    }


    if (title) {

        title.textContent =
            banner.title || "";

    }


    if (description) {

        description.textContent =
            banner.description || "";

    }


    if (button) {

        button.textContent =
            banner.buttonText ||
            "Shop Now";


        const link =
            safeURL(
                banner.buttonLink
            );


        button.href =
            link;


        if (link === "#") {

            button.onclick =
                function () {

                    return false;

                };

        } else {

            button.onclick = null;

        }

    }

}


/*==================================================
FEATURE: INITIALIZE SLIDER
==================================================*/

function initializeSlider() {

    const slides =
        document.querySelectorAll(
            ".hero-banner .slide"
        );


    const dots =
        document.querySelectorAll(
            ".hero-banner .slider-dot"
        );


    if (
        !slides.length
    ) {

        return;

    }


    currentSlide = 0;


    /*==================================================
    FEATURE: SHOW SLIDE
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

            index = 0;

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


        updateBannerContent(
            banners[index]
        );

    }


    /*==================================================
    FEATURE: NEXT
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
    FEATURE: PREVIOUS
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
    FEATURE: AUTO SLIDE
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
    FEATURE: DOT CLICK
    ==================================================*/

    dots.forEach(
        function (dot) {

            dot.addEventListener(
                "click",
                function () {

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
    FEATURE: DESKTOP PAUSE
    ==================================================*/

    const heroBanner =
        document.querySelector(
            ".hero-banner"
        );


    heroBanner?.addEventListener(
        "mouseenter",
        function () {

            if (
                window.innerWidth > 768
            ) {

                stopAutoSlide();

            }

        }
    );


    heroBanner?.addEventListener(
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
    FEATURE: TOUCH SWIPE
    ==================================================*/

    let touchStartX = 0;

    let touchStartY = 0;


    heroBanner?.addEventListener(
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


    heroBanner?.addEventListener(
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
    FEATURE: START
    ==================================================*/

    showSlide(0);

    startAutoSlide();


    console.log(
        "✓ SmartBazaar Pro 2 Home Banner Slider Ready:",
        slides.length,
        "banner(s)"
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
FEATURE: ERROR
==================================================*/

function showBannerError() {

    const slidesContainer =
        document.querySelector(
            ".hero-banner .slides"
        );


    if (!slidesContainer) {
        return;
    }


    slidesContainer.innerHTML = `

        <div class="slide active">

            <div class="banner-image-placeholder">

                <span>
                    Unable to load banners.
                </span>

            </div>

        </div>

    `;

}
