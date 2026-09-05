/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CUSTOMER CATEGORY PAGE JAVASCRIPT
FEATURE: CATEGORY DISPLAY SYSTEM
FEATURE: FIREBASE CATEGORY INTEGRATION
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORTS
==================================================*/

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: FIREBASE CONFIG
==================================================*/

import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE DATABASE
==================================================*/

const db = getDatabase(app);


/*==================================================
FEATURE: CATEGORY DATABASE PATH
==================================================*/

const categoriesRef = ref(
    db,
    "smartbazaar_pro_2/categories"
);


/*==================================================
FEATURE: CATEGORY PAGE ELEMENTS
==================================================*/

const categoryGrid =
    document.getElementById("categoryGrid");

const categoryLoading =
    document.getElementById("categoryLoading");

const categoryEmpty =
    document.getElementById("categoryEmpty");

const categoryError =
    document.getElementById("categoryError");

const categorySearch =
    document.getElementById("categorySearch");


/*==================================================
FEATURE: CATEGORY DATA
==================================================*/

let allCategories = [];


/*==================================================
FEATURE: HTML ESCAPE
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

    const url = String(value ?? "").trim();

    if (!url) {
        return "";
    }

    try {

        const parsedURL =
            new URL(url, window.location.origin);

        if (
            parsedURL.protocol === "http:" ||
            parsedURL.protocol === "https:"
        ) {
            return parsedURL.href;
        }

    } catch (error) {

        console.warn(
            "Invalid category image URL:",
            error
        );

    }

    return "";

}


/*==================================================
FEATURE: LOADING STATE
==================================================*/

function showCategoryLoading() {

    if (categoryLoading) {
        categoryLoading.hidden = false;
    }

    if (categoryEmpty) {
        categoryEmpty.hidden = true;
    }

    if (categoryError) {
        categoryError.hidden = true;
    }

    if (categoryGrid) {
        categoryGrid.innerHTML = "";
    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideCategoryLoading() {

    if (categoryLoading) {
        categoryLoading.hidden = true;
    }

}


/*==================================================
FEATURE: EMPTY STATE
==================================================*/

function showCategoryEmpty() {

    hideCategoryLoading();

    if (categoryEmpty) {
        categoryEmpty.hidden = false;
    }

    if (categoryError) {
        categoryError.hidden = true;
    }

    if (categoryGrid) {
        categoryGrid.innerHTML = "";
    }

}


/*==================================================
FEATURE: ERROR STATE
==================================================*/

function showCategoryError() {

    hideCategoryLoading();

    if (categoryError) {
        categoryError.hidden = false;
    }

    if (categoryEmpty) {
        categoryEmpty.hidden = true;
    }

    if (categoryGrid) {
        categoryGrid.innerHTML = "";
    }

}


/*==================================================
FEATURE: LOAD CATEGORIES
==================================================*/

function loadCategories() {

    showCategoryLoading();

    onValue(
        categoriesRef,

        (snapshot) => {

            const data =
                snapshot.val();

            allCategories = [];

            if (data && typeof data === "object") {

                Object.entries(data).forEach(
                    ([id, category]) => {

                        if (
                            !category ||
                            typeof category !== "object"
                        ) {
                            return;
                        }


                        /*==================================================
                        FEATURE: ACTIVE CATEGORY FILTER
                        ==================================================*/

                        if (
                            category.active === false
                        ) {
                            return;
                        }


                        allCategories.push({

                            id,

                            name:
                                category.name || "Unnamed Category",

                            slug:
                                category.slug || id,

                            description:
                                category.description || "",

                            imageUrl:
                                category.imageUrl || "",

                            icon:
                                category.icon ||
                                "fa-solid fa-layer-group",

                            sortOrder:
                                Number(category.sortOrder) || 0

                        });

                    }
                );

            }


            /*==================================================
            FEATURE: CATEGORY SORTING
            ==================================================*/

            allCategories.sort(
                (a, b) => {

                    const orderDifference =
                        a.sortOrder - b.sortOrder;

                    if (orderDifference !== 0) {
                        return orderDifference;
                    }

                    return a.name.localeCompare(
                        b.name,
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    );

                }
            );


            hideCategoryLoading();


            if (allCategories.length === 0) {

                showCategoryEmpty();

                return;

            }


            /*==================================================
            FEATURE: INITIAL CATEGORY RENDER
            ==================================================*/

            renderCategories(
                allCategories
            );

        },

        (error) => {

            console.error(
                "Category loading error:",
                error
            );

            showCategoryError();

        }
    );

}


/*==================================================
FEATURE: RENDER CATEGORIES
==================================================*/

function renderCategories(categories) {

    if (!categoryGrid) {
        return;
    }


    if (!categories.length) {

        categoryGrid.innerHTML = "";

        if (categoryEmpty) {
            categoryEmpty.hidden = false;
        }

        return;

    }


    if (categoryEmpty) {
        categoryEmpty.hidden = true;
    }


    categoryGrid.innerHTML =
        categories.map(
            (category) => {

                const imageURL =
                    safeURL(
                        category.imageUrl
                    );


                const imageHTML =
                    imageURL
                        ? `
                            <img
                                src="${escapeHTML(imageURL)}"
                                alt="${escapeHTML(category.name)}"
                                class="category-card-image"
                                loading="lazy"
                            >
                          `
                        : `
                            <div class="category-card-icon">
                                <i class="${escapeHTML(category.icon)}"></i>
                            </div>
                          `;


                return `
                    <article
                        class="category-card"
                        data-category-id="${escapeHTML(category.id)}"
                        data-category-slug="${escapeHTML(category.slug)}"
                        tabindex="0"
                        role="button"
                        aria-label="Open ${escapeHTML(category.name)} category"
                    >

                        <div class="category-card-media">

                            ${imageHTML}

                        </div>


                        <div class="category-card-content">

                            <h3 class="category-card-title">
                                ${escapeHTML(category.name)}
                            </h3>


                            ${
                                category.description
                                    ? `
                                        <p class="category-card-description">
                                            ${escapeHTML(category.description)}
                                        </p>
                                      `
                                    : ""
                            }


                            <span class="category-card-link">

                                Explore

                                <i class="fa-solid fa-arrow-right"></i>

                            </span>

                        </div>

                    </article>
                `;

            }
        ).join("");


    /*==================================================
    FEATURE: CATEGORY CARD EVENTS
    ==================================================*/

    categoryGrid
        .querySelectorAll(".category-card")
        .forEach(
            (card) => {

                card.addEventListener(
                    "click",
                    () => {

                        openCategory(
                            card.dataset.categoryId,
                            card.dataset.categorySlug
                        );

                    }
                );


                /*==================================================
                FEATURE: KEYBOARD ACCESSIBILITY
                ==================================================*/

                card.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            openCategory(
                                card.dataset.categoryId,
                                card.dataset.categorySlug
                            );

                        }

                    }
                );

            }
        );

}


/*==================================================
FEATURE: CATEGORY SEARCH
==================================================*/

function filterCategories(searchValue) {

    const query =
        String(searchValue ?? "")
            .trim()
            .toLowerCase();


    if (!query) {

        renderCategories(
            allCategories
        );

        return;

    }


    const filtered =
        allCategories.filter(
            (category) => {

                const name =
                    category.name.toLowerCase();

                const description =
                    category.description.toLowerCase();

                const slug =
                    category.slug.toLowerCase();

                return (
                    name.includes(query) ||
                    description.includes(query) ||
                    slug.includes(query)
                );

            }
        );


    renderCategories(
        filtered
    );

}


/*==================================================
FEATURE: CATEGORY SEARCH EVENT
==================================================*/

if (categorySearch) {

    categorySearch.addEventListener(
        "input",
        (event) => {

            filterCategories(
                event.target.value
            );

        }
    );

}


/*==================================================
FEATURE: OPEN CATEGORY
==================================================*/

function openCategory(
    categoryId,
    categorySlug
) {

    if (!categoryId) {
        return;
    }


    /*==================================================
    FEATURE: CATEGORY PRODUCT FILTER
    ==================================================
    The product page can read these parameters
    and load products belonging to this category.
    ==================================================*/

    const params =
        new URLSearchParams();

    params.set(
        "categoryId",
        categoryId
    );


    if (categorySlug) {

        params.set(
            "category",
            categorySlug
        );

    }


    /*
     * IMPORTANT:
     * Keep this target connected to the existing
     * SmartBazaar Pro 2 product/category page.
     *
     * Change only if the project's actual product
     * listing filename is different.
     */

    window.location.href =
        `products.html?${params.toString()}`;

}


/*==================================================
FEATURE: RETRY BUTTON
==================================================*/

const retryCategoryButton =
    document.getElementById(
        "retryCategoryButton"
    );


if (retryCategoryButton) {

    retryCategoryButton.addEventListener(
        "click",
        () => {

            loadCategories();

        }
    );

}


/*==================================================
FEATURE: INITIALIZE CATEGORY PAGE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCategories();

    }
);
