/* ============================================
   FEATURE: BEST DEALS HOME SECTION
   ============================================ */

import {
    database
} from "../firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/* ============================================
   CONFIGURATION
   ============================================ */

const PRODUCTS_PATH = "products";
const MAX_HOME_PRODUCTS = 4;


/* ============================================
   DOM ELEMENTS
   ============================================ */

const section = document.getElementById("homeBestDeals");
const grid = document.getElementById("homeBestDealsGrid");
const loading = document.getElementById("homeBestDealsLoading");
const empty = document.getElementById("homeBestDealsEmpty");


/* ============================================
   SAFETY CHECK
   ============================================ */

if (!section || !grid) {
    console.warn("Best Deals section elements were not found.");
} else {
    initBestDeals();
}


/* ============================================
   INITIALIZE
   ============================================ */

function initBestDeals() {

    showLoading();

    const productsRef = ref(database, PRODUCTS_PATH);

    onValue(
        productsRef,
        (snapshot) => {

            try {

                const productsData = snapshot.val();

                const products = normalizeProducts(productsData);

                const bestDeals = getBestDeals(products);

                if (bestDeals.length === 0) {
                    hideSection();
                    return;
                }

                renderBestDeals(bestDeals);

            } catch (error) {

                console.error(
                    "Best Deals loading error:",
                    error
                );

                hideSection();
            }
        },
        (error) => {

            console.error(
                "Firebase Best Deals error:",
                error
            );

            hideSection();
        }
    );
}


/* ============================================
   NORMALIZE PRODUCTS
   ============================================ */

function normalizeProducts(data) {

    if (!data) {
        return [];
    }

    return Object.entries(data).map(
        ([productId, product]) => {

            return {
                ...product,
                productId:
                    product?.productId ||
                    productId
            };
        }
    );
}


/* ============================================
   FIND BEST DEALS
   ============================================ */

function getBestDeals(products) {

    const deals = products
        .filter(product => {

            if (!product) {
                return false;
            }

            /*
             * Product must be published.
             */
            if (
                product.published === false ||
                product.published === "false"
            ) {
                return false;
            }

            const price = Number(product.price);
            const oldPrice = Number(product.oldPrice);

            /*
             * A valid deal needs both
             * current price and old price.
             */
            if (
                !Number.isFinite(price) ||
                !Number.isFinite(oldPrice)
            ) {
                return false;
            }

            if (price <= 0 || oldPrice <= 0) {
                return false;
            }

            /*
             * Current price must be lower
             * than the original price.
             */
            if (price >= oldPrice) {
                return false;
            }

            return true;
        })
        .map(product => {

            const price = Number(product.price);
            const oldPrice = Number(product.oldPrice);

            const discount =
                ((oldPrice - price) / oldPrice) * 100;

            const saving = oldPrice - price;

            return {
                ...product,
                calculatedDiscount: discount,
                calculatedSaving: saving
            };
        })
        .filter(product =>
            product.calculatedDiscount > 0
        )
        .sort(
            (a, b) =>
                b.calculatedDiscount -
                a.calculatedDiscount
        );

    return deals.slice(0, MAX_HOME_PRODUCTS);
}


/* ============================================
   RENDER PRODUCTS
   ============================================ */

function renderBestDeals(products) {

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    products.forEach(product => {

        const card =
            createProductCard(product);

        grid.appendChild(card);

    });

    hideLoading();

    if (empty) {
        empty.hidden = true;
    }

    section.hidden = false;
}


/* ============================================
   CREATE PRODUCT CARD
   ============================================ */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "home-best-deal-card";

    const productId =
        product.productId || "";

    const name =
        product.name ||
        "Product";

    const image =
        product.image ||
        "https://via.placeholder.com/500x500?text=Product";

    const price =
        Number(product.price);

    const oldPrice =
        Number(product.oldPrice);

    const discount =
        Math.round(
            Number(product.calculatedDiscount)
        );

    const saving =
        Number(product.calculatedSaving);


    card.innerHTML = `
        <a
            href="product-details.html?id=${encodeURIComponent(productId)}"
            class="home-best-deal-product-link"
            aria-label="${escapeHTML(name)}"
        >

            <div class="home-best-deal-image-wrap">

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeHTML(name)}"
                    class="home-best-deal-image"
                    loading="lazy"
                >

                <span class="home-best-deal-discount">
                    ${discount}% OFF
                </span>

            </div>

            <div class="home-best-deal-content">

                <h3 class="home-best-deal-name">
                    ${escapeHTML(name)}
                </h3>

                <div class="home-best-deal-price-row">

                    <span class="home-best-deal-price">
                        ${formatPrice(price)}
                    </span>

                    <span class="home-best-deal-old-price">
                        ${formatPrice(oldPrice)}
                    </span>

                </div>

                <div class="home-best-deal-saving">
                    Save ${formatPrice(saving)}
                </div>

            </div>

        </a>
    `;

    return card;
}


/* ============================================
   FORMAT PRICE
   ============================================ */

function formatPrice(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "Rs. 0";
    }

    return `Rs. ${number.toLocaleString("en-PK")}`;
}


/* ============================================
   ESCAPE HTML
   ============================================ */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================
   ESCAPE ATTRIBUTE
   ============================================ */

function escapeAttribute(value) {

    return String(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================
   LOADING
   ============================================ */

function showLoading() {

    section.hidden = false;

    if (loading) {
        loading.style.display = "flex";
    }

    if (grid) {
        grid.style.display = "none";
    }

    if (empty) {
        empty.hidden = true;
    }
}


/* ============================================
   HIDE LOADING
   ============================================ */

function hideLoading() {

    if (loading) {
        loading.style.display = "none";
    }

    if (grid) {
        grid.style.display = "flex";
    }
}


/* ============================================
   HIDE COMPLETE SECTION
   ============================================ */

function hideSection() {

    if (loading) {
        loading.style.display = "none";
    }

    if (empty) {
        empty.hidden = true;
    }

    if (grid) {
        grid.innerHTML = "";
    }

    /*
     * Important:
     * No empty space should remain
     * when there are no deals.
     */
    section.hidden = true;
}
