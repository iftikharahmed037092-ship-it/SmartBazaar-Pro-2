/* ============================================
   FEATURE: POPULAR STORES HOME SECTION
   ============================================ */

import { database } from "../firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


const PRODUCTS_PATH = "products";
const MAX_HOME_STORES = 4;

const section =
    document.getElementById("homePopularStores");

const grid =
    document.getElementById("homePopularStoresGrid");

const loading =
    document.getElementById("homePopularStoresLoading");

const empty =
    document.getElementById("homePopularStoresEmpty");


if (!section || !grid) {

    console.warn(
        "Popular Stores section elements were not found."
    );

} else {

    loadPopularStores();

}


/* ============================================
   LOAD POPULAR STORES
   ============================================ */

function loadPopularStores() {

    const productsRef =
        ref(database, PRODUCTS_PATH);

    onValue(
        productsRef,
        (snapshot) => {

            const data = snapshot.val();

            const stores = {};


            if (data && typeof data === "object") {

                Object.entries(data).forEach(
                    ([productId, product]) => {

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


                        /*
                         * sellerId is the existing permanent
                         * seller identifier in SmartBazaar.
                         */
                        const sellerId =
                            product.sellerId;


                        if (!sellerId) {
                            return;
                        }


                        if (!stores[sellerId]) {

                            stores[sellerId] = {
                                sellerId,
                                productCount: 0,

                                /*
                                 * Use seller information already
                                 * present on the product when available.
                                 */
                                name:
                                    product.sellerName ||
                                    product.storeName ||
                                    "Store",

                                image:
                                    product.sellerImage ||
                                    product.storeImage ||
                                    ""
                            };

                        }


                        stores[sellerId].productCount += 1;


                        /*
                         * If a later product contains seller
                         * display information, use it.
                         */
                        if (
                            product.sellerName ||
                            product.storeName
                        ) {

                            stores[sellerId].name =
                                product.sellerName ||
                                product.storeName;

                        }


                        if (
                            !stores[sellerId].image &&
                            (
                                product.sellerImage ||
                                product.storeImage
                            )
                        ) {

                            stores[sellerId].image =
                                product.sellerImage ||
                                product.storeImage;

                        }

                    }
                );

            }


            /*
             * Stores with more published products are
             * considered more established/popular for
             * this Home preview until real sales data
             * is connected.
             */
            const storeList =
                Object.values(stores);


            storeList.sort((a, b) => {

                if (
                    b.productCount !==
                    a.productCount
                ) {

                    return (
                        b.productCount -
                        a.productCount
                    );

                }


                return String(a.name).localeCompare(
                    String(b.name)
                );

            });


            const popularStores =
                storeList.slice(
                    0,
                    MAX_HOME_STORES
                );


            loading.hidden = true;


            /*
             * No stores:
             * hide the complete section.
             */

            if (!popularStores.length) {

                grid.innerHTML = "";

                empty.hidden = true;

                section.style.display = "none";

                return;
            }


            empty.hidden = true;

            section.style.display = "";


            renderStores(popularStores);

        },

        (error) => {

            console.error(
                "Popular Stores failed to load:",
                error
            );


            loading.hidden = true;

            grid.innerHTML = "";

            empty.hidden = true;

            section.style.display = "none";

        }
    );

}


/* ============================================
   RENDER STORES
   ============================================ */

function renderStores(stores) {

    grid.innerHTML = "";


    stores.forEach((store) => {

        const card =
            document.createElement("a");


        card.className =
            "home-popular-store-card";


        /*
         * Uses the existing seller UID model.
         */
        card.href =
            `seller-store.html?sellerId=${encodeURIComponent(
                store.sellerId
            )}`;


        /* Store avatar */

        const avatar =
            document.createElement("div");

        avatar.className =
            "home-popular-store-avatar";


        if (store.image) {

            const image =
                document.createElement("img");

            image.src =
                store.image;

            image.alt =
                store.name || "Store";

            image.loading = "lazy";


            image.onerror = function () {

                this.onerror = null;

                this.style.display = "none";

                showStorePlaceholder(avatar);

            };


            avatar.appendChild(image);

        } else {

            showStorePlaceholder(avatar);

        }


        /* Store name */

        const name =
            document.createElement("h3");

        name.className =
            "home-popular-store-name";

        name.textContent =
            store.name || "Store";


        /* Product count */

        const products =
            document.createElement("p");

        products.className =
            "home-popular-store-products";

        products.textContent =
            `${store.productCount} product${
                store.productCount === 1 ? "" : "s"
            }`;


        /* Store link */

        const link =
            document.createElement("span");

        link.className =
            "home-popular-store-link";

        link.textContent =
            "Visit Store →";


        card.appendChild(avatar);

        card.appendChild(name);

        card.appendChild(products);

        card.appendChild(link);


        grid.appendChild(card);

    });

}


/* ============================================
   STORE PLACEHOLDER
   ============================================ */

function showStorePlaceholder(avatar) {

    const placeholder =
        document.createElement("span");

    placeholder.className =
        "home-popular-store-placeholder";

    placeholder.textContent =
        "🏪";

    avatar.appendChild(placeholder);

}
