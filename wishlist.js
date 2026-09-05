/*==================================================
SMARTBAZAAR PRO 2
FEATURE: WISHLIST SYSTEM
FEATURE: CUSTOMER WISHLIST
FEATURE: FIREBASE WISHLIST INTEGRATION
FEATURE: PRODUCT WISHLIST MANAGEMENT
FEATURE: WISHLIST SEARCH
FEATURE: WISHLIST FILTER
FEATURE: WISHLIST CART INTEGRATION
==================================================*/


/*==================================================
FEATURE: FIREBASE AUTH IMPORT
==================================================*/

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


/*==================================================
FEATURE: FIREBASE DATABASE IMPORT
==================================================*/

import {
    ref,
    get,
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";


/*==================================================
FEATURE: FIREBASE CONFIG
==================================================*/

import {
    auth,
    database
} from "./firebase-config.js";


/*==================================================
FEATURE: DATABASE
==================================================*/

const db =
    database;


/*==================================================
FEATURE: WISHLIST PATH
IMPORTANT:

Account.js already uses:

users/{uid}/wishlist

We use exactly the same structure.
==================================================*/

function getWishlistPath(
    userId
) {

    return `users/${userId}/wishlist`;

}


/*==================================================
FEATURE: PRODUCTS PATH
==================================================*/

const PRODUCTS_PATH =
    "products";


/*==================================================
FEATURE: GLOBAL STATE
==================================================*/

let currentUser =
    null;

let allProducts =
    [];

let wishlistProducts =
    [];

let currentFilter =
    "all";

let currentSearch =
    "";

let pendingAction =
    null;


/*==================================================
FEATURE: DOM HELPER
==================================================*/

function $(
    id
) {

    return document.getElementById(
        id
    );

}


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const wishlistCount =
    $("wishlistCount");

const wishlistCountNumber =
    $("wishlistCountNumber");

const wishlistGrid =
    $("wishlistGrid");

const wishlistLoading =
    $("wishlistLoading");

const wishlistProductsSection =
    $("wishlistProductsSection");

const wishlistEmpty =
    $("wishlistEmpty");

const wishlistNoResults =
    $("wishlistNoResults");

const wishlistSearchInput =
    $("wishlistSearchInput");

const clearWishlistSearch =
    $("clearWishlistSearch");

const addAllToCartBtn =
    $("addAllToCartBtn");

const clearWishlistBtn =
    $("clearWishlistBtn");

const continueShoppingBtn =
    $("continueShoppingBtn");

const wishlistToast =
    $("wishlistToast");

const wishlistToastIcon =
    $("wishlistToastIcon");

const wishlistToastTitle =
    $("wishlistToastTitle");

const wishlistToastMessage =
    $("wishlistToastMessage");

const closeWishlistToast =
    $("closeWishlistToast");

const wishlistConfirmModal =
    $("wishlistConfirmModal");

const wishlistModalOverlay =
    $("wishlistModalOverlay");

const wishlistModalTitle =
    $("wishlistModalTitle");

const wishlistModalMessage =
    $("wishlistModalMessage");

const wishlistModalCancel =
    $("wishlistModalCancel");

const wishlistModalConfirm =
    $("wishlistModalConfirm");


/*==================================================
FEATURE: HTML ESCAPE
==================================================*/

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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
FEATURE: ATTRIBUTE ESCAPE
==================================================*/

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/*==================================================
FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(
    value
) {

    const price =
        Number(value) || 0;


    return (
        "Rs. " +
        price.toLocaleString(
            "en-PK",
            {
                maximumFractionDigits: 2
            }
        )
    );

}


/*==================================================
FEATURE: INITIAL LOADING STATE
==================================================*/

function showLoading() {

    if (wishlistLoading) {

        wishlistLoading.style.display =
            "flex";

    }


    if (wishlistProductsSection) {

        wishlistProductsSection.style.display =
            "none";

    }


    if (wishlistEmpty) {

        wishlistEmpty.style.display =
            "none";

    }


    if (wishlistNoResults) {

        wishlistNoResults.style.display =
            "none";

    }

}


/*==================================================
FEATURE: HIDE LOADING
==================================================*/

function hideLoading() {

    if (wishlistLoading) {

        wishlistLoading.style.display =
            "none";

    }

}


/*==================================================
FEATURE: SHOW EMPTY
==================================================*/

function showEmptyWishlist() {

    hideLoading();


    if (wishlistProductsSection) {

        wishlistProductsSection.style.display =
            "none";

    }


    if (wishlistNoResults) {

        wishlistNoResults.style.display =
            "none";

    }


    if (wishlistEmpty) {

        wishlistEmpty.style.display =
            "flex";

    }

}


/*==================================================
FEATURE: SHOW PRODUCTS SECTION
==================================================*/

function showProductsSection() {

    hideLoading();


    if (wishlistEmpty) {

        wishlistEmpty.style.display =
            "none";

    }


    if (wishlistNoResults) {

        wishlistNoResults.style.display =
            "none";

    }


    if (wishlistProductsSection) {

        wishlistProductsSection.style.display =
            "block";

    }

}


/*==================================================
FEATURE: SHOW NO RESULTS
==================================================*/

function showNoResults() {

    hideLoading();


    if (wishlistEmpty) {

        wishlistEmpty.style.display =
            "none";

    }


    if (wishlistProductsSection) {

        wishlistProductsSection.style.display =
            "block";

    }


    if (wishlistNoResults) {

        wishlistNoResults.style.display =
            "flex";

    }

}


/*==================================================
FEATURE: AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    async user => {

        currentUser =
            user || null;


        if (!user) {

            wishlistProducts = [];

            updateWishlistCount();

            showEmptyWishlist();

            showToast(
                "fa-solid fa-lock",
                "Login Required",
                "Please login to view your wishlist.",
                "error"
            );

            return;

        }


        await initializeWishlist();

    }
);


/*==================================================
FEATURE: INITIALIZE WISHLIST
==================================================*/

async function initializeWishlist() {

    showLoading();


    try {

        await loadProducts();

        await loadWishlist();

        updateWishlistCount();

        renderWishlist();

    } catch (error) {

        console.error(
            "Wishlist initialization error:",
            error
        );


        hideLoading();


        showToast(
            "fa-solid fa-triangle-exclamation",
            "Wishlist Error",
            "Unable to load your wishlist.",
            "error"
        );

    }

}


/*==================================================
FEATURE: LOAD ALL PRODUCTS
==================================================*/

async function loadProducts() {

    allProducts = [];


    if (!db) {

        throw new Error(
            "Firebase Database is not available."
        );

    }


    const productsRef =
        ref(
            db,
            PRODUCTS_PATH
        );


    const snapshot =
        await get(
            productsRef
        );


    if (!snapshot.exists()) {

        return;

    }


    const data =
        snapshot.val();


    Object.entries(data)
        .forEach(
            ([firebaseKey, product]) => {

                if (
                    !product ||
                    typeof product !== "object"
                ) {

                    return;

                }


                allProducts.push({

                    ...product,

                    productId:
                        product.productId ||
                        firebaseKey

                });

            }
        );

}


/*==================================================
FEATURE: LOAD USER WISHLIST
==================================================*/

async function loadWishlist() {

    wishlistProducts = [];


    if (
        !currentUser ||
        !db
    ) {

        return;

    }


    const wishlistRef =
        ref(
            db,
            getWishlistPath(
                currentUser.uid
            )
        );


    const snapshot =
        await get(
            wishlistRef
        );


    if (!snapshot.exists()) {

        return;

    }


    const wishlistData =
        snapshot.val();


    /*
    Wishlist entries can contain
    either a complete product object
    or simply productId.
    */


    Object.entries(
        wishlistData
    )
    .forEach(
        ([firebaseKey, wishlistItem]) => {

            let productId =
                firebaseKey;


            let savedData = {};


            if (
                wishlistItem &&
                typeof wishlistItem === "object"
            ) {

                savedData =
                    wishlistItem;


                productId =
                    wishlistItem.productId ||
                    wishlistItem.id ||
                    firebaseKey;

            }


            /*
            First find the latest
            product from products/{id}.
            */

            const product =
                allProducts.find(
                    item =>
                        String(
                            item.productId
                        ) ===
                        String(productId)
                );


            if (product) {

                wishlistProducts.push({

                    ...product,

                    productId,

                    wishlistAddedAt:
                        savedData.addedAt ||
                        savedData.createdAt ||
                        0

                });

            } else if (
                Object.keys(savedData).length
            ) {

                /*
                Product may have been
                deleted from products.
                Keep saved wishlist
                information visible.
                */

                wishlistProducts.push({

                    ...savedData,

                    productId,

                    wishlistOnly:
                        true

                });

            }

        }
    );


    wishlistProducts.sort(
        (
            a,
            b
        ) => {

            return (
                Number(
                    b.wishlistAddedAt || 0
                ) -
                Number(
                    a.wishlistAddedAt || 0
                )
            );

        }
    );

}


/*==================================================
FEATURE: UPDATE WISHLIST COUNT
==================================================*/

function updateWishlistCount() {

    const count =
        wishlistProducts.length;


    if (wishlistCount) {

        wishlistCount.textContent =
            String(count);

    }


    if (wishlistCountNumber) {

        wishlistCountNumber.textContent =
            String(count);

    }


    /*
    Update common account
    wishlist badges if available.
    */

    const accountWishlistCount =
        document.getElementById(
            "accountWishlistCount"
        );


    if (accountWishlistCount) {

        accountWishlistCount.textContent =
            String(count);

    }

}


/*==================================================
FEATURE: RENDER WISHLIST
==================================================*/

function renderWishlist() {

    if (!wishlistGrid) {

        return;

    }


    if (
        !wishlistProducts ||
        wishlistProducts.length === 0
    ) {

        showEmptyWishlist();

        return;

    }


    const filteredProducts =
        getFilteredProducts();


    if (
        filteredProducts.length === 0
    ) {

        showNoResults();

        wishlistGrid.innerHTML =
            "";

        return;

    }


    showProductsSection();


    wishlistGrid.innerHTML =
        filteredProducts
            .map(
                product =>
                    wishlistCardHTML(
                        product
                    )
            )
            .join("");

}


/*==================================================
FEATURE: FILTER PRODUCTS
==================================================*/

function getFilteredProducts() {

    let products =
        [...wishlistProducts];


    /*
    STOCK FILTER
    */

    if (
        currentFilter ===
        "available"
    ) {

        products =
            products.filter(
                product =>
                    getStock(
                        product
                    ) > 0
            );

    }


    if (
        currentFilter ===
        "outofstock"
    ) {

        products =
            products.filter(
                product =>
                    getStock(
                        product
                    ) <= 0
            );

    }


    /*
    SEARCH FILTER
    */

    const search =
        currentSearch
            .trim()
            .toLowerCase();


    if (search) {

        products =
            products.filter(
                product => {

                    const name =
                        getProductName(
                            product
                        )
                        .toLowerCase();


                    const category =
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


                    return (
                        name.includes(search) ||
                        category.includes(search) ||
                        brand.includes(search)
                    );

                }
            );

    }


    return products;

}


/*==================================================
FEATURE: WISHLIST CARD
==================================================*/

function wishlistCardHTML(
    product
) {

    const productId =
        getProductId(
            product
        );


    const name =
        getProductName(
            product
        );


    const image =
        getProductImage(
            product
        );


    const price =
        getProductPrice(
            product
        );


    const oldPrice =
        getProductOldPrice(
            product
        );


    const stock =
        getStock(
            product
        );


    const category =
        product.category ||
        "Product";


    const rating =
        Number(
            product.rating || 0
        );


    const reviews =
        Number(
            product.reviews ||
            product.reviewCount ||
            0
        );


    const isAvailable =
        stock > 0;


    const discount =
        getDiscount(
            product,
            price,
            oldPrice
        );


    return `

        <article
            class="wishlist-product-card"
            data-product-id="${escapeAttribute(productId)}"
        >

            <div class="wishlist-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(name)}"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="wishlist-image-placeholder">
                                <i class="fa-solid fa-image"></i>
                            </div>
                        `
                }


                <button
                    type="button"
                    class="wishlist-remove-button"
                    data-action="remove"
                    data-product-id="${escapeAttribute(productId)}"
                    aria-label="Remove ${escapeAttribute(name)} from wishlist"
                    title="Remove from Wishlist"
                >

                    <i class="fa-solid fa-heart"></i>

                </button>


                ${
                    discount > 0
                        ? `
                            <span class="wishlist-discount-badge">
                                -${discount}%
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="wishlist-product-info">

                <span class="wishlist-product-category">
                    ${escapeHTML(category)}
                </span>


                <h3 class="wishlist-product-name">

                    ${escapeHTML(name)}

                </h3>


                <div class="wishlist-product-rating">

                    <span class="wishlist-stars">

                        ${createStars(rating)}

                    </span>

                    <span class="wishlist-review-count">

                        (${reviews})

                    </span>

                </div>


                <div class="wishlist-product-price">

                    <strong>

                        ${formatPrice(price)}

                    </strong>


                    ${
                        oldPrice > price
                            ? `
                                <del>
                                    ${formatPrice(oldPrice)}
                                </del>
                            `
                            : ""
                    }

                </div>


                <div class="wishlist-stock">

                    ${
                        isAvailable
                            ? `
                                <span class="wishlist-in-stock">

                                    <i class="fa-solid fa-circle-check"></i>

                                    In Stock
                                    ${
                                        stock > 0
                                            ? `(${stock})`
                                            : ""
                                    }

                                </span>
                            `
                            : `
                                <span class="wishlist-out-of-stock">

                                    <i class="fa-solid fa-circle-xmark"></i>

                                    Out of Stock

                                </span>
                            `
                    }

                </div>


                <div class="wishlist-product-actions">

                    <button
                        type="button"
                        class="wishlist-view-button"
                        data-action="view"
                        data-product-id="${escapeAttribute(productId)}"
                    >

                        <i class="fa-solid fa-eye"></i>

                        View Product

                    </button>


                    <button
                        type="button"
                        class="wishlist-cart-button"
                        data-action="cart"
                        data-product-id="${escapeAttribute(productId)}"
                        ${
                            !isAvailable
                                ? "disabled"
                                : ""
                        }
                    >

                        <i class="fa-solid fa-cart-shopping"></i>

                        ${
                            isAvailable
                                ? "Add to Cart"
                                : "Out of Stock"
                        }

                    </button>

                </div>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: PRODUCT ID
==================================================*/

function getProductId(
    product
) {

    return (
        product.productId ||
        product.id ||
        product._key ||
        ""
    );

}


/*==================================================
FEATURE: PRODUCT NAME
==================================================*/

function getProductName(
    product
) {

    return (
        product.name ||
        product.productName ||
        product.title ||
        "Product"
    );

}


/*==================================================
FEATURE: PRODUCT IMAGE
==================================================*/

function getProductImage(
    product
) {

    if (
        typeof product.image ===
        "string" &&
        product.image.trim()
    ) {

        return product.image.trim();

    }


    if (
        typeof product.imageUrl ===
        "string" &&
        product.imageUrl.trim()
    ) {

        return product.imageUrl.trim();

    }


    if (
        typeof product.thumbnail ===
        "string" &&
        product.thumbnail.trim()
    ) {

        return product.thumbnail.trim();

    }


    if (
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ) {

        return (
            product.images[0] || ""
        );

    }


    if (
        product.images &&
        typeof product.images === "object"
    ) {

        const images =
            Object.values(
                product.images
            );


        if (images.length) {

            return (
                images[0] || ""
            );

        }

    }


    return "";

}


/*==================================================
FEATURE: PRODUCT PRICE
==================================================*/

function getProductPrice(
    product
) {

    return Number(
        product.price ??
        product.salePrice ??
        product.currentPrice ??
        0
    );

}


/*==================================================
FEATURE: OLD PRICE
==================================================*/

function getProductOldPrice(
    product
) {

    return Number(
        product.oldPrice ??
        product.originalPrice ??
        product.regularPrice ??
        product.compareAtPrice ??
        0
    );

}


/*==================================================
FEATURE: STOCK
==================================================*/

function getStock(
    product
) {

    if (
        product.stock !== undefined &&
        product.stock !== null
    ) {

        return Number(
            product.stock
        ) || 0;

    }


    if (
        product.stockQuantity !== undefined
    ) {

        return Number(
            product.stockQuantity
        ) || 0;

    }


    if (
        product.quantity !== undefined
    ) {

        return Number(
            product.quantity
        ) || 0;

    }


    if (
        product.inStock === true ||
        product.available === true
    ) {

        return 1;

    }


    return 0;

}


/*==================================================
FEATURE: DISCOUNT
==================================================*/

function getDiscount(
    product,
    price,
    oldPrice
) {

    if (
        product.discount !==
        undefined &&
        product.discount !== null
    ) {

        return Number(
            product.discount
        ) || 0;

    }


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        return Math.round(
            (
                (
                    oldPrice -
                    price
                )
                /
                oldPrice
            ) *
            100
        );

    }


    return 0;

}


/*==================================================
FEATURE: STARS
==================================================*/

function createStars(
    rating
) {

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


    let result =
        "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        result +=
            i <= rounded
                ? "★"
                : "☆";

    }


    return result;

}


/*==================================================
FEATURE: WISHLIST CARD EVENTS
==================================================*/

if (wishlistGrid) {

    wishlistGrid.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const productId =
                button.dataset.productId;


            if (!productId) {

                return;

            }


            if (action === "remove") {

                await removeFromWishlist(
                    productId
                );

            }


            if (action === "view") {

                openProductDetails(
                    productId
                );

            }


            if (action === "cart") {

                await addToCart(
                    productId
                );

            }

        }
    );

}


/*==================================================
FEATURE: REMOVE FROM WISHLIST
==================================================*/

async function removeFromWishlist(
    productId
) {

    if (
        !currentUser ||
        !db
    ) {

        showToast(
            "fa-solid fa-lock",
            "Login Required",
            "Please login first.",
            "error"
        );

        return;

    }


    const product =
        wishlistProducts.find(
            item =>
                String(
                    getProductId(item)
                ) ===
                String(productId)
        );


    const productName =
        product
            ? getProductName(product)
            : "Product";


    try {

        await remove(
            ref(
                db,
                `${getWishlistPath(currentUser.uid)}/${productId}`
            )
        );


        wishlistProducts =
            wishlistProducts.filter(
                item =>
                    String(
                        getProductId(item)
                    ) !==
                    String(productId)
            );


        updateWishlistCount();

        renderWishlist();


        showToast(
            "fa-solid fa-heart-crack",
            "Removed",
            `${productName} removed from your wishlist.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Remove wishlist error:",
            error
        );


        showToast(
            "fa-solid fa-triangle-exclamation",
            "Remove Failed",
            getFirebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


/*==================================================
FEATURE: ADD TO CART
==================================================*/

async function addToCart(
    productId
) {

    if (
        !currentUser ||
        !db
    ) {

        showToast(
            "fa-solid fa-lock",
            "Login Required",
            "Please login first.",
            "error"
        );

        return;

    }


    const product =
        wishlistProducts.find(
            item =>
                String(
                    getProductId(item)
                ) ===
                String(productId)
        );


    if (!product) {

        showToast(
            "fa-solid fa-triangle-exclamation",
            "Product Not Found",
            "This product is no longer available.",
            "error"
        );

        return;

    }


    const stock =
        getStock(product);


    if (stock <= 0) {

        showToast(
            "fa-solid fa-box-open",
            "Out of Stock",
            "This product is currently out of stock.",
            "error"
        );

        return;

    }


    try {

        const cartItemRef =
            ref(
                db,
                `users/${currentUser.uid}/cart/${productId}`
            );


        const existingSnapshot =
            await get(
                cartItemRef
            );


        if (
            existingSnapshot.exists()
        ) {

            const existing =
                existingSnapshot.val();


            const currentQuantity =
                Number(
                    existing.quantity
                ) || 0;


            const newQuantity =
                Math.min(
                    currentQuantity + 1,
                    stock
                );


            await update(
                cartItemRef,
                {

                    quantity:
                        newQuantity,

                    updatedAt:
                        Date.now()

                }
            );

        } else {

            await set(
                cartItemRef,
                {

                    productId,

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
                        getProductPrice(
                            product
                        ),

                    oldPrice:
                        getProductOldPrice(
                            product
                        ),

                    category:
                        product.category ||
                        "",

                    quantity:
                        1,

                    sellerId:
                        product.sellerId ||
                        "",

                    addedAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                }
            );

        }


        showToast(
            "fa-solid fa-cart-shopping",
            "Added to Cart",
            `${getProductName(product)} has been added to your cart.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );


        showToast(
            "fa-solid fa-triangle-exclamation",
            "Cart Error",
            getFirebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


/*==================================================
FEATURE: ADD ALL TO CART
==================================================*/

async function addAllToCart() {

    if (
        !currentUser ||
        !db
    ) {

        showToast(
            "fa-solid fa-lock",
            "Login Required",
            "Please login first.",
            "error"
        );

        return;

    }


    const availableProducts =
        wishlistProducts.filter(
            product =>
                getStock(product) > 0
        );


    if (
        availableProducts.length === 0
    ) {

        showToast(
            "fa-solid fa-cart-shopping",
            "Nothing to Add",
            "There are no available wishlist products.",
            "error"
        );

        return;

    }


    try {

        const updates = {};


        for (
            const product of availableProducts
        ) {

            const productId =
                getProductId(
                    product
                );


            if (!productId) {

                continue;

            }


            const cartPath =
                `users/${currentUser.uid}/cart/${productId}`;


            const existingSnapshot =
                await get(
                    ref(
                        db,
                        cartPath
                    )
                );


            if (
                existingSnapshot.exists()
            ) {

                const existing =
                    existingSnapshot.val();


                const currentQuantity =
                    Number(
                        existing.quantity
                    ) || 0;


                const stock =
                    getStock(product);


                updates[
                    `${cartPath}/quantity`
                ] =
                    Math.min(
                        currentQuantity + 1,
                        stock
                    );


                updates[
                    `${cartPath}/updatedAt`
                ] =
                    Date.now();

            } else {

                updates[
                    cartPath
                ] = {

                    productId,

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
                        getProductPrice(
                            product
                        ),

                    oldPrice:
                        getProductOldPrice(
                            product
                        ),

                    category:
                        product.category ||
                        "",

                    quantity:
                        1,

                    sellerId:
                        product.sellerId ||
                        "",

                    addedAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                };

            }

        }


        if (
            Object.keys(
                updates
            ).length
        ) {

            await update(
                ref(
                    db
                ),
                updates
            );

        }


        showToast(
            "fa-solid fa-cart-shopping",
            "Added to Cart",
            `${availableProducts.length} wishlist product(s) added to your cart.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Add all to cart error:",
            error
        );


        showToast(
            "fa-solid fa-triangle-exclamation",
            "Cart Error",
            getFirebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


/*==================================================
FEATURE: CLEAR WISHLIST
==================================================*/

function clearWishlist() {

    if (
        !currentUser ||
        !db
    ) {

        showToast(
            "fa-solid fa-lock",
            "Login Required",
            "Please login first.",
            "error"
        );

        return;

    }


    if (
        wishlistProducts.length === 0
    ) {

        showToast(
            "fa-regular fa-heart",
            "Wishlist Empty",
            "There is nothing to clear.",
            "error"
        );

        return;

    }


    pendingAction = {
        type: "clear"
    };


    openConfirmModal(
        "Clear Wishlist?",
        "Are you sure you want to remove all products from your wishlist?"
    );

}


/*==================================================
FEATURE: CONFIRM MODAL
==================================================*/

function openConfirmModal(
    title,
    message
) {

    if (!wishlistConfirmModal) {

        const confirmed =
            window.confirm(
                message
            );


        if (confirmed) {

            performPendingAction();

        }

        return;

    }


    if (wishlistModalTitle) {

        wishlistModalTitle.textContent =
            title;

    }


    if (wishlistModalMessage) {

        wishlistModalMessage.textContent =
            message;

    }


    wishlistConfirmModal.style.display =
        "flex";


    document.body.classList.add(
        "wishlist-modal-open"
    );

}


/*==================================================
FEATURE: CLOSE CONFIRM MODAL
==================================================*/

function closeConfirmModal() {

    if (wishlistConfirmModal) {

        wishlistConfirmModal.style.display =
            "none";

    }


    document.body.classList.remove(
        "wishlist-modal-open"
    );


    pendingAction = null;

}


/*==================================================
FEATURE: PERFORM PENDING ACTION
==================================================*/

async function performPendingAction() {

    const action =
        pendingAction;


    pendingAction =
        null;


    closeConfirmModal();


    if (!action) {

        return;

    }


    if (
        action.type ===
        "clear"
    ) {

        await performClearWishlist();

    }

}


/*==================================================
FEATURE: PERFORM CLEAR WISHLIST
==================================================*/

async function performClearWishlist() {

    if (
        !currentUser ||
        !db
    ) {

        return;

    }


    try {

        await remove(
            ref(
                db,
                getWishlistPath(
                    currentUser.uid
                )
            )
        );


        wishlistProducts = [];


        updateWishlistCount();

        renderWishlist();


        showToast(
            "fa-regular fa-heart",
            "Wishlist Cleared",
            "All products have been removed from your wishlist.",
            "success"
        );

    } catch (error) {

        console.error(
            "Clear wishlist error:",
            error
        );


        showToast(
            "fa-solid fa-triangle-exclamation",
            "Clear Failed",
            getFirebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


/*==================================================
FEATURE: SEARCH
==================================================*/

if (wishlistSearchInput) {

    wishlistSearchInput.addEventListener(
        "input",
        () => {

            currentSearch =
                wishlistSearchInput.value || "";


            if (
                clearWishlistSearch
            ) {

                clearWishlistSearch.style.display =
                    currentSearch
                        ? "block"
                        : "none";

            }


            renderWishlist();

        }
    );

}


/*==================================================
FEATURE: CLEAR SEARCH
==================================================*/

if (clearWishlistSearch) {

    clearWishlistSearch.addEventListener(
        "click",
        () => {

            if (wishlistSearchInput) {

                wishlistSearchInput.value =
                    "";

            }


            currentSearch =
                "";


            clearWishlistSearch.style.display =
                "none";


            renderWishlist();

        }
    );

}


/*==================================================
FEATURE: FILTER BUTTONS
==================================================*/

document
    .querySelectorAll(
        "[data-filter]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentFilter =
                        button.dataset.filter ||
                        "all";


                    document
                        .querySelectorAll(
                            "[data-filter]"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    renderWishlist();

                }
            );

        }
    );


/*==================================================
FEATURE: ADD ALL BUTTON
==================================================*/

if (addAllToCartBtn) {

    addAllToCartBtn.addEventListener(
        "click",
        addAllToCart
    );

}


/*==================================================
FEATURE: CLEAR WISHLIST BUTTON
==================================================*/

if (clearWishlistBtn) {

    clearWishlistBtn.addEventListener(
        "click",
        clearWishlist
    );

}


/*==================================================
FEATURE: CONTINUE SHOPPING
==================================================*/

if (continueShoppingBtn) {

    continueShoppingBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "./index.html";

        }
    );

}


/*==================================================
FEATURE: MODAL CANCEL
==================================================*/

if (wishlistModalCancel) {

    wishlistModalCancel.addEventListener(
        "click",
        closeConfirmModal
    );

}


/*==================================================
FEATURE: MODAL OVERLAY
==================================================*/

if (wishlistModalOverlay) {

    wishlistModalOverlay.addEventListener(
        "click",
        closeConfirmModal
    );

}


/*==================================================
FEATURE: MODAL CONFIRM
==================================================*/

if (wishlistModalConfirm) {

    wishlistModalConfirm.addEventListener(
        "click",
        performPendingAction
    );

}


/*==================================================
FEATURE: CLOSE TOAST
==================================================*/

if (closeWishlistToast) {

    closeWishlistToast.addEventListener(
        "click",
        () => {

            hideToast();

        }
    );

}


/*==================================================
FEATURE: OPEN PRODUCT DETAILS
==================================================*/

function openProductDetails(
    productId
) {

    if (!productId) {

        return;

    }


    window.location.href =
        `./product-details.html?id=${encodeURIComponent(productId)}`;

}


/*==================================================
FEATURE: TOAST
==================================================*/

let toastTimer =
    null;


function showToast(
    icon,
    title,
    message,
    type = "success"
) {

    if (!wishlistToast) {

        return;

    }


    if (wishlistToastIcon) {

        wishlistToastIcon.className =
            icon;

    }


    if (wishlistToastTitle) {

        wishlistToastTitle.textContent =
            title;

    }


    if (wishlistToastMessage) {

        wishlistToastMessage.textContent =
            message;

    }


    wishlistToast.classList.remove(
        "success",
        "error",
        "warning"
    );


    wishlistToast.classList.add(
        type
    );


    wishlistToast.style.display =
        "flex";


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            hideToast,
            4000
        );

}


/*==================================================
FEATURE: HIDE TOAST
==================================================*/

function hideToast() {

    if (wishlistToast) {

        wishlistToast.style.display =
            "none";

    }

}


/*==================================================
FEATURE: FIREBASE ERROR
==================================================*/

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return "Something went wrong.";

    }


    const code =
        error.code || "";


    switch (code) {

        case "PERMISSION_DENIED":
        case "permission-denied":

            return "Firebase permission denied. Please check your Database Rules.";


        case "network-request-failed":

            return "Network error. Please check your internet connection.";


        default:

            return (
                error.message ||
                "Something went wrong. Please try again."
            );

    }

}


/*==================================================
FEATURE: INITIAL FILTER
==================================================*/

document
    .querySelector(
        '[data-filter="all"]'
    )
    ?.classList.add(
        "active"
    );


/*==================================================
SMARTBAZAAR PRO 2
FEATURE: WISHLIST SYSTEM
END OF FILE
==================================================*/
