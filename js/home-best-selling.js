/* ============================================
   FEATURE: BEST SELLING HOME SECTION
   ============================================ */

import { database } from "../firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/* ============================================
   DATABASE PATHS
   ============================================ */

const PRODUCTS_PATH = "products";
const ORDERS_PATH = "orders";

const MAX_HOME_PRODUCTS = 4;


/* ============================================
   ELEMENTS
   ============================================ */

const section =
    document.getElementById("homeBestSelling");

const grid =
    document.getElementById("homeBestSellingGrid");

const loading =
    document.getElementById("homeBestSellingLoading");

const empty =
    document.getElementById("homeBestSellingEmpty");


/* ============================================
   START
   ============================================ */

if (!section || !grid) {

    console.warn(
        "Best Selling section elements were not found."
    );

} else {

    loadBestSellingProducts();

}


/* ============================================
   LOAD PRODUCTS + ORDERS
   ============================================ */

function loadBestSellingProducts() {

    const productsRef =
        ref(
            database,
            PRODUCTS_PATH
        );

    const ordersRef =
        ref(
            database,
            ORDERS_PATH
        );


    let productsData = null;
    let ordersData = null;

    let productsLoaded = false;
    let ordersLoaded = false;


    /* ------------------------------------------
       PRODUCTS
       ------------------------------------------ */

    onValue(
        productsRef,
        (snapshot) => {

            productsData =
                snapshot.val();

            productsLoaded = true;

            processBestSelling();

        },
        (error) => {

            console.error(
                "Best Selling products failed to load:",
                error
            );

            hideBestSellingSection();

        }
    );


    /* ------------------------------------------
       ORDERS
       ------------------------------------------ */

    onValue(
        ordersRef,
        (snapshot) => {

            ordersData =
                snapshot.val();

            ordersLoaded = true;

            processBestSelling();

        },
        (error) => {

            console.error(
                "Best Selling orders failed to load:",
                error
            );

            hideBestSellingSection();

        }
    );


    /* ------------------------------------------
       PROCESS ONLY AFTER BOTH LOAD
       ------------------------------------------ */

    function processBestSelling() {

        if (
            !productsLoaded ||
            !ordersLoaded
        ) {
            return;
        }


        const products =
            getPublishedProducts(
                productsData
            );


        const salesMap =
            calculatePaidSales(
                ordersData
            );


        /*
         * Only products that have REAL
         * paid sales can appear here.
         */

        const bestSellingProducts =
            products

                .map(product => {

                    const soldQuantity =
                        Number(
                            salesMap[product.id] || 0
                        );

                    return {
                        ...product,
                        soldQuantity
                    };

                })

                .filter(
                    product =>
                        product.soldQuantity > 0
                )

                .sort(
                    (a, b) => {

                        if (
                            b.soldQuantity !==
                            a.soldQuantity
                        ) {

                            return (
                                b.soldQuantity -
                                a.soldQuantity
                            );
                        }


                        return (
                            Number(b.createdAt || 0) -
                            Number(a.createdAt || 0)
                        );

                    }
                )

                .slice(
                    0,
                    MAX_HOME_PRODUCTS
                );


        loading.hidden = true;


        /*
         * No real sales =
         * hide entire section.
         */

        if (
            !bestSellingProducts.length
        ) {

            grid.innerHTML = "";

            if (empty) {
                empty.hidden = true;
            }

            section.style.display = "none";

            return;
        }


        if (empty) {
            empty.hidden = true;
        }


        section.style.display = "";


        renderProducts(
            bestSellingProducts
        );

    }

}


/* ============================================
   GET PUBLISHED PRODUCTS
   ============================================ */

function getPublishedProducts(
    data
) {

    const products = [];


    if (
        !data ||
        typeof data !== "object"
    ) {
        return products;
    }


    Object.entries(data).forEach(
        ([id, product]) => {

            if (
                !product ||
                typeof product !== "object"
            ) {
                return;
            }


            /*
             * Existing product publishing field.
             */

            if (
                product.published === false
            ) {
                return;
            }


            const price =
                Number(
                    product.price || 0
                );


            if (
                !price ||
                price <= 0
            ) {
                return;
            }


            products.push({

                id,

                ...product

            });

        }
    );


    return products;

}


/* ============================================
   CALCULATE REAL PAID SALES
   ============================================ */

function calculatePaidSales(
    ordersData
) {

    const salesMap = {};


    if (
        !ordersData ||
        typeof ordersData !== "object"
    ) {
        return salesMap;
    }


    Object.values(ordersData).forEach(
        order => {

            if (
                !order ||
                typeof order !== "object"
            ) {
                return;
            }


            /*
             * Only confirmed paid orders
             * are counted as sales.
             */

            const paymentStatus =
                String(
                    order.paymentStatus || ""
                ).toLowerCase();


            if (
                paymentStatus !== "paid"
            ) {
                return;
            }


            const productId =
                order.productId;


            if (!productId) {
                return;
            }


            const quantity =
                Number(
                    order.quantity || 0
                );


            if (
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                return;
            }


            if (
                !salesMap[productId]
            ) {
                salesMap[productId] = 0;
            }


            salesMap[productId] += quantity;

        }
    );


    return salesMap;

}


/* ============================================
   RENDER PRODUCTS
   ============================================ */

function renderProducts(
    products
) {

    grid.innerHTML = "";


    products.forEach(
        product => {

            const card =
                document.createElement("a");


            card.className =
                "home-best-selling-card";


            card.href =
                `product-details.html?id=${encodeURIComponent(
                    product.id
                )}`;


            /* ----------------------------------
               IMAGE
               ---------------------------------- */

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
                product.name ||
                "Product";


            image.loading =
                "lazy";


            image.onerror =
                function () {

                    this.onerror = null;

                    this.src =
                        "https://via.placeholder.com/400x400?text=Product";

                };


            imageWrap.appendChild(
                image
            );


            /* ----------------------------------
               SOLD BADGE
               ---------------------------------- */

            const soldBadge =
                document.createElement("div");


            soldBadge.className =
                "home-best-selling-badge";


            soldBadge.textContent =
                `${product.soldQuantity} sold`;


            imageWrap.appendChild(
                soldBadge
            );


            /* ----------------------------------
               CONTENT
               ---------------------------------- */

            const content =
                document.createElement("div");


            content.className =
                "home-best-selling-content";


            const name =
                document.createElement("h3");


            name.className =
                "home-best-selling-name";


            name.textContent =
                product.name ||
                "Product";


            /* ----------------------------------
               PRICE
               ---------------------------------- */

            const priceRow =
                document.createElement("div");


            priceRow.className =
                "home-best-selling-price-row";


            const price =
                document.createElement("span");


            price.className =
                "home-best-selling-price";


            price.textContent =
                formatPrice(
                    product.price
                );


            priceRow.appendChild(
                price
            );


            const oldPrice =
                Number(
                    product.oldPrice || 0
                );


            if (
                oldPrice >
                Number(product.price || 0)
            ) {

                const oldPriceElement =
                    document.createElement("span");


                oldPriceElement.className =
                    "home-best-selling-old-price";


                oldPriceElement.textContent =
                    formatPrice(
                        oldPrice
                    );


                priceRow.appendChild(
                    oldPriceElement
                );

            }


            /* ----------------------------------
               SALES TEXT
               ---------------------------------- */

            const salesText =
                document.createElement("div");


            salesText.className =
                "home-best-selling-rating";


            salesText.textContent =
                `${product.soldQuantity} sold`;


            /* ----------------------------------
               APPEND
               ---------------------------------- */

            content.appendChild(
                name
            );

            content.appendChild(
                priceRow
            );

            content.appendChild(
                salesText
            );


            card.appendChild(
                imageWrap
            );

            card.appendChild(
                content
            );


            grid.appendChild(
                card
            );

        }
    );

}


/* ============================================
   HIDE SECTION
   ============================================ */

function hideBestSellingSection() {

    if (loading) {
        loading.hidden = true;
    }

    if (grid) {
        grid.innerHTML = "";
    }

    if (section) {
        section.style.display = "none";
    }

}


/* ============================================
   PRICE FORMAT
   ============================================ */

function formatPrice(
    value
) {

    const number =
        Number(
            value || 0
        );


    return `Rs. ${number.toLocaleString(
        "en-PK"
    )}`;

}
