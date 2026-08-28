/*==================================================
SMARTBAZAAR PRO 2
HOME PAGE APP.JS
FEATURE: HEADER + DYNAMIC HERO BANNER SYSTEM
FIREBASE REALTIME DATABASE + CLOUDINARY IMAGES
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
ADMIN CONFIG
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: CORRECT FIREBASE BANNER PATH
IMPORTANT:
یہ path firebase-banner.js کے path کے بالکل برابر ہے۔
==================================================*/

const BANNER_DATABASE_PATH =
    "smartbazaar_pro_2/banners";


const bannersRef =
    ref(
        database,
        BANNER_DATABASE_PATH
    );


/*==================================================
FEATURE: GLOBAL HERO STATE
==================================================*/

let banners = [];

let currentSlide = 0;

let autoSlideTimer = null;

let heroInitialized = false;


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
FEATURE: ADMIN ACCESS
==================================================*/

function initializeAdminAccess() {

    const addBannerButton =
        document.getElementById(
            "adminAddBannerButton"
        );


    if (!addBannerButton) {
        return;
    }


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

            } else {

                addBannerButton.style.display =
                    "none";

            }

        }
    );

}


/*==================================================
FEATURE: HEADER / MENU SYSTEM
==================================================*/

function initializeHeader() {


    /*==================================================
    HEADER ELEMENTS
    ==================================================*/

    const desktopMenuButton =
        document.getElementById(
            "desktopMenuButton"
        );

    const allCategoriesButton =
        document.getElementById(
            "allCategoriesButton"
        );

    const megaMenu =
        document.getElementById(
            "megaMenu"
        );

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const closeMobileMenu =
        document.getElementById(
            "closeMobileMenu"
        );

    const mobileMenuDrawer =
        document.getElementById(
            "mobileMenuDrawer"
        );

    const mobileMenuOverlay =
        document.getElementById(
            "mobileMenuOverlay"
        );

    const bottomCategoriesButton =
        document.getElementById(
            "bottomCategoriesButton"
        );


    /*==================================================
    FEATURE: DESKTOP MEGA MENU
    ==================================================*/

    function openMegaMenu() {

        if (!megaMenu) {
            return;
        }


        megaMenu.classList.add(
            "mega-menu-open"
        );


        allCategoriesButton?.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function closeMegaMenu() {

        if (!megaMenu) {
            return;
        }


        megaMenu.classList.remove(
            "mega-menu-open"
        );


        allCategoriesButton?.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    function toggleMegaMenu() {

        if (!megaMenu) {
            return;
        }


        if (
            megaMenu.classList.contains(
                "mega-menu-open"
            )
        ) {

            closeMegaMenu();

        } else {

            openMegaMenu();

        }

    }


    allCategoriesButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            toggleMegaMenu();

        }
    );


    desktopMenuButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            toggleMegaMenu();

        }
    );


    /*==================================================
    FEATURE: MOBILE DRAWER
    ==================================================*/

    function openMobileDrawer() {

        mobileMenuDrawer?.classList.add(
            "mobile-drawer-open"
        );

        mobileMenuOverlay?.classList.add(
            "mobile-overlay-open"
        );

        document.body.style.overflow =
            "hidden";

    }


    function closeMobileDrawer() {

        mobileMenuDrawer?.classList.remove(
            "mobile-drawer-open"
        );

        mobileMenuOverlay?.classList.remove(
            "mobile-overlay-open"
        );

        document.body.style.overflow =
            "";

    }


    mobileMenuButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openMobileDrawer();

        }
    );


    closeMobileMenu?.addEventListener(
        "click",
        closeMobileDrawer
    );


    mobileMenuOverlay?.addEventListener(
        "click",
        closeMobileDrawer
    );


    bottomCategoriesButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openMobileDrawer();

        }
    );


    /*==================================================
    FEATURE: MOBILE CATEGORY
    ==================================================*/

    const mobileCategoryLinks =
        document.querySelectorAll(
            ".mobile-category-scroll a"
        );


    mobileCategoryLinks.forEach(
        function (link, index) {

            if (index === 0) {

                link.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        openMobileDrawer();

                    }
                );

            }

        }
    );


    /*==================================================
    FEATURE: MOBILE CATEGORY SCROLL
    ==================================================*/

    const mobileCategoryScroll =
        document.querySelector(
            ".mobile-category-scroll"
        );


    mobileCategoryScroll?.addEventListener(
        "wheel",
        function (event) {

            if (
                Math.abs(event.deltaY) >
                Math.abs(event.deltaX)
            ) {

                event.preventDefault();

                mobileCategoryScroll.scrollLeft +=
                    event.deltaY;

            }

        },
        {
            passive: false
        }
    );


    /*==================================================
    FEATURE: DESKTOP CATEGORY SCROLL
    ==================================================*/

    const navigationLinks =
        document.querySelector(
            ".navigation-links"
        );


    navigationLinks?.addEventListener(
        "wheel",
        function (event) {

            if (
                Math.abs(event.deltaY) >
                Math.abs(event.deltaX)
            ) {

                event.preventDefault();

                navigationLinks.scrollLeft +=
                    event.deltaY;

            }

        },
        {
            passive: false
        }
    );


    /*==================================================
    FEATURE: OUTSIDE CLICK
    ==================================================*/

    document.addEventListener(
        "click",
        function (event) {

            if (
                megaMenu &&
                megaMenu.classList.contains(
                    "mega-menu-open"
                )
            ) {

                const clickedMega =
                    megaMenu.contains(
                        event.target
                    );

                const clickedAll =
                    allCategoriesButton?.contains(
                        event.target
                    );

                const clickedMenu =
                    desktopMenuButton?.contains(
                        event.target
                    );


                if (
                    !clickedMega &&
                    !clickedAll &&
                    !clickedMenu
                ) {

                    closeMegaMenu();

                }

            }

        }
    );


    /*==================================================
    FEATURE: ESCAPE
    ==================================================*/

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeMegaMenu();

                closeMobileDrawer();

            }

        }
    );


    /*==================================================
    FEATURE: ACCOUNT DROPDOWN
    ==================================================*/

    const accountButton =
        document.querySelector(
            ".account-button"
        );

    const headerAccount =
        document.querySelector(
            ".header-account"
        );


    accountButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            headerAccount?.classList.toggle(
                "account-open"
            );

        }
    );


    /*==================================================
    FEATURE: CART DROPDOWN
    ==================================================*/

    const cartButton =
        document.querySelector(
            ".cart-button"
        );

    const headerCart =
        document.querySelector(
            ".header-cart"
        );


    cartButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            headerCart?.classList.toggle(
                "cart-open"
            );

        }
    );


    /*==================================================
    FEATURE: SEARCH
    ==================================================*/

    const desktopSearchForm =
        document.getElementById(
            "desktopSearchForm"
        );

    const desktopSearchInput =
        document.getElementById(
            "desktopSearchInput"
        );


    desktopSearchForm?.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const query =
                desktopSearchInput?.value.trim() ||
                "";


            if (!query) {

                desktopSearchInput?.focus();

                return;

            }


            console.log(
                "SmartBazaar Search:",
                query
            );

        }
    );


    /*==================================================
    FEATURE: MOBILE SEARCH
    ==================================================*/

    const mobileSearchForm =
        document.getElementById(
            "mobileSearchForm"
        );

    const mobileSearchInput =
        document.getElementById(
            "mobileSearchInput"
        );


    mobileSearchForm?.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const query =
                mobileSearchInput?.value.trim() ||
                "";


            if (!query) {

                mobileSearchInput?.focus();

                return;

            }


            console.log(
                "SmartBazaar Mobile Search:",
                query
            );

        }
    );


    /*==================================================
    FEATURE: CART COUNT
    ==================================================*/

    function updateCartCount() {

        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        "smartBazaarCart"
                    )
                ) || [];

        } catch (error) {

            cart = [];

        }


        let total = 0;


        if (Array.isArray(cart)) {

            cart.forEach(
                function (item) {

                    total += Number(
                        item?.quantity || 1
                    );

                }
            );

        }


        const desktopCartCount =
            document.getElementById(
                "cartCount"
            );

        const mobileCartCount =
            document.getElementById(
                "mobileCartCount"
            );


        if (desktopCartCount) {

            desktopCartCount.textContent =
                total;

        }


        if (mobileCartCount) {

            mobileCartCount.textContent =
                total;

        }

    }


    updateCartCount();


    /*==================================================
    FEATURE: CLOSE ACCOUNT + CART
    ==================================================*/

    document.addEventListener(
        "click",
        function (event) {

            if (
                headerAccount &&
                !headerAccount.contains(
                    event.target
                )
            ) {

                headerAccount.classList.remove(
                    "account-open"
                );

            }


            if (
                headerCart &&
                !headerCart.contains(
                    event.target
                )
            ) {

                headerCart.classList.remove(
                    "cart-open"
                );

            }

        }
    );


    console.log(
        "✓ SmartBazaar Pro 2 Header Loaded"
    );

}


/*==================================================
FEATURE: GET BANNER IMAGE
SUPPORTS DESKTOP + MOBILE IMAGE
==================================================*/

function getBannerImage(banner) {

    return (
        banner.imageUrl ||
        banner.desktopImageUrl ||
        banner.image ||
        ""
    );

}


function getMobileBannerImage(banner) {

    return (
        banner.mobileImageUrl ||
        banner.mobileImage ||
        getBannerImage(banner)
    );

}


/*==================================================
FEATURE: CHECK BANNER DATE
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
FEATURE: LOAD DYNAMIC BANNERS
==================================================*/

async function loadDynamicBanners() {

    const heroSlider =
        document.getElementById(
            "heroSlider"
        );


    if (!heroSlider) {

        console.warn(
            "SmartBazaar Pro 2: #heroSlider not found."
        );

        return;

    }


    console.log(
        "SmartBazaar Pro 2: Loading banners..."
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


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            console.log(
                "SmartBazaar Pro 2: Firebase banner data =",
                data
            );


            Object.entries(
                data
            ).forEach(
                function (
                    [id, banner]
                ) {

                    if (!banner) {
                        return;
                    }


                    /*==========================================
                    ACTIVE CONTROL
                    ==========================================*/

                    if (
                        banner.active === false
                    ) {

                        return;

                    }


                    /*
                    اگر active true ہے تو شامل ہوگا۔
                    اگر active field موجود نہیں تو بھی banner
                    کو reject نہیں کیا جائے گا۔
                    */


                    /*==========================================
                    IMAGE CONTROL
                    ==========================================*/

                    const imageUrl =
                        getBannerImage(
                            banner
                        );


                    if (!imageUrl) {

                        console.warn(
                            "Banner skipped because imageUrl is missing:",
                            id
                        );

                        return;

                    }


                    /*==========================================
                    DATE CONTROL
                    ==========================================*/

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
        SORT
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
            "SmartBazaar Pro 2: Final banners =",
            banners
        );


        renderBanners();


    } catch (error) {

        console.error(
            "SmartBazaar Pro 2: Firebase Banner Error:",
            error
        );


        showBannerError(
            error
        );

    }

}


/*==================================================
FEATURE: RENDER BANNERS
==================================================*/

function renderBanners() {

    const heroSlider =
        document.getElementById(
            "heroSlider"
        );


    if (!heroSlider) {
        return;
    }


    stopAutoSlide();


    /*==================================================
    NO BANNERS
    ==================================================*/

    if (
        !banners.length
    ) {

        heroSlider.innerHTML = `

            <div
                class="hero-slide active"
                id="bannerEmptySlide">

                <div
                    class="banner-image-placeholder">

                    <span>
                        No Banners Available
                    </span>

                </div>

            </div>

            <button
                type="button"
                class="hero-slider-arrow hero-prev"
                id="heroPrev"
                aria-label="Previous Banner">

                <i class="fa-solid fa-chevron-left"></i>

            </button>

            <button
                type="button"
                class="hero-slider-arrow hero-next"
                id="heroNext"
                aria-label="Next Banner">

                <i class="fa-solid fa-chevron-right"></i>

            </button>

            <div
                class="hero-slider-dots"
                id="heroSliderDots">
            </div>

        `;


        currentSlide = 0;

        return;

    }


    /*==================================================
    CREATE SLIDES
    ==================================================*/

    const slidesHTML =
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


                return `

                    <div
                        class="hero-slide ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-slide-index="${index}">

                        <a
                            class="hero-banner-link"
                            href="${buttonLink}"
                            ${
                                buttonLink === "#"
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
                                    class="hero-banner-image"
                                    src="${imageUrl}"
                                    alt="${
                                        title ||
                                        "SmartBazaar Pro Banner"
                                    }"
                                    loading="${
                                        index === 0
                                            ? "eager"
                                            : "lazy"
                                    }"
                                    draggable="false"
                                >

                            </picture>


                            ${
                                title ||
                                subtitle ||
                                description ||
                                buttonText
                                    ? `

                                        <div
                                            class="hero-banner-overlay">

                                            ${
                                                title
                                                    ? `
                                                        <h2>
                                                            ${title}
                                                        </h2>
                                                      `
                                                    : ""
                                            }

                                            ${
                                                subtitle
                                                    ? `
                                                        <h3>
                                                            ${subtitle}
                                                        </h3>
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
                                                            class="hero-banner-button">

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

                    </div>

                `;

            }
        ).join("");


    /*==================================================
    DOTS
    ==================================================*/

    const dotsHTML =
        banners.map(
            function (
                banner,
                index
            ) {

                return `

                    <button
                        type="button"
                        class="hero-dot ${
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


    /*==================================================
    BUILD HERO
    ==================================================*/

    heroSlider.innerHTML = `

        ${slidesHTML}


        <button
            type="button"
            class="hero-slider-arrow hero-prev"
            id="heroPrev"
            aria-label="Previous Banner">

            <i class="fa-solid fa-chevron-left"></i>

        </button>


        <button
            type="button"
            class="hero-slider-arrow hero-next"
            id="heroNext"
            aria-label="Next Banner">

            <i class="fa-solid fa-chevron-right"></i>

        </button>


        <div
            class="hero-slider-dots"
            id="heroSliderDots">

            ${dotsHTML}

        </div>

    `;


    initializeHeroSlider();

}


/*==================================================
FEATURE: ERROR DISPLAY
==================================================*/

function showBannerError(error) {

    const heroSlider =
        document.getElementById(
            "heroSlider"
        );


    if (!heroSlider) {
        return;
    }


    console.error(
        "SmartBazaar Pro 2 Banner Error:",
        error
    );


    heroSlider.innerHTML = `

        <div
            class="hero-slide active">

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
FEATURE: INITIALIZE HERO SLIDER
==================================================*/

function initializeHeroSlider() {

    const heroSlider =
        document.getElementById(
            "heroSlider"
        );


    if (!heroSlider) {
        return;
    }


    const slides =
        heroSlider.querySelectorAll(
            ".hero-slide"
        );

    const dots =
        heroSlider.querySelectorAll(
            ".hero-dot"
        );

    const prevButton =
        document.getElementById(
            "heroPrev"
        );

    const nextButton =
        document.getElementById(
            "heroNext"
        );


    if (
        !slides.length
    ) {

        return;

    }


    currentSlide = 0;

    heroInitialized = true;


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

                slide.classList.toggle(
                    "previous",
                    slideIndex < index
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
    FEATURE: BUTTONS
    ==================================================*/

    nextButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            nextSlide();

            startAutoSlide();

        }
    );


    prevButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            previousSlide();

            startAutoSlide();

        }
    );


    /*==================================================
    FEATURE: DOTS
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
    FEATURE: PAUSE ON DESKTOP HOVER
    ==================================================*/

    heroSlider.addEventListener(
        "mouseenter",
        function () {

            if (
                window.innerWidth > 768
            ) {

                stopAutoSlide();

            }

        }
    );


    heroSlider.addEventListener(
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


    heroSlider.addEventListener(
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


    heroSlider.addEventListener(
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
                Math.abs(distanceX) >
                50 &&
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
    FEATURE: MOUSE DRAG
    ==================================================*/

    let mouseStartX = 0;

    let mouseEndX = 0;

    let isDragging = false;


    heroSlider.addEventListener(
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


            heroSlider.classList.add(
                "is-dragging"
            );


            stopAutoSlide();

        }
    );


    heroSlider.addEventListener(
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


        heroSlider.classList.remove(
            "is-dragging"
        );


        const distance =
            mouseEndX -
            mouseStartX;


        if (
            Math.abs(distance) >=
            50
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


    heroSlider.addEventListener(
        "mouseup",
        finishMouseDrag
    );


    heroSlider.addEventListener(
        "mouseleave",
        finishMouseDrag
    );


    /*==================================================
    FEATURE: KEYBOARD
    ==================================================*/

    if (
        !heroSlider.dataset.keyboardBound
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


        heroSlider.dataset.keyboardBound =
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
        "✓ SmartBazaar Pro 2 Hero Slider Initialized:",
        slides.length,
        "banner(s)"
    );

}


/*==================================================
FEATURE: INITIALIZE APP
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "✓ SmartBazaar Pro 2 App Starting..."
        );


        initializeHeader();

        initializeAdminAccess();

        loadDynamicBanners();

    }
);
