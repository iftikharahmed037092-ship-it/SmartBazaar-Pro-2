/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FLASH SALE
FILE: js/flash-sale.js

PURPOSE:
1. Home Page Flash Sale
2. Full Flash Sale Page
3. Firebase Realtime Database
4. Existing products/{productId}/flashSale data
5. Real-time countdown
6. Active sale filtering
==================================================*/

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    database
} from "../firebase-config.js";


/*==================================================
CONFIGURATION
==================================================*/

const PRODUCTS_PATH = "products";

let allFlashSaleProducts = [];
let filteredFlashSaleProducts = [];

let currentCategory = "all";
let currentSort = "featured";

let countdownTimer = null;

let homeSaleEndAt = null;
let pageSaleEndAt = null;


/*==================================================
HELPERS
==================================================*/

function getElement(id) {
    return document.getElementById(id);
}


function getFlashSale(product) {
    if (!product || !product.flashSale) {
        return null;
    }

    return product.flashSale;
}


function toNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function getProductId(product, key) {
    return String(
        product?.productId ||
        key ||
        ""
    );
}


function getProductPrice(product) {
    return toNumber(product?.price, 0);
}


function getSalePrice(product) {
    const flashSale = getFlashSale(product);

    return toNumber(
        flashSale?.salePrice,
        0
    );
}


function getSaleStock(product) {
    const flashSale = getFlashSale(product);

    return toNumber(
        flashSale?.saleStock,
        0
    );
}


function getSoldQuantity(product) {
    const flashSale = getFlashSale(product);

    return toNumber(
        flashSale?.soldQuantity,
        0
    );
}


function getDiscount(product) {
    const flashSale = getFlashSale(product);

    const storedDiscount = toNumber(
        flashSale?.discount,
        -1
    );

    if (storedDiscount >= 0) {
        return storedDiscount;
    }

    const originalPrice = getProductPrice(product);
    const salePrice = getSalePrice(product);

    if (
        originalPrice > 0 &&
        salePrice > 0 &&
        salePrice < originalPrice
    ) {
        return Math.round(
            ((originalPrice - salePrice) / originalPrice) * 100
        );
    }

    return 0;
}


function parseDate(value) {

    if (!value) {
        return null;
    }

    const timestamp = new Date(value).getTime();

    if (!Number.isFinite(timestamp)) {
        return null;
    }

    return timestamp;
}


/*==================================================
ACTIVE FLASH SALE CHECK
==================================================*/

function isActiveFlashSale(product, now = Date.now()) {

    const flashSale = getFlashSale(product);

    if (!flashSale) {
        return false;
    }

    if (flashSale.enabled !== true) {
        return false;
    }

    const startAt = parseDate(
        flashSale.startAt
    );

    const endAt = parseDate(
        flashSale.endAt
    );

    if (!startAt || !endAt) {
        return false;
    }

    if (startAt > now) {
        return false;
    }

    if (endAt <= now) {
        return false;
    }

    const salePrice = getSalePrice(product);
    const originalPrice = getProductPrice(product);
    const saleStock = getSaleStock(product);
    const soldQuantity = getSoldQuantity(product);

    if (salePrice <= 0) {
        return false;
    }

    if (originalPrice <= 0) {
        return false;
    }

    if (salePrice >= originalPrice) {
        return false;
    }

    if (saleStock <= soldQuantity) {
        return false;
    }

    return true;
}


/*==================================================
NORMALIZE PRODUCTS
==================================================*/

function normalizeProducts(data) {

    const products = [];

    if (!data || typeof data !== "object") {
        return products;
    }

    Object.entries(data).forEach(
        ([key, product]) => {

            if (!product || typeof product !== "object") {
                return;
            }

            products.push({
                ...product,
                _firebaseKey: key,
                _productId: getProductId(product, key)
            });

        }
    );

    return products;
}


/*==================================================
GET IMAGE
==================================================*/

function getProductImage(product) {

    return (
        product?.image ||
        product?.images?.[0] ||
        product?.thumbnail ||
        ""
    );
}


/*==================================================
FORMAT PRICE
==================================================*/

function formatPrice(value) {

    const number = toNumber(value, 0);

    return `Rs. ${number.toLocaleString("en-PK")}`;
}


/*==================================================
FORMAT STOCK
==================================================*/

function getRemainingStock(product) {

    const saleStock = getSaleStock(product);
    const sold = getSoldQuantity(product);

    return Math.max(
        saleStock - sold,
        0
    );
}


/*==================================================
COUNTDOWN
==================================================*/

function startCountdown(endAt, mode = "home") {

    if (!endAt) {
        return;
    }

    if (mode === "home") {
        homeSaleEndAt = endAt;
    } else {
        pageSaleEndAt = endAt;
    }

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    updateCountdown(mode);

    countdownTimer = setInterval(
        () => updateCountdown(mode),
        1000
    );
}


function updateCountdown(mode = "home") {

    const endAt =
        mode === "home"
            ? homeSaleEndAt
            : pageSaleEndAt;

    if (!endAt) {
        return;
    }

    const difference =
        endAt - Date.now();


    /*==================================================
    HOME COUNTDOWN
    ==================================================*/

    if (mode === "home") {

        const hoursElement =
            getElement("flashSaleHours");

        const minutesElement =
            getElement("flashSaleMinutes");

        const secondsElement =
            getElement("flashSaleSeconds");


        if (!hoursElement ||
            !minutesElement ||
            !secondsElement) {

            return;
        }


        if (difference <= 0) {

            hoursElement.textContent = "00";
            minutesElement.textContent = "00";
            secondsElement.textContent = "00";

            clearInterval(countdownTimer);

            loadProductsFromFirebase();

            return;
        }


        const totalSeconds =
            Math.floor(
                difference / 1000
            );

        const hours =
            Math.floor(
                totalSeconds / 3600
            );

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );

        const seconds =
            totalSeconds % 60;


        hoursElement.textContent =
            String(hours).padStart(2, "0");

        minutesElement.textContent =
            String(minutes).padStart(2, "0");

        secondsElement.textContent =
            String(seconds).padStart(2, "0");

        return;
    }


    /*==================================================
    FULL FLASH SALE PAGE COUNTDOWN
    ==================================================*/

    const daysElement =
        getElement("countdownDays");

    const hoursElement =
        getElement("countdownHours");

    const minutesElement =
        getElement("countdownMinutes");

    const secondsElement =
        getElement("countdownSeconds");


    if (
        !daysElement ||
        !hoursElement ||
        !minutesElement ||
        !secondsElement
    ) {
        return;
    }


    if (difference <= 0) {

        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        clearInterval(countdownTimer);

        loadProductsFromFirebase();

        return;
    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;


    daysElement.textContent =
        String(days).padStart(2, "0");

    hoursElement.textContent =
        String(hours).padStart(2, "0");

    minutesElement.textContent =
        String(minutes).padStart(2, "0");

    secondsElement.textContent =
        String(seconds).padStart(2, "0");
}


/*==================================================
HOME SECTION
==================================================*/

function getHomeSection() {
    return getElement("homeFlashSale");
}


function hideHomeFlashSale() {

    const section =
        getHomeSection();

    if (!section) {
        return;
    }

    section.classList.add("hidden");

    section.style.display = "none";


    const grid =
        getElement("homeFlashSaleGrid");

    if (grid) {
        grid.innerHTML = "";
    }


    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}


function showHomeFlashSale() {

    const section =
        getHomeSection();

    if (!section) {
        return;
    }

    section.classList.remove("hidden");

    section.style.display = "";
}


/*==================================================
HOME PRODUCT CARD
==================================================*/

function createHomeProductCard(product) {

    const productId =
        getProductId(
            product,
            product._firebaseKey
        );

    const image =
        getProductImage(product);

    const name =
        product?.name ||
        "Product";

    const originalPrice =
        getProductPrice(product);

    const salePrice =
        getSalePrice(product);

    const discount =
        getDiscount(product);

    const remainingStock =
        getRemainingStock(product);


    const card =
        document.createElement("article");

    card.className =
        "home-flash-sale-card";


    card.innerHTML = `

        <div class="home-flash-sale-card-image">

            ${
                discount > 0
                    ? `
                        <span class="home-flash-sale-discount">
                            -${discount}%
                        </span>
                    `
                    : ""
            }

            ${
                image
                    ? `
                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(name)}"
                            loading="lazy"
                        >
                    `
                    : `
                        <div
                            style="
                                width:100%;
                                height:100%;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:35px;
                            "
                        >
                            🛍️
                        </div>
                    `
            }

        </div>


        <div class="home-flash-sale-card-body">

            <h3 class="home-flash-sale-card-name">
                ${escapeHtml(name)}
            </h3>


            <div class="home-flash-sale-card-prices">

                <strong class="home-flash-sale-sale-price">
                    ${formatPrice(salePrice)}
                </strong>

                <span class="home-flash-sale-old-price">
                    ${formatPrice(originalPrice)}
                </span>

            </div>


            <div class="home-flash-sale-stock">

                Only
                <strong>
                    ${remainingStock}
                </strong>
                left

            </div>

        </div>

    `;


    card.addEventListener(
        "click",
        () => {

            window.location.href =
                `product-details.html?id=${encodeURIComponent(productId)}`;

        }
    );


    return card;
}


/*==================================================
ESCAPE HTML
==================================================*/

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*==================================================
RENDER HOME FLASH SALE
==================================================*/

function renderHomeFlashSale(products) {

    const section =
        getHomeSection();

    const grid =
        getElement("homeFlashSaleGrid");


    if (!section || !grid) {
        return;
    }


    if (!products.length) {

        hideHomeFlashSale();

        return;
    }


    showHomeFlashSale();


    grid.innerHTML = "";


    /*
     * Home Page پر بہت زیادہ products نہ دکھائیں۔
     * پہلے 5 active products دکھائے جائیں گے۔
     */

    products
        .slice(0, 5)
        .forEach(
            product => {

                grid.appendChild(
                    createHomeProductCard(product)
                );

            }
        );


    /*==================================================
    SINGLE COUNTDOWN
    Earliest active product ending time is used.
    ==================================================*/

    const endTimes =
        products
            .map(product =>
                parseDate(
                    getFlashSale(product)?.endAt
                )
            )
            .filter(Boolean);


    if (endTimes.length) {

        const earliestEnd =
            Math.min(...endTimes);

        startCountdown(
            earliestEnd,
            "home"
        );

    }
}


/*==================================================
FULL FLASH SALE PAGE
==================================================*/

function setupFullFlashSalePage(products) {

    const pageGrid =
        getElement("flashSaleProductGrid");

    if (!pageGrid) {
        return;
    }


    const loading =
        getElement("productsLoading");

    const empty =
        getElement("flashSaleEmpty");

    const ended =
        getElement("flashSaleEnded");


    if (loading) {
        loading.hidden = false;
    }

    if (empty) {
        empty.hidden = true;
    }

    if (ended) {
        ended.hidden = true;
    }


    allFlashSaleProducts =
        products.slice();


    if (!allFlashSaleProducts.length) {

        if (loading) {
            loading.hidden = true;
        }

        if (empty) {
            empty.hidden = false;
        }

        updateFullPageStats([]);

        return;
    }


    buildCategories(
        allFlashSaleProducts
    );


    applyFilters();


    if (loading) {
        loading.hidden = true;
    }
}


/*==================================================
FULL PAGE FILTERS
==================================================*/

function applyFilters() {

    let products =
        allFlashSaleProducts.slice();


    /* Category */

    if (currentCategory !== "all") {

        products =
            products.filter(
                product =>
                    String(
                        product?.category || ""
                    ).toLowerCase() ===
                    currentCategory.toLowerCase()
            );

    }


    /* Search */

    const searchInput =
        getElement("flashSaleSearch");

    const search =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";


    if (search) {

        products =
            products.filter(
                product => {

                    const name =
                        String(
                            product?.name || ""
                        ).toLowerCase();

                    const category =
                        String(
                            product?.category || ""
                        ).toLowerCase();

                    return (
                        name.includes(search) ||
                        category.includes(search)
                    );

                }
            );

    }


    /* Sort */

    switch (currentSort) {

        case "discount-high":

            products.sort(
                (a, b) =>
                    getDiscount(b) -
                    getDiscount(a)
            );

            break;


        case "price-low":

            products.sort(
                (a, b) =>
                    getSalePrice(a) -
                    getSalePrice(b)
            );

            break;


        case "price-high":

            products.sort(
                (a, b) =>
                    getSalePrice(b) -
                    getSalePrice(a)
            );

            break;


        case "ending-soon":

            products.sort(
                (a, b) =>
                    parseDate(
                        getFlashSale(a)?.endAt
                    ) -
                    parseDate(
                        getFlashSale(b)?.endAt
                    )
            );

            break;


        case "popular":

            products.sort(
                (a, b) =>
                    toNumber(b?.reviews, 0) -
                    toNumber(a?.reviews, 0)
            );

            break;


        case "selling-fast":

            products.sort(
                (a, b) =>
                    getSoldQuantity(b) -
                    getSoldQuantity(a)
            );

            break;


        case "featured":

        default:

            products.sort(
                (a, b) =>
                    toNumber(b?.featured, 0) -
                    toNumber(a?.featured, 0)
            );

            break;
    }


    filteredFlashSaleProducts =
        products;


    renderFullPageProducts(
        filteredFlashSaleProducts
    );

    updateFullPageStats(
        allFlashSaleProducts
    );

    renderEndingSoon(
        allFlashSaleProducts
    );

    setupFullPageCountdown(
        allFlashSaleProducts
    );
}


/*==================================================
BUILD CATEGORIES
==================================================*/

function buildCategories(products) {

    const container =
        getElement("flashSaleCategories");

    if (!container) {
        return;
    }


    const categories =
        [
            ...new Set(
                products
                    .map(
                        product =>
                            String(
                                product?.category || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );


    container.innerHTML = "";


    categories.forEach(
        category => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "category-scroll-button";

            button.dataset.category =
                category;

            button.textContent =
                category;


            button.addEventListener(
                "click",
                () => {

                    currentCategory =
                        category;

                    document
                        .querySelectorAll(
                            ".category-scroll-button"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    applyFilters();

                }
            );


            container.appendChild(
                button
            );

        }
    );


    const allButton =
        document.querySelector(
            '.category-scroll-button[data-category="all"]'
        );


    if (allButton) {

        allButton.addEventListener(
            "click",
            () => {

                currentCategory = "all";

                document
                    .querySelectorAll(
                        ".category-scroll-button"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                allButton.classList.add(
                    "active"
                );

                applyFilters();

            }
        );

    }
}


/*==================================================
FULL PRODUCT CARD
==================================================*/

function createFullProductCard(product) {

    const productId =
        getProductId(
            product,
            product._firebaseKey
        );

    const image =
        getProductImage(product);

    const name =
        product?.name ||
        "Product";

    const originalPrice =
        getProductPrice(product);

    const salePrice =
        getSalePrice(product);

    const discount =
        getDiscount(product);

    const remainingStock =
        getRemainingStock(product);


    const card =
        document.createElement("article");

    card.className =
        "flash-product-card";


    card.innerHTML = `

        <div class="flash-product-image">

            ${
                discount > 0
                    ? `
                        <span class="discount-badge">
                            -${discount}%
                        </span>
                    `
                    : ""
            }

            ${
                image
                    ? `
                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(name)}"
                            loading="lazy"
                        >
                    `
                    : `
                        <div
                            style="
                                width:100%;
                                aspect-ratio:1/1;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:45px;
                            "
                        >
                            🛍️
                        </div>
                    `
            }

        </div>


        <div class="flash-product-content">

            <h3 class="flash-product-title">
                ${escapeHtml(name)}
            </h3>


            <div class="flash-product-price">

                <strong class="sale-price">
                    ${formatPrice(salePrice)}
                </strong>

                <span class="old-price">
                    ${formatPrice(originalPrice)}
                </span>

            </div>


            <div class="flash-product-stock">

                <span>
                    ${remainingStock} left
                </span>

            </div>


            <button
                type="button"
                class="primary-button flash-product-view-button"
            >
                View Product
                <i class="fa-solid fa-arrow-right"></i>
            </button>

        </div>

    `;


    card.addEventListener(
        "click",
        event => {

            if (
                event.target.closest("button")
            ) {
                event.preventDefault();
            }

            window.location.href =
                `product-details.html?id=${encodeURIComponent(productId)}`;

        }
    );


    return card;
}


/*==================================================
RENDER FULL PRODUCTS
==================================================*/

function renderFullPageProducts(products) {

    const grid =
        getElement("flashSaleProductGrid");

    if (!grid) {
        return;
    }


    const resultCount =
        getElement("flashSaleResultsCount");

    const empty =
        getElement("flashSaleEmpty");

    const ended =
        getElement("flashSaleEnded");

    const loadMore =
        getElement("loadMoreWrapper");


    grid.innerHTML = "";


    if (resultCount) {
        resultCount.textContent =
            products.length;
    }


    if (!products.length) {

        if (empty) {
            empty.hidden = false;
        }

        if (loadMore) {
            loadMore.hidden = true;
        }

        return;
    }


    if (empty) {
        empty.hidden = true;
    }

    if (ended) {
        ended.hidden = true;
    }


    products.forEach(
        product => {

            grid.appendChild(
                createFullProductCard(product)
            );

        }
    );


    if (loadMore) {
        loadMore.hidden = true;
    }
}


/*==================================================
FULL PAGE STATS
==================================================*/

function updateFullPageStats(products) {

    const activeDeals =
        getElement("activeDealsCount");

    const hotDeals =
        getElement("hotDealsCount");

    const limitedStock =
        getElement("limitedStockCount");

    const maximumDiscount =
        getElement("maximumDiscount");


    if (activeDeals) {
        activeDeals.textContent =
            products.length;
    }


    const hotCount =
        products.filter(
            product =>
                getDiscount(product) >= 30
        ).length;


    if (hotDeals) {
        hotDeals.textContent =
            hotCount;
    }


    const limitedCount =
        products.filter(
            product =>
                getRemainingStock(product) <= 10
        ).length;


    if (limitedStock) {
        limitedStock.textContent =
            limitedCount;
    }


    const maxDiscount =
        products.length
            ? Math.max(
                ...products.map(
                    product =>
                        getDiscount(product)
                )
            )
            : 0;


    if (maximumDiscount) {
        maximumDiscount.textContent =
            `${maxDiscount}%`;
    }
}


/*==================================================
ENDING SOON
==================================================*/

function renderEndingSoon(products) {

    const container =
        getElement("endingSoonGrid");

    if (!container) {
        return;
    }


    const ending =
        products
            .slice()
            .sort(
                (a, b) =>
                    parseDate(
                        getFlashSale(a)?.endAt
                    ) -
                    parseDate(
                        getFlashSale(b)?.endAt
                    )
            )
            .slice(0, 4);


    container.innerHTML = "";


    ending.forEach(
        product => {

            container.appendChild(
                createFullProductCard(product)
            );

        }
    );
}


/*==================================================
FULL PAGE COUNTDOWN
==================================================*/

function setupFullPageCountdown(products) {

    const endTimes =
        products
            .map(
                product =>
                    parseDate(
                        getFlashSale(product)?.endAt
                    )
            )
            .filter(Boolean);


    if (!endTimes.length) {
        return;
    }


    const earliestEnd =
        Math.min(...endTimes);


    startCountdown(
        earliestEnd,
        "page"
    );
}


/*==================================================
SEARCH
==================================================*/

function setupSearch() {

    const form =
        getElement("flashSaleSearchForm");

    const input =
        getElement("flashSaleSearch");


    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            applyFilters();

        }
    );


    input.addEventListener(
        "input",
        () => {

            applyFilters();

        }
    );
}


/*==================================================
SORT
==================================================*/

function setupSort() {

    const select =
        getElement("flashSaleSort");

    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            currentSort =
                select.value;

            applyFilters();

        }
    );
}


/*==================================================
LOAD PRODUCTS FROM FIREBASE
==================================================*/

function loadProductsFromFirebase() {

    const productsRef =
        ref(
            database,
            PRODUCTS_PATH
        );


    onValue(
        productsRef,
        snapshot => {

            const data =
                snapshot.val();


            const products =
                normalizeProducts(data);


            const now =
                Date.now();


            const activeProducts =
                products.filter(
                    product =>
                        isActiveFlashSale(
                            product,
                            now
                        )
                );


            /*
             * HOME PAGE
             */

            renderHomeFlashSale(
                activeProducts
            );


            /*
             * FULL FLASH SALE PAGE
             */

            if (
                getElement(
                    "flashSaleProductGrid"
                )
            ) {

                setupFullFlashSalePage(
                    activeProducts
                );

            }

        },

        error => {

            console.error(
                "SmartBazaar Flash Sale Firebase Error:",
                error
            );


            /*
             * اگر Firebase error دے
             * تو Home پر blank/loading نہیں رہے گی۔
             */

            hideHomeFlashSale();


            const loading =
                getElement(
                    "productsLoading"
                );

            if (loading) {
                loading.hidden = true;
            }


            const empty =
                getElement(
                    "flashSaleEmpty"
                );

            if (empty) {
                empty.hidden = false;
            }

        }
    );
}


/*==================================================
INITIALIZE
==================================================*/

function initializeFlashSale() {

    /*
     * Home Flash Sale کو شروع میں ہی hide کریں۔
     * Active sale ملنے پر JS خود show کرے گا۔
     */

    if (getHomeSection()) {
        hideHomeFlashSale();
    }


    setupSearch();
    setupSort();


    /*
     * Firebase سے real data شروع کریں۔
     */

    loadProductsFromFirebase();
}


/*==================================================
START
==================================================*/

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFlashSale
    );

} else {

    initializeFlashSale();

}


/*==================================================
GLOBAL API
==================================================*/

window.SmartBazaarFlashSale = {

    reload: loadProductsFromFirebase,

    getActiveProducts: () =>
        allFlashSaleProducts.slice()

};
