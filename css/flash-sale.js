/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FLASH SALE SYSTEM
FEATURE: FIREBASE PRODUCT INTEGRATION
FEATURE: DYNAMIC FLASH SALE PRODUCTS
FEATURE: SEARCH + FILTER + SORT
FEATURE: COUNTDOWN
FEATURE: WISHLIST INTEGRATION
FEATURE: BUY NOW INTEGRATION
FEATURE: CART CONNECTION POINT
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    database,
    auth
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE PATHS
==================================================*/

const PRODUCTS_PATH = "products";


/*==================================================
FEATURE: ADMIN CONFIG
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: GLOBAL STATE
==================================================*/

let allProducts = [];

let flashSaleProducts = [];

let filteredProducts = [];

let currentUser = null;

let currentCategory = "all";

let currentSort = "default";

let currentSearch = "";

let displayedProducts = 0;

const PRODUCTS_PER_LOAD = 12;


/*==================================================
FEATURE: FLASH SALE CONFIGURATION

IMPORTANT:
This first version detects Flash Sale products
from existing product data.

Supported fields:

flashSale
isFlashSale
flash_sale
flashSaleActive
saleType = "flash-sale"

Later, the dedicated Flash Sale/Admin system
can add its own fields without changing
the product loading architecture.
==================================================*/


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const productGrid =
    document.getElementById(
        "flashSaleProductsGrid"
    );

const loadingState =
    document.getElementById(
        "flashSaleLoading"
    );

const emptyState =
    document.getElementById(
        "flashSaleEmpty"
    );

const saleEndedState =
    document.getElementById(
        "flashSaleEnded"
    );

const loadMoreButton =
    document.getElementById(
        "loadMoreButton"
    );

const searchInput =
    document.getElementById(
        "flashSaleSearch"
    );

const categoryContainer =
    document.getElementById(
        "flashSaleCategories"
    );

const sortSelect =
    document.getElementById(
        "flashSaleSort"
    );


/*==================================================
FEATURE: COUNTDOWN ELEMENTS
==================================================*/

const countdownDays =
    document.getElementById(
        "countdownDays"
    );

const countdownHours =
    document.getElementById(
        "countdownHours"
    );

const countdownMinutes =
    document.getElementById(
        "countdownMinutes"
    );

const countdownSeconds =
    document.getElementById(
        "countdownSeconds"
    );


/*==================================================
FEATURE: STAT ELEMENTS
==================================================*/

const activeSaleCount =
    document.getElementById(
        "activeSaleCount"
    );

const hotSaleCount =
    document.getElementById(
        "hotSaleCount"
    );

const limitedStockCount =
    document.getElementById(
        "limitedStockCount"
    );

const maxDiscountCount =
    document.getElementById(
        "maxDiscountCount"
    );


/*==================================================
FEATURE: QUICK VIEW
==================================================*/

const quickViewModal =
    document.getElementById(
        "quickViewModal"
    );

const quickViewClose =
    document.getElementById(
        "quickViewClose"
    );


/*==================================================
FEATURE: TOAST
==================================================*/

const toast =
    document.getElementById(
        "flashSaleToast"
    );

const toastMessage =
    document.getElementById(
        "flashSaleToastMessage"
    );


/*==================================================
FEATURE: AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    user => {

        currentUser =
            user || null;

    }
);


/*==================================================
FEATURE: INITIALIZE
==================================================*/

initializeFlashSale();


/*==================================================
FEATURE: INITIALIZE FLASH SALE
==================================================*/

async function initializeFlashSale() {

    showLoading();

    hideEmpty();

    hideSaleEnded();

    try {

        await loadProducts();

        buildCategories();

        updateStatistics();

        applyFilters();

        startCountdown();

    } catch (error) {

        console.error(
            "Flash Sale initialization error:",
            error
        );

        showEmpty(
            "Unable to load Flash Sale products."
        );

    }

}


/*==================================================
FEATURE: LOAD PRODUCTS
==================================================*/

async function loadProducts() {

    const productsRef =
        ref(
            database,
            PRODUCTS_PATH
        );

    const snapshot =
        await get(
            productsRef
        );

    if (!snapshot.exists()) {

        allProducts = [];

        flashSaleProducts = [];

        return;

    }


    const products =
        snapshot.val();


    allProducts =
        Object.entries(
            products
        ).map(
            ([firebaseKey, product]) => {

                if (
                    !product ||
                    typeof product !== "object"
                ) {

                    return null;

                }


                return normalizeProduct(
                    product,
                    firebaseKey
                );

            }
        ).filter(Boolean);


    /*
     * Only published products are shown.
     */

    const publishedProducts =
        allProducts.filter(
            product =>
                product.published === true
        );


    /*
     * Detect Flash Sale products.
     */

    flashSaleProducts =
        publishedProducts.filter(
            isFlashSaleProduct
        );

}


/*==================================================
FEATURE: NORMALIZE PRODUCT
==================================================*/

function normalizeProduct(
    product,
    firebaseKey
) {

    const productId =
        product.productId ||
        firebaseKey;


    const price =
        Number(
            product.price || 0
        );


    const oldPrice =
        Number(
            product.oldPrice ||
            product.originalPrice ||
            0
        );


    let discount =
        product.discount != null
            ? Number(
                product.discount
            )
            : 0;


    if (
        discount <= 0 &&
        oldPrice > price &&
        oldPrice > 0
    ) {

        discount =
            Math.round(
                (
                    (
                        oldPrice -
                        price
                    )
                    /
                    oldPrice
                )
                *
                100
            );

    }


    const stock =
        Number(
            product.stock || 0
        );


    const images =
        getProductImages(
            product
        );


    return {

        ...product,

        productId,

        name:
            product.name ||
            product.title ||
            "Product",

        category:
            product.category ||
            "Other",

        image:
            images[0] ||
            product.image ||
            product.imageUrl ||
            "",

        images,

        price,

        oldPrice,

        discount,

        stock,

        rating:
            Number(
                product.rating || 0
            ),

        reviews:
            Number(
                product.reviews || 0
            ),

        sellerName:
            product.sellerName ||
            product.seller ||
            "SmartBazaar Seller",

        sellerId:
            product.sellerId ||
            "",

        freeShipping:
            product.freeShipping === true,

        featured:
            product.featured === true

    };

}


/*==================================================
FEATURE: DETECT FLASH SALE PRODUCT
==================================================*/

function isFlashSaleProduct(
    product
) {

    if (!product) {

        return false;

    }


    /*
     * Direct boolean flags.
     */

    if (
        product.flashSale === true ||
        product.isFlashSale === true ||
        product.flash_sale === true ||
        product.flashSaleActive === true
    ) {

        return true;

    }


    /*
     * Sale type support.
     */

    const saleType =
        String(
            product.saleType ||
            product.sale_type ||
            ""
        ).toLowerCase();


    if (
        saleType === "flash-sale" ||
        saleType === "flash sale" ||
        saleType === "flashsale"
    ) {

        return true;

    }


    return false;

}


/*==================================================
FEATURE: GET PRODUCT IMAGES
==================================================*/

function getProductImages(
    product
) {

    let images = [];


    if (
        Array.isArray(
            product.images
        )
    ) {

        images =
            product.images.filter(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );

    }


    if (
        images.length === 0 &&
        product.images &&
        typeof product.images === "object"
    ) {

        images =
            Object.values(
                product.images
            ).filter(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );

    }


    if (
        images.length === 0 &&
        typeof product.image === "string" &&
        product.image.trim()
    ) {

        images.push(
            product.image.trim()
        );

    }


    if (
        images.length === 0 &&
        typeof product.imageUrl === "string" &&
        product.imageUrl.trim()
    ) {

        images.push(
            product.imageUrl.trim()
        );

    }


    return images;

}


/*==================================================
FEATURE: BUILD CATEGORIES
==================================================*/

function buildCategories() {

    if (!categoryContainer) {

        return;

    }


    const categories =
        [
            ...new Set(
                flashSaleProducts
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    categoryContainer.innerHTML = "";


    const allButton =
        createCategoryButton(
            "all",
            "All"
        );


    categoryContainer.appendChild(
        allButton
    );


    categories.forEach(
        category => {

            categoryContainer.appendChild(
                createCategoryButton(
                    category,
                    category
                )
            );

        }
    );

}


/*==================================================
FEATURE: CATEGORY BUTTON
==================================================*/

function createCategoryButton(
    value,
    label
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "flash-category-btn";


    if (
        value === currentCategory
    ) {

        button.classList.add(
            "active"
        );

    }


    button.dataset.category =
        value;


    button.textContent =
        label;


    button.addEventListener(
        "click",
        () => {

            currentCategory =
                value;


            document
                .querySelectorAll(
                    ".flash-category-btn"
                )
                .forEach(
                    item =>
                        item.classList.toggle(
                            "active",
                            item.dataset.category ===
                            currentCategory
                        )
                );


            applyFilters();

        }
    );


    return button;

}


/*==================================================
FEATURE: SEARCH
==================================================*/

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            currentSearch =
                String(
                    event.target.value ||
                    ""
                )
                .trim()
                .toLowerCase();


            applyFilters();

        }
    );

}


/*==================================================
FEATURE: SORT
==================================================*/

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        event => {

            currentSort =
                event.target.value ||
                "default";


            applyFilters();

        }
    );

}


/*==================================================
FEATURE: APPLY FILTERS
==================================================*/

function applyFilters() {

    let products =
        [...flashSaleProducts];


    /*
     * Category filter.
     */

    if (
        currentCategory !== "all"
    ) {

        products =
            products.filter(
                product =>
                    String(
                        product.category
                    )
                    .toLowerCase() ===
                    String(
                        currentCategory
                    )
                    .toLowerCase()
            );

    }


    /*
     * Search filter.
     */

    if (currentSearch) {

        products =
            products.filter(
                product => {

                    const searchableText =
                        [
                            product.name,
                            product.category,
                            product.brand,
                            product.sku,
                            product.sellerName,
                            product.shortDescription
                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        currentSearch
                    );

                }
            );

    }


    /*
     * Sorting.
     */

    sortProducts(
        products
    );


    filteredProducts =
        products;


    displayedProducts =
        0;


    renderProducts();

}


/*==================================================
FEATURE: SORT PRODUCTS
==================================================*/

function sortProducts(
    products
) {

    switch (
        currentSort
    ) {

        case "price-low":

            products.sort(
                (a, b) =>
                    a.price -
                    b.price
            );

            break;


        case "price-high":

            products.sort(
                (a, b) =>
                    b.price -
                    a.price
            );

            break;


        case "discount":

            products.sort(
                (a, b) =>
                    b.discount -
                    a.discount
            );

            break;


        case "rating":

            products.sort(
                (a, b) =>
                    b.rating -
                    a.rating
            );

            break;


        case "ending":

            products.sort(
                (
                    a,
                    b
                ) =>
                    getSaleEndTime(a) -
                    getSaleEndTime(b)
            );

            break;


        default:

            products.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.createdAt || 0
                    )
                    -
                    Number(
                        a.createdAt || 0
                    )
            );

            break;

    }

}


/*==================================================
FEATURE: RENDER PRODUCTS
==================================================*/

function renderProducts() {

    if (!productGrid) {

        return;

    }


    hideLoading();


    hideEmpty();


    productGrid.innerHTML = "";


    if (
        filteredProducts.length === 0
    ) {

        showEmpty(
            currentSearch ||
            currentCategory !== "all"
                ? "No Flash Sale products match your search."
                : "No Flash Sale products are available right now."
        );


        updateLoadMoreButton();

        return;

    }


    const productsToShow =
        filteredProducts.slice(
            0,
            displayedProducts +
            PRODUCTS_PER_LOAD
        );


    displayedProducts =
        productsToShow.length;


    productsToShow.forEach(
        product => {

            productGrid.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );


    updateLoadMoreButton();

}


/*==================================================
FEATURE: PRODUCT CARD
==================================================*/

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "flash-product-card";


    card.dataset.productId =
        product.productId;


    const discountHtml =
        product.discount > 0
            ? `
                <span class="flash-discount">
                    -${product.discount}%
                </span>
              `
            : "";


    const oldPriceHtml =
        product.oldPrice > product.price
            ? `
                <span class="flash-old-price">
                    ${formatPrice(product.oldPrice)}
                </span>
              `
            : "";


    const savings =
        product.oldPrice > product.price
            ? product.oldPrice -
              product.price
            : 0;


    const savingsHtml =
        savings > 0
            ? `
                <span class="flash-savings">
                    Save ${formatPrice(savings)}
                </span>
              `
            : "";


    const stockPercentage =
        calculateStockPercentage(
            product
        );


    const stockText =
        product.stock > 0
            ? `Only ${product.stock} left`
            : "Out of Stock";


    const rating =
        product.rating > 0
            ? `
                <span class="flash-rating">
                    ★ ${product.rating.toFixed(1)}
                </span>
              `
            : "";


    const freeShippingHtml =
        product.freeShipping
            ? `
                <span class="flash-free-shipping">
                    Free Shipping
                </span>
              `
            : "";


    card.innerHTML =
        `
        <div class="flash-product-image-wrap">

            ${discountHtml}

            <button
                type="button"
                class="flash-wishlist-btn"
                data-product-id="${escapeHtml(product.productId)}"
                aria-label="Wishlist"
                aria-pressed="false"
            >
                <i class="fa-regular fa-heart"></i>
            </button>

            <img
                class="flash-product-image"
                src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
            >

            ${
                product.stock <= 0
                    ? `
                        <span class="flash-out-stock">
                            Out of Stock
                        </span>
                      `
                    : ""
            }

        </div>


        <div class="flash-product-info">

            <div class="flash-product-category">
                ${escapeHtml(product.category)}
            </div>

            <h3 class="flash-product-name">
                ${escapeHtml(product.name)}
            </h3>

            <div class="flash-product-rating">
                ${rating}
                ${
                    product.reviews > 0
                        ? `
                            <span>
                                (${product.reviews})
                            </span>
                          `
                        : ""
                }
            </div>

            <div class="flash-price-row">

                <strong class="flash-price">
                    ${formatPrice(product.price)}
                </strong>

                ${oldPriceHtml}

            </div>

            ${savingsHtml}

            <div class="flash-stock-section">

                <div class="flash-stock-text">
                    <span>
                        ${stockText}
                    </span>
                </div>

                <div class="flash-stock-bar">
                    <span
                        style="width:${stockPercentage}%"
                    ></span>
                </div>

            </div>

            ${
                product.sellerName
                    ? `
                        <div class="flash-seller">
                            Sold by ${escapeHtml(product.sellerName)}
                        </div>
                      `
                    : ""
            }

            ${freeShippingHtml}

            <div class="flash-card-actions">

                <button
                    type="button"
                    class="flash-quick-view-btn"
                    data-product-id="${escapeHtml(product.productId)}"
                >
                    Quick View
                </button>

                <button
                    type="button"
                    class="flash-cart-btn"
                    data-product-id="${escapeHtml(product.productId)}"
                    ${
                        product.stock <= 0
                            ? "disabled"
                            : ""
                    }
                >
                    Add to Cart
                </button>

                <button
                    type="button"
                    class="flash-buy-btn"
                    data-product-id="${escapeHtml(product.productId)}"
                    ${
                        product.stock <= 0
                            ? "disabled"
                            : ""
                    }
                >
                    Buy Now
                </button>

            </div>

        </div>
        `;


    /*
     * Product image error handling.
     */

    const image =
        card.querySelector(
            ".flash-product-image"
        );


    if (image) {

        image.addEventListener(
            "error",
            () => {

                image.style.display =
                    "none";

            }
        );

    }


    /*
     * Product details.
     */

    card.addEventListener(
        "dblclick",
        () => {

            openProductDetails(
                product.productId
            );

        }
    );


    /*
     * Wishlist.
     */

    const wishlistButton =
        card.querySelector(
            ".flash-wishlist-btn"
        );


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleWishlist(
                    product,
                    wishlistButton
                );

            }
        );

    }


    /*
     * Quick View.
     */

    const quickViewButton =
        card.querySelector(
            ".flash-quick-view-btn"
        );


    if (quickViewButton) {

        quickViewButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openQuickView(
                    product
                );

            }
        );

    }


    /*
     * Cart connection point.
     */

    const cartButton =
        card.querySelector(
            ".flash-cart-btn"
        );


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                handleCartConnection(
                    product,
                    1
                );

            }
        );

    }


    /*
     * Buy Now.
     */

    const buyButton =
        card.querySelector(
            ".flash-buy-btn"
        );


    if (buyButton) {

        buyButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                buyNow(
                    product,
                    1
                );

            }
        );

    }


    /*
     * Open details by clicking the
     * main card areas.
     */

    card.querySelector(
        ".flash-product-image-wrap"
    )?.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "button"
                )
            ) {

                return;

            }


            openProductDetails(
                product.productId
            );

        }
    );


    card.querySelector(
        ".flash-product-name"
    )?.addEventListener(
        "click",
        () => {

            openProductDetails(
                product.productId
            );

        }
    );


    return card;

}


/*==================================================
FEATURE: STOCK PERCENTAGE
==================================================*/

function calculateStockPercentage(
    product
) {

    const stock =
        Number(
            product.stock || 0
        );


    if (stock <= 0) {

        return 0;

    }


    const originalStock =
        Number(
            product.flashSaleStock ||
            product.saleStock ||
            product.initialStock ||
            product.stockLimit ||
            100
        );


    return Math.max(
        5,
        Math.min(
            100,
            Math.round(
                (
                    stock /
                    Math.max(
                        originalStock,
                        stock
                    )
                )
                *
                100
            )
        )
    );

}


/*==================================================
FEATURE: LOAD MORE
==================================================*/

if (loadMoreButton) {

    loadMoreButton.addEventListener(
        "click",
        () => {

            if (
                displayedProducts >=
                filteredProducts.length
            ) {

                return;

            }


            renderProducts();

        }
    );

}


/*==================================================
FEATURE: LOAD MORE BUTTON STATE
==================================================*/

function updateLoadMoreButton() {

    if (!loadMoreButton) {

        return;

    }


    const hasMore =
        displayedProducts <
        filteredProducts.length;


    loadMoreButton.style.display =
        hasMore
            ? ""
            : "none";

}


/*==================================================
FEATURE: BUY NOW
==================================================*/

function buyNow(
    product,
    quantity
) {

    if (!product?.productId) {

        showToast(
            "Product information is missing."
        );

        return;

    }


    if (
        Number(product.stock || 0) <= 0
    ) {

        showToast(
            "This product is out of stock."
        );

        return;

    }


    const safeQuantity =
        Math.max(
            1,
            Math.min(
                Number(quantity) || 1,
                Number(product.stock)
            )
        );


    window.location.href =
        `./checkout.html?id=${encodeURIComponent(product.productId)}&quantity=${encodeURIComponent(safeQuantity)}`;

}


/*==================================================
FEATURE: CART CONNECTION POINT
==================================================*/

/*
 * IMPORTANT:
 *
 * The real SmartBazaar Pro 2 Cart system has
 * not been created yet.
 *
 * DO NOT create a new Cart Firebase path here.
 *
 * When the real Cart JS is created, this function
 * will be replaced/connected to that system.
 */

function handleCartConnection(
    product,
    quantity = 1
) {

    if (!product?.productId) {

        showToast(
            "Product information is missing."
        );

        return;

    }


    if (
        Number(product.stock || 0) <= 0
    ) {

        showToast(
            "This product is out of stock."
        );

        return;

    }


    /*
     * FEATURE: CART PLACEHOLDER
     *
     * Future:
     * Connect the real Cart JS here.
     */

    console.log(
        "FLASH SALE CART CONNECTION:",
        {
            productId:
                product.productId,

            quantity,

            product
        }
    );


    showToast(
        "Cart connection is ready for the Cart system."
    );

}


/*==================================================
FEATURE: WISHLIST
==================================================*/

async function toggleWishlist(
    product,
    button
) {

    if (!currentUser) {

        window.location.href =
            `./login.html?redirect=${encodeURIComponent(window.location.href)}`;

        return;

    }


    if (!product?.productId) {

        return;

    }


    const wishlistRef =
        ref(
            database,
            `users/${currentUser.uid}/wishlist/${product.productId}`
        );


    try {

        const snapshot =
            await get(
                wishlistRef
            );


        if (snapshot.exists()) {

            /*
             * Actual remove operation will be
             * handled here once remove import is
             * needed.
             *
             * For now use the existing product
             * details Wishlist integration point.
             */

            showToast(
                "This product is already in your Wishlist."
            );

            setWishlistButtonState(
                button,
                true
            );

            return;

        }


        /*
         * Placeholder:
         * The existing Wishlist JS already owns
         * the complete Firebase write structure.
         *
         * We intentionally do not duplicate it here.
         */

        showToast(
            "Wishlist connection point is ready."
        );

        setWishlistButtonState(
            button,
            false
        );

    } catch (error) {

        console.error(
            "Flash Sale Wishlist error:",
            error
        );

        showToast(
            "Wishlist check failed."
        );

    }

}


/*==================================================
FEATURE: WISHLIST BUTTON STATE
==================================================*/

function setWishlistButtonState(
    button,
    active
) {

    if (!button) {

        return;

    }


    const icon =
        button.querySelector(
            "i"
        );


    if (icon) {

        icon.classList.remove(
            "fa-regular",
            "fa-solid"
        );


        icon.classList.add(
            active
                ? "fa-solid"
                : "fa-regular"
        );

    }


    button.classList.toggle(
        "active",
        active
    );


    button.setAttribute(
        "aria-pressed",
        String(active)
    );

}


/*==================================================
FEATURE: QUICK VIEW
==================================================*/

function openQuickView(
    product
) {

    if (!quickViewModal) {

        openProductDetails(
            product.productId
        );

        return;

    }


    const nameElement =
        document.getElementById(
            "quickViewName"
        );

    const imageElement =
        document.getElementById(
            "quickViewImage"
        );

    const priceElement =
        document.getElementById(
            "quickViewPrice"
        );

    const oldPriceElement =
        document.getElementById(
            "quickViewOldPrice"
        );

    const discountElement =
        document.getElementById(
            "quickViewDiscount"
        );

    const ratingElement =
        document.getElementById(
            "quickViewRating"
        );

    const descriptionElement =
        document.getElementById(
            "quickViewDescription"
        );


    if (nameElement) {

        nameElement.textContent =
            product.name;

    }


    if (imageElement) {

        imageElement.src =
            product.image;

        imageElement.alt =
            product.name;

    }


    if (priceElement) {

        priceElement.textContent =
            formatPrice(
                product.price
            );

    }


    if (oldPriceElement) {

        oldPriceElement.textContent =
            product.oldPrice >
            product.price
                ? formatPrice(
                    product.oldPrice
                )
                : "";

    }


    if (discountElement) {

        discountElement.textContent =
            product.discount > 0
                ? `-${product.discount}%`
                : "";

    }


    if (ratingElement) {

        ratingElement.textContent =
            product.rating > 0
                ? `★ ${product.rating.toFixed(1)} (${product.reviews})`
                : "No ratings yet";

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            product.shortDescription ||
            product.description ||
            "No description available.";

    }


    quickViewModal.classList.add(
        "active",
        "show"
    );


    quickViewModal.style.display =
        "flex";


    quickViewModal.dataset.productId =
        product.productId;

}


/*==================================================
FEATURE: CLOSE QUICK VIEW
==================================================*/

function closeQuickView() {

    if (!quickViewModal) {

        return;

    }


    quickViewModal.classList.remove(
        "active",
        "show"
    );


    quickViewModal.style.display =
        "none";

}


if (quickViewClose) {

    quickViewClose.addEventListener(
        "click",
        closeQuickView
    );

}


if (quickViewModal) {

    quickViewModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                quickViewModal
            ) {

                closeQuickView();

            }

        }
    );

}


/*==================================================
FEATURE: OPEN PRODUCT DETAILS
==================================================*/

function openProductDetails(
    id
) {

    if (!id) {

        return;

    }


    window.location.href =
        `./product-details.html?id=${encodeURIComponent(id)}`;

}


/*==================================================
FEATURE: COUNTDOWN
==================================================*/

let countdownTimer = null;


function startCountdown() {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

    }


    updateCountdown();


    countdownTimer =
        setInterval(
            updateCountdown,
            1000
        );

}


/*==================================================
FEATURE: GET SALE END TIME
==================================================*/

function getSaleEndTime(
    product
) {

    const possibleValues = [
        product.flashSaleEnd,
        product.flashSaleEndsAt,
        product.saleEnd,
        product.saleEndsAt,
        product.endTime,
        product.saleEndTime
    ];


    for (
        const value of possibleValues
    ) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            continue;

        }


        const numeric =
            Number(value);


        if (
            Number.isFinite(numeric) &&
            numeric > 0
        ) {

            return numeric < 100000000000
                ? numeric * 1000
                : numeric;

        }


        const date =
            new Date(
                value
            )
            .getTime();


        if (
            Number.isFinite(date)
        ) {

            return date;

        }

    }


    /*
     * Temporary default:
     * 24 hours from page load when no
     * Flash Sale end field exists yet.
     *
     * This is only a front-end fallback.
     */

    return Date.now() +
        (
            24 *
            60 *
            60 *
            1000
        );

}


/*==================================================
FEATURE: GET GLOBAL SALE END
==================================================*/

function getGlobalSaleEndTime() {

    const times =
        flashSaleProducts
            .map(
                product =>
                    getSaleEndTime(
                        product
                    )
            )
            .filter(
                time =>
                    Number.isFinite(time)
            );


    if (!times.length) {

        return Date.now() +
            (
                24 *
                60 *
                60 *
                1000
            );

    }


    return Math.min(
        ...times
    );

}


/*==================================================
FEATURE: UPDATE COUNTDOWN
==================================================*/

function updateCountdown() {

    const endTime =
        getGlobalSaleEndTime();


    const remaining =
        Math.max(
            0,
            endTime -
            Date.now()
        );


    const totalSeconds =
        Math.floor(
            remaining /
            1000
        );


    const days =
        Math.floor(
            totalSeconds /
            86400
        );


    const hours =
        Math.floor(
            (
                totalSeconds %
                86400
            )
            /
            3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            )
            /
            60
        );


    const seconds =
        totalSeconds %
        60;


    setCountdownValue(
        countdownDays,
        days
    );


    setCountdownValue(
        countdownHours,
        hours
    );


    setCountdownValue(
        countdownMinutes,
        minutes
    );


    setCountdownValue(
        countdownSeconds,
        seconds
    );


    if (
        remaining <= 0
    ) {

        showSaleEnded();

    }

}


/*==================================================
FEATURE: COUNTDOWN VALUE
==================================================*/

function setCountdownValue(
    element,
    value
) {

    if (!element) {

        return;

    }


    element.textContent =
        String(
            value
        )
        .padStart(
            2,
            "0"
        );

}


/*==================================================
FEATURE: UPDATE STATISTICS
==================================================*/

function updateStatistics() {

    const active =
        flashSaleProducts.length;


    const hot =
        flashSaleProducts.filter(
            product =>
                product.discount >= 30
        ).length;


    const limited =
        flashSaleProducts.filter(
            product =>
                product.stock > 0 &&
                product.stock <= 5
        ).length;


    const maxDiscount =
        flashSaleProducts.reduce(
            (
                max,
                product
            ) =>
                Math.max(
                    max,
                    Number(
                        product.discount || 0
                    )
                ),
            0
        );


    setText(
        activeSaleCount,
        active
    );


    setText(
        hotSaleCount,
        hot
    );


    setText(
        limitedStockCount,
        limited
    );


    setText(
        maxDiscountCount,
        maxDiscount > 0
            ? `${maxDiscount}%`
            : "0%"
    );

}


/*==================================================
FEATURE: SHOW LOADING
==================================================*/

function showLoading() {

    if (loadingState) {

        loadingState.style.display =
            "";

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (loadingState) {

        loadingState.style.display =
            "none";

    }

}


/*==================================================
FEATURE: EMPTY STATE
==================================================*/

function showEmpty(
    message
) {

    hideLoading();

    hideSaleEnded();


    if (emptyState) {

        const messageElement =
            emptyState.querySelector(
                "[data-empty-message]"
            );


        if (messageElement) {

            messageElement.textContent =
                message;

        }


        emptyState.style.display =
            "flex";

    }

}


function hideEmpty() {

    if (emptyState) {

        emptyState.style.display =
            "none";

    }

}


/*==================================================
FEATURE: SALE ENDED STATE
==================================================*/

function showSaleEnded() {

    if (saleEndedState) {

        saleEndedState.style.display =
            "flex";

    }

}


function hideSaleEnded() {

    if (saleEndedState) {

        saleEndedState.style.display =
            "none";

    }

}


/*==================================================
FEATURE: TOAST
==================================================*/

function showToast(
    message
) {

    if (
        toast &&
        toastMessage
    ) {

        toastMessage.textContent =
            message;


        toast.classList.add(
            "show",
            "active"
        );


        toast.style.display =
            "flex";


        clearTimeout(
            showToast.timeout
        );


        showToast.timeout =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show",
                        "active"
                    );

                },
                2500
            );


        return;

    }


    console.log(
        "Flash Sale:",
        message
    );

}


/*==================================================
FEATURE: SET TEXT
==================================================*/

function setText(
    element,
    value
) {

    if (element) {

        element.textContent =
            value;

    }

}


/*==================================================
FEATURE: FORMAT PRICE
==================================================*/

function formatPrice(
    price
) {

    return (
        "Rs. " +
        Number(
            price || 0
        )
        .toLocaleString(
            "en-PK"
        )
    );

}


/*==================================================
FEATURE: ESCAPE HTML
==================================================*/

function escapeHtml(
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
