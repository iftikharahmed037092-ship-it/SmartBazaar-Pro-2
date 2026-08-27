/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ADMIN PANEL JAVASCRIPT
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORTS
==================================================*/

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: FIREBASE CONFIG
==================================================*/

import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: ADMIN AUTHENTICATION
==================================================*/

const auth = getAuth(app);


/*==================================================
FEATURE: ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const adminLoading =
    document.getElementById("adminLoading");

const adminEmail =
    document.getElementById("adminEmail");

const adminName =
    document.getElementById("adminName");

const logoutButton =
    document.getElementById("logoutButton");

const viewWebsiteButton =
    document.getElementById("viewWebsiteButton");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const adminSidebar =
    document.getElementById("adminSidebar");

const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");

const adminToast =
    document.getElementById("adminToast");

const adminToastMessage =
    document.getElementById("adminToastMessage");


/*==================================================
FEATURE: ADMIN ACCESS VERIFICATION
==================================================*/

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "admin-login.html";

        return;

    }


    const loggedInEmail =
        user.email
            ? user.email.toLowerCase()
            : "";


    if (
        loggedInEmail !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        signOut(auth)
            .finally(() => {

                alert(
                    "Access Denied. Admin account required."
                );

                window.location.href =
                    "admin-login.html";

            });

        return;

    }


    /*==================================================
    ADMIN VERIFIED
    ==================================================*/

    adminEmail.textContent =
        user.email;


    adminName.textContent =
        user.displayName ||
        "Administrator";


    adminLoading.classList.add(
        "hidden"
    );

});


/*==================================================
FEATURE: SIDEBAR NAVIGATION
==================================================*/

const navigationItems =
    document.querySelectorAll(
        ".admin-nav-item"
    );


const sections =
    document.querySelectorAll(
        ".admin-section"
    );


navigationItems.forEach((item) => {

    item.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            const sectionName =
                item.dataset.section;


            openSection(
                sectionName
            );


            /* MOBILE SIDEBAR CLOSE */

            adminSidebar.classList.remove(
                "open"
            );

        }
    );

});


/*==================================================
FEATURE: OPEN ADMIN SECTION
==================================================*/

function openSection(sectionName) {


    navigationItems.forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.section ===
            sectionName
        );

    });


    sections.forEach((section) => {

        section.classList.remove(
            "active"
        );

    });


    const targetSection =
        document.getElementById(
            sectionName + "Section"
        );


    if (targetSection) {

        targetSection.classList.add(
            "active"
        );

    }


    const titles = {

        dashboard: [
            "Dashboard",
            "Welcome back to SmartBazaar Pro 2"
        ],

        banners: [
            "Banners",
            "Manage your homepage banners"
        ],

        products: [
            "Products",
            "Manage marketplace products"
        ],

        categories: [
            "Categories",
            "Organize your marketplace"
        ],

        orders: [
            "Orders",
            "Manage customer orders"
        ],

        users: [
            "Users",
            "Manage marketplace users"
        ],

        analytics: [
            "Analytics",
            "Monitor marketplace performance"
        ],

        settings: [
            "Settings",
            "Manage SmartBazaar Pro 2"
        ]

    };


    if (titles[sectionName]) {

        pageTitle.textContent =
            titles[sectionName][0];

        pageSubtitle.textContent =
            titles[sectionName][1];

    }

}


/*==================================================
FEATURE: QUICK ACTIONS
==================================================*/

const quickActionButtons =
    document.querySelectorAll(
        "[data-section-action]"
    );


quickActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.sectionAction;


                openSection(
                    section
                );

            }
        );

    }
);


/*==================================================
FEATURE: SIDEBAR MOBILE TOGGLE
==================================================*/

if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            adminSidebar.classList.toggle(
                "open"
            );

        }
    );

}


/*==================================================
FEATURE: VIEW WEBSITE
==================================================*/

if (viewWebsiteButton) {

    viewWebsiteButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
FEATURE: LOGOUT
==================================================*/

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            try {

                await signOut(auth);

                window.location.href =
                    "admin-login.html";

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

                showToast(
                    "Unable to logout."
                );

            }

        }
    );

}


/*==================================================
FEATURE: ADD BANNER
==================================================*/

const addBannerButton =
    document.getElementById(
        "addBannerButton"
    );


const openBannerEditorButton =
    document.getElementById(
        "openBannerEditorButton"
    );


function openBannerEditor() {

    window.location.href =
        "banner-editor.html";

}


if (addBannerButton) {

    addBannerButton.addEventListener(
        "click",
        openBannerEditor
    );

}


if (openBannerEditorButton) {

    openBannerEditorButton.addEventListener(
        "click",
        openBannerEditor
    );

}


/*==================================================
FEATURE: TOAST MESSAGE
==================================================*/

function showToast(message) {

    adminToastMessage.textContent =
        message;


    adminToast.classList.add(
        "show"
    );


    setTimeout(() => {

        adminToast.classList.remove(
            "show"
        );

    }, 3000);

}


/*==================================================
FEATURE: INITIAL DASHBOARD
==================================================*/

openSection(
    "dashboard"
);
