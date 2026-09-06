/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PRODUCTS LISTING SYSTEM
FEATURE: CATEGORY → PRODUCTS CONNECTION
FEATURE: FIREBASE PRODUCTS
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {
    database
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE DATABASE METHODS
==================================================*/

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const productsGrid =
    document.getElementById(
        "productsGrid"
    );


const productsLoading =
    document.getElementById(
        "productsLoading"
    );


const productsEmpty =
    document.getElementById(
        "productsEmpty"
    );


const productsEmptyText =
    document.getElementById(
        "productsEmptyText"
    );


const productsError =
    document.getElementById(
        "productsError"
    );


const retryProductsButton =
    document.getElementById(
        "retryProductsButton"
    );


const productsSearch =
    document.getElementById(
        "productsSearch"
    );


const productsSort =
    document.getElementById(
        "productsSort"
    );


const productsPageTitle =
    document.getElementById(
        "productsPageTitle"
    );


const productsPageSubtitle =
    document.getElementById(
        "productsPageSubtitle"
    );


const productsResultCount =
    document.getElementById(
        "productsResultCount"
    );


/*==================================================
FEATURE: URL CATEGORY
==================================================*/

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const selectedCategory =
    String(
        urlParams.get("category") || ""
    ).trim();


/*==================================================
FEATURE: PRODUCTS DATA
==================================================*/

let allProducts = [];


/*==================================================
FEATURE: HTML SECURITY
==================================================*/

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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
FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(
    value
) {

    return (
        "Rs. "
        +
        Number(value || 0)
            .toLocaleString(
                "en-PK"
            )
    );

}


/*==================================================
FEATURE: NORMALIZE CATEGORY
==================================================*/

function normalizeCategory(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/*==================================================
FEATURE: PAGE TITLE
==================================================*/

function setupCategoryTitle() {

    if (!selectedCategory) {

        if (productsPageTitle) {

            productsPageTitle.textContent =
                "All Products";

        }

        if (productsPageSubtitle) {

            productsPageSubtitle.textContent =
                "Explore our latest products";

        }

        return;

    }


    if (productsPageTitle) {

        productsPageTitle.textContent =
            selectedCategory;

    }


    if (productsPageSubtitle) {

        productsPageSubtitle.textContent =
            `Products in ${selectedCategory}`;

    }

}


/*==================================================
FEATURE: SHOW LOADING
==================================================*/

function showLoading() {

    if (productsLoading) {

        productsLoading.hidden =
            false;

    }

    if (productsEmpty) {

        productsEmpty.hidden =
            true;

    }

    if (productsError) {

        productsError.hidden =
            true;

    }

    if (productsGrid) {

        productsGrid.innerHTML =
            "";

    }

}


/*==================================================
FEATURE: SHOW EMPTY
==================================================*/

function showEmpty(
    message = "There are no products available."
) {

    if (productsLoading) {

        productsLoading.hidden =
            true;

    }

    if (productsError) {

        productsError.hidden =
            true;

    }

    if (productsGrid) {

        productsGrid.innerHTML =
            "";

    }

    if (productsEmptyText) {

        productsEmptyText.textContent =
            message;

    }

    if (productsEmpty) {

        productsEmpty.hidden =
            false;

    }

}


/*==================================================
FEATURE: SHOW ERROR
==================================================*/

function showError() {

    if (productsLoading) {

        productsLoading.hidden =
            true;

    }

    if (productsEmpty) {

        productsEmpty.hidden =
            true;

    }

    if (productsError) {

        productsError.hidden =
            false;

    }

    if (productsGrid) {

        productsGrid.innerHTML =
            "";

    }

}


/*==================================================
FEATURE: HIDE STATES
==================================================*/

function hideStates() {

    if (productsLoading) {

        productsLoading.hidden =
            true;

    }

    if (productsEmpty) {

        productsEmpty.hidden =
            true;

    }

    if (productsError) {

        productsError.hidden =
            true;

    }

}


/*==================================================
FEATURE: CREATE PRODUCT CARD
==================================================*/

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    /*
     * IMPORTANT:
     * Existing product-card class
     * is reused.
     *
     * Existing Product Card CSS
     * remains responsible for styling.
     */

    card.className =
        "product-card";


    /*==================================================
    FEATURE: PRODUCT DATA
    ==================================================*/

    const name =
        product.name ||
        "Unnamed Product";


    const category =
        product.category ||
        "Product";


    const image =
        product.image ||
        "https://via.placeholder.com/600x600?text=Product";


    const price =
        Number(
            product.price
        ) || 0;


    const oldPrice =
        Number(
            product.oldPrice
        ) || 0;


    const discount =
        Number(
            product.discount
        ) || 0;


    const description =
        product.shortDescription ||
        product.description ||
        "";


    const rating =
        Number(
            product.rating
        ) || 0;


    const reviews =
        Number(
            product.reviews
        ) || 0;


    /*==================================================
    FEATURE: SALE BADGE
    ==================================================*/

    let saleBadge = "";


    if (
        discount > 0
    ) {

        saleBadge =
            `
                <span class="product-sale-badge">
                    -${discount}%
                </span>
            `;

    }


    /*==================================================
    FEATURE: OLD PRICE
    ==================================================*/

    let oldPriceHTML = "";


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        oldPriceHTML =
            `
                <span class="product-old-price">
                    ${formatPrice(oldPrice)}
                </span>
            `;

    }


    /*==================================================
    FEATURE: RATING
    ==================================================*/

    let ratingHTML = "";


    if (
        rating > 0
    ) {

        ratingHTML =
            `
                <div class="product-card-rating">

                    <i class="fa-solid fa-star"></i>

                    <span>
                        ${rating.toFixed(1)}
                        (${reviews})
                    </span>

                </div>
            `;

    }


    /*==================================================
    FEATURE: CARD HTML
    ==================================================*/

    card.innerHTML =
        `
            ${saleBadge}


            <div class="product-card-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >

            </div>


            <div class="product-card-content">

                <span class="product-card-category">
                    ${escapeHTML(category)}
                </span>


                <h3 class="product-card-title">
                    ${escapeHTML(name)}
                </h3>


                ${
                    description
                    ?
                    `
                        <p class="product-card-description">
                            ${escapeHTML(description)}
                        </p>
                    `
                    :
                    ""
                }


                <div class="product-card-price">

                    <span class="product-current-price">
                        ${formatPrice(price)}
                    </span>

                    ${oldPriceHTML}

                </div>


                ${ratingHTML}

            </div>
        `;


    /*==================================================
    FEATURE: PRODUCT CARD CLICK
    ==================================================*/

    card.addEventListener(
        "click",
        () => {

            openProductDetail(
                product
            );

        }
    );


    return card;

}


/*==================================================
FEATURE: OPEN PRODUCT DETAILS
==================================================*/

function openProductDetail(
    product
) {

    if (
        !product ||
        !product.productId
    ) {

        console.error(
            "Product Detail Error: Product ID missing."
        );

        return;

    }


    window.location.href =
        `product-details.html?id=${encodeURIComponent(
            product.productId
        )}`;

}


/*==================================================
FEATURE: FILTER PRODUCTS
==================================================*/

function getFilteredProducts() {

    const searchValue =
        normalizeCategory(
            productsSearch?.value
        );


    let filtered =
        [...allProducts];


    /*==================================================
    FEATURE: CATEGORY FILTER
    ==================================================*/

    if (
        selectedCategory
    ) {

        const targetCategory =
            normalizeCategory(
                selectedCategory
            );


        filtered =
            filtered.filter(
                product =>
                    normalizeCategory(
                        product.category
                    ) === targetCategory
            );

    }


    /*==================================================
    FEATURE: SEARCH FILTER
    ==================================================*/

    if (
        searchValue
    ) {

        filtered =
            filtered.filter(
                product => {

                    const name =
                        normalizeCategory(
                            product.name
                        );


                    const category =
                        normalizeCategory(
                            product.category
                        );


                    const brand =
                        normalizeCategory(
                            product.brand
                        );


                    const description =
                        normalizeCategory(
                            product.shortDescription ||
                            product.description
                        );


                    return (
                        name.includes(
                            searchValue
                        ) ||

                        category.includes(
                            searchValue
                        ) ||

                        brand.includes(
                            searchValue
                        ) ||

                        description.includes(
                            searchValue
                        )
                    );

                }
            );

    }


    return filtered;

}


/*==================================================
FEATURE: SORT PRODUCTS
==================================================*/

function sortProducts(
    products
) {

    const sortType =
        productsSort?.value ||
        "newest";


    products.sort(
        (a, b) => {

            switch (
                sortType
            ) {

                case "price-low":

                    return (
                        Number(a.price || 0)
                        -
                        Number(b.price || 0)
                    );


                case "price-high":

                    return (
                        Number(b.price || 0)
                        -
                        Number(a.price || 0)
                    );


                case "name":

                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    );


                case "newest":

                default:

                    return (
                        Number(
                            b.createdAt || 0
                        )
                        -
                        Number(
                            a.createdAt || 0
                        )
                    );

            }

        }
    );


    return products;

}


/*==================================================
FEATURE: RENDER PRODUCTS
==================================================*/

function renderProducts() {

    if (!productsGrid) {

        return;

    }


    let filteredProducts =
        getFilteredProducts();


    filteredProducts =
        sortProducts(
            filteredProducts
        );


    productsGrid.innerHTML =
        "";


    /*==================================================
    FEATURE: RESULT COUNT
    ==================================================*/

    if (productsResultCount) {

        const count =
            filteredProducts.length;


        productsResultCount.textContent =
            `${count} product${count === 1 ? "" : "s"} found`;

    }


    /*==================================================
    FEATURE: NO RESULT
    ==================================================*/

    if (
        filteredProducts.length === 0
    ) {

        const message =
            selectedCategory
            ?
            `No products found in "${selectedCategory}".`
            :
            "No products match your search.";


        showEmpty(
            message
        );

        return;

    }


    hideStates();


    /*==================================================
    FEATURE: RENDER CARDS
    ==================================================*/

    filteredProducts.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );


            productsGrid.appendChild(
                card
            );

        }
    );

}


/*==================================================
FEATURE: LOAD PRODUCTS
==================================================*/

function loadProducts() {

    showLoading();


    const productsRef =
        ref(
            database,
            "products"
        );


    onValue(
        productsRef,
        (snapshot) => {

            if (!snapshot.exists()) {

                allProducts = [];

                showEmpty(
                    "There are no products available yet."
                );

                return;

            }


            const data =
                snapshot.val();


            /*==================================================
            FEATURE: FIREBASE OBJECT → ARRAY
            ==================================================*/

            allProducts =
                Object.entries(
                    data
                )
                .map(
                    ([firebaseId, product]) => ({

                        firebaseId,

                        ...product

                    })
                )
                .filter(
                    product =>
                        product &&
                        product.published === true
                );


            /*==================================================
            FEATURE: RENDER
            ==================================================*/

            renderProducts();

        },
        (error) => {

            console.error(
                "Products Firebase Error:",
                error
            );


            showError();

        }
    );

}


/*==================================================
FEATURE: SEARCH EVENT
==================================================*/

if (productsSearch) {

    productsSearch.addEventListener(
        "input",
        renderProducts
    );

}


/*==================================================
FEATURE: SORT EVENT
==================================================*/

if (productsSort) {

    productsSort.addEventListener(
        "change",
        renderProducts
    );

}


/*==================================================
FEATURE: RETRY EVENT
==================================================*/

if (retryProductsButton) {

    retryProductsButton.addEventListener(
        "click",
        loadProducts
    );

}


/*==================================================
FEATURE: INITIALIZE PAGE
==================================================*/

setupCategoryTitle();

loadProducts();
