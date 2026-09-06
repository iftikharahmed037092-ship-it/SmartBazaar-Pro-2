/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CATEGORY PAGE SYSTEM
FEATURE: CATEGORY SEARCH
FEATURE: POPULAR CATEGORIES
FEATURE: CATEGORY → PRODUCTS CONNECTION
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
==================================================*/

const categoriesRef =
    ref(
        database,
        "smartbazaar_pro_2/categories"
    );


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const categoriesGrid =
    document.getElementById(
        "categoriesGrid"
    );


const categoryLoading =
    document.getElementById(
        "categoryLoading"
    );


const categoryEmpty =
    document.getElementById(
        "categoryEmpty"
    );


const categorySearch =
    document.getElementById(
        "categorySearch"
    );


const clearCategorySearch =
    document.getElementById(
        "clearCategorySearch"
    );


const resetCategorySearch =
    document.getElementById(
        "resetCategorySearch"
    );


const popularCategoriesGrid =
    document.getElementById(
        "popularCategoriesGrid"
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
FEATURE: SHOW LOADING
==================================================*/

function showLoading() {

    if (categoryLoading) {

        categoryLoading.hidden =
            false;

    }


    if (categoryEmpty) {

        categoryEmpty.hidden =
            true;

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (categoryLoading) {

        categoryLoading.hidden =
            true;

    }

}


/*==================================================
FEATURE: SHOW EMPTY
==================================================*/

function showEmpty() {

    hideLoading();


    if (categoryEmpty) {

        categoryEmpty.hidden =
            false;

    }

}


/*==================================================
FEATURE: HIDE EMPTY
==================================================*/

function hideEmpty() {

    if (categoryEmpty) {

        categoryEmpty.hidden =
            true;

    }

}


/*==================================================
FEATURE: CREATE CATEGORY CARD
==================================================*/

function createCategoryCard(
    category
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "category-card";


    /*==================================================
    FEATURE: CATEGORY DATA
    ==================================================*/

    const name =
        String(
            category.name || ""
        ).trim();


    const slug =
        String(
            category.slug ||
            createSlug(name)
        ).trim();


    const description =
        String(
            category.description || ""
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


    /*==================================================
    FEATURE: CARD MEDIA
    ==================================================*/

    let mediaHTML = "";


    if (imageUrl) {

        mediaHTML =
            `
                <div class="category-card-image">

                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt="${escapeHTML(name)}"
                        loading="lazy"
                    >

                </div>
            `;

    }

    else {

        mediaHTML =
            `
                <div class="category-card-icon">

                    <i
                        class="fa-solid ${escapeHTML(icon)}"
                    ></i>

                </div>
            `;

    }


    /*==================================================
    FEATURE: CARD HTML
    ==================================================*/

    card.innerHTML =
        `
            ${mediaHTML}

            <div class="category-card-content">

                <h3 class="category-card-title">
                    ${escapeHTML(name)}
                </h3>

                ${
                    description
                    ?
                    `
                        <p class="category-card-description">
                            ${escapeHTML(description)}
                        </p>
                    `
                    :
                    ""
                }

                <span class="category-card-link">

                    View Products

                    <i
                        class="fa-solid fa-arrow-right"
                    ></i>

                </span>

            </div>
        `;


    /*==================================================
    FEATURE: STORE CATEGORY DATA
    ==================================================*/

    card.dataset.category =
        name;


    card.dataset.slug =
        slug;


    /*==================================================
    FEATURE: CATEGORY → PRODUCTS
    ==================================================*/

    card.addEventListener(
        "click",
        () => {

            if (!name) {

                return;

            }


            /*
             * IMPORTANT:
             *
             * Product Editor currently saves:
             *
             * category: category
             *
             * Therefore we pass the
             * actual category NAME.
             */

            const params =
                new URLSearchParams();


            params.set(
                "category",
                name
            );


            window.location.href =
                `products.html?${params.toString()}`;

        }
    );


    /*==================================================
    FEATURE: KEYBOARD ACCESSIBILITY
    ==================================================*/

    card.setAttribute(
        "tabindex",
        "0"
    );


    card.setAttribute(
        "role",
        "link"
    );


    card.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                card.click();

            }

        }
    );


    return card;

}


/*==================================================
FEATURE: RENDER CATEGORIES
==================================================*/

function renderCategories(
    categories
) {

    if (!categoriesGrid) {

        console.error(
            "Category Error: #categoriesGrid not found."
        );

        return;

    }


    categoriesGrid.innerHTML =
        "";


    if (
        !categories.length
    ) {

        showEmpty();

        return;

    }


    hideLoading();

    hideEmpty();


    const fragment =
        document.createDocumentFragment();


    categories.forEach(
        category => {

            fragment.appendChild(
                createCategoryCard(
                    category
                )
            );

        }
    );


    categoriesGrid.appendChild(
        fragment
    );

}


/*==================================================
FEATURE: RENDER POPULAR CATEGORIES
==================================================*/

function renderPopularCategories(
    categories
) {

    if (!popularCategoriesGrid) {

        return;

    }


    popularCategoriesGrid.innerHTML =
        "";


    /*
     * Top categories according
     * to sortOrder.
     *
     * Maximum 6.
     */

    const popular =
        [...categories]
            .sort(
                (a, b) =>
                    Number(
                        a.sortOrder || 0
                    )
                    -
                    Number(
                        b.sortOrder || 0
                    )
            )
            .slice(
                0,
                6
            );


    popular.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "popular-category-item";


            const icon =
                String(
                    category.icon ||
                    "fa-layer-group"
                );


            button.innerHTML =
                `
                    <i
                        class="fa-solid ${escapeHTML(icon)}"
                    ></i>

                    <span>
                        ${escapeHTML(
                            category.name || ""
                        )}
                    </span>
                `;


            /*==================================================
            FEATURE: POPULAR CATEGORY → PRODUCTS
            ==================================================*/

            button.addEventListener(
                "click",
                () => {

                    const name =
                        String(
                            category.name || ""
                        ).trim();


                    if (!name) {

                        return;

                    }


                    window.location.href =
                        `products.html?category=${encodeURIComponent(
                            name
                        )}`;

                }
            );


            popularCategoriesGrid.appendChild(
                button
            );

        }
    );

}


/*==================================================
FEATURE: SORT CATEGORIES
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
FEATURE: FILTER CATEGORIES
==================================================*/

function filterCategories() {

    const query =
        normalizeCategory(
            categorySearch?.value
        );


    if (!query) {

        renderCategories(
            allCategories
        );

        return;

    }


    const filtered =
        allCategories.filter(
            category => {

                const name =
                    normalizeCategory(
                        category.name
                    );


                const slug =
                    normalizeCategory(
                        category.slug
                    );


                const description =
                    normalizeCategory(
                        category.description
                    );


                return (
                    name.includes(query) ||
                    slug.includes(query) ||
                    description.includes(query)
                );

            }
        );


    renderCategories(
        filtered
    );

}


/*==================================================
FEATURE: CLEAR SEARCH
==================================================*/

function clearSearch() {

    if (categorySearch) {

        categorySearch.value =
            "";

        categorySearch.focus();

    }


    renderCategories(
        allCategories
    );

}


/*==================================================
FEATURE: LOAD CATEGORIES
==================================================*/

function loadCategories() {

    showLoading();


    onValue(
        categoriesRef,
        (snapshot) => {

            if (!snapshot.exists()) {

                allCategories = [];

                renderCategories([]);

                if (
                    popularCategoriesGrid
                ) {

                    popularCategoriesGrid.innerHTML =
                        "";

                }

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
                        category.active !== false
                );


            /*==================================================
            FEATURE: SORT
            ==================================================*/

            allCategories =
                sortCategories(
                    allCategories
                );


            /*==================================================
            FEATURE: MAIN CATEGORIES
            ==================================================*/

            renderCategories(
                allCategories
            );


            /*==================================================
            FEATURE: POPULAR CATEGORIES
            ==================================================*/

            renderPopularCategories(
                allCategories
            );

        },
        (error) => {

            console.error(
                "Category Firebase Error:",
                error
            );


            hideLoading();

            showEmpty();

        }
    );

}


/*==================================================
FEATURE: SEARCH EVENT
==================================================*/

if (categorySearch) {

    categorySearch.addEventListener(
        "input",
        filterCategories
    );

}


/*==================================================
FEATURE: CLEAR BUTTON
==================================================*/

if (clearCategorySearch) {

    clearCategorySearch.addEventListener(
        "click",
        clearSearch
    );

}


/*==================================================
FEATURE: RESET SEARCH
==================================================*/

if (resetCategorySearch) {

    resetCategorySearch.addEventListener(
        "click",
        clearSearch
    );

}


/*==================================================
FEATURE: START CATEGORY SYSTEM
==================================================*/

loadCategories();
