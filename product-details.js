/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PRODUCT DETAILS SYSTEM
FEATURE: ADVANCED PRODUCT DETAIL SUPPORT
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORT
==================================================*/

import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/*==================================================
FEATURE: FIREBASE
==================================================*/

const db =
    getDatabase(app);


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

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


/*==================================================
FEATURE: GET PRODUCT ID
URL:
product-details.html?id=PRODUCT_ID
==================================================*/

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const productId =
    urlParams.get("id");


/*==================================================
FEATURE: LOAD PRODUCT
==================================================*/

if (!productId) {

    showProductError();

} else {

    loadProduct(
        productId
    );

}


/*==================================================
FEATURE: LOAD PRODUCT FROM FIREBASE
==================================================*/

async function loadProduct(id) {

    try {

        const productRef =
            ref(
                db,
                `products/${id}`
            );


        const snapshot =
            await get(
                productRef
            );


        if (!snapshot.exists()) {

            showProductError();

            return;

        }


        const product =
            snapshot.val();


        /*
         * IMPORTANT:
         * Existing products remain compatible.
         */

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


/*==================================================
FEATURE: RENDER PRODUCT
==================================================*/

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


    /*==================================================
    FEATURE: PRODUCT NAME
    ==================================================*/

    productName.textContent =
        product.name ||
        product.title ||
        "Product";


    document.title =
        `${productName.textContent} | SmartBazaar Pro`;


    /*==================================================
    FEATURE: CATEGORY
    ==================================================*/

    productCategory.textContent =
        product.category ||
        "Product";


    /*==================================================
    FEATURE: BRAND
    ==================================================*/

    renderAdvancedMeta(
        product
    );


    /*==================================================
    FEATURE: PRICE
    ==================================================*/

    const price =
        Number(
            product.price || 0
        );


    productPrice.textContent =
        formatPrice(
            price
        );


    /*==================================================
    FEATURE: OLD PRICE
    ==================================================*/

    const oldPrice =
        Number(
            product.oldPrice ||
            product.originalPrice ||
            0
        );


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        productOldPrice.textContent =
            formatPrice(
                oldPrice
            );


        const discount =
            product.discount != null
                ? Number(product.discount)
                : Math.round(
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
                );


        productDiscount.textContent =
            `-${discount}%`;

    } else {

        productOldPrice.textContent =
            "";

        productDiscount.textContent =
            "";

    }


    /*==================================================
    FEATURE: RATING
    ==================================================*/

    const rating =
        Number(
            product.rating || 0
        );


    productStars.textContent =
        createStars(
            rating
        );


    productReviews.textContent =
        `${Number(product.reviews || 0)} Reviews`;


    /*==================================================
    FEATURE: STOCK
    ==================================================*/

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


    /*==================================================
    FEATURE: SHORT DESCRIPTION
    ==================================================*/

    productShortDescription.textContent =
        product.shortDescription ||
        product.short_description ||
        product.description ||
        "No description available.";


    /*==================================================
    FEATURE: FULL DESCRIPTION
    ==================================================*/

    const fullDescription =
        product.description ||
        product.fullDescription ||
        "";


    if (fullDescription.trim()) {

        productDescription.textContent =
            fullDescription;

        productDescriptionSection.style.display =
            "block";

    } else {

        productDescription.textContent =
            "";

        productDescriptionSection.style.display =
            "none";

    }


    /*==================================================
    FEATURE: SELLER
    ==================================================*/

    sellerName.textContent =
        product.sellerName ||
        product.seller ||
        "SmartBazaar Seller";


    /*==================================================
    FEATURE: IMAGES
    ==================================================*/

    const images =
        getProductImages(
            product
        );


    if (images.length > 0) {

        setMainImage(
            images[0]
        );


        createThumbnails(
            images
        );

    }


    /*==================================================
    FEATURE: ADVANCED PRODUCT CONTENT
    ==================================================*/

    renderAdvancedProductContent(
        product
    );


    /*==================================================
    FEATURE: BUTTON DATA
    ==================================================*/

    addToCartButton.dataset.productId =
        id;


    buyNowButton.dataset.productId =
        id;


    wishlistButton.dataset.productId =
        id;


    /*==================================================
    FEATURE: STOCK QUANTITY LIMIT
    ==================================================*/

    productQuantity.max =
        stock > 0
            ? stock
            : 1;


    if (stock <= 0) {

        addToCartButton.disabled =
            true;

        buyNowButton.disabled =
            true;

    } else {

        addToCartButton.disabled =
            false;

        buyNowButton.disabled =
            false;

    }


}


/*==================================================
FEATURE: ADVANCED META
==================================================*/

function renderAdvancedMeta(
    product
) {

    let metaContainer =
        document.getElementById(
            "productAdvancedMeta"
        );


    if (!metaContainer) {

        metaContainer =
            document.createElement(
                "div"
            );


        metaContainer.id =
            "productAdvancedMeta";


        metaContainer.className =
            "product-advanced-meta";


        const information =
            document.querySelector(
                ".product-information"
            );


        if (information) {

            information.appendChild(
                metaContainer
            );

        }

    }


    metaContainer.innerHTML =
        "";


    const items = [];


    /* BRAND */

    if (product.brand) {

        items.push({
            label: "Brand",
            value: product.brand
        });

    }


    /* SKU */

    if (product.sku || product.SKU) {

        items.push({
            label: "SKU",
            value:
                product.sku ||
                product.SKU
        });

    }


    /* CONDITION */

    if (product.condition || product.productCondition) {

        items.push({
            label: "Condition",
            value:
                formatCondition(
                    product.condition ||
                    product.productCondition
                )
        });

    }


    if (!items.length) {

        return;

    }


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        "Product Information";


    metaContainer.appendChild(
        title
    );


    items.forEach(
        item => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "product-meta-row";


            row.innerHTML =
                `
                    <span>
                        ${escapeHTML(item.label)}
                    </span>

                    <strong>
                        ${escapeHTML(item.value)}
                    </strong>
                `;


            metaContainer.appendChild(
                row
            );

        }
    );

}


/*==================================================
FEATURE: CONDITION FORMAT
==================================================*/

function formatCondition(
    value
) {

    const condition =
        String(value)
            .toLowerCase();


    if (condition === "new") {

        return "New";

    }


    if (condition === "used") {

        return "Used";

    }


    if (condition === "refurbished") {

        return "Refurbished";

    }


    return value;

}


/*==================================================
FEATURE: ADVANCED PRODUCT CONTENT
==================================================*/

function renderAdvancedProductContent(
    product
) {

    let container =
        document.getElementById(
            "advancedProductContent"
        );


    if (!container) {

        container =
            document.createElement(
                "section"
            );


        container.id =
            "advancedProductContent";


        container.className =
            "advanced-product-content";


        productDescriptionSection
            .parentNode
            .insertBefore(
                container,
                productDescriptionSection.nextSibling
            );

    }


    container.innerHTML =
        "";


    /*==================================================
    FEATURE: FREE SHIPPING
    ==================================================*/

    if (
        product.freeShipping === true
    ) {

        const shipping =
            document.createElement(
                "div"
            );


        shipping.className =
            "free-shipping-badge";


        shipping.innerHTML =
            `
                <i class="fa-solid fa-truck"></i>
                Free Shipping
            `;


        container.appendChild(
            shipping
        );

    }


    /*==================================================
    FEATURE: FEATURED
    ==================================================*/

    if (
        product.featured === true
    ) {

        const featured =
            document.createElement(
                "div"
            );


        featured.className =
            "featured-product-badge";


        featured.innerHTML =
            `
                <i class="fa-solid fa-star"></i>
                Featured Product
            `;


        container.appendChild(
            featured
        );

    }


    /*==================================================
    FEATURE: LOW STOCK WARNING
    ==================================================*/

    const stock =
        Number(
            product.stock || 0
        );


    const lowStockLimit =
        Number(
            product.lowStockLimit ||
            5
        );


    if (
        stock > 0 &&
        stock <= lowStockLimit
    ) {

        const warning =
            document.createElement(
                "div"
            );


        warning.className =
            "low-stock-warning";


        warning.innerHTML =
            `
                <i class="fa-solid fa-triangle-exclamation"></i>
                Only ${stock} left in stock
            `;


        container.appendChild(
            warning
        );

    }


    /*==================================================
    FEATURE: CONTENT BLOCKS
    ==================================================*/

    const blocks =
        normalizeContentBlocks(
            product.contentBlocks ||
            product.content ||
            product.detailBlocks
        );


    if (blocks.length) {

        const blocksWrapper =
            document.createElement(
                "div"
            );


        blocksWrapper.className =
            "product-content-blocks";


        blocks.forEach(
            block => {

                const element =
                    renderContentBlock(
                        block
                    );


                if (element) {

                    blocksWrapper.appendChild(
                        element
                    );

                }

            }
        );


        container.appendChild(
            blocksWrapper
        );

    }


    /*==================================================
    FEATURE: SPECIFICATIONS
    ==================================================*/

    const specifications =
        product.specifications;


    if (specifications) {

        const specificationElement =
            renderSpecifications(
                specifications
            );


        if (specificationElement) {

            container.appendChild(
                specificationElement
            );

        }

    }


    if (!container.innerHTML.trim()) {

        container.style.display =
            "none";

    } else {

        container.style.display =
            "block";

    }

}


/*==================================================
FEATURE: NORMALIZE CONTENT BLOCKS
==================================================*/

function normalizeContentBlocks(
    blocks
) {

    if (
        Array.isArray(blocks)
    ) {

        return blocks;

    }


    if (
        blocks &&
        typeof blocks === "object"
    ) {

        return Object.values(
            blocks
        );

    }


    return [];

}


/*==================================================
FEATURE: RENDER CONTENT BLOCK
==================================================*/

function renderContentBlock(
    block
) {

    if (!block) {

        return null;

    }


    const type =
        String(
            block.type ||
            block.blockType ||
            ""
        ).toLowerCase();


    /*==================================================
    HEADING
    ==================================================*/

    if (
        type === "heading"
    ) {

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "product-content-heading";


        const heading =
            document.createElement(
                "h2"
            );


        heading.textContent =
            block.content ||
            block.text ||
            block.title ||
            "Product Details";


        section.appendChild(
            heading
        );


        return section;

    }


    /*==================================================
    TEXT
    ==================================================*/

    if (
        type === "text"
    ) {

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "product-content-text";


        const text =
            document.createElement(
                "p"
            );


        text.textContent =
            block.content ||
            block.text ||
            "";


        section.appendChild(
            text
        );


        return section;

    }


    /*==================================================
    IMAGE
    ==================================================*/

    if (
        type === "image"
    ) {

        const url =
            block.url ||
            block.src ||
            block.image;


        if (!url) {

            return null;

        }


        const section =
            document.createElement(
                "div"
            );


        section.className =
            "product-content-image";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            url;


        image.alt =
            block.alt ||
            "Product Detail Image";


        image.loading =
            "lazy";


        section.appendChild(
            image
        );


        return section;

    }


    /*==================================================
    VIDEO
    ==================================================*/

    if (
        type === "video"
    ) {

        const url =
            block.url ||
            block.src ||
            block.videoUrl;


        if (!url) {

            return null;

        }


        return createVideoElement(
            url
        );

    }


    /*==================================================
    DIVIDER
    ==================================================*/

    if (
        type === "divider"
    ) {

        return document.createElement(
            "hr"
        );

    }


    /*==================================================
    SPECIFICATIONS BLOCK
    ==================================================*/

    if (
        type === "specifications" ||
        type === "specification"
    ) {

        return renderSpecifications(
            block.data ||
            block.items ||
            block.specifications
        );

    }


    return null;

}


/*==================================================
FEATURE: SPECIFICATIONS
==================================================*/

function renderSpecifications(
    specifications
) {

    if (!specifications) {

        return null;

    }


    const section =
        document.createElement(
            "section"
        );


    section.className =
        "product-specifications";


    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        "Specifications";


    section.appendChild(
        title
    );


    const table =
        document.createElement(
            "div"
        );


    table.className =
        "specifications-list";


    if (
        Array.isArray(
            specifications
        )
    ) {

        specifications.forEach(
            item => {

                if (
                    !item ||
                    typeof item !== "object"
                ) {

                    return;

                }


                const key =
                    item.name ||
                    item.key ||
                    item.label;


                const value =
                    item.value ||
                    item.content ||
                    "";


                addSpecificationRow(
                    table,
                    key,
                    value
                );

            }
        );

    } else if (
        typeof specifications === "object"
    ) {

        Object.entries(
            specifications
        ).forEach(
            ([key, value]) => {

                addSpecificationRow(
                    table,
                    key,
                    value
                );

            }
        );

    }


    if (!table.children.length) {

        return null;

    }


    section.appendChild(
        table
    );


    return section;

}


/*==================================================
FEATURE: SPECIFICATION ROW
==================================================*/

function addSpecificationRow(
    container,
    key,
    value
) {

    if (!key) {

        return;

    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "specification-row";


    const name =
        document.createElement(
            "span"
        );


    name.textContent =
        key;


    const data =
        document.createElement(
            "strong"
        );


    data.textContent =
        value;


    row.appendChild(
        name
    );


    row.appendChild(
        data
    );


    container.appendChild(
        row
    );

}


/*==================================================
FEATURE: PRODUCT VIDEO
==================================================*/

function createVideoElement(
    url
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "product-video-section";


    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        "Product Video";


    const video =
        document.createElement(
            "video"
        );


    video.controls =
        true;


    video.playsInline =
        true;


    video.preload =
        "metadata";


    video.src =
        url;


    wrapper.appendChild(
        title
    );


    wrapper.appendChild(
        video
    );


    return wrapper;

}


/*==================================================
FEATURE: PRODUCT IMAGES
==================================================*/

function getProductImages(
    product
) {

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
                    "string" &&
                    image.trim()
            );

    }


    if (
        images.length === 0 &&
        product.images &&
        typeof product.images ===
        "object"
    ) {

        images =
            Object.values(
                product.images
            ).filter(
                image =>
                    typeof image ===
                    "string" &&
                    image.trim()
            );

    }


    if (
        images.length === 0 &&
        product.image
    ) {

        images.push(
            product.image
        );

    }


    if (
        images.length === 0 &&
        product.imageUrl
    ) {

        images.push(
            product.imageUrl
        );

    }


    return images;

}


/*==================================================
FEATURE: MAIN IMAGE
==================================================*/

function setMainImage(
    image
) {

    productMainImage.src =
        image;


    productMainImage.alt =
        productName.textContent;

}


/*==================================================
FEATURE: THUMBNAILS
==================================================*/

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


            thumbnail.alt =
                `Product Image ${index + 1}`;


            thumbnail.loading =
                "lazy";


            if (
                index === 0
            ) {

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


/*==================================================
FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(
    price
) {

    return (
        "Rs. " +
        Number(price)
            .toLocaleString(
                "en-PK"
            )
    );

}


/*==================================================
FEATURE: STAR GENERATOR
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


    let stars =
        "";


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


/*==================================================
FEATURE: QUANTITY
==================================================*/

increaseQuantity.addEventListener(
    "click",
    () => {

        const current =
            Number(
                productQuantity.value
            ) || 1;


        const max =
            Number(
                productQuantity.max
            );


        if (
            max > 0 &&
            current >= max
        ) {

            productQuantity.value =
                max;

            return;

        }


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


        if (
            current > 1
        ) {

            productQuantity.value =
                current - 1;

        }

    }
);


/*==================================================
FEATURE: QUANTITY VALIDATION
==================================================*/

productQuantity.addEventListener(
    "change",
    () => {

        let quantity =
            Number(
                productQuantity.value
            ) || 1;


        const max =
            Number(
                productQuantity.max
            );


        if (
            quantity < 1
        ) {

            quantity =
                1;

        }


        if (
            max > 0 &&
            quantity > max
        ) {

            quantity =
                max;

        }


        productQuantity.value =
            quantity;

    }
);


/*==================================================
FEATURE: ADD TO CART
==================================================*/

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


/*==================================================
FEATURE: BUY NOW
==================================================*/

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
         * Checkout system remains
         * ready for later integration.
         */


        alert(
            "Buy Now system is ready for checkout integration."
        );

    }
);


/*==================================================
FEATURE: WISHLIST
==================================================*/

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


/*==================================================
FEATURE: HTML ESCAPE
==================================================*/

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


/*==================================================
FEATURE: PRODUCT ERROR
==================================================*/

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
