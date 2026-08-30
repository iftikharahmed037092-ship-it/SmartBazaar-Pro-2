/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PRODUCT DETAILS SYSTEM
FEATURE: ADVANCED PRODUCT DETAIL SUPPORT
FEATURE: CLOUDINARY PRODUCT VIDEO SUPPORT
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
FEATURE: FIREBASE DATABASE
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

async function loadProduct(
    id
) {

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

    if (productDetailsLoading) {

        productDetailsLoading.style.display =
            "none";

    }


    if (productContent) {

        productContent.style.display =
            "grid";

    }


    if (productDescriptionSection) {

        productDescriptionSection.style.display =
            "block";

    }


    /*==================================================
    FEATURE: PRODUCT NAME
    ==================================================*/

    const finalProductName =
        product.name ||
        product.title ||
        "Product";


    if (productName) {

        productName.textContent =
            finalProductName;

    }


    document.title =
        `${finalProductName} | SmartBazaar Pro`;


    /*==================================================
    FEATURE: CATEGORY
    ==================================================*/

    if (productCategory) {

        productCategory.textContent =
            product.category ||
            "Product";

    }


    /*==================================================
    FEATURE: ADVANCED META
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


    if (productPrice) {

        productPrice.textContent =
            formatPrice(
                price
            );

    }


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
        productOldPrice &&
        productDiscount
    ) {

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

    }


    /*==================================================
    FEATURE: RATING
    ==================================================*/

    const rating =
        Number(
            product.rating || 0
        );


    if (productStars) {

        productStars.textContent =
            createStars(
                rating
            );

    }


    if (productReviews) {

        productReviews.textContent =
            `${Number(product.reviews || 0)} Reviews`;

    }


    /*==================================================
    FEATURE: STOCK
    ==================================================*/

    const stock =
        Number(
            product.stock || 0
        );


    if (productStock) {

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

    }


    /*==================================================
    FEATURE: SHORT DESCRIPTION
    ==================================================*/

    if (productShortDescription) {

        productShortDescription.textContent =
            product.shortDescription ||
            product.short_description ||
            product.description ||
            "No description available.";

    }


    /*==================================================
    FEATURE: FULL DESCRIPTION
    ==================================================*/

    const fullDescription =
        product.description ||
        product.fullDescription ||
        "";


    if (
        productDescription &&
        productDescriptionSection
    ) {

        if (
            String(fullDescription).trim()
        ) {

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

    }


    /*==================================================
    FEATURE: SELLER
    ==================================================*/

    if (sellerName) {

        sellerName.textContent =
            product.sellerName ||
            product.seller ||
            "SmartBazaar Seller";

    }


    /*==================================================
    FEATURE: PRODUCT IMAGES
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
    FEATURE: PRODUCT ID
    ==================================================*/

    if (addToCartButton) {

        addToCartButton.dataset.productId =
            id;

    }


    if (buyNowButton) {

        buyNowButton.dataset.productId =
            id;

    }


    if (wishlistButton) {

        wishlistButton.dataset.productId =
            id;

    }


    /*==================================================
    FEATURE: STOCK QUANTITY LIMIT
    ==================================================*/

    if (productQuantity) {

        productQuantity.max =
            stock > 0
                ? stock
                : 1;

    }


    /*==================================================
    FEATURE: DISABLE PURCHASE WHEN OUT OF STOCK
    ==================================================*/

    if (addToCartButton) {

        addToCartButton.disabled =
            stock <= 0;

    }


    if (buyNowButton) {

        buyNowButton.disabled =
            stock <= 0;

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


    if (!metaContainer) {

        return;

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

    if (
        product.sku ||
        product.SKU
    ) {

        items.push({
            label: "SKU",
            value:
                product.sku ||
                product.SKU
        });

    }


    /* CONDITION */

    if (
        product.condition ||
        product.productCondition
    ) {

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


            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                item.label;


            const value =
                document.createElement(
                    "strong"
                );


            value.textContent =
                item.value;


            row.appendChild(
                label
            );


            row.appendChild(
                value
            );


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


        if (
            productDescriptionSection &&
            productDescriptionSection.parentNode
        ) {

            productDescriptionSection
                .parentNode
                .insertBefore(
                    container,
                    productDescriptionSection.nextSibling
                );

        }

    }


    if (!container) {

        return;

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
    FEATURE: DIRECT PRODUCT VIDEO
    ==================================================*/

    const directVideos =
        getProductVideos(
            product
        );


    if (directVideos.length) {

        directVideos.forEach(
            videoUrl => {

                const videoElement =
                    createVideoElement(
                        videoUrl
                    );


                if (videoElement) {

                    container.appendChild(
                        videoElement
                    );

                }

            }
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


    /*==================================================
    FEATURE: SHOW / HIDE ADVANCED CONTENT
    ==================================================*/

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


        image.onerror =
            () => {

                console.error(
                    "Product detail image failed:",
                    url
                );

            };


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
            block.videoUrl ||
            block.video;


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
    SPECIFICATIONS
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
FEATURE: GET PRODUCT VIDEOS
SUPPORTS:

product.video
product.videoUrl
product.videos
==================================================*/

function getProductVideos(
    product
) {

    const videos = [];


    /*==================================================
    DIRECT VIDEO URL
    ==================================================*/

    if (
        typeof product.video === "string" &&
        product.video.trim()
    ) {

        videos.push(
            product.video.trim()
        );

    }


    /*==================================================
    VIDEO URL
    ==================================================*/

    if (
        typeof product.videoUrl === "string" &&
        product.videoUrl.trim()
    ) {

        if (
            !videos.includes(
                product.videoUrl.trim()
            )
        ) {

            videos.push(
                product.videoUrl.trim()
            );

        }

    }


    /*==================================================
    VIDEO ARRAY
    ==================================================*/

    if (
        Array.isArray(
            product.videos
        )
    ) {

        product.videos.forEach(
            video => {

                if (
                    typeof video === "string" &&
                    video.trim()
                ) {

                    if (
                        !videos.includes(
                            video.trim()
                        )
                    ) {

                        videos.push(
                            video.trim()
                        );

                    }

                } else if (
                    video &&
                    typeof video === "object"
                ) {

                    const url =
                        video.url ||
                        video.src ||
                        video.videoUrl ||
                        video.video;


                    if (
                        typeof url === "string" &&
                        url.trim() &&
                        !videos.includes(
                            url.trim()
                        )
                    ) {

                        videos.push(
                            url.trim()
                        );

                    }

                }

            }
        );

    }


    /*==================================================
    VIDEO OBJECT
    ==================================================*/

    if (
        product.videos &&
        typeof product.videos === "object" &&
        !Array.isArray(product.videos)
    ) {

        Object.values(
            product.videos
        ).forEach(
            video => {

                if (
                    typeof video === "string" &&
                    video.trim()
                ) {

                    if (
                        !videos.includes(
                            video.trim()
                        )
                    ) {

                        videos.push(
                            video.trim()
                        );

                    }

                } else if (
                    video &&
                    typeof video === "object"
                ) {

                    const url =
                        video.url ||
                        video.src ||
                        video.videoUrl ||
                        video.video;


                    if (
                        typeof url === "string" &&
                        url.trim() &&
                        !videos.includes(
                            url.trim()
                        )
                    ) {

                        videos.push(
                            url.trim()
                        );

                    }

                }

            }
        );

    }


    return videos;

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

    if (
        !url ||
        typeof url !== "string"
    ) {

        return null;

    }


    const cleanUrl =
        url.trim();


    if (!cleanUrl) {

        return null;

    }


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


    video.setAttribute(
        "controlsList",
        "nodownload"
    );


    video.setAttribute(
        "webkit-playsinline",
        "true"
    );


    /*==================================================
    FEATURE: CLOUDINARY VIDEO URL
    ==================================================*/

    const videoSource =
        createCloudinaryVideoUrl(
            cleanUrl
        );


    video.src =
        videoSource;


    video.style.width =
        "100%";


    video.style.maxWidth =
        "800px";


    video.style.display =
        "block";


    video.style.borderRadius =
        "14px";


    video.style.background =
        "#000";


    video.addEventListener(
        "error",
        () => {

            console.error(
                "Product video failed to load:",
                videoSource
            );

        }
    );


    wrapper.appendChild(
        title
    );


    wrapper.appendChild(
        video
    );


    return wrapper;

}


/*==================================================
FEATURE: CLOUDINARY VIDEO DELIVERY
==================================================*/

function createCloudinaryVideoUrl(
    url
) {

    if (
        !url.includes(
            "res.cloudinary.com"
        )
    ) {

        return url;

    }


    /*
     * Add Cloudinary automatic format
     * and quality optimization.
     *
     * Existing Cloudinary URL:
     *
     * /video/upload/...
     *
     * Becomes:
     *
     * /video/upload/f_auto,q_auto/...
     */

    if (
        url.includes(
            "/video/upload/"
        ) &&
        !url.includes(
            "/video/upload/f_auto"
        )
    ) {

        return url.replace(
            "/video/upload/",
            "/video/upload/f_auto,q_auto/"
        );

    }


    return url;

}


/*==================================================
FEATURE: PRODUCT IMAGES
==================================================*/

function getProductImages(
    product
) {

    let images = [];


    /*==================================================
    IMAGE ARRAY
    ==================================================*/

    if (
        Array.isArray(
            product.images
        )
    ) {

        images =
            product.images.filter(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );

    }


    /*==================================================
    IMAGE OBJECT
    ==================================================*/

    if (
        images.length === 0 &&
        product.images &&
        typeof product.images === "object"
    ) {

        images =
            Object.values(
                product.images
            ).filter(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );

    }


    /*==================================================
    MAIN IMAGE
    ==================================================*/

    if (
        images.length === 0 &&
        typeof product.image === "string" &&
        product.image.trim()
    ) {

        images.push(
            product.image.trim()
        );

    }


    /*==================================================
    IMAGE URL
    ==================================================*/

    if (
        images.length === 0 &&
        typeof product.imageUrl === "string" &&
        product.imageUrl.trim()
    ) {

        images.push(
            product.imageUrl.trim()
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

    if (!productMainImage) {

        return;

    }


    productMainImage.src =
        image;


    productMainImage.alt =
        productName
            ? productName.textContent
            : "Product";


    productMainImage.onerror =
        () => {

            console.error(
                "Main product image failed:",
                image
            );

        };

}


/*==================================================
FEATURE: THUMBNAILS
==================================================*/

function createThumbnails(
    images
) {

    if (!productThumbnails) {

        return;

    }


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

if (increaseQuantity) {

    increaseQuantity.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    productQuantity?.value
                ) || 1;


            const max =
                Number(
                    productQuantity?.max
                );


            if (
                max > 0 &&
                current >= max
            ) {

                if (productQuantity) {

                    productQuantity.value =
                        max;

                }

                return;

            }


            if (productQuantity) {

                productQuantity.value =
                    current + 1;

            }

        }
    );

}


if (decreaseQuantity) {

    decreaseQuantity.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    productQuantity?.value
                ) || 1;


            if (
                current > 1 &&
                productQuantity
            ) {

                productQuantity.value =
                    current - 1;

            }

        }
    );

}


/*==================================================
FEATURE: QUANTITY VALIDATION
==================================================*/

if (productQuantity) {

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

}


/*==================================================
FEATURE: ADD TO CART
==================================================*/

if (addToCartButton) {

    addToCartButton.addEventListener(
        "click",
        () => {

            const id =
                addToCartButton.dataset.productId;


            const quantity =
                Number(
                    productQuantity?.value
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

}


/*==================================================
FEATURE: BUY NOW
==================================================*/

if (buyNowButton) {

    buyNowButton.addEventListener(
        "click",
        () => {

            const id =
                buyNowButton.dataset.productId;


            const quantity =
                Number(
                    productQuantity?.value
                ) || 1;


            console.log(
                "Buy now:",
                id,
                quantity
            );


            alert(
                "Buy Now system is ready for checkout integration."
            );

        }
    );

}


/*==================================================
FEATURE: WISHLIST
==================================================*/

if (wishlistButton) {

    wishlistButton.addEventListener(
        "click",
        () => {

            const icon =
                wishlistButton.querySelector(
                    "i"
                );


            if (icon) {

                icon.classList.toggle(
                    "fa-regular"
                );


                icon.classList.toggle(
                    "fa-solid"
                );

            }


            wishlistButton.classList.toggle(
                "active"
            );

        }
    );

}


/*==================================================
FEATURE: PRODUCT ERROR
==================================================*/

function showProductError() {

    if (productDetailsLoading) {

        productDetailsLoading.style.display =
            "none";

    }


    if (productContent) {

        productContent.style.display =
            "none";

    }


    if (productDescriptionSection) {

        productDescriptionSection.style.display =
            "none";

    }


    if (productError) {

        productError.style.display =
            "flex";

    }

}
