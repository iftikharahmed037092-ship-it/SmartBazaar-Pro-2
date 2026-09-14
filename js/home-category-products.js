/*==================================================
SMARTBAZAAR PRO 2
FEATURE: HOME CATEGORY PRODUCTS
FEATURE: FIREBASE CATEGORY SYNC
FEATURE: CATEGORY → PRODUCTS CONNECTION
FEATURE: HORIZONTAL CATEGORY PRODUCTS
FEATURE: ADMIN CATEGORY ORDER SYNC
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

const database = getDatabase(app);


/*==================================================
FEATURE: FIREBASE PATHS
==================================================*/

const categoriesRef = ref(
    database,
    "smartbazaar_pro_2/categories"
);

const productsRef = ref(
    database,
    "products"
);


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const container =
    document.getElementById(
        "homeCategoryProductsContainer"
    );

const loadingElement =
    document.getElementById(
        "homeCategoryProductsLoading"
    );


/*==================================================
FEATURE: DATA
==================================================*/

let allCategories = [];
let allProducts = [];


/*==================================================
FEATURE: HTML SECURITY
==================================================*/

function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
FEATURE: SAFE IMAGE URL
==================================================*/

function safeImageURL(value = "") {

    const url = String(value).trim();

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {
        return url;
    }

    return "";
}


/*==================================================
FEATURE: NORMALIZE CATEGORY
==================================================*/

function normalizeCategory(value = "") {

    return String(value)
        .trim()
        .toLowerCase();

}


/*==================================================
FEATURE: CREATE CATEGORY SLUG
==================================================*/

function createSlug(value = "") {

    return String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+|-+$/g, "");

}


/*==================================================
FEATURE: FORMAT PRICE
==================================================*/

function formatPrice(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "";
    }

    return `Rs. ${number.toLocaleString("en-PK")}`;

}


/*==================================================
FEATURE: GET PRODUCT DISCOUNT
==================================================*/

function getDiscount(product) {

    const discount =
        Number(product.discount);

    if (
        Number.isFinite(discount) &&
        discount > 0
    ) {
        return Math.round(discount);
    }


    const price =
        Number(product.price);

    const oldPrice =
        Number(product.oldPrice);


    if (
        Number.isFinite(price) &&
        Number.isFinite(oldPrice) &&
        oldPrice > price
    ) {

        return Math.round(
            ((oldPrice - price) / oldPrice) * 100
        );

    }


    return 0;

}


/*==================================================
FEATURE: SORT CATEGORIES
==================================================*/

function sortCategories(categories) {

    return categories.sort(
        (a, b) => {

            const orderA =
                Number(a.sortOrder || 0);

            const orderB =
                Number(b.sortOrder || 0);


            if (orderA !== orderB) {

                return orderA - orderB;

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

        loadingElement.hidden = false;

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (loadingElement) {

        loadingElement.hidden = true;

    }

}


/*==================================================
FEATURE: CREATE PRODUCT CARD
==================================================*/

function createProductCard(product) {

    const productId =
        String(
            product.productId ||
            product.id ||
            ""
        ).trim();


    if (!productId) {

        return "";

    }


    const name =
        String(
            product.name || "Product"
        ).trim();


    const image =
        safeImageURL(
            product.image || ""
        );


    const price =
        Number(product.price);


    const oldPrice =
        Number(product.oldPrice);


    const discount =
        getDiscount(product);


    const imageHTML =
        image
            ? `
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="this.style.display='none';"
                >
              `
            : `
                <span aria-hidden="true">🛍️</span>
              `;


    const discountHTML =
        discount > 0
            ? `
                <span class="home-category-product-discount">
                    ${discount}% OFF
                </span>
              `
            : "";


    const oldPriceHTML =
        Number.isFinite(oldPrice) &&
        oldPrice > price
            ? `
                <span class="home-category-product-old-price">
                    ${formatPrice(oldPrice)}
                </span>
              `
            : "";


    return `
        <a
            href="product-details.html?id=${encodeURIComponent(productId)}"
            class="home-category-product-card"
        >

            <div class="home-category-product-image">

                ${imageHTML}

                ${discountHTML}

            </div>


            <div class="home-category-product-info">

                <h3 class="home-category-product-name">
                    ${escapeHTML(name)}
                </h3>


                <div class="home-category-product-price-row">

                    <span class="home-category-product-price">
                        ${formatPrice(price)}
                    </span>

                    ${oldPriceHTML}

                </div>

            </div>

        </a>
    `;

}


/*==================================================
FEATURE: GET CATEGORY PRODUCTS
==================================================*/

function getCategoryProducts(categoryName) {

    const normalizedName =
        normalizeCategory(
            categoryName
        );


    return allProducts
        .filter(product => {

            if (
                !product ||
                product.published === false
            ) {
                return false;
            }


            const productCategory =
                normalizeCategory(
                    product.category || ""
                );


            return (
                productCategory ===
                normalizedName
            );

        })
        .sort(
            (a, b) => {

                const createdA =
                    Number(
                        a.createdAt || 0
                    );

                const createdB =
                    Number(
                        b.createdAt || 0
                    );


                return createdB - createdA;

            }
        );

}


/*==================================================
FEATURE: CREATE CATEGORY SECTION
==================================================*/

function createCategorySection(
    category,
    products
) {

    const name =
        String(
            category.name || ""
        ).trim();


    if (
        !name ||
        products.length === 0
    ) {

        return "";

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


    const visibleProducts =
        products.slice(0, 4);


    const productsHTML =
        visibleProducts
            .map(createProductCard)
            .join("");


    return `
        <section
            class="home-category-product-block"
            data-category="${escapeHTML(name)}"
            data-slug="${escapeHTML(slug)}"
        >

            <div class="home-category-product-header">

                <div class="home-category-product-title-wrap">

                    <span class="home-category-product-icon">

                        <span class="home-category-product-icon-text">

                            <i class="fa-solid ${escapeHTML(icon)}"></i>

                        </span>

                    </span>


                    <h2 class="home-category-product-title">
                        ${escapeHTML(name)}
                    </h2>

                </div>


                <a
                    href="products.html?category=${encodeURIComponent(name)}"
                    class="home-category-product-view-all"
                >
                    View All
                    <span>→</span>
                </a>

            </div>


            <div class="home-category-product-wrapper">

                <div
                    class="home-category-product-grid"
                    aria-label="${escapeHTML(name)} Products"
                >

                    ${productsHTML}

                </div>

            </div>

        </section>
    `;

}


/*==================================================
FEATURE: RENDER CATEGORY PRODUCTS
==================================================*/

function renderCategoryProducts() {

    if (!container) {

        console.error(
            "Home Category Products Error: #homeCategoryProductsContainer not found."
        );

        return;

    }


    container.innerHTML = "";


    /*
     * ہر active category کے products دیکھیں۔
     */

    allCategories.forEach(
        category => {

            const products =
                getCategoryProducts(
                    category.name
                );


            /*
             * جس category میں کوئی product نہیں
             * اسے Home پر نہیں دکھایا جائے گا۔
             */

            if (
                products.length === 0
            ) {

                return;

            }


            const section =
                createCategorySection(
                    category,
                    products
                );


            if (section) {

                container.insertAdjacentHTML(
                    "beforeend",
                    section
                );

            }

        }
    );


    hideLoading();

}


/*==================================================
FEATURE: LOAD CATEGORIES
==================================================*/

function loadCategories() {

    return new Promise(
        resolve => {

            onValue(
                categoriesRef,

                snapshot => {

                    if (
                        !snapshot.exists()
                    ) {

                        allCategories = [];

                        renderCategoryProducts();

                        resolve();

                        return;

                    }


                    const data =
                        snapshot.val();


                    allCategories =
                        Object.entries(data)
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


                    allCategories =
                        sortCategories(
                            allCategories
                        );


                    renderCategoryProducts();

                    resolve();

                },

                error => {

                    console.error(
                        "Home Category Firebase Error:",
                        error
                    );


                    allCategories = [];

                    renderCategoryProducts();

                    resolve();

                }
            );

        }
    );

}


/*==================================================
FEATURE: LOAD PRODUCTS
==================================================*/

function loadProducts() {

    return new Promise(
        resolve => {

            onValue(
                productsRef,

                snapshot => {

                    if (
                        !snapshot.exists()
                    ) {

                        allProducts = [];

                        renderCategoryProducts();

                        resolve();

                        return;

                    }


                    const data =
                        snapshot.val();


                    allProducts =
                        Object.entries(data)
                            .map(
                                ([id, product]) => ({

                                    id,

                                    ...product

                                })
                            );


                    renderCategoryProducts();

                    resolve();

                },

                error => {

                    console.error(
                        "Home Products Firebase Error:",
                        error
                    );


                    allProducts = [];

                    renderCategoryProducts();

                    resolve();

                }
            );

        }
    );

}


/*==================================================
FEATURE: INITIALIZE
==================================================*/

function initializeHomeCategoryProducts() {

    if (!container) {

        return;

    }


    showLoading();


    /*
     * دونوں Firebase listeners
     * realtime میں چلیں گے۔
     */

    loadCategories();

    loadProducts();

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
        initializeHomeCategoryProducts
    );

} else {

    initializeHomeCategoryProducts();

}
