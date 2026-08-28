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
DATABASE
==================================================*/

const bannersRef =
    ref(database, "banners");


/*==================================================
FEATURE: HEADER / MENU SYSTEM
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {


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

            if (!megaMenu) return;

            megaMenu.classList.add(
                "mega-menu-open"
            );

            if (allCategoriesButton) {

                allCategoriesButton.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        }


        function closeMegaMenu() {

            if (!megaMenu) return;

            megaMenu.classList.remove(
                "mega-menu-open"
            );

            if (allCategoriesButton) {

                allCategoriesButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }


        function toggleMegaMenu() {

            if (!megaMenu) return;

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


        if (allCategoriesButton) {

            allCategoriesButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleMegaMenu();

                }
            );

        }


        if (desktopMenuButton) {

            desktopMenuButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleMegaMenu();

                }
            );

        }


        /*==================================================
        FEATURE: MOBILE DRAWER
        ==================================================*/

        function openMobileDrawer() {

            if (mobileMenuDrawer) {

                mobileMenuDrawer.classList.add(
                    "mobile-drawer-open"
                );

            }

            if (mobileMenuOverlay) {

                mobileMenuOverlay.classList.add(
                    "mobile-overlay-open"
                );

            }

            document.body.style.overflow =
                "hidden";

        }


        function closeMobileDrawer() {

            if (mobileMenuDrawer) {

                mobileMenuDrawer.classList.remove(
                    "mobile-drawer-open"
                );

            }

            if (mobileMenuOverlay) {

                mobileMenuOverlay.classList.remove(
                    "mobile-overlay-open"
                );

            }

            document.body.style.overflow =
                "";

        }


        if (mobileMenuButton) {

            mobileMenuButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    openMobileDrawer();

                }
            );

        }


        if (closeMobileMenu) {

            closeMobileMenu.addEventListener(
                "click",
                function () {

                    closeMobileDrawer();

                }
            );

        }


        if (mobileMenuOverlay) {

            mobileMenuOverlay.addEventListener(
                "click",
                function () {

                    closeMobileDrawer();

                }
            );

        }


        if (bottomCategoriesButton) {

            bottomCategoriesButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openMobileDrawer();

                }
            );

        }


        /*==================================================
        FEATURE: MOBILE ALL CATEGORY
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


        if (mobileCategoryScroll) {

            mobileCategoryScroll.addEventListener(
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

        }


        /*==================================================
        FEATURE: DESKTOP CATEGORY SCROLL
        ==================================================*/

        const navigationLinks =
            document.querySelector(
                ".navigation-links"
            );


        if (navigationLinks) {

            navigationLinks.addEventListener(
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

        }


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
                        allCategoriesButton &&
                        allCategoriesButton.contains(
                            event.target
                        );

                    const clickedMenu =
                        desktopMenuButton &&
                        desktopMenuButton.contains(
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
        FEATURE: ESCAPE KEY
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


        if (
            accountButton &&
            headerAccount
        ) {

            accountButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    headerAccount.classList.toggle(
                        "account-open"
                    );

                }
            );

        }


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


        if (
            cartButton &&
            headerCart
        ) {

            cartButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    headerCart.classList.toggle(
                        "cart-open"
                    );

                }
            );

        }


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


        if (desktopSearchForm) {

            desktopSearchForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    const query =
                        desktopSearchInput
                            ? desktopSearchInput.value.trim()
                            : "";


                    if (!query) {

                        if (desktopSearchInput) {

                            desktopSearchInput.focus();

                        }

                        return;

                    }


                    console.log(
                        "SmartBazaar Search:",
                        query
                    );

                }
            );

        }


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


        if (mobileSearchForm) {

            mobileSearchForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    const query =
                        mobileSearchInput
                            ? mobileSearchInput.value.trim()
                            : "";


                    if (!query) {

                        if (mobileSearchInput) {

                            mobileSearchInput.focus();

                        }

                        return;

                    }


                    console.log(
                        "SmartBazaar Mobile Search:",
                        query
                    );

                }
            );

        }


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
                            item.quantity || 1
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
        FEATURE: CLOSE ACCOUNT/CART OUTSIDE
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
            "✓ SmartBazaar Pro Header Loaded"
        );

    }
);


/*==================================================
SMARTBAZAAR PRO 2
FEATURE: DYNAMIC HERO BANNER SYSTEM
FIREBASE REALTIME DATABASE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*==================================================
        HERO ELEMENTS
        ==================================================*/

        const heroSection =
            document.getElementById(
                "heroBannerSection"
            );

        const heroSlider =
            document.getElementById(
                "heroSlider"
            );

        const addBannerButton =
            document.getElementById(
                "adminAddBannerButton"
            );


        /*==================================================
        SAFETY CHECK
        ==================================================*/

        if (!heroSlider) {

            console.warn(
                "Hero slider element not found."
            );

            return;

        }


        /*==================================================
        SLIDER STATE
        ==================================================*/

        let banners = [];

        let currentSlide = 0;

        let autoSlideTimer = null;

        let touchStartX = 0;

        let touchEndX = 0;

        let mouseStartX = 0;

        let mouseEndX = 0;

        let isDragging = false;


        /*==================================================
        FEATURE: LOAD BANNERS FROM FIREBASE
        ==================================================*/

        async function loadDynamicBanners() {

            try {

                console.log(
                    "Loading banners from Firebase..."
                );


                const snapshot =
                    await get(
                        bannersRef
                    );


                banners = [];


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

                            if (
                                banner &&
                                banner.active === true &&
                                banner.imageUrl
                            ) {

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
                                        banner.buttonLink || "#",

                                    imageUrl:
                                        banner.imageUrl,

                                    order:
                                        Number(
                                            banner.order || 0
                                        )

                                });

                            }

                        }
                    );

                }


                /*==================================================
                SORT BY ORDER
                ==================================================*/

                banners.sort(
                    function (a, b) {

                        return (
                            a.order -
                            b.order
                        );

                    }
                );


                console.log(
                    "Active banners loaded:",
                    banners.length
                );


                /*==================================================
                RENDER
                ==================================================*/

                renderBanners();


            } catch (error) {

                console.error(
                    "Firebase Banner Load Error:",
                    error
                );


                showBannerError();

            }

        }


        /*==================================================
        FEATURE: ESCAPE HTML
        ==================================================*/

        function escapeHTML(value) {

            return String(value)
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
        FEATURE: SAFE LINK
        ==================================================*/

        function safeLink(value) {

            const link =
                String(
                    value || "#"
                ).trim();


            if (
                link.toLowerCase()
                    .startsWith(
                        "javascript:"
                    )
            ) {

                return "#";

            }


            return escapeHTML(
                link
            );

        }


        /*==================================================
        FEATURE: RENDER BANNERS
        ==================================================*/

        function renderBanners() {

            if (!banners.length) {

                heroSlider.innerHTML = `

                    <div class="hero-slide active">

                        <div class="banner-image-placeholder">

                            <span>
                                No active banners available.
                            </span>

                        </div>

                    </div>

                `;

                return;

            }


            /*==================================================
            CREATE SLIDES
            ==================================================*/

            const slidesHTML =
                banners.map(
                    function (banner, index) {

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

                        const imageUrl =
                            escapeHTML(
                                banner.imageUrl
                            );

                        const link =
                            safeLink(
                                banner.buttonLink
                            );


                        return `

                            <div
                                class="hero-slide ${
                                    index === 0
                                        ? "active"
                                        : ""
                                }"
                                data-slide-index="${index}">

                                <img
                                    class="hero-banner-image"
                                    src="${imageUrl}"
                                    alt="${title || "SmartBazaar Banner"}"
                                    loading="${
                                        index === 0
                                            ? "eager"
                                            : "lazy"
                                    }">

                                <div class="hero-banner-overlay">

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
                                                <a
                                                    href="${link}"
                                                    class="hero-banner-button">

                                                    ${buttonText}

                                                </a>
                                              `
                                            : ""
                                    }

                                </div>

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
                                aria-label="Go to banner ${
                                    index + 1
                                }">

                            </button>

                        `;

                    }
                ).join("");


            /*==================================================
            REBUILD SLIDER
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


            /*==================================================
            INITIALIZE SLIDER
            ==================================================*/

            initializeSlider();

        }


        /*==================================================
        FEATURE: ERROR STATE
        ==================================================*/

        function showBannerError() {

            heroSlider.innerHTML = `

                <div class="hero-slide active">

                    <div class="banner-image-placeholder">

                        <span>
                            Unable to load banners.
                        </span>

                    </div>

                </div>

            `;

        }


        /*==================================================
        FEATURE: INITIALIZE SLIDER
        ==================================================*/

        function initializeSlider() {

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
                slides.length === 0
            ) {

                return;

            }


            currentSlide = 0;


            /*==================================================
            SHOW SLIDE
            ==================================================*/

            function showSlide(index) {

                if (
                    index >=
                    slides.length
                ) {

                    index = 0;

                }


                if (index < 0) {

                    index =
                        slides.length - 1;

                }


                slides.forEach(
                    function (
                        slide,
                        i
                    ) {

                        slide.classList.remove(
                            "active",
                            "previous"
                        );


                        if (
                            i < index
                        ) {

                            slide.classList.add(
                                "previous"
                            );

                        }

                    }
                );


                slides[index].classList.add(
                    "active"
                );


                dots.forEach(
                    function (
                        dot,
                        i
                    ) {

                        dot.classList.toggle(
                            "active",
                            i === index
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
            AUTO SLIDER
            ==================================================*/

            function stopAutoSlide() {

                if (
                    autoSlideTimer
                ) {

                    clearInterval(
                        autoSlideTimer
                    );

                    autoSlideTimer =
                        null;

                }

            }


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
                        5000
                    );

            }


            function restartAutoSlide() {

                stopAutoSlide();

                startAutoSlide();

            }


            /*==================================================
            NEXT BUTTON
            ==================================================*/

            if (nextButton) {

                nextButton.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        nextSlide();

                        restartAutoSlide();

                    }
                );

            }


            /*==================================================
            PREVIOUS BUTTON
            ==================================================*/

            if (prevButton) {

                prevButton.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        previousSlide();

                        restartAutoSlide();

                    }
                );

            }


            /*==================================================
            DOTS
            ==================================================*/

            dots.forEach(
                function (
                    dot
                ) {

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

                            restartAutoSlide();

                        }
                    );

                }
            );


            /*==================================================
            MOUSE HOVER
            ==================================================*/

            heroSlider.addEventListener(
                "mouseenter",
                function () {

                    stopAutoSlide();

                }
            );


            heroSlider.addEventListener(
                "mouseleave",
                function () {

                    startAutoSlide();

                }
            );


            /*==================================================
            TOUCH START
            ==================================================*/

            heroSlider.addEventListener(
                "touchstart",
                function (event) {

                    if (
                        !event.touches.length
                    ) {

                        return;

                    }


                    touchStartX =
                        event.touches[0]
                            .clientX;

                },
                {
                    passive: true
                }
            );


            /*==================================================
            TOUCH END
            ==================================================*/

            heroSlider.addEventListener(
                "touchend",
                function (event) {

                    if (
                        !event.changedTouches.length
                    ) {

                        return;

                    }


                    touchEndX =
                        event.changedTouches[0]
                            .clientX;


                    const distance =
                        touchEndX -
                        touchStartX;


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


                        restartAutoSlide();

                    }

                },
                {
                    passive: true
                }
            );


            /*==================================================
            MOUSE DRAG START
            ==================================================*/

            heroSlider.addEventListener(
                "mousedown",
                function (event) {

                    isDragging =
                        true;

                    mouseStartX =
                        event.clientX;

                    mouseEndX =
                        event.clientX;

                    heroSlider.style.cursor =
                        "grabbing";

                    stopAutoSlide();

                }
            );


            /*==================================================
            MOUSE DRAG MOVE
            ==================================================*/

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


            /*==================================================
            MOUSE DRAG END
            ==================================================*/

            heroSlider.addEventListener(
                "mouseup",
                function () {

                    if (
                        !isDragging
                    ) {

                        return;

                    }


                    isDragging =
                        false;

                    heroSlider.style.cursor =
                        "default";


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


                    restartAutoSlide();

                }
            );


            /*==================================================
            MOUSE DRAG CANCEL
            ==================================================*/

            heroSlider.addEventListener(
                "mouseleave",
                function () {

                    if (
                        isDragging
                    ) {

                        isDragging =
                            false;

                        heroSlider.style.cursor =
                            "default";

                        startAutoSlide();

                    }

                }
            );


            /*==================================================
            KEYBOARD CONTROL
            ==================================================*/

            document.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "ArrowRight"
                    ) {

                        nextSlide();

                        restartAutoSlide();

                    }


                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {

                        previousSlide();

                        restartAutoSlide();

                    }

                }
            );


            /*==================================================
            INITIAL SLIDE
            ==================================================*/

            showSlide(0);

            startAutoSlide();

        }


        /*==================================================
        FEATURE: ADMIN ADD BANNER BUTTON
        ==================================================*/

        onAuthStateChanged(
            auth,
            function (user) {

                if (
                    !addBannerButton
                ) {

                    return;

                }


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


        /*==================================================
        LOAD FIREBASE BANNERS
        ==================================================*/

        loadDynamicBanners();

    }
);
