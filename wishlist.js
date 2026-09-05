/*==================================================
SMARTBAZAAR PRO 2
FEATURE: WISHLIST SYSTEM
FEATURE: WISHLIST FIREBASE INTEGRATION
FEATURE: WISHLIST SEARCH
FEATURE: WISHLIST FILTERS
FEATURE: WISHLIST CART INTEGRATION
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORTS
==================================================*/

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getDatabase,
    ref,
    onValue,
    remove,
    set,
    update
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: FIREBASE CONFIG
==================================================*/

import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE INITIALIZATION
==================================================*/

const auth = getAuth(app);

const db = getDatabase(app);


/*==================================================
FEATURE: FIREBASE PATHS
==================================================*/

const WISHLIST_PATH =
    "smartbazaar_pro_2/wishlists";


const PRODUCTS_PATH =
    "smartbazaar_pro_2/products";


const CART_PATH =
    "smartbazaar_pro_2/carts";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const wishlistLoading =
    document.getElementById(
        "wishlistLoading"
    );


const wishlistProductsSection =
    document.getElementById(
        "wishlistProductsSection"
    );


const wishlistGrid =
    document.getElementById(
        "wishlistGrid"
    );


const wishlistEmpty =
    document.getElementById(
        "wishlistEmpty"
    );


const wishlistNoResults =
    document.getElementById(
        "wishlistNoResults"
    );


const wishlistCountNumber =
    document.getElementById(
        "wishlistCountNumber"
    );


const wishlistSearchInput =
    document.getElementById(
        "wishlistSearchInput"
    );


const clearWishlistSearch =
    document.getElementById(
        "clearWishlistSearch"
    );


const addAllToCartBtn =
    document.getElementById(
        "addAllToCartBtn"
    );


const clearWishlistBtn =
    document.getElementById(
        "clearWishlistBtn"
    );


const continueShoppingBtn =
    document.getElementById(
        "continueShoppingBtn"
    );


const closeWishlistToast =
    document.getElementById(
        "closeWishlistToast"
    );


const wishlistToast =
    document.getElementById(
        "wishlistToast"
    );


const wishlistToastTitle =
    document.getElementById(
        "wishlistToastTitle"
    );


const wishlistToastMessage =
    document.getElementById(
        "wishlistToastMessage"
    );


const wishlistToastIcon =
    document.getElementById(
        "wishlistToastIcon"
    );


const wishlistConfirmModal =
    document.getElementById(
        "wishlistConfirmModal"
    );


const wishlistModalOverlay =
    document.getElementById(
        "wishlistModalOverlay"
    );


const wishlistModalCancel =
    document.getElementById(
        "wishlistModalCancel"
    );


const wishlistModalConfirm =
    document.getElementById(
        "wishlistModalConfirm"
    );


const wishlistModalTitle =
    document.getElementById(
        "wishlistModalTitle"
    );


const wishlistModalMessage =
    document.getElementById(
        "wishlistModalMessage"
    );


/*==================================================
FEATURE: FILTER BUTTONS
==================================================*/

const wishlistFilterButtons =
    document.querySelectorAll(
        ".wishlist-filter-btn"
    );


/*==================================================
FEATURE: STATE
==================================================*/

let currentUser = null;

let wishlistData = {};

let productsData = {};

let currentFilter = "all";

let currentSearch = "";

let pendingRemoveId = null;

let toastTimer = null;


/*==================================================
FEATURE: INITIALIZATION
==================================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            currentUser = null;

            wishlistData = {};

            productsData = {};

            renderWishlist();

            hideLoading();

            showToast(
                "Login Required",
                "Please login to view your wishlist.",
                "warning"
            );

            return;

        }


        currentUser = user;

        loadProducts();

        loadWishlist();

    }
);


/*==================================================
FEATURE: LOAD PRODUCTS
==================================================*/

function loadProducts() {

    const productsRef =
        ref(
            db,
            PRODUCTS_PATH
        );


    onValue(
        productsRef,
        (snapshot) => {

            productsData =
                snapshot.exists()
                    ? snapshot.val()
                    : {};


            renderWishlist();

        },
        (error) => {

            console.error(
                "Products Load Error:",
                error
            );

            productsData = {};

            renderWishlist();

        }
    );

}


/*==================================================
FEATURE: LOAD USER WISHLIST
==================================================*/

function loadWishlist() {

    if (!currentUser) {

        return;

    }


    const userWishlistRef =
        ref(
            db,
            `${WISHLIST_PATH}/${currentUser.uid}`
        );


    onValue(
        userWishlistRef,
        (snapshot) => {

            wishlistData =
                snapshot.exists()
                    ? snapshot.val()
                    : {};


            hideLoading();

            renderWishlist();

        },
        (error) => {

            console.error(
                "Wishlist Load Error:",
                error
            );

            wishlistData = {};

            hideLoading();

            renderWishlist();

            showToast(
                "Wishlist Error",
                "Unable to load your wishlist.",
                "error"
            );

        }
    );

}


/*==================================================
FEATURE: GET WISHLIST ITEMS
==================================================*/

function getWishlistItems() {

    if (
        !wishlistData ||
        typeof wishlistData !== "object"
    ) {

        return [];

    }


    return Object.entries(
        wishlistData
    ).map(
        ([wishlistId, wishlistItem]) => {

            return normalizeWishlistItem(
                wishlistId,
                wishlistItem
            );

        }
    );

}


/*==================================================
FEATURE: NORMALIZE WISHLIST ITEM
==================================================*/

function normalizeWishlistItem(
    wishlistId,
    wishlistItem
) {

    let item = {};


    if (
        wishlistItem &&
        typeof wishlistItem === "object"
    ) {

        item = {
            ...wishlistItem
        };

    }


    const productId =
        item.productId ||
        item.productID ||
        item.id ||
        wishlistId;


    const product =
        findProduct(
            productId
        );


    const merged = {

        ...product,
        ...item

    };


    return {

        wishlistId,

        productId,

        name:
            merged.name ||
            merged.productName ||
            merged.title ||
            "Unnamed Product",

        title:
            merged.title ||
            merged.name ||
            merged.productName ||
            "Unnamed Product",

        image:
            getProductImage(
                merged
            ),

        price:
            getProductPrice(
                merged
            ),

        oldPrice:
            getProductOldPrice(
                merged
            ),

        category:
            merged.category ||
            merged.categoryName ||
            "Product",

        rating:
            Number(
                merged.rating ||
                merged.averageRating ||
                0
            ),

        ratingCount:
            Number(
                merged.ratingCount ||
                merged.reviewsCount ||
                merged.reviewCount ||
                0
            ),

        stock:
            getProductStock(
                merged
            ),

        raw:
            merged

    };

}


/*==================================================
FEATURE: FIND PRODUCT
==================================================*/

function findProduct(productId) {

    if (
        !productsData ||
        typeof productsData !== "object"
    ) {

        return {};

    }


    if (
        productsData[productId]
    ) {

        return {
            ...productsData[productId],
            id: productId
        };

    }


    for (
        const [
            key,
            product
        ] of Object.entries(productsData)
    ) {

        if (
            !product ||
            typeof product !== "object"
        ) {

            continue;

        }


        const possibleId =
            product.id ||
            product.productId ||
            product.productID;


        if (
            String(possibleId) ===
            String(productId)
        ) {

            return {
                ...product,
                id: key
            };

        }

    }


    return {};

}


/*==================================================
FEATURE: PRODUCT IMAGE
==================================================*/

function getProductImage(product) {

    const images =
        product.images;


    if (
        Array.isArray(images) &&
        images.length > 0
    ) {

        return (
            images[0] ||
            getFallbackImage()
        );

    }


    if (
        images &&
        typeof images === "object"
    ) {

        const firstImage =
            Object.values(images)[0];


        if (firstImage) {

            return firstImage;

        }

    }


    return (
        product.image ||
        product.imageUrl ||
        product.productImage ||
        product.thumbnail ||
        product.photo ||
        product.photoUrl ||
        getFallbackImage()
    );

}


/*==================================================
FEATURE: FALLBACK IMAGE
==================================================*/

function getFallbackImage() {

    return (
        "data:image/svg+xml," +
        "utf8," +
        encodeURIComponent(`
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="600"
                height="600"
                viewBox="0 0 600 600"
            >
                <rect
                    width="600"
                    height="600"
                    fill="#f3f4f6"
                />
                <text
                    x="300"
                    y="300"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-family="Arial"
                    font-size="30"
                    fill="#9ca3af"
                >
                    No Image
                </text>
            </svg>
        `)
    );

}


/*==================================================
FEATURE: PRODUCT PRICE
==================================================*/

function getProductPrice(product) {

    const price =
        product.salePrice ??
        product.discountPrice ??
        product.currentPrice ??
        product.price ??
        0;


    return Number(
        price
    ) || 0;

}


/*==================================================
FEATURE: PRODUCT OLD PRICE
==================================================*/

function getProductOldPrice(product) {

    const oldPrice =
        product.oldPrice ??
        product.originalPrice ??
        product.regularPrice ??
        product.compareAtPrice ??
        0;


    return Number(
        oldPrice
    ) || 0;

}


/*==================================================
FEATURE: PRODUCT STOCK
==================================================*/

function getProductStock(product) {

    if (
        typeof product.stock === "number"
    ) {

        return product.stock;

    }


    if (
        typeof product.stockQuantity === "number"
    ) {

        return product.stockQuantity;

    }


    if (
        typeof product.quantity === "number"
    ) {

        return product.quantity;

    }


    if (
        product.inStock === false
    ) {

        return 0;

    }


    if (
        product.available === false
    ) {

        return 0;

    }


    if (
        typeof product.stock === "string"
    ) {

        const numericStock =
            Number(
                product.stock
            );


        if (
            !Number.isNaN(
                numericStock
            )
        ) {

            return numericStock;

        }

    }


    return 1;

}


/*==================================================
FEATURE: RENDER WISHLIST
==================================================*/

function renderWishlist() {

    const items =
        getWishlistItems();


    updateWishlistCount(
        items.length
    );


    let filteredItems =
        [...items];


    /*==================================================
    SEARCH FILTER
    ==================================================*/

    if (
        currentSearch
    ) {

        const search =
            currentSearch.toLowerCase();


        filteredItems =
            filteredItems.filter(
                (item) => {

                    return (

                        item.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        item.category
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    /*==================================================
    STOCK FILTER
    ==================================================*/

    if (
        currentFilter ===
        "available"
    ) {

        filteredItems =
            filteredItems.filter(
                (item) =>
                    item.stock > 0
            );

    }


    if (
        currentFilter ===
        "outofstock"
    ) {

        filteredItems =
            filteredItems.filter(
                (item) =>
                    item.stock <= 0
            );

    }


    /*==================================================
    EMPTY WISHLIST
    ==================================================*/

    if (
        items.length === 0
    ) {

        showEmptyWishlist();

        return;

    }


    hideEmptyWishlist();


    /*==================================================
    NO SEARCH RESULTS
    ==================================================*/

    if (
        filteredItems.length === 0
    ) {

        wishlistGrid.innerHTML = "";

        showNoResults();

        return;

    }


    hideNoResults();


    wishlistGrid.innerHTML =
        filteredItems
            .map(
                (item) =>
                    createWishlistCard(
                        item
                    )
            )
            .join("");

}


/*==================================================
FEATURE: CREATE PRODUCT CARD
==================================================*/

function createWishlistCard(item) {

    const safeName =
        escapeHTML(
            item.name
        );


    const safeCategory =
        escapeHTML(
            item.category
        );


    const image =
        escapeAttribute(
            item.image
        );


    const price =
        formatPrice(
            item.price
        );


    const oldPrice =
        item.oldPrice > item.price
            ? formatPrice(
                item.oldPrice
            )
            : "";


    const isAvailable =
        item.stock > 0;


    const stockClass =
        isAvailable
            ? ""
            : "out";


    const stockText =
        isAvailable
            ? `In Stock`
            : `Out of Stock`;


    const disabledClass =
        isAvailable
            ? ""
            : "disabled";


    const rating =
        createRating(
            item.rating
        );


    return `

        <article
            class="wishlist-card ${disabledClass}"
            data-wishlist-id="${escapeAttribute(item.wishlistId)}"
        >


            <div
                class="wishlist-card-image"
            >

                <img
                    src="${image}"
                    alt="${safeName}"
                    loading="lazy"
                    onerror="this.src='${escapeAttribute(getFallbackImage())}'"
                >


                <button
                    type="button"
                    class="wishlist-remove-btn"
                    data-remove-wishlist="${escapeAttribute(item.wishlistId)}"
                    aria-label="Remove ${safeName}"
                >

                    <i
                        class="fa-solid fa-heart"
                    ></i>

                </button>


                <span
                    class="wishlist-stock-badge ${stockClass}"
                >

                    ${stockText}

                </span>

            </div>


            <div
                class="wishlist-card-content"
            >


                <div
                    class="wishlist-card-category"
                >

                    ${safeCategory}

                </div>


                <h3
                    class="wishlist-card-title"
                >

                    ${safeName}

                </h3>


                <div
                    class="wishlist-card-rating"
                >

                    <span
                        class="wishlist-card-rating-stars"
                    >

                        ${rating}

                    </span>


                    <span
                        class="wishlist-card-rating-count"
                    >

                        ${
                            item.ratingCount > 0
                                ? `(${item.ratingCount})`
                                : ""
                        }

                    </span>

                </div>


                <div
                    class="wishlist-card-price-row"
                >

                    <div>

                        <span
                            class="wishlist-card-price"
                        >

                            ${price}

                        </span>


                        ${
                            oldPrice
                                ? `
                                    <span
                                        class="wishlist-card-old-price"
                                    >
                                        ${oldPrice}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div
                    class="wishlist-card-actions"
                >

                    <button
                        type="button"
                        class="wishlist-add-cart-btn"
                        data-add-cart="${escapeAttribute(item.wishlistId)}"
                        ${
                            !isAvailable
                                ? "disabled"
                                : ""
                        }
                    >

                        <i
                            class="fa-solid fa-cart-plus"
                        ></i>

                        <span>
                            ${
                                isAvailable
                                    ? "Add to Cart"
                                    : "Out of Stock"
                            }
                        </span>

                    </button>


                    <button
                        type="button"
                        class="wishlist-view-btn"
                        data-view-product="${escapeAttribute(item.productId)}"
                        aria-label="View product"
                    >

                        <i
                            class="fa-solid fa-eye"
                        ></i>

                    </button>

                </div>


            </div>


        </article>

    `;

}


/*==================================================
FEATURE: RATING
==================================================*/

function createRating(rating) {

    const safeRating =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );


    const rounded =
        Math.round(
            safeRating
        );


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (
            i <= rounded
        ) {

            stars +=
                `<i class="fa-solid fa-star"></i>`;

        }
        else {

            stars +=
                `<i class="fa-regular fa-star"></i>`;

        }

    }


    return stars;

}


/*==================================================
FEATURE: UPDATE WISHLIST COUNT
==================================================*/

function updateWishlistCount(
    count
) {

    if (
        wishlistCountNumber
    ) {

        wishlistCountNumber.textContent =
            count;

    }

}


/*==================================================
FEATURE: REMOVE FROM WISHLIST
==================================================*/

async function removeFromWishlist(
    wishlistId
) {

    if (
        !currentUser ||
        !wishlistId
    ) {

        return;

    }


    try {

        const wishlistItemRef =
            ref(
                db,
                `${WISHLIST_PATH}/${currentUser.uid}/${wishlistId}`
            );


        await remove(
            wishlistItemRef
        );


        showToast(
            "Removed",
            "Product removed from your wishlist.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Remove Wishlist Error:",
            error
        );


        showToast(
            "Error",
            "Unable to remove product.",
            "error"
        );

    }

}


/*==================================================
FEATURE: ADD TO CART
==================================================*/

async function addToCart(
    item
) {

    if (
        !currentUser
    ) {

        showToast(
            "Login Required",
            "Please login before adding products to cart.",
            "warning"
        );

        return;

    }


    if (
        !item ||
        item.stock <= 0
    ) {

        showToast(
            "Out of Stock",
            "This product is currently unavailable.",
            "warning"
        );

        return;

    }


    try {

        const cartItemRef =
            ref(
                db,
                `${CART_PATH}/${currentUser.uid}/${item.productId}`
            );


        const cartItem = {

            productId:
                item.productId,

            name:
                item.name,

            productName:
                item.name,

            image:
                item.image,

            price:
                item.price,

            quantity:
                1,

            category:
                item.category,

            addedAt:
                Date.now()

        };


        await set(
            cartItemRef,
            cartItem
        );


        showToast(
            "Added to Cart",
            `${item.name} was added to your cart.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Add To Cart Error:",
            error
        );


        showToast(
            "Cart Error",
            "Unable to add product to cart.",
            "error"
        );

    }

}


/*==================================================
FEATURE: ADD ALL TO CART
==================================================*/

async function addAllToCart() {

    if (
        !currentUser
    ) {

        showToast(
            "Login Required",
            "Please login before adding products to cart.",
            "warning"
        );

        return;

    }


    const items =
        getWishlistItems()
            .filter(
                (item) =>
                    item.stock > 0
            );


    if (
        items.length === 0
    ) {

        showToast(
            "No Available Products",
            "There are no available wishlist products.",
            "warning"
        );

        return;

    }


    try {

        const cartUpdates = {};


        items.forEach(
            (item) => {

                const cartPath =
                    `${CART_PATH}/${currentUser.uid}/${item.productId}`;


                cartUpdates[
                    cartPath
                ] = {

                    productId:
                        item.productId,

                    name:
                        item.name,

                    productName:
                        item.name,

                    image:
                        item.image,

                    price:
                        item.price,

                    quantity:
                        1,

                    category:
                        item.category,

                    addedAt:
                        Date.now()

                };

            }
        );


        await update(
            ref(
                db
            ),
            cartUpdates
        );


        showToast(
            "Added to Cart",
            `${items.length} products added to your cart.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Add All To Cart Error:",
            error
        );


        showToast(
            "Cart Error",
            "Unable to add wishlist products to cart.",
            "error"
        );

    }

}


/*==================================================
FEATURE: CLEAR WISHLIST
==================================================*/

async function clearWishlist() {

    if (
        !currentUser
    ) {

        return;

    }


    try {

        const userWishlistRef =
            ref(
                db,
                `${WISHLIST_PATH}/${currentUser.uid}`
            );


        await remove(
            userWishlistRef
        );


        closeModal();


        showToast(
            "Wishlist Cleared",
            "All wishlist products have been removed.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Clear Wishlist Error:",
            error
        );


        showToast(
            "Error",
            "Unable to clear wishlist.",
            "error"
        );

    }

}


/*==================================================
FEATURE: FILTER EVENTS
==================================================*/

wishlistFilterButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                wishlistFilterButtons.forEach(
                    (filterButton) => {

                        filterButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                renderWishlist();

            }
        );

    }
);


/*==================================================
FEATURE: SEARCH
==================================================*/

if (
    wishlistSearchInput
) {

    wishlistSearchInput.addEventListener(
        "input",
        () => {

            currentSearch =
                wishlistSearchInput.value
                    .trim();


            if (
                clearWishlistSearch
            ) {

                clearWishlistSearch.classList.toggle(
                    "show",
                    currentSearch.length > 0
                );

            }


            renderWishlist();

        }
    );

}


/*==================================================
FEATURE: CLEAR SEARCH
==================================================*/

if (
    clearWishlistSearch
) {

    clearWishlistSearch.addEventListener(
        "click",
        () => {

            wishlistSearchInput.value =
                "";

            currentSearch =
                "";

            clearWishlistSearch.classList.remove(
                "show"
            );

            renderWishlist();

            wishlistSearchInput.focus();

        }
    );

}


/*==================================================
FEATURE: WISHLIST GRID ACTIONS
==================================================*/

if (
    wishlistGrid
) {

    wishlistGrid.addEventListener(
        "click",
        async (event) => {

            const removeButton =
                event.target.closest(
                    "[data-remove-wishlist]"
                );


            if (
                removeButton
            ) {

                const wishlistId =
                    removeButton.dataset.removeWishlist;


                await removeFromWishlist(
                    wishlistId
                );

                return;

            }


            const addCartButton =
                event.target.closest(
                    "[data-add-cart]"
                );


            if (
                addCartButton
            ) {

                const wishlistId =
                    addCartButton.dataset.addCart;


                const item =
                    getWishlistItems()
                        .find(
                            (wishlistItem) =>
                                String(
                                    wishlistItem.wishlistId
                                ) ===
                                String(
                                    wishlistId
                                )
                        );


                if (
                    item
                ) {

                    await addToCart(
                        item
                    );

                }

                return;

            }


            const viewButton =
                event.target.closest(
                    "[data-view-product]"
                );


            if (
                viewButton
            ) {

                const productId =
                    viewButton.dataset.viewProduct;


                openProduct(
                    productId
                );

            }

        }
    );

}


/*==================================================
FEATURE: OPEN PRODUCT
==================================================*/

function openProduct(
    productId
) {

    if (
        !productId
    ) {

        return;

    }


    /*
        Product details page can use
        the productId from URL.

        Example:
        product-details.html?id=PRODUCT_ID
    */


    window.location.href =
        `product-details.html?id=${encodeURIComponent(productId)}`;

}


/*==================================================
FEATURE: ADD ALL BUTTON
==================================================*/

if (
    addAllToCartBtn
) {

    addAllToCartBtn.addEventListener(
        "click",
        addAllToCart
    );

}


/*==================================================
FEATURE: CLEAR WISHLIST BUTTON
==================================================*/

if (
    clearWishlistBtn
) {

    clearWishlistBtn.addEventListener(
        "click",
        () => {

            const count =
                getWishlistItems().length;


            if (
                count === 0
            ) {

                showToast(
                    "Wishlist Empty",
                    "There are no products to remove.",
                    "warning"
                );

                return;

            }


            openClearModal(
                count
            );

        }
    );

}


/*==================================================
FEATURE: CONTINUE SHOPPING
==================================================*/

if (
    continueShoppingBtn
) {

    continueShoppingBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
FEATURE: OPEN CLEAR MODAL
==================================================*/

function openClearModal(
    count
) {

    if (
        !wishlistConfirmModal
    ) {

        return;

    }


    if (
        wishlistModalTitle
    ) {

        wishlistModalTitle.textContent =
            "Clear Wishlist?";

    }


    if (
        wishlistModalMessage
    ) {

        wishlistModalMessage.textContent =
            `Are you sure you want to remove all ${count} products from your wishlist?`;

    }


    wishlistConfirmModal.hidden =
        false;

}


/*==================================================
FEATURE: CLOSE MODAL
==================================================*/

function closeModal() {

    if (
        wishlistConfirmModal
    ) {

        wishlistConfirmModal.hidden =
            true;

    }

}


/*==================================================
FEATURE: MODAL EVENTS
==================================================*/

if (
    wishlistModalCancel
) {

    wishlistModalCancel.addEventListener(
        "click",
        closeModal
    );

}


if (
    wishlistModalOverlay
) {

    wishlistModalOverlay.addEventListener(
        "click",
        closeModal
    );

}


if (
    wishlistModalConfirm
) {

    wishlistModalConfirm.addEventListener(
        "click",
        clearWishlist
    );

}


/*==================================================
FEATURE: ESCAPE KEY
==================================================*/

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();

        }

    }
);


/*==================================================
FEATURE: TOAST
==================================================*/

function showToast(
    title,
    message,
    type = "success"
) {

    if (
        !wishlistToast
    ) {

        return;

    }


    if (
        wishlistToastTitle
    ) {

        wishlistToastTitle.textContent =
            title;

    }


    if (
        wishlistToastMessage
    ) {

        wishlistToastMessage.textContent =
            message;

    }


    if (
        wishlistToastIcon
    ) {

        wishlistToastIcon.className =
            "fa-solid fa-circle-check";


        if (
            type === "error"
        ) {

            wishlistToastIcon.className =
                "fa-solid fa-circle-xmark";

        }


        if (
            type === "warning"
        ) {

            wishlistToastIcon.className =
                "fa-solid fa-triangle-exclamation";

        }

    }


    wishlistToast.classList.add(
        "show"
    );


    if (
        toastTimer
    ) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        setTimeout(
            () => {

                hideToast();

            },
            3500
        );

}


/*==================================================
FEATURE: HIDE TOAST
==================================================*/

function hideToast() {

    if (
        wishlistToast
    ) {

        wishlistToast.classList.remove(
            "show"
        );

    }

}


/*==================================================
FEATURE: CLOSE TOAST BUTTON
==================================================*/

if (
    closeWishlistToast
) {

    closeWishlistToast.addEventListener(
        "click",
        hideToast
    );

}


/*==================================================
FEATURE: EMPTY WISHLIST STATE
==================================================*/

function showEmptyWishlist() {

    if (
        wishlistProductsSection
    ) {

        wishlistProductsSection.hidden =
            true;

    }


    if (
        wishlistEmpty
    ) {

        wishlistEmpty.hidden =
            false;

    }


    if (
        wishlistNoResults
    ) {

        wishlistNoResults.hidden =
            true;

    }

}


/*==================================================
FEATURE: HIDE EMPTY WISHLIST
==================================================*/

function hideEmptyWishlist() {

    if (
        wishlistProductsSection
    ) {

        wishlistProductsSection.hidden =
            false;

    }


    if (
        wishlistEmpty
    ) {

        wishlistEmpty.hidden =
            true;

    }

}


/*==================================================
FEATURE: SHOW NO RESULTS
==================================================*/

function showNoResults() {

    if (
        wishlistNoResults
    ) {

        wishlistNoResults.hidden =
            false;

    }

}


/*==================================================
FEATURE: HIDE NO RESULTS
==================================================*/

function hideNoResults() {

    if (
        wishlistNoResults
    ) {

        wishlistNoResults.hidden =
            true;

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (
        wishlistLoading
    ) {

        wishlistLoading.hidden =
            true;

    }

}


/*==================================================
FEATURE: FORMAT PRICE
==================================================*/

function formatPrice(
    value
) {

    const number =
        Number(value) || 0;


    return (
        "Rs. " +
        number.toLocaleString(
            "en-PK"
        )
    );

}


/*==================================================
FEATURE: ESCAPE HTML
==================================================*/

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}


/*==================================================
FEATURE: ESCAPE ATTRIBUTE
==================================================*/

function escapeAttribute(
    value
) {

    return String(
        value == null
            ? ""
            : value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/*==================================================
FEATURE: INITIAL UI
==================================================*/

if (
    wishlistEmpty
) {

    wishlistEmpty.hidden =
        true;

}


if (
    wishlistNoResults
) {

    wishlistNoResults.hidden =
        true;

}
