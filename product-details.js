/* =========================================================
   SMARTBAZAAR PRO
   FEATURE: PRODUCT DETAILS SYSTEM
   ========================================================= */

import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
   ========================================================= */

const db = getDatabase(app);


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const productDetailsLoading =
    document.getElementById(
        "productDetailsLoading"
    );

const productContent =
    document.getElementById(
        "productContent"
    );

const productError =
    document.getElementById(
        "productError"
    );

const productDescriptionSection =
    document.getElementById(
        "productDescriptionSection"
    );


const productMainImage =
    document.getElementById(
        "productMainImage"
    );

const productThumbnails =
    document.getElementById(
        "productThumbnails"
    );

const productCategory =
    document.getElementById(
        "productCategory"
    );

const productName =
    document.getElementById(
        "productName"
    );

const productStars =
    document.getElementById(
        "productStars"
    );

const productReviews =
    document.getElementById(
        "productReviews"
    );

const productPrice =
    document.getElementById(
        "productPrice"
    );

const productOldPrice =
    document.getElementById(
        "productOldPrice"
    );

const productDiscount =
    document.getElementById(
        "productDiscount"
    );

const productStock =
    document.getElementById(
        "productStock"
    );

const productShortDescription =
    document.getElementById(
        "productShortDescription"
    );

const productDescription =
    document.getElementById(
        "productDescription"
    );

const sellerName =
    document.getElementById(
        "sellerName"
    );

const productQuantity =
    document.getElementById(
        "productQuantity"
    );

const increaseQuantity =
    document.getElementById(
        "increaseQuantity"
    );

const decreaseQuantity =
    document.getElementById(
        "decreaseQuantity"
    );

const addToCartButton =
    document.getElementById(
        "addToCartButton"
    );

const buyNowButton =
    document.getElementById(
        "buyNowButton"
    );

const wishlistButton =
    document.getElementById(
        "wishlistButton"
    );


/* =========================================================
   GET PRODUCT ID
   URL:
   product-details.html?id=PRODUCT_ID
   ========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const productId =
    urlParams.get("id");


/* =========================================================
   CHECK PRODUCT ID
   ========================================================= */

if (!productId) {

    showProductError();

} else {

    loadProduct(productId);

}


/* =========================================================
   LOAD PRODUCT
   ========================================================= */

async function loadProduct(id) {

    try {

        const productRef =
            ref(
                db,
                `products/${id}`
            );


        const snapshot =
            await get(productRef);


        if (!snapshot.exists()) {

            showProductError();

            return;

        }


        const product =
            snapshot.val();


        renderProduct(
            product,
            id
        );


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        showProductError();

    }

}


/* =========================================================
   RENDER PRODUCT
   ========================================================= */

function renderProduct(
    product,
    id
) {

    productDetailsLoading.style.display =
        "none";


    productContent.style.display =
        "grid";


    productDescriptionSection.style.display =
        "block";


    /* =====================================================
       NAME
       ===================================================== */

    productName.textContent =
        product.name ||
        product.title ||
        "Product";


    document.title =
        `${productName.textContent} | SmartBazaar Pro`;


    /* =====================================================
       CATEGORY
       ===================================================== */

    productCategory.textContent =
        product.category ||
        "Product";


    /* =====================================================
       PRICE
       ===================================================== */

    const price =
        Number(
            product.price || 0
        );


    productPrice.textContent =
        formatPrice(price);


    /* =====================================================
       OLD PRICE
       ===================================================== */

    const oldPrice =
        Number(
            product.oldPrice ||
            product.originalPrice ||
            0
        );


    if (
        oldPrice > price
        && oldPrice > 0
    ) {

        productOldPrice.textContent =
            formatPrice(oldPrice);


        const discount =
            Math.round(
                (
                    (
                        oldPrice - price
                    )
                    /
                    oldPrice
                )
                *
                100
            );


        productDiscount.textContent =
            `-${discount}%`;

    } else {

        productOldPrice.textContent =
            "";

        productDiscount.textContent =
            "";

    }


    /* =====================================================
       RATING
       ===================================================== */

    const rating =
        Number(
            product.rating || 0
        );


    productStars.textContent =
        createStars(rating);


    productReviews.textContent =
        `${product.reviews || 0} Reviews`;


    /* =====================================================
       STOCK
       ===================================================== */

    const stock =
        Number(
            product.stock || 0
        );


    if (stock > 0) {

        productStock.textContent =
            `In Stock (${stock})`;

        productStock.classList.remove(
            "out-of-stock"
        );

    } else {

        productStock.textContent =
            "Out of Stock";

        productStock.classList.add(
            "out-of-stock"
        );

    }


    /* =====================================================
       SHORT DESCRIPTION
       ===================================================== */

    productShortDescription.textContent =
        product.shortDescription ||
        product.short_description ||
        product.description ||
        "No description available.";


    /* =====================================================
       FULL DESCRIPTION
       ===================================================== */

    productDescription.textContent =
        product.description ||
        product.fullDescription ||
        "No detailed description available.";


    /* =====================================================
       SELLER
       ===================================================== */

    sellerName.textContent =
        product.sellerName ||
        product.seller ||
        "SmartBazaar Seller";


    /* =====================================================
       IMAGES
       ===================================================== */

    const images =
        getProductImages(product);


    if (images.length > 0) {

        setMainImage(
            images[0]
        );


        createThumbnails(
            images
        );

    }


    /* =====================================================
       BUTTON DATA
       ===================================================== */

    addToCartButton.dataset.productId =
        id;

    buyNowButton.dataset.productId =
        id;

    wishlistButton.dataset.productId =
        id;

}


/* =========================================================
   PRODUCT IMAGES
   ========================================================= */

function getProductImages(product) {

    let images = [];


    if (
        Array.isArray(
            product.images
        )
    ) {

        images =
            product.images.filter(
                image =>
                    typeof image ===
                    "string"
            );

    }


    if (
        images.length === 0
        &&
        typeof product.images ===
        "object"
    ) {

        images =
            Object.values(
                product.images
            ).filter(
                image =>
                    typeof image ===
                    "string"
            );

    }


    if (
        images.length === 0
        &&
        product.image
    ) {

        images.push(
            product.image
        );

    }


    if (
        images.length === 0
        &&
        product.imageUrl
    ) {

        images.push(
            product.imageUrl
        );

    }


    return images;

}


/* =========================================================
   MAIN IMAGE
   ========================================================= */

function setMainImage(
    image
) {

    productMainImage.src =
        image;

    productMainImage.alt =
        productName.textContent;

}


/* =========================================================
   THUMBNAILS
   ========================================================= */

function createThumbnails(
    images
) {

    productThumbnails.innerHTML =
        "";


    images.forEach(
        (
            image,
            index
        ) => {

            const thumbnail =
                document.createElement(
                    "img"
                );


            thumbnail.src =
                image;

            thumbnail.className =
                "product-thumbnail";


            if (index === 0) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".product-thumbnail"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    thumbnail.classList.add(
                        "active"
                    );


                    setMainImage(
                        image
                    );

                }
            );


            productThumbnails.appendChild(
                thumbnail
            );

        }
    );

}


/* =========================================================
   PRICE FORMAT
   ========================================================= */

function formatPrice(
    price
) {

    return (
        "Rs. "
        +
        Number(price)
            .toLocaleString(
                "en-PK"
            )
    );

}


/* =========================================================
   STAR GENERATOR
   ========================================================= */

function createStars(
    rating
) {

    const rounded =
        Math.round(
            rating
        );


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= rounded
                ? "★"
                : "☆";

    }


    return stars;

}


/* =========================================================
   QUANTITY
   ========================================================= */

increaseQuantity.addEventListener(
    "click",
    () => {

        const current =
            Number(
                productQuantity.value
            ) || 1;


        productQuantity.value =
            current + 1;

    }
);


decreaseQuantity.addEventListener(
    "click",
    () => {

        const current =
            Number(
                productQuantity.value
            ) || 1;


        if (current > 1) {

            productQuantity.value =
                current - 1;

        }

    }
);


/* =========================================================
   ADD TO CART
   ========================================================= */

addToCartButton.addEventListener(
    "click",
    () => {

        const id =
            addToCartButton.dataset.productId;


        const quantity =
            Number(
                productQuantity.value
            ) || 1;


        console.log(
            "Add to cart:",
            id,
            quantity
        );


        alert(
            "Product added to cart."
        );

    }
);


/* =========================================================
   BUY NOW
   ========================================================= */

buyNowButton.addEventListener(
    "click",
    () => {

        const id =
            buyNowButton.dataset.productId;


        const quantity =
            Number(
                productQuantity.value
            ) || 1;


        console.log(
            "Buy now:",
            id,
            quantity
        );


        /*
            Checkout system will be
            connected here later.
        */

        alert(
            "Buy Now system is ready for checkout integration."
        );

    }
);


/* =========================================================
   WISHLIST
   ========================================================= */

wishlistButton.addEventListener(
    "click",
    () => {

        const icon =
            wishlistButton.querySelector(
                "i"
            );


        icon.classList.toggle(
            "fa-regular"
        );

        icon.classList.toggle(
            "fa-solid"
        );


        wishlistButton.classList.toggle(
            "active"
        );

    }
);


/* =========================================================
   ERROR
   ========================================================= */

function showProductError() {

    productDetailsLoading.style.display =
        "none";


    productContent.style.display =
        "none";


    productDescriptionSection.style.display =
        "none";


    productError.style.display =
        "flex";

}
