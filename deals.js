/*==================================================
SMARTBAZAAR PRO 2
FEATURE: DEALS PAGE SYSTEM
FEATURE: FIREBASE DEALS INTEGRATION
FEATURE: DEAL PRODUCT CARDS
FEATURE: DEAL WISHLIST INTEGRATION
FEATURE: DEAL CART INTEGRATION
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
    onValue,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: FIREBASE AUTH METHODS
==================================================*/

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const dealsSearch =
    document.getElementById(
        "dealsSearch"
    );

const dealsCategory =
    document.getElementById(
        "dealsCategory"
    );

const dealsDiscount =
    document.getElementById(
        "dealsDiscount"
    );

const dealsSort =
    document.getElementById(
        "dealsSort"
    );

const dealsResultCount =
    document.getElementById(
        "dealsResultCount"
    );

const dealsLoading =
    document.getElementById(
        "dealsLoading"
    );

const dealsError =
    document.getElementById(
        "dealsError"
    );

const dealsEmpty =
    document.getElementById(
        "dealsEmpty"
    );

const dealsEmptyText =
    document.getElementById(
        "dealsEmptyText"
    );

const retryDealsButton =
    document.getElementById(
        "retryDealsButton"
    );

const dealsGrid =
    document.getElementById(
        "dealsGrid"
    );

const bestDealsSection =
    document.getElementById(
        "bestDealsSection"
    );

const bestDealsGrid =
    document.getElementById(
        "bestDealsGrid"
    );

const bestDealsCount =
    document.getElementById(
        "bestDealsCount"
    );

const almostSoldOutSection =
    document.getElementById(
        "almostSoldOutSection"
    );

const almostSoldOutGrid =
    document.getElementById(
        "almostSoldOutGrid"
    );

const almostSoldOutCount =
    document.getElementById(
        "almostSoldOutCount"
    );


/*==================================================
FEATURE: SYSTEM STATE
==================================================*/

let allDeals = [];

let filteredDeals = [];

let currentUser = null;

let wishlistIds = new Set();

let firebaseProductsListener = null;


/*==================================================
FEATURE: GET PRODUCT ID
==================================================*/

function getProductId(
    product
) {

    return String(
        product?.productId ||
        product?.id ||
        product?._key ||
        ""
    );

}


/*==================================================
FEATURE: GET PRODUCT NAME
==================================================*/

function getProductName(
    product
) {

    return (
        product?.name ||
        product?.title ||
        product?.productName ||
        "Unnamed Product"
    );

}


/*==================================================
FEATURE: GET PRODUCT IMAGE
==================================================*/

function getProductImage(
    product
) {

    if (
        typeof product?.image === "string" &&
        product.image.trim()
    ) {

        return product.image.trim();

    }


    if (
        typeof product?.imageUrl === "string" &&
        product.imageUrl.trim()
    ) {

        return product.imageUrl.trim();

    }


    if (
        typeof product?.thumbnail === "string" &&
        product.thumbnail.trim()
    ) {

        return product.thumbnail.trim();

    }


    if (
        Array.isArray(product?.images)
    ) {

        const image =
            product.images.find(
                item =>
                    typeof item === "string" &&
                    item.trim()
            );


        if (image) {

            return image.trim();

        }

    }


    if (
        product?.images &&
        typeof product.images === "object" &&
        !Array.isArray(product.images)
    ) {

        const image =
            Object.values(
                product.images
            ).find(
                item =>
                    typeof item === "string" &&
                    item.trim()
            );


        if (image) {

            return image.trim();

        }

    }


    return "https://via.placeholder.com/600x600?text=Product";

}


/*==================================================
FEATURE: GET PRICE
==================================================*/

function getPrice(
    product
) {

    return Number(
        product?.price ??
        product?.salePrice ??
        product?.currentPrice ??
        0
    ) || 0;

}


/*==================================================
FEATURE: GET OLD PRICE
==================================================*/

function getOldPrice(
    product
) {

    return Number(
        product?.oldPrice ??
        product?.originalPrice ??
        product?.regularPrice ??
        product?.compareAtPrice ??
        0
    ) || 0;

}


/*==================================================
FEATURE: GET DISCOUNT
==================================================*/

function getDiscount(
    product
) {

    const price =
        getPrice(
            product
        );

    const oldPrice =
        getOldPrice(
            product
        );


    const storedDiscount =
        Number(
            product?.discount
        );


    if (
        Number.isFinite(storedDiscount) &&
        storedDiscount > 0
    ) {

        return Math.min(
            100,
            Math.round(
                storedDiscount
            )
        );

    }


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        return Math.min(
            100,
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
            )
        );

    }


    return 0;

}


/*==================================================
FEATURE: GET STOCK
==================================================*/

function getStock(
    product
) {

    const stockValues = [
        product?.stock,
        product?.stockQuantity,
        product?.quantity
    ];


    for (
        const value of stockValues
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const stock =
                Number(value);


            if (
                Number.isFinite(stock)
            ) {

                return Math.max(
                    0,
                    stock
                );

            }

        }

    }


    if (
        product?.inStock === true ||
        product?.available === true
    ) {

        return 1;

    }


    return 0;

}


/*==================================================
FEATURE: GET LOW STOCK LIMIT
==================================================*/

function getLowStockLimit(
    product
) {

    const limit =
        Number(
            product?.lowStockLimit
        );


    if (
        Number.isFinite(limit) &&
        limit > 0
    ) {

        return limit;

    }


    return 5;

}


/*==================================================
FEATURE: PRODUCT DEAL CHECK
==================================================*/

function isValidDeal(
    product
) {

    if (
        !product ||
        product.published !== true
    ) {

        return false;

    }


    const price =
        getPrice(
            product
        );

    const oldPrice =
        getOldPrice(
            product
        );

    const discount =
        getDiscount(
            product
        );


    /*
     * A real deal requires:
     *
     * 1. Published product
     * 2. Current price greater than zero
     * 3. Real discount
     */

    if (
        price <= 0
    ) {

        return false;

    }


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        return true;

    }


    return discount > 0;

}


/*==================================================
FEATURE: FIREBASE PRODUCTS
==================================================*/

function loadDeals() {

    if (
        firebaseProductsListener
    ) {

        return;

    }


    const productsRef =
        ref(
            database,
            "products"
        );


    firebaseProductsListener =
        onValue(
            productsRef,
            snapshot => {

                try {

                    const products =
                        snapshot.exists()
                            ? snapshot.val()
                            : {};


                    allDeals =
                        Object.entries(
                            products
                        )
                        .map(
                            ([firebaseId, product]) => {

                                return {
                                    ...(product || {}),
                                    firebaseId,

                                    /*
                                     * Firebase key becomes
                                     * fallback product ID.
                                     */

                                    productId:
                                        product?.productId ||
                                        firebaseId

                                };

                            }
                        )
                        .filter(
                            isValidDeal
                        );


                    populateCategories();

                    hideLoading();

                    hideError();

                    renderDeals();

                } catch (error) {

                    console.error(
                        "Deals rendering error:",
                        error
                    );

                    showDealsError();

                }

            },
            error => {

                console.error(
                    "Deals Firebase Error:",
                    error
                );

                showDealsError();

            }
        );

}


/*==================================================
FEATURE: AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    async user => {

        currentUser =
            user || null;


        if (!currentUser) {

            wishlistIds =
                new Set();

            renderDeals();

            return;

        }


        await loadWishlistIds();

        renderDeals();

    }
);


/*==================================================
FEATURE: LOAD WISHLIST IDS
==================================================*/

async function loadWishlistIds() {

    if (!currentUser) {

        wishlistIds =
            new Set();

        return;

    }


    try {

        const wishlistRef =
            ref(
                database,
                `users/${currentUser.uid}/wishlist`
            );


        const snapshot =
            await get(
                wishlistRef
            );


        if (
            !snapshot.exists()
        ) {

            wishlistIds =
                new Set();

            return;

        }


        const wishlist =
            snapshot.val();


        wishlistIds =
            new Set(
                Object.keys(
                    wishlist || {}
                )
            );

    } catch (error) {

        console.error(
            "Wishlist loading error:",
            error
        );

        wishlistIds =
            new Set();

    }

}


/*==================================================
FEATURE: POPULATE CATEGORIES
==================================================*/

function populateCategories() {

    if (!dealsCategory) {

        return;

    }


    const currentValue =
        dealsCategory.value || "all";


    const categories =
        [
            ...new Set(
                allDeals
                    .map(
                        product =>
                            String(
                                product.category ||
                                ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        );


    dealsCategory.innerHTML =
        `
            <option value="all">
                All Categories
            </option>
        `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;

            option.textContent =
                category;


            dealsCategory.appendChild(
                option
            );

        }
    );


    const stillExists =
        [
            "all",
            ...categories
        ].includes(
            currentValue
        );


    dealsCategory.value =
        stillExists
            ? currentValue
            : "all";

}


/*==================================================
FEATURE: FILTER DEALS
==================================================*/

function getFilteredDeals() {

    const search =
        String(
            dealsSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const category =
        dealsCategory?.value ||
        "all";


    const discountMinimum =
        dealsDiscount?.value ||
        "all";


    const minimum =
        discountMinimum === "all"
            ? 0
            : Number(
                discountMinimum
            );


    let result =
        allDeals.filter(
            product => {

                const name =
                    getProductName(
                        product
                    )
                    .toLowerCase();


                const productCategory =
                    String(
                        product.category ||
                        ""
                    )
                    .toLowerCase();


                const brand =
                    String(
                        product.brand ||
                        ""
                    )
                    .toLowerCase();


                const description =
                    String(
                        product.shortDescription ||
                        product.description ||
                        ""
                    )
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    productCategory.includes(search) ||
                    brand.includes(search) ||
                    description.includes(search);


                const matchesCategory =
                    category === "all" ||
                    String(
                        product.category ||
                        ""
                    ) === category;


                const matchesDiscount =
                    getDiscount(
                        product
                    ) >= minimum;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesDiscount
                );

            }
        );


    sortDeals(
        result
    );


    return result;

}


/*==================================================
FEATURE: SORT DEALS
==================================================*/

function sortDeals(
    products
) {

    const sort =
        dealsSort?.value ||
        "newest";


    products.sort(
        (a, b) => {

            if (
                sort === "discount-high"
            ) {

                return (
                    getDiscount(b)
                    -
                    getDiscount(a)
                );

            }


            if (
                sort === "price-low"
            ) {

                return (
                    getPrice(a)
                    -
                    getPrice(b)
                );

            }


            if (
                sort === "price-high"
            ) {

                return (
                    getPrice(b)
                    -
                    getPrice(a)
                );

            }


            if (
                sort === "name"
            ) {

                return getProductName(a)
                    .localeCompare(
                        getProductName(b)
                    );

            }


            return (
                Number(b.createdAt || 0)
                -
                Number(a.createdAt || 0)
            );

        }
    );

}


/*==================================================
FEATURE: RENDER DEALS
==================================================*/

function renderDeals() {

    if (
        !dealsGrid
    ) {

        return;

    }


    filteredDeals =
        getFilteredDeals();


    if (
        dealsResultCount
    ) {

        dealsResultCount.textContent =
            `${filteredDeals.length} ${
                filteredDeals.length === 1
                    ? "deal"
                    : "deals"
            } found`;

    }


    /*
     * Hide all state sections
     * before deciding what to display.
     */

    hideElement(
        dealsEmpty
    );

    hideElement(
        bestDealsSection
    );

    hideElement(
        almostSoldOutSection
    );


    dealsGrid.innerHTML =
        "";

    if (bestDealsGrid) {

        bestDealsGrid.innerHTML =
            "";

    }

    if (almostSoldOutGrid) {

        almostSoldOutGrid.innerHTML =
            "";

    }


    if (
        filteredDeals.length === 0
    ) {

        if (
            allDeals.length === 0
        ) {

            if (dealsEmptyText) {

                dealsEmptyText.textContent =
                    "There are no discounted products available right now.";

            }

        } else {

            if (dealsEmptyText) {

                dealsEmptyText.textContent =
                    "No deals match your current search or filters.";

            }

        }


        showElement(
            dealsEmpty
        );


        return;

    }


    /*
     * BEST DEALS:
     * Top 4 highest discounts.
     */

    const bestDeals =
        [...filteredDeals]
            .sort(
                (a, b) =>
                    getDiscount(b)
                    -
                    getDiscount(a)
            )
            .slice(
                0,
                4
            );


    if (
        bestDeals.length > 0 &&
        bestDealsGrid
    ) {

        bestDeals.forEach(
            product => {

                bestDealsGrid.appendChild(
                    createDealCard(
                        product
                    )
                );

            }
        );


        if (bestDealsCount) {

            bestDealsCount.textContent =
                `${bestDeals.length} top offers`;

        }


        showElement(
            bestDealsSection
        );

    }


    /*
     * ALMOST SOLD OUT:
     * Actual stock based.
     */

    const almostSoldOut =
        filteredDeals
            .filter(
                product => {

                    const stock =
                        getStock(
                            product
                        );

                    const limit =
                        getLowStockLimit(
                            product
                        );


                    return (
                        stock > 0 &&
                        stock <= limit
                    );

                }
            )
            .sort(
                (a, b) =>
                    getStock(a)
                    -
                    getStock(b)
            )
            .slice(
                0,
                4
            );


    if (
        almostSoldOut.length > 0 &&
        almostSoldOutGrid
    ) {

        almostSoldOut.forEach(
            product => {

                almostSoldOutGrid.appendChild(
                    createDealCard(
                        product
                    )
                );

            }
        );


        if (almostSoldOutCount) {

            almostSoldOutCount.textContent =
                `${almostSoldOut.length} limited`;

        }


        showElement(
            almostSoldOutSection
        );

    }


    /*
     * ALL DEALS
     */

    filteredDeals.forEach(
        product => {

            dealsGrid.appendChild(
                createDealCard(
                    product
                )
            );

        }
    );

}


/*==================================================
FEATURE: CREATE DEAL CARD
==================================================*/

function createDealCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "deals-card";


    const id =
        getProductId(
            product
        );


    const name =
        getProductName(
            product
        );


    const category =
        product.category ||
        "Product";


    const image =
        getProductImage(
            product
        );


    const price =
        getPrice(
            product
        );


    const oldPrice =
        getOldPrice(
            product
        );


    const discount =
        getDiscount(
            product
        );


    const stock =
        getStock(
            product
        );


    const lowStockLimit =
        getLowStockLimit(
            product
        );


    const rating =
        Number(
            product.rating
        ) || 0;


    const reviews =
        Number(
            product.reviews
        ) || 0;


    const description =
        product.shortDescription ||
        product.description ||
        "";


    const isWishlisted =
        wishlistIds.has(
            id
        );


    const freeShipping =
        product.freeShipping === true;


    /*==================================================
    FEATURE: STOCK HTML
    ==================================================*/

    let stockHTML =
        "";


    if (
        stock <= 0
    ) {

        stockHTML =
            `
                <div class="deals-card-stock out">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Out of Stock
                </div>
            `;

    }

    else if (
        stock <= lowStockLimit
    ) {

        stockHTML =
            `
                <div class="deals-card-stock low">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Only ${stock} left
                </div>
            `;

    }

    else {

        stockHTML =
            `
                <div class="deals-card-stock">
                    <i class="fa-solid fa-circle-check"></i>
                    In Stock
                </div>
            `;

    }


    /*==================================================
    FEATURE: RATING HTML
    ==================================================*/

    let ratingHTML =
        "";


    if (
        rating > 0
    ) {

        ratingHTML =
            `
                <div class="deals-card-rating">

                    <i class="fa-solid fa-star"></i>

                    <span>
                        ${rating.toFixed(1)}
                        (${reviews})
                    </span>

                </div>
            `;

    }


    /*==================================================
    FEATURE: DESCRIPTION
    ==================================================*/

    const descriptionHTML =
        description
            ?
            `
                <p class="deals-card-description">
                    ${escapeHTML(description)}
                </p>
            `
            :
            "";


    /*==================================================
    FEATURE: FREE SHIPPING
    ==================================================*/

    const shippingHTML =
        freeShipping
            ?
            `
                <div class="deals-free-shipping">
                    <i class="fa-solid fa-truck"></i>
                    Free Shipping
                </div>
            `
            :
            "";


    /*==================================================
    FEATURE: OLD PRICE
    ==================================================*/

    const oldPriceHTML =
        oldPrice > price
            ?
            `
                <span class="deals-old-price">
                    ${formatPrice(oldPrice)}
                </span>
            `
            :
            "";


    /*==================================================
    FEATURE: CARD HTML
    ==================================================*/

    card.innerHTML =
        `
            <span class="deals-discount-badge">
                -${discount}%
            </span>


            <button
                type="button"
                class="deals-wishlist-button ${
                    isWishlisted
                        ? "active"
                        : ""
                }"
                aria-label="${
                    isWishlisted
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"
                }"
                aria-pressed="${isWishlisted}"
                data-product-id="${escapeHTML(id)}">

                <i class="${
                    isWishlisted
                        ? "fa-solid"
                        : "fa-regular"
                } fa-heart"></i>

            </button>


            <div class="deals-card-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >

            </div>


            <div class="deals-card-content">

                <span class="deals-card-category">
                    ${escapeHTML(category)}
                </span>


                <h3 class="deals-card-title">
                    ${escapeHTML(name)}
                </h3>


                ${descriptionHTML}


                <div class="deals-card-price">

                    <span class="deals-current-price">
                        ${formatPrice(price)}
                    </span>

                    ${oldPriceHTML}

                </div>


                ${ratingHTML}


                ${stockHTML}


                ${shippingHTML}


                <div class="deals-card-actions">

                    <button
                        type="button"
                        class="deals-action-button deals-view-button"
                        data-action="view"
                        data-product-id="${escapeHTML(id)}">

                        <i class="fa-solid fa-eye"></i>

                        View

                    </button>


                    <button
                        type="button"
                        class="deals-action-button deals-cart-button"
                        data-action="cart"
                        data-product-id="${escapeHTML(id)}"
                        ${
                            stock <= 0
                                ? "disabled"
                                : ""
                        }>

                        <i class="fa-solid fa-cart-shopping"></i>

                        Cart

                    </button>

                </div>

            </div>
        `;


    /*==================================================
    FEATURE: CARD CLICK
    ==================================================*/

    card.addEventListener(
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
                id
            );

        }
    );


    /*==================================================
    FEATURE: VIEW BUTTON
    ==================================================*/

    const viewButton =
        card.querySelector(
            '[data-action="view"]'
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openProductDetails(
                    id
                );

            }
        );

    }


    /*==================================================
    FEATURE: CART BUTTON
    ==================================================*/

    const cartButton =
        card.querySelector(
            '[data-action="cart"]'
        );


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                await addProductToCart(
                    product
                );

            }
        );

    }


    /*==================================================
    FEATURE: WISHLIST BUTTON
    ==================================================*/

    const wishlistButton =
        card.querySelector(
            ".deals-wishlist-button"
        );


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                await toggleWishlist(
                    product,
                    wishlistButton
                );

            }
        );

    }


    /*==================================================
    FEATURE: IMAGE ERROR
    ==================================================*/

    const imageElement =
        card.querySelector(
            "img"
        );


    if (imageElement) {

        imageElement.addEventListener(
            "error",
            () => {

                if (
                    imageElement.src !==
                    "https://via.placeholder.com/600x600?text=Product"
                ) {

                    imageElement.src =
                        "https://via.placeholder.com/600x600?text=Product";

                }

            }
        );

    }


    return card;

}


/*==================================================
FEATURE: OPEN PRODUCT DETAILS
==================================================*/

function openProductDetails(
    id
) {

    if (!id) {

        showToast(
            "Product information is missing."
        );

        return;

    }


    window.location.href =
        `./product-details.html?id=${encodeURIComponent(id)}`;

}


/*==================================================
FEATURE: ADD PRODUCT TO CART
==================================================*/

async function addProductToCart(
    product
) {

    if (!currentUser) {

        showToast(
            "Please login to add products to your cart."
        );


        window.location.href =
            `./login.html?redirect=${encodeURIComponent(window.location.href)}`;

        return;

    }


    const id =
        getProductId(
            product
        );


    if (!id) {

        showToast(
            "Product information is missing."
        );

        return;

    }


    const stock =
        getStock(
            product
        );


    if (
        stock <= 0
    ) {

        showToast(
            "This product is out of stock."
        );

        return;

    }


    const cartRef =
        ref(
            database,
            `users/${currentUser.uid}/cart/${id}`
        );


    try {

        const snapshot =
            await get(
                cartRef
            );


        const existing =
            snapshot.exists()
                ? snapshot.val()
                : null;


        const oldQuantity =
            Number(
                existing?.quantity
            ) || 0;


        const quantity =
            Math.min(
                oldQuantity + 1,
                stock
            );


        const now =
            Date.now();


        const cartProduct = {

            productId:
                id,

            name:
                getProductName(
                    product
                ),

            productName:
                getProductName(
                    product
                ),

            image:
                getProductImage(
                    product
                ),

            price:
                getPrice(
                    product
                ),

            oldPrice:
                getOldPrice(
                    product
                ),

            category:
                product.category ||
                "",

            quantity:
                quantity,

            sellerId:
                product.sellerId ||
                "",

            addedAt:
                existing?.addedAt ||
                now,

            updatedAt:
                now

        };


        await set(
            cartRef,
            cartProduct
        );


        if (
            oldQuantity >= stock
        ) {

            showToast(
                "Maximum available quantity is already in your cart."
            );

        } else {

            showToast(
                "Product added to cart."
            );

        }

    } catch (error) {

        console.error(
            "Deals cart error:",
            error
        );


        showToast(
            "Unable to add product to cart."
        );

    }

}


/*==================================================
FEATURE: TOGGLE WISHLIST
==================================================*/

async function toggleWishlist(
    product,
    button
) {

    if (!currentUser) {

        showToast(
            "Please login to use Wishlist."
        );


        window.location.href =
            `./login.html?redirect=${encodeURIComponent(window.location.href)}`;

        return;

    }


    const id =
        getProductId(
            product
        );


    if (!id) {

        showToast(
            "Product information is missing."
        );

        return;

    }


    const wishlistRef =
        ref(
            database,
            `users/${currentUser.uid}/wishlist/${id}`
        );


    try {

        const snapshot =
            await get(
                wishlistRef
            );


        if (
            snapshot.exists()
        ) {

            await importWishlistRemove(
                wishlistRef
            );


            wishlistIds.delete(
                id
            );


            setWishlistButtonUI(
                button,
                false
            );


            showToast(
                "Removed from Wishlist."
            );


            return;

        }


        const now =
            Date.now();


        const wishlistProduct = {

            productId:
                id,

            name:
                getProductName(
                    product
                ),

            image:
                getProductImage(
                    product
                ),

            images:
                getProductImages(
                    product
                ),

            price:
                getPrice(
                    product
                ),

            oldPrice:
                getOldPrice(
                    product
                ),

            discount:
                getDiscount(
                    product
                ),

            category:
                product.category ||
                "",

            brand:
                product.brand ||
                "",

            sku:
                product.sku ||
                product.SKU ||
                "",

            condition:
                product.condition ||
                product.productCondition ||
                "",

            rating:
                Number(
                    product.rating
                ) || 0,

            reviews:
                Number(
                    product.reviews
                ) || 0,

            stock:
                getStock(
                    product
                ),

            inStock:
                getStock(product) > 0,

            available:
                getStock(product) > 0,

            shortDescription:
                product.shortDescription ||
                product.short_description ||
                "",

            sellerName:
                product.sellerName ||
                product.seller ||
                "SmartBazaar Seller",

            sellerId:
                product.sellerId ||
                "",

            createdBy:
                product.createdBy ||
                "",

            freeShipping:
                product.freeShipping === true,

            featured:
                product.featured === true,

            addedAt:
                now

        };


        await set(
            wishlistRef,
            wishlistProduct
        );


        wishlistIds.add(
            id
        );


        setWishlistButtonUI(
            button,
            true
        );


        showToast(
            "Added to Wishlist."
        );

    } catch (error) {

        console.error(
            "Deals wishlist error:",
            error
        );


        showToast(
            "Wishlist update failed."
        );

    }

}


/*==================================================
FEATURE: FIREBASE REMOVE
==================================================*/

async function importWishlistRemove(
    wishlistRef
) {

    const {
        remove
    } =
        await import(
            "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js"
        );


    await remove(
        wishlistRef
    );

}


/*==================================================
FEATURE: GET ALL PRODUCT IMAGES
==================================================*/

function getProductImages(
    product
) {

    const images = [];


    if (
        Array.isArray(
            product?.images
        )
    ) {

        product.images.forEach(
            image => {

                if (
                    typeof image === "string" &&
                    image.trim() &&
                    !images.includes(
                        image.trim()
                    )
                ) {

                    images.push(
                        image.trim()
                    );

                }

            }
        );

    }


    if (
        product?.images &&
        typeof product.images === "object" &&
        !Array.isArray(product.images)
    ) {

        Object.values(
            product.images
        ).forEach(
            image => {

                if (
                    typeof image === "string" &&
                    image.trim() &&
                    !images.includes(
                        image.trim()
                    )
                ) {

                    images.push(
                        image.trim()
                    );

                }

            }
        );

    }


    const mainImage =
        getProductImage(
            product
        );


    if (
        mainImage &&
        !images.includes(
            mainImage
        ) &&
        !mainImage.includes(
            "via.placeholder.com"
        )
    ) {

        images.unshift(
            mainImage
        );

    }


    return images;

}


/*==================================================
FEATURE: WISHLIST UI
==================================================*/

function setWishlistButtonUI(
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


    button.setAttribute(
        "aria-label",
        active
            ? "Remove from Wishlist"
            : "Add to Wishlist"
    );

}


/*==================================================
FEATURE: ESCAPE HTML
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
        Number(
            value
        )
        .toLocaleString(
            "en-PK"
        )
    );

}


/*==================================================
FEATURE: UI HELPERS
==================================================*/

function showElement(
    element
) {

    if (
        element
    ) {

        element.hidden =
            false;

        element.style.display =
            "";

    }

}


function hideElement(
    element
) {

    if (
        element
    ) {

        element.hidden =
            true;

        element.style.display =
            "none";

    }

}


/*==================================================
FEATURE: LOADING STATE
==================================================*/

function hideLoading() {

    hideElement(
        dealsLoading
    );

}


/*==================================================
FEATURE: ERROR STATE
==================================================*/

function showDealsError() {

    hideLoading();

    hideElement(
        dealsEmpty
    );


    if (
        dealsError
    ) {

        dealsError.hidden =
            false;

        dealsError.style.display =
            "block";

    }

}


/*==================================================
FEATURE: TOAST
==================================================*/

let toastTimer = null;


function showToast(
    message
) {

    let toast =
        document.getElementById(
            "dealsToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "dealsToast";


        toast.className =
            "deals-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/*==================================================
FEATURE: RETRY
==================================================*/

if (
    retryDealsButton
) {

    retryDealsButton.addEventListener(
        "click",
        () => {

            window.location.reload();

        }
    );

}


/*==================================================
FEATURE: SEARCH
==================================================*/

if (
    dealsSearch
) {

    dealsSearch.addEventListener(
        "input",
        renderDeals
    );

}


/*==================================================
FEATURE: CATEGORY FILTER
==================================================*/

if (
    dealsCategory
) {

    dealsCategory.addEventListener(
        "change",
        renderDeals
    );

}


/*==================================================
FEATURE: DISCOUNT FILTER
==================================================*/

if (
    dealsDiscount
) {

    dealsDiscount.addEventListener(
        "change",
        () => {

            updateQuickFilterUI(
                dealsDiscount.value
            );

            renderDeals();

        }
    );

}


/*==================================================
FEATURE: SORT
==================================================*/

if (
    dealsSort
) {

    dealsSort.addEventListener(
        "change",
        renderDeals
    );

}


/*==================================================
FEATURE: QUICK DISCOUNT FILTERS
==================================================*/

document
    .querySelectorAll(
        ".deals-quick-filter"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.dataset.discount ||
                        "all";


                    if (
                        dealsDiscount
                    ) {

                        dealsDiscount.value =
                            value;

                    }


                    updateQuickFilterUI(
                        value
                    );


                    renderDeals();

                }
            );

        }
    );


/*==================================================
FEATURE: QUICK FILTER UI
==================================================*/

function updateQuickFilterUI(
    value
) {

    document
        .querySelectorAll(
            ".deals-quick-filter"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    (
                        button.dataset.discount ||
                        "all"
                    ) === value
                );

            }
        );

}


/*==================================================
FEATURE: START DEALS SYSTEM
==================================================*/

loadDeals();
