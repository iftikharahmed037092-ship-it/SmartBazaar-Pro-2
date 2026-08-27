/*==================================================
SMARTBAZAAR PRO
FINAL HEADER JAVASCRIPT
FEATURE: HEADER / CATEGORY / MENU SYSTEM
==================================================*/

document.addEventListener("DOMContentLoaded", function () {


    /*==================================================
    FEATURE: ELEMENTS
    ==================================================*/

    const desktopMenuButton =
        document.getElementById("desktopMenuButton");

    const allCategoriesButton =
        document.getElementById("allCategoriesButton");

    const megaMenu =
        document.getElementById("megaMenu");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const closeMobileMenu =
        document.getElementById("closeMobileMenu");

    const mobileMenuDrawer =
        document.getElementById("mobileMenuDrawer");

    const mobileMenuOverlay =
        document.getElementById("mobileMenuOverlay");

    const bottomCategoriesButton =
        document.getElementById("bottomCategoriesButton");


    /*==================================================
    FEATURE: DESKTOP MEGA MENU
    ==================================================*/

    function openMegaMenu() {

        if (!megaMenu) return;

        megaMenu.classList.add("mega-menu-open");

        if (allCategoriesButton) {
            allCategoriesButton.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    function closeMegaMenu() {

        if (!megaMenu) return;

        megaMenu.classList.remove("mega-menu-open");

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

        document.body.style.overflow = "hidden";
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

        document.body.style.overflow = "";
    }


    /*==================================================
    FEATURE: MOBILE MENU BUTTON
    ==================================================*/

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


    /*==================================================
    FEATURE: CLOSE MOBILE MENU
    ==================================================*/

    if (closeMobileMenu) {

        closeMobileMenu.addEventListener(
            "click",
            function () {

                closeMobileDrawer();

            }
        );

    }


    /*==================================================
    FEATURE: OVERLAY CLOSE
    ==================================================*/

    if (mobileMenuOverlay) {

        mobileMenuOverlay.addEventListener(
            "click",
            function () {

                closeMobileDrawer();

            }
        );

    }


    /*==================================================
    FEATURE: BOTTOM CATEGORIES
    ==================================================*/

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
    FEATURE: MOBILE "ALL"
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
    FEATURE: HORIZONTAL CATEGORY SCROLL
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

            if (event.key === "Escape") {

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
    FEATURE: CLOSE DROPDOWNS OUTSIDE
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


    /*==================================================
    FEATURE: HEADER READY
    ==================================================*/

    console.log(
        "✓ SmartBazaar Pro Final Header Loaded"
    );

});

/*==================================================
SMARTBAZAAR PRO
FEATURE: HERO BANNER / SLIDER SYSTEM
==================================================*/


document.addEventListener("DOMContentLoaded", function () {


    /*==================================================
    FEATURE: HERO SLIDER ELEMENTS
    ==================================================*/

    const heroSlider =
        document.getElementById("heroSlider");

    const slides =
        document.querySelectorAll(".hero-slide");

    const prevButton =
        document.getElementById("heroPrev");

    const nextButton =
        document.getElementById("heroNext");

    const dots =
        document.querySelectorAll(".hero-dot");


    /*==================================================
    FEATURE: SAFETY CHECK
    ==================================================*/

    if (
        !heroSlider ||
        slides.length === 0
    ) {
        return;
    }


    /*==================================================
    FEATURE: SLIDER VARIABLES
    ==================================================*/

    let currentSlide = 0;

    let autoSlideTimer = null;

    let touchStartX = 0;

    let touchEndX = 0;

    let mouseStartX = 0;

    let mouseEndX = 0;

    let isDragging = false;


    /*==================================================
    FEATURE: SHOW SLIDE
    ==================================================*/

    function showSlide(index) {

        if (index >= slides.length) {
            index = 0;
        }

        if (index < 0) {
            index = slides.length - 1;
        }


        slides.forEach(function (slide, i) {

            slide.classList.remove(
                "active",
                "previous"
            );

            if (i < index) {

                slide.classList.add(
                    "previous"
                );

            }

        });


        slides[index].classList.add(
            "active"
        );


        dots.forEach(function (dot, i) {

            dot.classList.toggle(
                "active",
                i === index
            );

        });


        currentSlide = index;
    }


    /*==================================================
    FEATURE: NEXT SLIDE
    ==================================================*/

    function nextSlide() {

        showSlide(
            currentSlide + 1
        );

    }


    /*==================================================
    FEATURE: PREVIOUS SLIDE
    ==================================================*/

    function previousSlide() {

        showSlide(
            currentSlide - 1
        );

    }


    /*==================================================
    FEATURE: ARROW BUTTONS
    ==================================================*/

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                nextSlide();

                restartAutoSlide();

            }
        );

    }


    if (prevButton) {

        prevButton.addEventListener(
            "click",
            function () {

                previousSlide();

                restartAutoSlide();

            }
        );

    }


    /*==================================================
    FEATURE: DOT NAVIGATION
    ==================================================*/

    dots.forEach(function (dot) {

        dot.addEventListener(
            "click",
            function () {

                const slideIndex =
                    Number(
                        dot.dataset.slide
                    );

                showSlide(slideIndex);

                restartAutoSlide();

            }
        );

    });


    /*==================================================
    FEATURE: AUTO SLIDER
    ہر 5 سیکنڈ بعد Banner تبدیل ہوگا
    ==================================================*/

    function startAutoSlide() {

        stopAutoSlide();


        autoSlideTimer =
            setInterval(
                function () {

                    nextSlide();

                },
                5000
            );

    }


    function stopAutoSlide() {

        if (autoSlideTimer) {

            clearInterval(
                autoSlideTimer
            );

            autoSlideTimer = null;

        }

    }


    function restartAutoSlide() {

        stopAutoSlide();

        startAutoSlide();

    }


    /*==================================================
    FEATURE: MOUSE HOVER
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
    FEATURE: TOUCH SWIPE
    موبائل پر انگلی سے Slide
    ==================================================*/

    heroSlider.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

        },
        {
            passive: true
        }
    );


    heroSlider.addEventListener(
        "touchend",
        function (event) {

            touchEndX =
                event.changedTouches[0].clientX;

            handleSwipe();

        },
        {
            passive: true
        }
    );


    function handleSwipe() {

        const swipeDistance =
            touchEndX - touchStartX;


        if (
            Math.abs(swipeDistance) < 50
        ) {
            return;
        }


        if (swipeDistance < 0) {

            nextSlide();

        } else {

            previousSlide();

        }


        restartAutoSlide();

    }


    /*==================================================
    FEATURE: DESKTOP MOUSE DRAG
    ==================================================*/

    heroSlider.addEventListener(
        "mousedown",
        function (event) {

            isDragging = true;

            mouseStartX =
                event.clientX;

            heroSlider.style.cursor =
                "grabbing";

        }
    );


    heroSlider.addEventListener(
        "mousemove",
        function (event) {

            if (!isDragging) {
                return;
            }

            mouseEndX =
                event.clientX;

        }
    );


    heroSlider.addEventListener(
        "mouseup",
        function () {

            if (!isDragging) {
                return;
            }

            isDragging = false;

            heroSlider.style.cursor =
                "default";


            const dragDistance =
                mouseEndX - mouseStartX;


            if (
                Math.abs(dragDistance) < 50
            ) {
                return;
            }


            if (dragDistance < 0) {

                nextSlide();

            } else {

                previousSlide();

            }


            restartAutoSlide();

        }
    );


    heroSlider.addEventListener(
        "mouseleave",
        function () {

            if (!isDragging) {
                return;
            }

            isDragging = false;

            heroSlider.style.cursor =
                "default";

        }
    );


    /*==================================================
    FEATURE: KEYBOARD CONTROL
    ==================================================*/

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "ArrowRight") {

                nextSlide();

                restartAutoSlide();

            }


            if (event.key === "ArrowLeft") {

                previousSlide();

                restartAutoSlide();

            }

        }
    );


    /*==================================================
    FEATURE: INITIALIZE SLIDER
    ==================================================*/

    showSlide(0);

    startAutoSlide();


});
