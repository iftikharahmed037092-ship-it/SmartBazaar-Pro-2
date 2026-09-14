/* ============================================
   FEATURE: BEST SELLING HOME SECTION
   ============================================ */

import { database } from "../firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


const PRODUCTS_PATH = "products";

const MAX_HOME_PRODUCTS = 4;

const section = document.getElementById("homeBestSelling");
const grid = document.getElementById("homeBestSellingGrid");
const loading = document.getElementById("homeBestSellingLoading");
const empty = document.getElementById("homeBestSellingEmpty");


if (!section || !grid) {
    console.warn("Best Selling section elements were not found.");
} else {

    loadBestSellingProducts();

}


/* ============================================
   LOAD PRODUCTS
   ============================================ */

function loadBestSellingProducts() {

    const productsRef = ref(database, PRODUCTS_PATH);

    onValue(
        productsRef,
        (snapshot) => {

            const data = snapshot.val();

            const products = [];

            if (data && typeof data === "object") {

                Object.entries(data).forEach(([id, product]) => {

                    if (!product || typeof product !== "object") {
                        return;
                    }

                    /* Only published products */
                    if (product.published === false) {
                        return;
                    }

                    const price = Number(product.price || 0);

                    if (!price || price <= 0) {
                        return;
                    }

                    products.push({
                        id,
                        ...product
                    });

                });

            }


            /*
             * Until the real order/sales system is connected,
             * use existing product information to create a
             * stable popularity-style order.
             *
             * No new Firebase fields are created here.
             */

            products.sort((a, b) => {

                const ratingA = Number(a.rating || 0);
                const ratingB = Number(b.rating || 0);

                const reviewsA = Number(a.reviews || 0);
                const reviewsB = Number(b.reviews || 0);

                const scoreA =
                    (ratingA * 10) +
                    Math.min(reviewsA, 100);

                const scoreB =
                    (ratingB * 10) +
                    Math.min(reviewsB, 100);

                if (scoreB !== scoreA) {
                    return scoreB - scoreA;
                }

                return Number(b.createdAt || 0) -
                       Number(a.createdAt || 0);

            });


            const bestSellingProducts =
                products.slice(0, MAX_HOME_PRODUCTS);


            loading.hidden = true;


            if (!bestSellingProducts.length) {

                grid.innerHTML = "";

                empty.hidden = false;

                /*
                 * Hide the entire section if there
                 * are no suitable products.
                 */

                section.style.display = "none";

                return;
            }


            empty.hidden = true;

            section.style.display = "";


            renderProducts(bestSellingProducts);

        },
        (error) => {

            console.error(
                "Best Selling products failed to load:",
                error
            );

            loading.hidden = true;

            grid.innerHTML = "";

            empty.hidden = true;

            /*
             * If Firebase fails, don't leave an
             * empty broken section on the Home Page.
             */

            section.style.display = "none";

        }
    );

}


/* ============================================
   RENDER PRODUCTS
   ============================================ */

function renderProducts(products) {

    grid.innerHTML = "";

    products.forEach((product) => {

        const card = document.createElement("a");

        card.className = "home-best-selling-card";

        card.href =
            `product-details.html?id=${encodeURIComponent(product.id)}`;


        const imageWrap =
            document.createElement("div");

        imageWrap.className =
            "home-best-selling-image-wrap";


        const image =
            document.createElement("img");

        image.className =
            "home-best-selling-image";

        image.src =
            product.image ||
            "https://via.placeholder.com/400x400?text=Product";

        image.alt =
            product.name || "Product";

        image.loading = "lazy";


        image.onerror = function () {

            this.onerror = null;

            this.src =
                "https://via.placeholder.com/400x400?text=Product";

        };


        imageWrap.appendChild(image);


        /*
         * Show rating badge only when
         * existing rating data is available.
         */

        const rating =
            Number(product.rating || 0);

        if (rating > 0) {

            const badge =
                document.createElement("div");

            badge.className =
                "home-best-selling-badge";

            badge.textContent =
                `★ ${rating.toFixed(1)}`;

            imageWrap.appendChild(badge);

        }


        const content =
            document.createElement("div");

        content.className =
            "home-best-selling-content";


        const name =
            document.createElement("h3");

        name.className =
            "home-best-selling-name";

        name.textContent =
            product.name || "Product";


        const priceRow =
            document.createElement("div");

        priceRow.className =
            "home-best-selling-price-row";


        const price =
            document.createElement("span");

        price.className =
            "home-best-selling-price";

        price.textContent =
            formatPrice(product.price);


        priceRow.appendChild(price);


        const oldPrice =
            Number(product.oldPrice || 0);

        if (oldPrice > Number(product.price || 0)) {

            const oldPriceElement =
                document.createElement("span");

            oldPriceElement.className =
                "home-best-selling-old-price";

            oldPriceElement.textContent =
                formatPrice(oldPrice);

            priceRow.appendChild(oldPriceElement);

        }


        const reviews =
            Number(product.reviews || 0);


        const ratingText =
            document.createElement("div");

        ratingText.className =
            "home-best-selling-rating";


        if (rating > 0 && reviews > 0) {

            ratingText.textContent =
                `★ ${rating.toFixed(1)} · ${reviews} reviews`;

        } else if (rating > 0) {

            ratingText.textContent =
                `★ ${rating.toFixed(1)}`;

        } else {

            ratingText.textContent =
                "Popular product";

        }


        content.appendChild(name);

        content.appendChild(priceRow);

        content.appendChild(ratingText);


        card.appendChild(imageWrap);

        card.appendChild(content);


        grid.appendChild(card);

    });

}


/* ============================================
   PRICE FORMAT
   ============================================ */

function formatPrice(value) {

    const number =
        Number(value || 0);

    return `Rs. ${number.toLocaleString("en-PK")}`;

}
