/*==================================================
SMARTBAZAAR PRO 2
HOME PAGE APP.JS
FEATURE: HEADER + MAIN HOME APPLICATION
==================================================*/


/*==================================================
FIREBASE IMPORTS
==================================================*/

import {
    auth
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
ADMIN CONFIG
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: ADMIN ACCESS
NOTE:
Home Banner system is handled separately by
home-banners.js.
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

            const isAdmin =
                user &&
                user.email &&
                user.email.toLowerCase() ===
                ADMIN_EMAIL.toLowerCase();


            if (isAdmin) {

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


    /*==================================================
    FEATURE: ALL CATEGORIES BUTTON
    ==================================================*/

    allCategoriesButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            toggleMegaMenu();

        }
    );


    /*==================================================
    FEATURE: DESKTOP MENU BUTTON
    ==================================================*/

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


    /*==================================================
    FEATURE: MOBILE MENU BUTTON
    ==================================================*/

    mobileMenuButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openMobileDrawer();

        }
    );


    /*==================================================
    FEATURE: CLOSE MOBILE MENU
    ==================================================*/

    closeMobileMenu?.addEventListener(
        "click",
        function () {

            closeMobileDrawer();

        }
    );


    /*==================================================
    FEATURE: MOBILE OVERLAY
    ==================================================*/

    mobileMenuOverlay?.addEventListener(
        "click",
        function () {

            closeMobileDrawer();

        }
    );


    /*==================================================
    FEATURE: BOTTOM CATEGORIES
    ==================================================*/

    bottomCategoriesButton?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openMobileDrawer();

        }
    );


    /*==================================================
    FEATURE: MOBILE CATEGORY LINKS
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

            console.warn(
                "SmartBazaar Cart Error:",
                error
            );


            cart = [];

        }


        let total = 0;


        if (
            Array.isArray(cart)
        ) {

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


    /*==================================================
    FEATURE: HEADER READY
    ==================================================*/

    console.log(
        "✓ SmartBazaar Pro 2 Header Loaded"
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


        /*
        IMPORTANT:
        Banner loading is NOT called here.

        home-banners.js is the dedicated
        Home Banner Controller.
        */


        console.log(
            "✓ SmartBazaar Pro 2 Main App Initialized"
        );

    }
);


/*==================================================
SMARTBAZAAR PRO 2
END OF APP.JS
==================================================*/
