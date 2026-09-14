/* ============================================
   FEATURE: NEW ARRIVALS HOME SECTION
   ============================================ */

import { database } from "../firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


const PRODUCTS_PATH = "products";
const MAX_HOME_PRODUCTS = 4;

const section =
    document.getElementById("homeNewArrivals");

const grid =
    document.getElementById("homeNewArrivalsGrid");

const loading =
    document.getElementById("homeNewArrivalsLoading");

const empty =
    document.getElementById("homeNewArrivalsEmpty");


if (!section || !grid) {

    console.warn(
        "New Arrivals section elements were not found."
    );

} else {

    loadNewArrivals();

}


/* ============================================
   LOAD NEW ARRIVALS
   ============================================ */

function loadNewArrivals() {

    const productsRef =
        ref(database, PRODUCTS_PATH);

    onValue(
        productsRef,
        (snapshot) => {

            const data = snapshot.val();

            const products = [];


            if (data && typeof data === "object") {

                Object.entries(data).forEach(
                    ([id, product]) => {

                        if (
                            !product ||
                            typeof product !== "object"
                        ) {
                            return;
                        }


                        /* Only published products */
                        if (product.published === false) {
                            return;
                        }


                        const price =
                            Number(product.price || 0);


                        if (!price || price <= 0) {
                            return;
                        }


                        products.push({
                            id,
                            ...product
                        });

                    }
                );

            }


            /*
             * New Arrivals are determined only
             * from the existing createdAt field.
             */

            products.sort((a, b) => {

                return Number(b.createdAt || 0) -
                       Number(a.createdAt || 0);

            });


            const newArrivals =
                products.slice(
                    0,
                    MAX_HOME_PRODUCTS
                );


            loading.hidden = true;


            /*
             * No products:
             * hide the complete section.
             */

            if (!newArrivals.length) {

                grid.innerHTML = "";

                empty.hidden = true;

                section.style.display = "none";

                return;
            }


            empty.hidden = true;

            section.style.display = "";


            renderProducts(newArrivals);

        },

        (error) => {

            console.error(
                "New Arrivals failed to load:",
                error
            );


            loading.hidden = true;

            grid.innerHTML = "";

            empty.hidden = true;


            /*
             * Never leave a broken/loading
             * section on the Home Page.
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

        const card =
            document.createElement("a");


        card.className =
            "home-new-arrival-card";


        card.href =
            `product-details.html?id=${encodeURIComponent(
                product.id
            )}`;


        /* Product image */

        const imageWrap =
            document.createElement("div");

        imageWrap.className =
            "home-new-arrival-image-wrap";


        const image =
            document.createElement("img");

        image.className =
            "home-new-arrival-image";


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


        /* NEW badge */

        const badge =
            document.createElement("div");

        badge.className =
            "home-new-arrival-badge";

        badge.textContent =
            "NEW";


        imageWrap.appendChild(badge);


        /* Product content */

        const content =
            document.createElement("div");

        content.className =
            "home-new-arrival-content";


        const name =
            document.createElement("h3");

        name.className =
            "home-new-arrival-name";

        name.textContent =
            product.name || "Product";


        const priceRow =
            document.createElement("div");

        priceRow.className =
            "home-new-arrival-price-row";


        const price =
            document.createElement("span");

        price.className =
            "home-new-arrival-price";

        price.textContent =
            formatPrice(product.price);


        priceRow.appendChild(price);


        /* Old price */

        const oldPrice =
            Number(product.oldPrice || 0);


        if (
            oldPrice >
            Number(product.price || 0)
        ) {

            const oldPriceElement =
                document.createElement("span");

            oldPriceElement.className =
                "home-new-arrival-old-price";

            oldPriceElement.textContent =
                formatPrice(oldPrice);

            priceRow.appendChild(
                oldPriceElement
            );

        }


        /* Rating */

        const rating =
            Number(product.rating || 0);

        const reviews =
            Number(product.reviews || 0);


        const ratingElement =
            document.createElement("div");

        ratingElement.className =
            "home-new-arrival-rating";


        if (rating > 0 && reviews > 0) {

            ratingElement.textContent =
                `★ ${rating.toFixed(1)} · ${reviews} reviews`;

        } else if (rating > 0) {

            ratingElement.textContent =
                `★ ${rating.toFixed(1)}`;

        } else {

            ratingElement.textContent =
                "New product";

        }


        content.appendChild(name);

        content.appendChild(priceRow);

        content.appendChild(ratingElement);


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
