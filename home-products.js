/*==================================================
SMARTBAZAAR PRO 2
FEATURE: HOME PRODUCTS SYSTEM
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {
    database,
    auth
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE DATABASE METHODS
==================================================*/

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: FIREBASE AUTH METHODS
==================================================*/

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const productsGrid =
    document.getElementById(
        "homeProductsGrid"
    );


/*==================================================
FEATURE: CHECK PRODUCT GRID
==================================================*/

if (!productsGrid) {

    console.error(
        "Home Products Error: #homeProductsGrid not found."
    );

}


/*==================================================
FEATURE: ADMIN ADD PRODUCT BUTTON
==================================================*/

function createAdminAddProductButton() {

    /*==================================================
    PREVENT DUPLICATE BUTTON
    ==================================================*/

    if (
        document.getElementById(
            "adminAddProductButton"
        )
    ) {

        return;

    }


    /*==================================================
    CREATE BUTTON
    ==================================================*/

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.id =
        "adminAddProductButton";


    button.className =
        "admin-add-product-button";


    button.innerHTML =
        `
            <i class="fa-solid fa-plus"></i>
            <span>Add Product</span>
        `;


    /*==================================================
    FEATURE: OPEN PRODUCT EDITOR
    ==================================================*/

    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "product-editor.html";

        }
    );


    /*==================================================
    ADD BUTTON TO PRODUCT SECTION
    ==================================================*/

    const productsSection =
        document.getElementById(
            "products"
        );


    if (productsSection) {

        productsSection.appendChild(
            button
        );

    }

}


/*==================================================
FEATURE: REMOVE ADMIN BUTTON
==================================================*/

function removeAdminAddProductButton() {

    const button =
        document.getElementById(
            "adminAddProductButton"
        );


    if (button) {

        button.remove();

    }

}


/*==================================================
FEATURE: ADMIN AUTHENTICATION
==================================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            removeAdminAddProductButton();

            return;

        }


        const loggedInEmail =
            user.email
                ? user.email.toLowerCase()
                : "";


        /*==================================================
        FEATURE: ADMIN ONLY
        ==================================================*/

        if (
            loggedInEmail ===
            ADMIN_EMAIL.toLowerCase()
        ) {

            createAdminAddProductButton();

        }

        else {

            removeAdminAddProductButton();

        }

    }
);


/*==================================================
FEATURE: LOAD PRODUCTS FROM FIREBASE
==================================================*/

function loadHomeProducts() {

    if (!productsGrid) {

        return;

    }


    const productsRef =
        ref(
            database,
            "products"
        );


    onValue(
        productsRef,
        (snapshot) => {

            /*==================================================
            CLEAR CURRENT PRODUCTS
            ==================================================*/

            productsGrid.innerHTML =
                "";


            /*==================================================
            NO PRODUCTS
            ==================================================*/

            if (!snapshot.exists()) {

                showEmptyProducts();

                return;

            }


            const products =
                snapshot.val();


            /*==================================================
            CONVERT FIREBASE OBJECT TO ARRAY
            ==================================================*/

            const productList =
                Object.values(
                    products
                );


            /*==================================================
            SHOW ONLY PUBLISHED PRODUCTS
            ==================================================*/

            const publishedProducts =
                productList.filter(
                    (product) =>
                        product &&
                        product.published === true
                );


            /*==================================================
            SORT NEWEST PRODUCTS FIRST
            ==================================================*/

            publishedProducts.sort(
                (a, b) =>
                    (b.createdAt || 0)
                    -
                    (a.createdAt || 0)
            );


            /*==================================================
            NO PUBLISHED PRODUCTS
            ==================================================*/

            if (
                publishedProducts.length === 0
            ) {

                showEmptyProducts();

                return;

            }


            /*==================================================
            FEATURE: CREATE PRODUCT CARDS
            ==================================================*/

            publishedProducts.forEach(
                (product) => {

                    const card =
                        createProductCard(
                            product
                        );


                    productsGrid.appendChild(
                        card
                    );

                }
            );

        },
        (error) => {

            console.error(
                "Home Products Firebase Error:",
                error
            );


            showProductsError();

        }
    );

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

    let saleBadge =
        "";


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

    let oldPriceHTML =
        "";


    if (
        oldPrice > price
        &&
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

    let ratingHTML =
        "";


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
FEATURE: OPEN PRODUCT DETAIL
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


    /*==================================================
    PRODUCT DETAIL PAGE
    ==================================================*/

    window.location.href =
    `product-details.html?id=${encodeURIComponent(product.productId)}`;


/*==================================================
FEATURE: EMPTY PRODUCTS
==================================================*/

function showEmptyProducts() {

    productsGrid.innerHTML =
        `
            <div class="products-loading">

                <i class="fa-solid fa-box-open"></i>

                <p>
                    No products available yet.
                </p>

            </div>
        `;

}


/*==================================================
FEATURE: PRODUCTS ERROR
==================================================*/

function showProductsError() {

    productsGrid.innerHTML =
        `
            <div class="products-loading">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <p>
                    Unable to load products.
                </p>

            </div>
        `;

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
        Number(value)
            .toLocaleString(
                "en-PK"
            )
    );

}


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
FEATURE: START HOME PRODUCT SYSTEM
==================================================*/

loadHomeProducts();
