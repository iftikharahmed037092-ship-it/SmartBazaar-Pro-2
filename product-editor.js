/*==================================================
 SMARTBAZAAR PRO 2
 FEATURE: PREMIUM PRODUCT DETAIL EDITOR
 FEATURE: ADD PRODUCT
 FEATURE: EDIT PRODUCT
 FEATURE: SELLER PRODUCT OWNERSHIP
 FEATURE: ADMIN PRODUCT ACCESS
 FEATURE: PRODUCT MEDIA MANAGEMENT
 FEATURE: PRODUCT CONTENT BUILDER
 VERSION: PRODUCT EDITOR V3.1
==================================================*/


/*==================================================
 FEATURE: FIREBASE IMPORT
==================================================*/

import { database, auth } from "./firebase-config.js";

import {
    ref,
    push,
    set,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    uploadToCloudinary,
    CLOUDINARY_FOLDERS
} from "./cloudinary-config.js";


/*==================================================
 FEATURE: ADMIN CONFIGURATION
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
 FEATURE: URL PARAMETERS
==================================================*/

const pageUrl =
    new URL(window.location.href);

const editProductId =
    pageUrl.searchParams.get("edit") ||
    pageUrl.searchParams.get("productId") ||
    null;

const source =
    pageUrl.searchParams.get("source") ||
    "";

const isEditMode =
    Boolean(editProductId);


/*==================================================
 FEATURE: CURRENT USER / EDIT STATE
==================================================*/

let currentUser = null;

let existingProduct = null;

let editFirebaseKey = null;

let existingMainImageUrl = "";

let existingGalleryUrls = [];

let existingVideoUrl = "";

let galleryFiles = [];

let detailBlocks = [];

let removedGalleryUrls = new Set();

let objectUrls = new Set();


/*==================================================
 FEATURE: DOM REFERENCES
==================================================*/

const productForm =
    document.getElementById("productForm");

const saveProductButton =
    document.getElementById("saveProductButton");

const clearButton =
    document.getElementById("clearButton");


/*==================================================
 FEATURE: BASIC INFORMATION FIELDS
==================================================*/

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productBrand =
    document.getElementById("productBrand");

const productSKU =
    document.getElementById("productSKU");

const productCondition =
    document.getElementById("productCondition");


/*==================================================
 FEATURE: PRICING FIELDS
==================================================*/

const productPrice =
    document.getElementById("productPrice");

const productOldPrice =
    document.getElementById("productOldPrice");

const productStock =
    document.getElementById("productStock");

const lowStockLimit =
    document.getElementById("lowStockLimit");


/*==================================================
 FEATURE: DESCRIPTION FIELDS
==================================================*/

const shortDescription =
    document.getElementById("shortDescription");

const fullDescription =
    document.getElementById("fullDescription");

const shortDescriptionCount =
    document.getElementById("shortDescriptionCount");


/*==================================================
 FEATURE: MEDIA FIELDS
==================================================*/

const mainImage =
    document.getElementById("mainImage");

const galleryImages =
    document.getElementById("galleryImages");

const productVideo =
    document.getElementById("productVideo");

const productVideoUrl =
    document.getElementById("productVideoUrl");

const mainImagePreview =
    document.getElementById("mainImagePreview");

const galleryPreview =
    document.getElementById("galleryPreview");

const videoPreview =
    document.getElementById("videoPreview");


/*==================================================
 FEATURE: CONTENT BUILDER
==================================================*/

const contentBlocksContainer =
    document.getElementById("contentBlocks");

const contentEmptyState =
    document.getElementById("contentEmptyState");

const contentBuilderToolbar =
    document.getElementById(
        "contentBuilderToolbar"
    );


/*==================================================
 FEATURE: STATUS / MESSAGE
==================================================*/

const editorMessage =
    document.getElementById("editorMessage");

const editorStatusDot =
    document.getElementById("editorStatusDot");

const editorStatusText =
    document.getElementById(
        "editorStatusText"
    );


/*==================================================
 FEATURE: PRICE PREVIEW
==================================================*/

const previewPrice =
    document.getElementById("previewPrice");

const previewOldPrice =
    document.getElementById(
        "previewOldPrice"
    );

const previewDiscount =
    document.getElementById(
        "previewDiscount"
    );


/*==================================================
 FEATURE: RATING
==================================================*/

const productRating =
    document.getElementById("productRating");

const productReviews =
    document.getElementById(
        "productReviews"
    );


/*==================================================
 FEATURE: SELLER
==================================================*/

const sellerName =
    document.getElementById("sellerName");


/*==================================================
 FEATURE: SETTINGS
==================================================*/

const productPublished =
    document.getElementById(
        "productPublished"
    );

const productFeatured =
    document.getElementById(
        "productFeatured"
    );

const freeShipping =
    document.getElementById(
        "freeShipping"
    );


/*==================================================
 FEATURE: HELPERS
==================================================*/

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function formatPrice(value) {

    return safeNumber(value)
        .toLocaleString("en-PK", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function createBlockId() {

    return (
        "block_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
}


function setEditorMessage(
    message = "",
    type = ""
) {

    if (!editorMessage) return;

    editorMessage.textContent =
        message;

    editorMessage.className =
        `editor-message ${type}`.trim();
}


function setEditorStatus(
    text,
    ready = false
) {

    if (editorStatusText) {

        editorStatusText.textContent =
            text;
    }

    if (editorStatusDot) {

        editorStatusDot.classList.toggle(
            "ready",
            ready
        );
    }
}


/*==================================================
 FEATURE: BUTTON STATE
==================================================*/

function setSaveButtonLoading(
    loading
) {

    if (!saveProductButton) return;


    if (loading) {

        saveProductButton.disabled =
            true;

        saveProductButton.dataset
            .previousText =
            saveProductButton.textContent;

        saveProductButton.innerHTML =
            isEditMode
                ? `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Updating Product
                  `
                : `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Saving Product
                  `;

    } else {

        saveProductButton.disabled =
            false;

        saveProductButton.innerHTML =
            isEditMode
                ? `
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Update Product
                  `
                : `
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Save Product
                  `;
    }
}


/*==================================================
 FEATURE: NAVIGATION
==================================================*/

function setupProductEditorNavigation() {

    const backButton =
        document.getElementById(
            "productEditorBackButton"
        );

    const backText =
        document.getElementById(
            "productEditorBackText"
        );


    if (!backButton) return;


    if (source === "account") {

        backButton.href =
            "account.html#my-products";

        if (backText) {

            backText.textContent =
                "My Products";
        }

        return;
    }


    backButton.href =
        "admin-panel.html";

    if (backText) {

        backText.textContent =
            "Admin Panel";
    }
}


/*==================================================
 FEATURE: PRICE PREVIEW
==================================================*/

function updatePricePreview() {

    const price =
        safeNumber(
            productPrice?.value
        );

    const oldPrice =
        safeNumber(
            productOldPrice?.value
        );


    let discount = 0;


    if (
        oldPrice > price &&
        oldPrice > 0 &&
        price > 0
    ) {

        discount =
            Math.round(
                (
                    (oldPrice - price) /
                    oldPrice
                ) * 100
            );
    }


    if (previewPrice) {

        previewPrice.textContent =
            price > 0
                ? `Rs. ${formatPrice(price)}`
                : "Rs. 0";
    }


    if (previewOldPrice) {

        previewOldPrice.textContent =
            oldPrice > 0
                ? `Rs. ${formatPrice(oldPrice)}`
                : "";
    }


    if (previewDiscount) {

        previewDiscount.textContent =
            discount > 0
                ? `${discount}% OFF`
                : "";
    }
}


function setupPricePreview() {

    productPrice?.addEventListener(
        "input",
        updatePricePreview
    );

    productOldPrice?.addEventListener(
        "input",
        updatePricePreview
    );

    updatePricePreview();
}


/*==================================================
 FEATURE: SHORT DESCRIPTION COUNTER
==================================================*/

function updateShortDescriptionCount() {

    if (
        !shortDescription ||
        !shortDescriptionCount
    ) {
        return;
    }


    shortDescriptionCount.textContent =
        shortDescription.value.length;
}


function setupShortDescription() {

    shortDescription?.addEventListener(
        "input",
        updateShortDescriptionCount
    );

    updateShortDescriptionCount();
}


/*==================================================
 FEATURE: MAIN IMAGE
==================================================*/

function clearMainImagePreview() {

    if (!mainImagePreview) return;

    mainImagePreview.innerHTML = "";
}


function renderMainImage(
    url,
    isNew = false
) {

    if (!mainImagePreview) return;


    mainImagePreview.innerHTML = "";


    if (!url) return;


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "editor-existing-media";


    wrapper.innerHTML = `
        <img
            src="${escapeHtml(url)}"
            alt="Product image"
        >

        <small>
            ${
                isNew
                    ? "New image selected"
                    : "Current product image"
            }
        </small>
    `;


    mainImagePreview.appendChild(
        wrapper
    );
}


function setupMainImage() {

    if (!mainImage) return;


    mainImage.addEventListener(
        "change",
        () => {

            const file =
                mainImage.files?.[0];


            if (!file) {

                if (
                    isEditMode &&
                    existingMainImageUrl
                ) {

                    renderMainImage(
                        existingMainImageUrl
                    );

                } else {

                    clearMainImagePreview();
                }

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                setEditorMessage(
                    "Please select a valid image.",
                    "error"
                );

                mainImage.value = "";

                return;
            }


            const url =
                URL.createObjectURL(file);

            objectUrls.add(url);


            renderMainImage(
                url,
                true
            );


            setEditorMessage(
                "New main image selected.",
                "success"
            );
        }
    );
}


/*==================================================
 FEATURE: GALLERY
==================================================*/

function setupGallery() {

    if (!galleryImages) return;


    galleryImages.addEventListener(
        "change",
        () => {

            const files =
                Array.from(
                    galleryImages.files || []
                );


            const validFiles =
                files.filter(
                    file =>
                        file.type.startsWith(
                            "image/"
                        )
                );


            galleryFiles.push(
                ...validFiles
            );


            galleryImages.value = "";

            renderGallery();


            if (
                validFiles.length
            ) {

                setEditorMessage(
                    `${validFiles.length} gallery image(s) added.`,
                    "success"
                );
            }
        }
    );
}


function renderGallery() {

    if (!galleryPreview) return;


    galleryPreview.innerHTML = "";


    let visibleCount = 0;


    /*
     * Existing images
     */

    existingGalleryUrls.forEach(
        url => {

            if (
                removedGalleryUrls.has(
                    url
                )
            ) {
                return;
            }


            visibleCount++;


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "gallery-preview-item";


            item.innerHTML = `
                <img
                    src="${escapeHtml(url)}"
                    alt="Gallery image"
                >

                <button
                    type="button"
                    class="gallery-remove-button"
                    data-existing-gallery="${escapeHtml(url)}"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Remove
                </button>

                <small>
                    Existing image
                </small>
            `;


            galleryPreview.appendChild(
                item
            );
        }
    );


    /*
     * New images
     */

    galleryFiles.forEach(
        (file, index) => {

            visibleCount++;


            const url =
                URL.createObjectURL(file);

            objectUrls.add(url);


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "gallery-preview-item";


            item.innerHTML = `
                <img
                    src="${url}"
                    alt="New gallery image"
                >

                <button
                    type="button"
                    class="gallery-remove-button"
                    data-local-gallery="${index}"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Remove
                </button>

                <small>
                    New image
                </small>
            `;


            galleryPreview.appendChild(
                item
            );
        }
    );


    if (!visibleCount) {

        galleryPreview.innerHTML = `
            <div class="gallery-empty">
                No gallery images selected.
            </div>
        `;
    }
}


function setupGalleryRemove() {

    if (!galleryPreview) return;


    galleryPreview.addEventListener(
        "click",
        event => {

            const existingButton =
                event.target.closest(
                    "[data-existing-gallery]"
                );


            if (existingButton) {

                const url =
                    existingButton.dataset
                        .existingGallery;


                removedGalleryUrls.add(
                    url
                );


                renderGallery();

                return;
            }


            const localButton =
                event.target.closest(
                    "[data-local-gallery]"
                );


            if (localButton) {

                const index =
                    Number(
                        localButton.dataset
                            .localGallery
                    );


                if (
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < galleryFiles.length
                ) {

                    galleryFiles.splice(
                        index,
                        1
                    );


                    renderGallery();
                }
            }
        }
    );
}


/*==================================================
 FEATURE: VIDEO
==================================================*/

function renderVideo(
    url,
    label = "Current product video"
) {

    if (!videoPreview) return;


    videoPreview.innerHTML = "";


    if (!url) return;


    videoPreview.innerHTML = `
        <div class="editor-existing-media">

            <video
                controls
                preload="metadata"
                src="${escapeHtml(url)}"
            ></video>

            <small>
                ${escapeHtml(label)}
            </small>

        </div>
    `;
}


function setupVideo() {

    productVideo?.addEventListener(
        "change",
        () => {

            const file =
                productVideo.files?.[0];


            if (!file) {

                if (
                    productVideoUrl?.value.trim()
                ) {

                    renderVideo(
                        productVideoUrl.value.trim(),
                        "Video URL"
                    );

                } else if (
                    existingVideoUrl
                ) {

                    renderVideo(
                        existingVideoUrl
                    );
                }

                return;
            }


            if (
                !file.type.startsWith(
                    "video/"
                )
            ) {

                setEditorMessage(
                    "Please select a valid video.",
                    "error"
                );

                productVideo.value = "";

                return;
            }


            const url =
                URL.createObjectURL(file);

            objectUrls.add(url);


            renderVideo(
                url,
                "New video selected"
            );
        }
    );


    productVideoUrl?.addEventListener(
        "input",
        () => {

            const url =
                productVideoUrl.value.trim();


            if (url) {

                renderVideo(
                    url,
                    "Video URL"
                );

            } else if (
                existingVideoUrl
            ) {

                renderVideo(
                    existingVideoUrl
                );
            }
        }
    );
}


/*==================================================
 FEATURE: CONTENT BUILDER
==================================================*/

function setupContentBuilder() {

    if (!contentBuilderToolbar) return;


    contentBuilderToolbar.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".content-add-button"
                );


            if (!button) return;


            /*
             * IMPORTANT:
             *
             * HTML uses:
             * data-block-type
             */

            const type =
                button.dataset.blockType;


            if (!type) return;


            const block = {

                id:
                    createBlockId(),

                type,

                title:
                    "",

                text:
                    "",

                file:
                    null,

                imageUrl:
                    "",

                videoUrl:
                    "",

                specifications:
                    []
            };


            detailBlocks.push(
                block
            );


            renderContentBlocks();
        }
    );
}


function normalizeContentBlocks(
    blocks
) {

    if (!blocks) return [];


    const list =
        Array.isArray(blocks)
            ? blocks
            : Object.values(blocks);


    return list.map(
        block => ({

            id:
                block.id ||
                createBlockId(),

            type:
                block.type ||
                "text",

            title:
                block.title ||
                "",

            text:
                block.text ||
                "",

            file:
                null,

            imageUrl:
                block.imageUrl ||
                block.image ||
                "",

            videoUrl:
                block.videoUrl ||
                "",

            specifications:
                Array.isArray(
                    block.specifications
                )
                    ? block.specifications.map(
                        row => ({
                            key:
                                row.key ||
                                row.name ||
                                "",

                            value:
                                row.value ||
                                ""
                        })
                    )
                    : []
        })
    );
}


function renderContentBlocks() {

    if (!contentBlocksContainer)
        return;


    contentBlocksContainer.innerHTML =
        "";


    if (!detailBlocks.length) {

        if (contentEmptyState) {

            contentEmptyState.style.display =
                "block";
        }

        return;
    }


    if (contentEmptyState) {

        contentEmptyState.style.display =
            "none";
    }


    detailBlocks.forEach(
        block => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "content-builder-block";

            wrapper.dataset.blockId =
                block.id;


            wrapper.innerHTML =
                getContentBlockHTML(
                    block
                );


            contentBlocksContainer
                .appendChild(
                    wrapper
                );
        }
    );


    setupContentBlockEvents();
}


function getContentBlockHTML(
    block
) {

    const id =
        escapeHtml(block.id);


    if (
        block.type ===
        "heading"
    ) {

        return `
            <div class="content-block-header">

                <strong>
                    Heading
                </strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${id}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

            <input
                type="text"
                class="content-block-title"
                data-block-id="${id}"
                value="${escapeHtml(block.title)}"
                placeholder="Enter heading"
            >
        `;
    }


    if (
        block.type ===
        "text"
    ) {

        return `
            <div class="content-block-header">

                <strong>
                    Text
                </strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${id}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

            <textarea
                class="content-block-text"
                data-block-id="${id}"
                rows="6"
                placeholder="Write product details..."
            >${escapeHtml(block.text)}</textarea>
        `;
    }


    if (
        block.type ===
        "image"
    ) {

        return `
            <div class="content-block-header">

                <strong>
                    Image
                </strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${id}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

            ${
                block.imageUrl
                    ? `
                        <div class="editor-existing-media">

                            <img
                                src="${escapeHtml(block.imageUrl)}"
                                alt="Product detail image"
                            >

                            <small>
                                Existing image
                            </small>

                        </div>
                    `
                    : ""
            }

            <input
                type="file"
                accept="image/*"
                class="content-block-image"
                data-block-id="${id}"
            >
        `;
    }


    if (
        block.type ===
        "video"
    ) {

        return `
            <div class="content-block-header">

                <strong>
                    Video
                </strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${id}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

            ${
                block.videoUrl
                    ? `
                        <div class="editor-existing-media">

                            <video
                                controls
                                preload="metadata"
                                src="${escapeHtml(block.videoUrl)}"
                            ></video>

                            <small>
                                Existing video
                            </small>

                        </div>
                    `
                    : ""
            }

            <input
                type="file"
                accept="video/*"
                class="content-block-video"
                data-block-id="${id}"
            >

            <input
                type="url"
                class="content-block-video-url"
                data-block-id="${id}"
                value="${escapeHtml(block.videoUrl)}"
                placeholder="Or paste video URL"
            >
        `;
    }


    if (
        block.type ===
        "specifications"
    ) {

        const specifications =
            Array.isArray(
                block.specifications
            )
                ? block.specifications
                : [];


        return `
            <div class="content-block-header">

                <strong>
                    Specifications
                </strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${id}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

            <div class="specification-rows">

                ${
                    specifications.map(
                        (row, index) => `
                            <div class="specification-row">

                                <input
                                    type="text"
                                    class="spec-key"
                                    data-block-id="${id}"
                                    data-row-index="${index}"
                                    value="${escapeHtml(row.key)}"
                                    placeholder="Specification"
                                >

                                <input
                                    type="text"
                                    class="spec-value"
                                    data-block-id="${id}"
                                    data-row-index="${index}"
                                    value="${escapeHtml(row.value)}"
                                    placeholder="Value"
                                >

                                <button
                                    type="button"
                                    class="spec-remove-row"
                                    data-block-id="${id}"
                                    data-row-index="${index}"
                                >
                                    Remove
                                </button>

                            </div>
                        `
                    ).join("")
                }

            </div>

            <button
                type="button"
                class="spec-add-row"
                data-block-id="${id}"
            >
                Add Specification
            </button>
        `;
    }


    if (
        block.type ===
        "divider"
    ) {

        return `
            <div class="content-block-header">

                <strong>
                    Divider
                </strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${id}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

            <hr>
        `;
    }


    return "";
}


/*==================================================
 FEATURE: CONTENT BLOCK EVENTS
==================================================*/

function setupContentBlockEvents() {

    if (!contentBlocksContainer)
        return;


    contentBlocksContainer.onclick =
        event => {

            /*
             * Remove block
             */

            const removeBlock =
                event.target.closest(
                    ".content-remove-block"
                );


            if (removeBlock) {

                const blockId =
                    removeBlock.dataset
                        .blockId;


                detailBlocks =
                    detailBlocks.filter(
                        block =>
                            block.id !==
                            blockId
                    );


                renderContentBlocks();

                return;
            }


            /*
             * Add specification row
             */

            const addRow =
                event.target.closest(
                    ".spec-add-row"
                );


            if (addRow) {

                const blockId =
                    addRow.dataset
                        .blockId;


                const block =
                    detailBlocks.find(
                        item =>
                            item.id ===
                            blockId
                    );


                if (!block) return;


                if (
                    !Array.isArray(
                        block.specifications
                    )
                ) {

                    block.specifications =
                        [];
                }


                block.specifications.push({
                    key: "",
                    value: ""
                });


                renderContentBlocks();

                return;
            }


            /*
             * Remove specification row
             */

            const removeRow =
                event.target.closest(
                    ".spec-remove-row"
                );


            if (removeRow) {

                const blockId =
                    removeRow.dataset
                        .blockId;


                const rowIndex =
                    Number(
                        removeRow.dataset
                            .rowIndex
                    );


                const block =
                    detailBlocks.find(
                        item =>
                            item.id ===
                            blockId
                    );


                if (!block) return;


                block.specifications
                    .splice(
                        rowIndex,
                        1
                    );


                renderContentBlocks();
            }
        };


    contentBlocksContainer.oninput =
        event => {

            const element =
                event.target;


            const blockId =
                element.dataset.blockId;


            if (!blockId) return;


            const block =
                detailBlocks.find(
                    item =>
                        item.id ===
                        blockId
                );


            if (!block) return;


            if (
                element.classList.contains(
                    "content-block-title"
                )
            ) {

                block.title =
                    element.value;
            }


            if (
                element.classList.contains(
                    "content-block-text"
                )
            ) {

                block.text =
                    element.value;
            }


            if (
                element.classList.contains(
                    "content-block-video-url"
                )
            ) {

                block.videoUrl =
                    element.value;
            }


            if (
                element.classList.contains(
                    "spec-key"
                )
            ) {

                const rowIndex =
                    Number(
                        element.dataset
                            .rowIndex
                    );


                if (
                    block.specifications[
                        rowIndex
                    ]
                ) {

                    block.specifications[
                        rowIndex
                    ].key =
                        element.value;
                }
            }


            if (
                element.classList.contains(
                    "spec-value"
                )
            ) {

                const rowIndex =
                    Number(
                        element.dataset
                            .rowIndex
                    );


                if (
                    block.specifications[
                        rowIndex
                    ]
                ) {

                    block.specifications[
                        rowIndex
                    ].value =
                        element.value;
                }
            }
        };


    contentBlocksContainer.onchange =
        event => {

            const element =
                event.target;


            const blockId =
                element.dataset.blockId;


            if (!blockId) return;


            const block =
                detailBlocks.find(
                    item =>
                        item.id ===
                        blockId
                );


            if (!block) return;


            if (
                element.classList.contains(
                    "content-block-image"
                )
            ) {

                const file =
                    element.files?.[0];


                if (
                    file &&
                    file.type.startsWith(
                        "image/"
                    )
                ) {

                    block.file =
                        file;
                }
            }


            if (
                element.classList.contains(
                    "content-block-video"
                )
            ) {

                const file =
                    element.files?.[0];


                if (
                    file &&
                    file.type.startsWith(
                        "video/"
                    )
                ) {

                    block.file =
                        file;
                }
            }
        };
}


/*==================================================
 FEATURE: LOAD EXISTING PRODUCT
==================================================*/

async function loadExistingProduct() {

    if (!isEditMode) return;


    setEditorStatus(
        "Loading Product...",
        false
    );


    setEditorMessage(
        "Loading product information...",
        "info"
    );


    try {

        const productsRef =
            ref(
                database,
                "products"
            );


        const snapshot =
            await get(productsRef);


        if (!snapshot.exists()) {

            throw new Error(
                "No products found."
            );
        }


        let foundKey = null;

        let foundProduct = null;


        snapshot.forEach(
            childSnapshot => {

                const key =
                    childSnapshot.key;

                const data =
                    childSnapshot.val() || {};


                if (
                    foundProduct
                ) {
                    return;
                }


                const keyMatches =
                    key === editProductId;


                const productIdMatches =
                    String(
                        data.productId ||
                        ""
                    ) ===
                    String(
                        editProductId
                    );


                if (
                    keyMatches ||
                    productIdMatches
                ) {

                    foundKey =
                        key;

                    foundProduct =
                        data;
                }
            }
        );


        if (
            !foundProduct ||
            !foundKey
        ) {

            throw new Error(
                "Product not found."
            );
        }


        /*
         * Seller / Admin permission
         */

        const isAdmin =
            String(
                currentUser.email || ""
            ).toLowerCase() ===
            ADMIN_EMAIL.toLowerCase();


        const isOwner =
            foundProduct.sellerId ===
                currentUser.uid ||

            foundProduct.createdBy ===
                currentUser.uid;


        if (
            !isAdmin &&
            !isOwner
        ) {

            throw new Error(
                "You are not authorized to edit this product."
            );
        }


        editFirebaseKey =
            foundKey;


        existingProduct =
            foundProduct;


        /*
         * Existing main image
         */

        existingMainImageUrl =
            foundProduct.image ||
            (
                Array.isArray(
                    foundProduct.images
                )
                    ? foundProduct.images[0] ||
                      ""
                    : ""
            );


        /*
         * Existing gallery
         */

        const allImages =
            Array.isArray(
                foundProduct.images
            )
                ? foundProduct.images
                : [];


        existingGalleryUrls =
            allImages.filter(
                url =>
                    url &&
                    url !==
                        existingMainImageUrl
            );


        /*
         * Existing video
         */

        existingVideoUrl =
            foundProduct.videoUrl ||
            "";


        removedGalleryUrls.clear();


        populateForm(
            foundProduct
        );


        setEditorStatus(
            "Edit Mode Ready",
            true
        );


        setEditorMessage(
            "Product loaded successfully. You can now edit it.",
            "success"
        );


    } catch (error) {

        console.error(
            "Load product error:",
            error
        );


        setEditorStatus(
            "Load Failed",
            false
        );


        setEditorMessage(
            error.message ||
            "Unable to load product.",
            "error"
        );


        if (saveProductButton) {

            saveProductButton.disabled =
                true;
        }
    }
}


/*==================================================
 FEATURE: POPULATE FORM
==================================================*/

function populateForm(
    product
) {

    if (productName) {

        productName.value =
            product.name || "";
    }


    if (productCategory) {

        productCategory.value =
            product.category || "";
    }


    if (productBrand) {

        productBrand.value =
            product.brand || "";
    }


    if (productSKU) {

        productSKU.value =
            product.sku || "";
    }


    if (productCondition) {

        productCondition.value =
            product.condition ||
            "new";
    }


    if (productPrice) {

        productPrice.value =
            product.price ?? "";
    }


    if (productOldPrice) {

        productOldPrice.value =
            product.oldPrice ?? "";
    }


    if (productStock) {

        productStock.value =
            product.stock ?? 0;
    }


    if (lowStockLimit) {

        lowStockLimit.value =
            product.lowStockLimit ?? 5;
    }


    if (shortDescription) {

        shortDescription.value =
            product.shortDescription ||
            "";
    }


    if (fullDescription) {

        fullDescription.value =
            product.description ||
            product.fullDescription ||
            "";
    }


    if (productRating) {

        productRating.value =
            product.rating ?? 0;
    }


    if (productReviews) {

        productReviews.value =
            product.reviews ?? 0;
    }


    if (sellerName) {

        sellerName.value =
            product.sellerName ||
            "";
    }


    if (productPublished) {

        productPublished.checked =
            product.published !== false;
    }


    if (productFeatured) {

        productFeatured.checked =
            product.featured === true;
    }


    if (freeShipping) {

        freeShipping.checked =
            product.freeShipping === true;
    }


    if (productVideoUrl) {

        productVideoUrl.value =
            existingVideoUrl;
    }


    /*
     * Media
     */

    renderMainImage(
        existingMainImageUrl
    );

    renderGallery();

    renderVideo(
        existingVideoUrl
    );


    /*
     * Content blocks
     */

    detailBlocks =
        normalizeContentBlocks(
            product.detailBlocks
        );


    renderContentBlocks();


    /*
     * Previews
     */

    updatePricePreview();

    updateShortDescriptionCount();


    /*
     * Button
     */

    if (saveProductButton) {

        saveProductButton.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up"></i>
            Update Product
        `;
    }
}


/*==================================================
 FEATURE: VALIDATION
==================================================*/

function validateProduct() {

    const name =
        productName?.value.trim() || "";

    const category =
        productCategory?.value.trim() || "";

    const price =
        safeNumber(
            productPrice?.value
        );

    const stock =
        safeNumber(
            productStock?.value
        );

    const rating =
        safeNumber(
            productRating?.value
        );


    if (!name) {

        setEditorMessage(
            "Product name is required.",
            "error"
        );

        productName?.focus();

        return false;
    }


    if (!category) {

        setEditorMessage(
            "Category is required.",
            "error"
        );

        productCategory?.focus();

        return false;
    }


    if (price <= 0) {

        setEditorMessage(
            "Selling price must be greater than 0.",
            "error"
        );

        productPrice?.focus();

        return false;
    }


    if (stock < 0) {

        setEditorMessage(
            "Stock cannot be negative.",
            "error"
        );

        productStock?.focus();

        return false;
    }


    if (
        rating < 0 ||
        rating > 5
    ) {

        setEditorMessage(
            "Rating must be between 0 and 5.",
            "error"
        );

        productRating?.focus();

        return false;
    }


    /*
     * New product:
     * Main image required.
     *
     * Edit product:
     * Existing image can remain.
     */

    const newMainImage =
        mainImage?.files?.[0];


    if (
        !isEditMode &&
        !newMainImage
    ) {

        setEditorMessage(
            "Please select a main product image.",
            "error"
        );

        mainImage?.click();

        return false;
    }


    if (
        isEditMode &&
        !newMainImage &&
        !existingMainImageUrl
    ) {

        setEditorMessage(
            "Please select a main product image.",
            "error"
        );

        mainImage?.click();

        return false;
    }


    return true;
}


/*==================================================
 FEATURE: CLOUDINARY UPLOAD
==================================================*/

async function uploadProductFile(
    file
) {

    if (!file) return "";


    return await uploadToCloudinary(
        file,
        CLOUDINARY_FOLDERS.PRODUCTS
    );
}


/*==================================================
 FEATURE: PREPARE CONTENT BLOCKS
==================================================*/

async function prepareContentBlocks() {

    const result = [];


    for (
        const block of detailBlocks
    ) {

        const savedBlock = {

            id:
                block.id,

            type:
                block.type,

            title:
                block.title || "",

            text:
                block.text || "",

            imageUrl:
                block.imageUrl || "",

            videoUrl:
                block.videoUrl || "",

            specifications:
                Array.isArray(
                    block.specifications
                )
                    ? block.specifications
                    : []
        };


        /*
         * Upload new image
         */

        if (
            block.type === "image" &&
            block.file
        ) {

            savedBlock.imageUrl =
                await uploadProductFile(
                    block.file
                );
        }


        /*
         * Upload new video
         */

        if (
            block.type === "video" &&
            block.file
        ) {

            savedBlock.videoUrl =
                await uploadProductFile(
                    block.file
                );
        }


        result.push(
            savedBlock
        );
    }


    return result;
}


/*==================================================
 FEATURE: BUILD PRODUCT DATA
==================================================*/

async function buildProductData() {

    /*
     * Basic values
     */

    const name =
        productName?.value.trim() || "";

    const category =
        productCategory?.value.trim() || "";

    const brand =
        productBrand?.value.trim() || "";

    const sku =
        productSKU?.value.trim() || "";

    const condition =
        productCondition?.value ||
        "new";


    /*
     * Pricing
     */

    const price =
        safeNumber(
            productPrice?.value
        );

    const oldPrice =
        safeNumber(
            productOldPrice?.value
        );


    let discount = 0;


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        discount =
            Math.round(
                (
                    (oldPrice - price) /
                    oldPrice
                ) * 100
            );
    }


    /*
     * Inventory
     */

    const stock =
        safeNumber(
            productStock?.value
        );

    const lowStock =
        safeNumber(
            lowStockLimit?.value,
            5
        );


    /*
     * Main image
     */

    let mainImageUrl =
        existingMainImageUrl;


    const newMainImage =
        mainImage?.files?.[0];


    if (newMainImage) {

        mainImageUrl =
            await uploadProductFile(
                newMainImage
            );
    }


    /*
     * Gallery
     */

    const retainedGallery =
        existingGalleryUrls.filter(
            url =>
                !removedGalleryUrls.has(
                    url
                )
        );


    const newGalleryUrls = [];


    for (
        const file of galleryFiles
    ) {

        const url =
            await uploadProductFile(
                file
            );


        if (url) {

            newGalleryUrls.push(
                url
            );
        }
    }


    const images = [
        mainImageUrl,
        ...retainedGallery,
        ...newGalleryUrls
    ].filter(Boolean);


    /*
     * Video
     */

    let videoUrl =
        existingVideoUrl;


    const newVideo =
        productVideo?.files?.[0];


    if (newVideo) {

        videoUrl =
            await uploadProductFile(
                newVideo
            );

    } else {

        const typedUrl =
            productVideoUrl?.value.trim() ||
            "";


        if (typedUrl) {

            videoUrl =
                typedUrl;
        }
    }


    /*
     * Content
     */

    const savedDetailBlocks =
        await prepareContentBlocks();


    /*
     * Final data
     */

    const productData = {

        productId:
            isEditMode
                ? (
                    existingProduct?.productId ||
                    editFirebaseKey
                )
                : "",

        name,

        category,

        brand,

        sku,

        condition,

        price,

        oldPrice,

        discount,

        stock,

        lowStockLimit:
            lowStock,

        inStock:
            stock > 0,

        available:
            stock > 0,

        shortDescription:
            shortDescription?.value.trim() ||
            "",

        description:
            fullDescription?.value.trim() ||
            "",

        image:
            mainImageUrl,

        images,

        videoUrl,

        detailBlocks:
            savedDetailBlocks,

        sellerName:
            sellerName?.value.trim() ||
            "",

        rating:
            safeNumber(
                productRating?.value
            ),

        reviews:
            safeNumber(
                productReviews?.value
            ),

        published:
            productPublished
                ? productPublished.checked
                : true,

        featured:
            productFeatured
                ? productFeatured.checked
                : false,

        freeShipping:
            freeShipping
                ? freeShipping.checked
                : false
    };


    /*
     * Ownership / timestamps
     */

    if (isEditMode) {

        /*
         * IMPORTANT:
         * Preserve original ownership.
         */

        productData.sellerId =
            existingProduct.sellerId ||
            currentUser.uid;

        productData.createdBy =
            existingProduct.createdBy ||
            currentUser.uid;


        /*
         * Preserve original creation time.
         */

        productData.createdAt =
            existingProduct.createdAt ||
            Date.now();


        /*
         * Update modification time.
         */

        productData.updatedAt =
            Date.now();

    } else {

        productData.createdBy =
            currentUser.uid;

        productData.sellerId =
            currentUser.uid;

        productData.createdAt =
            Date.now();

        productData.updatedAt =
            Date.now();
    }


    return productData;
}


/*==================================================
 FEATURE: SAVE PRODUCT
==================================================*/

async function saveProduct() {

    if (!currentUser) {

        window.location.href =
            "./login.html";

        return;
    }


    if (!validateProduct()) {
        return;
    }


    setSaveButtonLoading(
        true
    );


    setEditorStatus(
        isEditMode
            ? "Updating..."
            : "Saving...",
        false
    );


    setEditorMessage(
        isEditMode
            ? "Updating product. Please wait..."
            : "Saving product. Please wait...",
        "info"
    );


    try {

        const productData =
            await buildProductData();


        /*
         * EDIT
         */

        if (isEditMode) {

            if (!editFirebaseKey) {

                throw new Error(
                    "Product Firebase key is missing."
                );
            }


            const productRef =
                ref(
                    database,
                    `products/${editFirebaseKey}`
                );


            await update(
                productRef,
                productData
            );


            /*
             * Update local state
             */

            existingProduct = {
                ...existingProduct,
                ...productData
            };


            existingMainImageUrl =
                productData.image || "";


            existingGalleryUrls =
                Array.isArray(
                    productData.images
                )
                    ? productData.images.slice(1)
                    : [];


            existingVideoUrl =
                productData.videoUrl || "";


            galleryFiles = [];

            removedGalleryUrls.clear();


            detailBlocks =
                normalizeContentBlocks(
                    productData.detailBlocks
                );


            /*
             * Re-render
             */

            renderMainImage(
                existingMainImageUrl
            );

            renderGallery();

            renderVideo(
                existingVideoUrl
            );

            renderContentBlocks();


            setEditorStatus(
                "Product Updated",
                true
            );


            setEditorMessage(
                "Product updated successfully.",
                "success"
            );


        } else {

            /*
             * ADD NEW PRODUCT
             */

            const productsRef =
                ref(
                    database,
                    "products"
                );


            const newProductRef =
                push(productsRef);


            productData.productId =
                newProductRef.key;


            await set(
                newProductRef,
                productData
            );


            setEditorStatus(
                "Product Saved",
                true
            );


            setEditorMessage(
                "Product added successfully.",
                "success"
            );


            /*
             * Reset Add mode
             */

            resetEditor();
        }


    } catch (error) {

        console.error(
            "Product save error:",
            error
        );


        setEditorStatus(
            "Save Failed",
            false
        );


        setEditorMessage(
            error.message ||
            (
                isEditMode
                    ? "Unable to update product."
                    : "Unable to save product."
            ),
            "error"
        );


    } finally {

        setSaveButtonLoading(
            false
        );
    }
}


/*==================================================
 FEATURE: FORM SUBMIT
==================================================*/

function setupFormSubmit() {

    if (!productForm) return;


    productForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveProduct();
        }
    );
}


/*==================================================
 FEATURE: RESET EDITOR
==================================================*/

function resetEditor() {

    if (productForm) {

        productForm.reset();
    }


    galleryFiles = [];

    detailBlocks = [];

    existingMainImageUrl = "";

    existingGalleryUrls = [];

    existingVideoUrl = "";

    removedGalleryUrls.clear();


    cleanupObjectUrls();


    clearMainImagePreview();


    if (galleryPreview) {

        galleryPreview.innerHTML = `
            <div class="gallery-empty">
                No gallery images selected.
            </div>
        `;
    }


    if (videoPreview) {

        videoPreview.innerHTML = "";
    }


    renderContentBlocks();

    updatePricePreview();

    updateShortDescriptionCount();
}


/*==================================================
 FEATURE: CLEAR BUTTON
==================================================*/

function setupClearButton() {

    if (!clearButton) return;


    clearButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    isEditMode
                        ? "Reset the current changes and reload the original product?"
                        : "Clear all product fields?"
                );


            if (!confirmed) {
                return;
            }


            if (isEditMode) {

                /*
                 * Reload original product
                 */

                galleryFiles = [];

                removedGalleryUrls.clear();

                cleanupObjectUrls();


                if (existingProduct) {

                    existingMainImageUrl =
                        existingProduct.image ||
                        (
                            Array.isArray(
                                existingProduct.images
                            )
                                ? existingProduct.images[0] ||
                                  ""
                                : ""
                        );


                    existingGalleryUrls =
                        Array.isArray(
                            existingProduct.images
                        )
                            ? existingProduct.images.filter(
                                url =>
                                    url &&
                                    url !==
                                        existingMainImageUrl
                            )
                            : [];


                    existingVideoUrl =
                        existingProduct.videoUrl ||
                        "";


                    populateForm(
                        existingProduct
                    );


                    setEditorMessage(
                        "Original product data restored.",
                        "info"
                    );
                }


                return;
            }


            resetEditor();


            setEditorStatus(
                "Ready",
                true
            );


            setEditorMessage(
                "Editor cleared.",
                "info"
            );
        }
    );
}


/*==================================================
 FEATURE: OBJECT URL CLEANUP
==================================================*/

function cleanupObjectUrls() {

    objectUrls.forEach(
        url => {

            try {

                URL.revokeObjectURL(
                    url
                );

            } catch (error) {

                /* Ignore cleanup error */
            }
        }
    );


    objectUrls.clear();
}


/*==================================================
 FEATURE: AUTHENTICATION
==================================================*/

function setupAuthentication() {

    onAuthStateChanged(
        auth,
        async user => {

            if (!user) {

                window.location.href =
                    "./login.html";

                return;
            }


            currentUser =
                user;


            /*
             * Add mode
             */

            if (!isEditMode) {

                setEditorStatus(
                    "Ready",
                    true
                );


                if (saveProductButton) {

                    saveProductButton.innerHTML = `
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        Save Product
                    `;
                }


                return;
            }


            /*
             * Edit mode
             */

            await loadExistingProduct();
        }
    );
}


/*==================================================
 FEATURE: INITIALIZATION
==================================================*/

function initializeProductEditor() {

    setupProductEditorNavigation();

    setupPricePreview();

    setupShortDescription();

    setupMainImage();

    setupGallery();

    setupGalleryRemove();

    setupVideo();

    setupContentBuilder();

    setupFormSubmit();

    setupClearButton();

    renderContentBlocks();

    updatePricePreview();

    updateShortDescriptionCount();


    if (isEditMode) {

        setEditorStatus(
            "Loading Product...",
            false
        );


        if (saveProductButton) {

            saveProductButton.innerHTML = `
                <i class="fa-solid fa-cloud-arrow-up"></i>
                Update Product
            `;
        }

    } else {

        setEditorStatus(
            "Ready",
            true
        );
    }


    /*
     * Start Firebase Auth
     */

    setupAuthentication();
}


/*==================================================
 FEATURE: PAGE START
==================================================*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeProductEditor
    );

} else {

    initializeProductEditor();
}


/*==================================================
 FEATURE: CLEANUP
==================================================*/

window.addEventListener(
    "beforeunload",
    cleanupObjectUrls
);
