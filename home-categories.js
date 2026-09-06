/*==================================================
SMARTBAZAAR PRO 2
FEATURE: HOME QUICK CATEGORIES
FEATURE: FIREBASE CATEGORY CONNECTION
FEATURE: ADMIN CATEGORY SYNC
FEATURE: CATEGORY → PRODUCTS CONNECTION
FEATURE: ALL CATEGORIES CONNECTION
FEATURE: HORIZONTAL CATEGORY NAVIGATION
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE DATABASE
==================================================*/

const database =
    getDatabase(app);


/*==================================================
FEATURE: CATEGORIES DATABASE PATH
IMPORTANT:
یہی path آپ کے موجودہ category.js میں ہے۔
==================================================*/

const categoriesRef =
    ref(
        database,
        "smartbazaar_pro_2/categories"
    );


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const quickCategories =
    document.getElementById(
        "homeQuickCategories"
    );


const loadingElement =
    document.getElementById(
        "homeCategoryLoading"
    );


/*==================================================
FEATURE: CATEGORY DATA
==================================================*/

let allCategories = [];


/*==================================================
FEATURE: HTML SECURITY
==================================================*/

function escapeHTML(
    value = ""
) {

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
FEATURE: SAFE IMAGE URL
==================================================*/

function safeImageURL(
    value = ""
) {

    const url =
        String(value).trim();


    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {

        return url;

    }


    return "";

}


/*==================================================
FEATURE: CREATE SLUG
==================================================*/

function createSlug(
    value = ""
) {

    return String(value)
        .toLowerCase()
        .trim()
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[^\w\-]+/g,
            ""
        )
        .replace(
            /\-\-+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            "");

}


/*==================================================
FEATURE: NORMALIZE CATEGORY
==================================================*/

function normalizeCategory(
    value = ""
) {

    return String(value)
        .trim()
        .toLowerCase();

}


/*==================================================
FEATURE: SORT CATEGORIES
Admin Panel کا sortOrder استعمال ہوگا۔
==================================================*/

function sortCategories(
    categories
) {

    return categories.sort(
        (a, b) => {

            const orderA =
                Number(
                    a.sortOrder || 0
                );


            const orderB =
                Number(
                    b.sortOrder || 0
                );


            if (
                orderA !== orderB
            ) {

                return (
                    orderA -
                    orderB
                );

            }


            return String(
                a.name || ""
            ).localeCompare(
                String(
                    b.name || ""
                )
            );

        }
    );

}


/*==================================================
FEATURE: SHOW LOADING
==================================================*/

function showLoading() {

    if (loadingElement) {

        loadingElement.hidden =
            false;

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (loadingElement) {

        loadingElement.hidden =
            true;

    }

}


/*==================================================
FEATURE: CREATE ALL BUTTON
==================================================*/

function createAllButton() {

    const button =
        document.createElement(
            "a"
        );


    button.href =
        "category.html";


    button.className =
        "home-quick-category active";


    button.dataset.category =
        "all";


    button.innerHTML =
        `
            <i class="fa-solid fa-layer-group"></i>

            <span>
                All
            </span>
        `;


    return button;

}


/*==================================================
FEATURE: CREATE CATEGORY BUTTON
==================================================*/

function createCategoryButton(
    category
) {

    const name =
        String(
            category.name || ""
        ).trim();


    if (!name) {

        return null;

    }


    const slug =
        String(
            category.slug ||
            createSlug(name)
        ).trim();


    const icon =
        String(
            category.icon ||
            "fa-layer-group"
        ).trim();


    const imageUrl =
        safeImageURL(
            category.imageUrl || ""
        );


    const button =
        document.createElement(
            "a"
        );


    /*
     * IMPORTANT:
     *
     * Product Editor میں category
     * اصل category NAME سے save ہو رہی ہے۔
     *
     * اس لیے یہاں بھی category NAME
     * pass کیا جا رہا ہے۔
     */

    button.href =
        `products.html?category=${encodeURIComponent(
            name
        )}`;


    button.className =
        "home-quick-category";


    button.dataset.category =
        name;


    button.dataset.slug =
        slug;


    /*==================================================
    FEATURE: CATEGORY MEDIA
    ==================================================*/

    let mediaHTML = "";


    /*
     * اگر Admin نے image دی ہے
     * تو image استعمال کریں گے۔
     */

    if (imageUrl) {

        mediaHTML =
            `
                <span class="home-quick-category-image">

                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt="${escapeHTML(name)}"
                        loading="lazy"
                    >

                </span>
            `;

    }

    else {

        /*
         * ورنہ Admin Panel کا icon
         * استعمال ہوگا۔
         */

        mediaHTML =
            `
                <span class="home-quick-category-icon">

                    <i
                        class="fa-solid ${escapeHTML(icon)}"
                    ></i>

                </span>
            `;

    }


    /*==================================================
    FEATURE: CATEGORY BUTTON HTML
    ==================================================*/

    button.innerHTML =
        `
            ${mediaHTML}

            <span class="home-quick-category-name">
                ${escapeHTML(name)}
            </span>
        `;


    return button;

}


/*==================================================
FEATURE: RENDER QUICK CATEGORIES
==================================================*/

function renderQuickCategories(
    categories
) {

    if (!quickCategories) {

        console.error(
            "Home Category Error: #homeQuickCategories not found."
        );

        return;

    }


    /*
     * پہلے موجودہ content صاف کریں۔
     */

    quickCategories.innerHTML =
        "";


    /*
     * All button ہمیشہ موجود رہے گا۔
     */

    quickCategories.appendChild(
        createAllButton()
    );


    /*
     * Firebase categories
     */

    categories.forEach(
        category => {

            const button =
                createCategoryButton(
                    category
                );


            if (button) {

                quickCategories.appendChild(
                    button
                );

            }

        }
    );


    hideLoading();

}


/*==================================================
FEATURE: LOAD CATEGORIES
==================================================*/

function loadHomeCategories() {

    if (!quickCategories) {

        return;

    }


    showLoading();


    onValue(
        categoriesRef,
        snapshot => {

            /*
             * Firebase میں categories نہیں ہیں۔
             */

            if (!snapshot.exists()) {

                allCategories =
                    [];


                renderQuickCategories(
                    []
                );


                return;

            }


            const data =
                snapshot.val();


            /*==================================================
            FEATURE: FIREBASE OBJECT → ARRAY
            ==================================================*/

            allCategories =
                Object.entries(
                    data
                )
                .map(
                    ([id, category]) => ({

                        id,

                        ...category

                    })
                )
                .filter(
                    category =>
                        category &&
                        category.active !== false &&
                        String(
                            category.name || ""
                        ).trim() !== ""
                );


            /*==================================================
            FEATURE: SORT
            ==================================================*/

            allCategories =
                sortCategories(
                    allCategories
                );


            /*==================================================
            FEATURE: RENDER
            ==================================================*/

            renderQuickCategories(
                allCategories
            );

        },

        error => {

            console.error(
                "Home Categories Firebase Error:",
                error
            );


            /*
             * Firebase error کی صورت میں
             * کم از کم All button موجود رہے۔
             */

            allCategories =
                [];


            renderQuickCategories(
                []
            );

        }
    );

}


/*==================================================
FEATURE: ACTIVE CATEGORY
==================================================*/

function updateActiveCategory() {

    if (!quickCategories) {

        return;

    }


    const currentURL =
        new URL(
            window.location.href
        );


    const currentCategory =
        currentURL.searchParams.get(
            "category"
        );


    const buttons =
        quickCategories.querySelectorAll(
            ".home-quick-category"
        );


    buttons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    /*
     * Home پر All active رہے گا۔
     */

    if (!currentCategory) {

        const allButton =
            quickCategories.querySelector(
                '[data-category="all"]'
            );


        if (allButton) {

            allButton.classList.add(
                "active"
            );

        }


        return;

    }


    const normalized =
        normalizeCategory(
            currentCategory
        );


    buttons.forEach(
        button => {

            const category =
                normalizeCategory(
                    button.dataset.category
                );


            if (
                category ===
                normalized
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );

}


/*==================================================
FEATURE: INITIALIZE
==================================================*/

function initializeHomeCategories() {

    loadHomeCategories();


    /*
     * Active state
     */

    updateActiveCategory();

}


/*==================================================
FEATURE: START SYSTEM
==================================================*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHomeCategories
    );

} else {

    initializeHomeCategories();

}
