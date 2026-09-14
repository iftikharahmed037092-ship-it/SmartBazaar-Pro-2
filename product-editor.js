/*==================================================
 SMARTBAZAAR PRO 2
 FEATURE: PREMIUM PRODUCT DETAIL EDITOR
 FEATURE: ADD PRODUCT
 FEATURE: EDIT PRODUCT
 FEATURE: SELLER PRODUCT OWNERSHIP
 FEATURE: ADMIN PRODUCT ACCESS
 VERSION: PRODUCT EDITOR V3.0
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

const ADMIN_EMAIL = "iftikharahmed037092@gmail.com";


/*==================================================
 FEATURE: DOM REFERENCES
==================================================*/

const productForm = document.getElementById("productForm");

const saveProductButton =
    document.getElementById("saveProductButton");

const clearButton =
    document.getElementById("clearButton");

const mainImageInput =
    document.getElementById("mainImageInput");

const galleryImagesInput =
    document.getElementById("galleryImagesInput");

const productVideoInput =
    document.getElementById("productVideoInput");

const productVideoUrlInput =
    document.getElementById("productVideoUrlInput");

const mainImagePreview =
    document.getElementById("mainImagePreview");

const galleryPreview =
    document.getElementById("galleryPreview");

const videoPreview =
    document.getElementById("videoPreview");

const contentBlocks =
    document.getElementById("contentBlocks");

const contentEmptyState =
    document.getElementById("contentEmptyState");

const contentBuilderToolbar =
    document.getElementById("contentBuilderToolbar");

const editorMessage =
    document.getElementById("editorMessage");

const editorStatusDot =
    document.getElementById("editorStatusDot");

const editorStatusText =
    document.getElementById("editorStatusText");

const previewPrice =
    document.getElementById("previewPrice");

const previewOldPrice =
    document.getElementById("previewOldPrice");

const previewDiscount =
    document.getElementById("previewDiscount");

const shortDescription =
    document.getElementById("shortDescription");

const shortDescriptionCount =
    document.getElementById("shortDescriptionCount");


/*==================================================
 FEATURE: PRODUCT FIELD REFERENCES
==================================================*/

const productNameInput =
    document.getElementById("productName");

const categoryInput =
    document.getElementById("category");

const brandInput =
    document.getElementById("brand");

const skuInput =
    document.getElementById("sku");

const conditionInput =
    document.getElementById("condition");

const priceInput =
    document.getElementById("price");

const oldPriceInput =
    document.getElementById("oldPrice");

const stockInput =
    document.getElementById("stock");

const lowStockLimitInput =
    document.getElementById("lowStockLimit");

const fullDescriptionInput =
    document.getElementById("fullDescription");

const sellerNameInput =
    document.getElementById("sellerName");

const ratingInput =
    document.getElementById("rating");

const reviewsInput =
    document.getElementById("reviews");

const publishedInput =
    document.getElementById("published");

const featuredInput =
    document.getElementById("featured");

const freeShippingInput =
    document.getElementById("freeShipping");


/*==================================================
 FEATURE: LOCAL STATE
==================================================*/

let currentUser = null;

let editProductId = null;
let editFirebaseKey = null;

let existingProduct = null;

let existingMainImageUrl = "";
let existingGalleryUrls = [];
let existingVideoUrl = "";

let galleryFiles = [];

let detailBlocks = [];

let objectUrls = new Set();

let removedGalleryUrls = new Set();


/*==================================================
 FEATURE: URL / EDIT MODE
==================================================*/

const pageUrl = new URL(window.location.href);

editProductId =
    pageUrl.searchParams.get("edit") ||
    pageUrl.searchParams.get("productId") ||
    null;

const source =
    pageUrl.searchParams.get("source") || "";


const isEditMode = Boolean(editProductId);


/*==================================================
 FEATURE: BASIC HELPERS
==================================================*/

function $(selector) {
    return document.querySelector(selector);
}


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function formatPrice(value) {
    const number = safeNumber(value);

    return number.toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}


function setEditorMessage(message = "", type = "") {

    if (!editorMessage) return;

    editorMessage.textContent = message;

    editorMessage.className =
        `editor-message ${type}`.trim();
}


function setEditorStatus(text, ready = false) {

    if (editorStatusText) {
        editorStatusText.textContent = text;
    }

    if (editorStatusDot) {

        editorStatusDot.classList.toggle(
            "ready",
            Boolean(ready)
        );
    }
}


function setButtonLoading(loading) {

    if (!saveProductButton) return;

    saveProductButton.disabled = loading;

    if (loading) {

        saveProductButton.dataset.originalText =
            saveProductButton.textContent;

        saveProductButton.textContent =
            isEditMode
                ? "Updating Product..."
                : "Saving Product...";

    } else {

        saveProductButton.textContent =
            isEditMode
                ? "Update Product"
                : "Save Product";
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
            "./account.html#my-products";

        if (backText) {
            backText.textContent =
                "My Products";
        }

        return;
    }


    /*
     * Existing architecture:
     * Default back destination remains Admin Panel.
     */

    backButton.href =
        "./admin-panel.html";

    if (backText) {
        backText.textContent =
            "Admin Panel";
    }
}


/*==================================================
 FEATURE: MAIN IMAGE PREVIEW
==================================================*/

function clearMainImagePreview() {

    if (!mainImagePreview) return;

    mainImagePreview.innerHTML = "";
}


function renderMainImagePreview(url) {

    if (!mainImagePreview) return;

    mainImagePreview.innerHTML = "";

    if (!url) return;


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "editor-existing-media";


    const image =
        document.createElement("img");

    image.src = url;
    image.alt = "Product image";
    image.loading = "lazy";


    wrapper.appendChild(image);

    mainImagePreview.appendChild(wrapper);
}


function setupMainImagePreview() {

    if (!mainImageInput) return;


    mainImageInput.addEventListener(
        "change",
        () => {

            const file =
                mainImageInput.files?.[0];

            if (!file) {

                if (isEditMode &&
                    existingMainImageUrl) {

                    renderMainImagePreview(
                        existingMainImageUrl
                    );

                } else {

                    clearMainImagePreview();
                }

                return;
            }


            if (!file.type.startsWith("image/")) {

                setEditorMessage(
                    "Please select a valid image file.",
                    "error"
                );

                mainImageInput.value = "";

                return;
            }


            const objectUrl =
                URL.createObjectURL(file);

            objectUrls.add(objectUrl);


            if (mainImagePreview) {

                mainImagePreview.innerHTML = `
                    <div class="editor-existing-media">
                        <img
                            src="${objectUrl}"
                            alt="Selected product image"
                        >
                        <small>New image selected</small>
                    </div>
                `;
            }

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

function cleanupObjectUrl(url) {

    if (!url) return;

    try {
        URL.revokeObjectURL(url);
    } catch (error) {
        /* Ignore cleanup errors */
    }

    objectUrls.delete(url);
}


function cleanupAllObjectUrls() {

    objectUrls.forEach(url => {

        try {
            URL.revokeObjectURL(url);
        } catch (error) {
            /* Ignore */
        }
    });

    objectUrls.clear();
}


function setupGalleryInput() {

    if (!galleryImagesInput) return;


    galleryImagesInput.addEventListener(
        "change",
        () => {

            const files =
                Array.from(
                    galleryImagesInput.files || []
                );


            const validFiles =
                files.filter(file =>
                    file.type.startsWith("image/")
                );


            if (validFiles.length !== files.length) {

                setEditorMessage(
                    "Some gallery files were ignored because they were not images.",
                    "error"
                );
            }


            galleryFiles.push(...validFiles);

            galleryImagesInput.value = "";

            renderGalleryPreview();
        }
    );
}


function renderGalleryPreview() {

    if (!galleryPreview) return;


    galleryPreview.innerHTML = "";


    /*
     * Existing Firebase gallery
     */

    existingGalleryUrls.forEach(
        (url, index) => {

            if (removedGalleryUrls.has(url)) {
                return;
            }


            const item =
                document.createElement("div");

            item.className =
                "gallery-preview-item";


            item.innerHTML = `
                <img
                    src="${escapeHtml(url)}"
                    alt="Gallery image ${index + 1}"
                >

                <button
                    type="button"
                    class="gallery-remove-button"
                    data-existing-gallery="${escapeHtml(url)}"
                >
                    Remove
                </button>

                <small>Existing image</small>
            `;


            galleryPreview.appendChild(item);
        }
    );


    /*
     * New local files
     */

    galleryFiles.forEach(
        (file, index) => {

            const objectUrl =
                URL.createObjectURL(file);

            objectUrls.add(objectUrl);


            const item =
                document.createElement("div");

            item.className =
                "gallery-preview-item";


            item.innerHTML = `
                <img
                    src="${objectUrl}"
                    alt="New gallery image ${index + 1}"
                >

                <button
                    type="button"
                    class="gallery-remove-button"
                    data-local-gallery="${index}"
                >
                    Remove
                </button>

                <small>New image</small>
            `;


            galleryPreview.appendChild(item);
        }
    );


    if (!existingGalleryUrls.length &&
        !galleryFiles.length) {

        galleryPreview.innerHTML = `
            <div class="gallery-empty">
                No gallery images selected.
            </div>
        `;
    }
}


function setupGalleryRemoveEvents() {

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

                removedGalleryUrls.add(url);

                renderGalleryPreview();

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

                    galleryFiles.splice(index, 1);

                    renderGalleryPreview();
                }
            }
        }
    );
}


/*==================================================
 FEATURE: VIDEO PREVIEW
==================================================*/

function renderVideoPreview(url) {

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

            <small>Current product video</small>
        </div>
    `;
}


function setupVideoInputs() {

    if (productVideoInput) {

        productVideoInput.addEventListener(
            "change",
            () => {

                const file =
                    productVideoInput.files?.[0];

                if (!file) {

                    if (
                        productVideoUrlInput?.value
                    ) {

                        renderVideoPreview(
                            productVideoUrlInput.value.trim()
                        );

                    } else if (isEditMode) {

                        renderVideoPreview(
                            existingVideoUrl
                        );

                    }

                    return;
                }


                if (!file.type.startsWith("video/")) {

                    setEditorMessage(
                        "Please select a valid video file.",
                        "error"
                    );

                    productVideoInput.value = "";

                    return;
                }


                const objectUrl =
                    URL.createObjectURL(file);

                objectUrls.add(objectUrl);


                if (videoPreview) {

                    videoPreview.innerHTML = `
                        <div class="editor-existing-media">
                            <video
                                controls
                                preload="metadata"
                                src="${objectUrl}"
                            ></video>

                            <small>New video selected</small>
                        </div>
                    `;
                }
            }
        );
    }


    if (productVideoUrlInput) {

        productVideoUrlInput.addEventListener(
            "input",
            () => {

                const url =
                    productVideoUrlInput.value.trim();

                if (url) {

                    renderVideoPreview(url);

                } else if (isEditMode) {

                    renderVideoPreview(
                        existingVideoUrl
                    );
                }
            }
        );
    }
}


/*==================================================
 FEATURE: PRICE PREVIEW
==================================================*/

function updatePricePreview() {

    const price =
        safeNumber(priceInput?.value);

    const oldPrice =
        safeNumber(oldPriceInput?.value);


    let discount = 0;


    if (
        oldPrice > 0 &&
        price > 0 &&
        oldPrice > price
    ) {

        discount =
            Math.round(
                ((oldPrice - price) /
                    oldPrice) * 100
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

    [
        priceInput,
        oldPriceInput
    ].forEach(input => {

        if (!input) return;

        input.addEventListener(
            "input",
            updatePricePreview
        );
    });


    updatePricePreview();
}


/*==================================================
 FEATURE: SHORT DESCRIPTION COUNTER
==================================================*/

function updateShortDescriptionCount() {

    if (!shortDescription ||
        !shortDescriptionCount) {
        return;
    }


    shortDescriptionCount.textContent =
        String(
            shortDescription.value.length
        );
}


function setupShortDescriptionCounter() {

    if (!shortDescription) return;

    shortDescription.addEventListener(
        "input",
        updateShortDescriptionCount
    );

    updateShortDescriptionCount();
}


/*==================================================
 FEATURE: CONTENT BUILDER
==================================================*/

function createBlockId() {

    return `block_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}


function createEmptyBlock(type) {

    return {
        id: createBlockId(),
        type,
        title: "",
        text: "",
        file: null,
        imageUrl: "",
        videoUrl: "",
        specifications: []
    };
}


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


            const type =
                button.dataset.contentType;

            if (!type) return;


            const block =
                createEmptyBlock(type);

            detailBlocks.push(block);

            renderContentBlocks();
        }
    );
}


function renderContentBlocks() {

    if (!contentBlocks) return;


    contentBlocks.innerHTML = "";


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
        (block, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "content-builder-block";

            wrapper.dataset.blockId =
                block.id;


            wrapper.innerHTML =
                getBlockMarkup(block, index);


            contentBlocks.appendChild(wrapper);
        }
    );


    setupDynamicContentEvents();
}


function getBlockMarkup(block, index) {

    const type =
        block.type;


    if (type === "heading") {

        return `
            <div class="content-block-header">
                <strong>Heading</strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${escapeHtml(block.id)}"
                >
                    Remove
                </button>
            </div>

            <input
                type="text"
                class="content-block-title"
                data-block-id="${escapeHtml(block.id)}"
                value="${escapeHtml(block.title)}"
                placeholder="Heading"
            >
        `;
    }


    if (type === "text") {

        return `
            <div class="content-block-header">
                <strong>Text</strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${escapeHtml(block.id)}"
                >
                    Remove
                </button>
            </div>

            <textarea
                class="content-block-text"
                data-block-id="${escapeHtml(block.id)}"
                rows="5"
                placeholder="Write product details..."
            >${escapeHtml(block.text)}</textarea>
        `;
    }


    if (type === "image") {

        return `
            <div class="content-block-header">
                <strong>Image</strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${escapeHtml(block.id)}"
                >
                    Remove
                </button>
            </div>

            ${
                block.imageUrl
                    ? `
                        <div class="content-existing-media">
                            <img
                                src="${escapeHtml(block.imageUrl)}"
                                alt="Product detail"
                            >

                            <small>Existing image</small>
                        </div>
                    `
                    : ""
            }

            <input
                type="file"
                accept="image/*"
                class="content-block-image"
                data-block-id="${escapeHtml(block.id)}"
            >
        `;
    }


    if (type === "video") {

        return `
            <div class="content-block-header">
                <strong>Video</strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${escapeHtml(block.id)}"
                >
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

                            <small>Existing video</small>
                        </div>
                    `
                    : ""
            }

            <input
                type="file"
                accept="video/*"
                class="content-block-video"
                data-block-id="${escapeHtml(block.id)}"
            >

            <input
                type="url"
                class="content-block-video-url"
                data-block-id="${escapeHtml(block.id)}"
                value="${escapeHtml(block.videoUrl)}"
                placeholder="Or paste video URL"
            >
        `;
    }


    if (type === "specifications") {

        const rows =
            Array.isArray(block.specifications)
                ? block.specifications
                : [];


        return `
            <div class="content-block-header">
                <strong>Specifications</strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${escapeHtml(block.id)}"
                >
                    Remove
                </button>
            </div>

            <div class="specification-rows">

                ${
                    rows.map(
                        (row, rowIndex) => `
                            <div class="specification-row">

                                <input
                                    type="text"
                                    class="spec-key"
                                    data-block-id="${escapeHtml(block.id)}"
                                    data-row-index="${rowIndex}"
                                    value="${escapeHtml(row.key || "")}"
                                    placeholder="Specification"
                                >

                                <input
                                    type="text"
                                    class="spec-value"
                                    data-block-id="${escapeHtml(block.id)}"
                                    data-row-index="${rowIndex}"
                                    value="${escapeHtml(row.value || "")}"
                                    placeholder="Value"
                                >

                                <button
                                    type="button"
                                    class="spec-remove-row"
                                    data-block-id="${escapeHtml(block.id)}"
                                    data-row-index="${rowIndex}"
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
                data-block-id="${escapeHtml(block.id)}"
            >
                Add Specification
            </button>
        `;
    }


    if (type === "divider") {

        return `
            <div class="content-block-header">
                <strong>Divider</strong>

                <button
                    type="button"
                    class="content-remove-block"
                    data-block-id="${escapeHtml(block.id)}"
                >
                    Remove
                </button>
            </div>

            <hr>
        `;
    }


    return "";
}


function setupDynamicContentEvents() {

    if (!contentBlocks) return;


    contentBlocks.onclick =
        event => {

            const removeBlock =
                event.target.closest(
                    ".content-remove-block"
                );


            if (removeBlock) {

                const id =
                    removeBlock.dataset.blockId;

                detailBlocks =
                    detailBlocks.filter(
                        block => block.id !== id
                    );

                renderContentBlocks();

                return;
            }


            const addRow =
                event.target.closest(
                    ".spec-add-row"
                );


            if (addRow) {

                const id =
                    addRow.dataset.blockId;

                const block =
                    detailBlocks.find(
                        item => item.id === id
                    );

                if (!block) return;


                if (!Array.isArray(
                    block.specifications
                )) {

                    block.specifications = [];
                }


                block.specifications.push({
                    key: "",
                    value: ""
                });


                renderContentBlocks();

                return;
            }


            const removeRow =
                event.target.closest(
                    ".spec-remove-row"
                );


            if (removeRow) {

                const id =
                    removeRow.dataset.blockId;

                const rowIndex =
                    Number(
                        removeRow.dataset.rowIndex
                    );


                const block =
                    detailBlocks.find(
                        item => item.id === id
                    );

                if (!block) return;


                block.specifications.splice(
                    rowIndex,
                    1
                );


                renderContentBlocks();
            }
        };


    contentBlocks.oninput =
        event => {

            const element =
                event.target;

            const blockId =
                element.dataset.blockId;

            if (!blockId) return;


            const block =
                detailBlocks.find(
                    item => item.id === blockId
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
                        element.dataset.rowIndex
                    );

                block.specifications[rowIndex]
                    .key =
                    element.value;
            }


            if (
                element.classList.contains(
                    "spec-value"
                )
            ) {

                const rowIndex =
                    Number(
                        element.dataset.rowIndex
                    );

                block.specifications[rowIndex]
                    .value =
                    element.value;
            }
        };


    contentBlocks.onchange =
        event => {

            const element =
                event.target;

            const blockId =
                element.dataset.blockId;

            if (!blockId) return;


            const block =
                detailBlocks.find(
                    item => item.id === blockId
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
                    file.type.startsWith("image/")
                ) {

                    block.file = file;
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
                    file.type.startsWith("video/")
                ) {

                    block.file = file;
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
        "Loading product...",
        false
    );


    setEditorMessage(
        "Loading product data...",
        "info"
    );


    try {

        const productsRef =
            ref(database, "products");

        const snapshot =
            await get(productsRef);


        if (!snapshot.exists()) {

            throw new Error(
                "Product database is empty."
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


                const matchesKey =
                    key === editProductId;

                const matchesProductId =
                    String(
                        data.productId ?? ""
                    ) === String(
                        editProductId
                    );


                if (
                    !foundProduct &&
                    (matchesKey ||
                        matchesProductId)
                ) {

                    foundKey = key;
                    foundProduct = data;
                }
            }
        );


        if (!foundProduct) {

            throw new Error(
                "Product not found."
            );
        }


        /*
         * Seller ownership verification.
         */

        const userIsAdmin =
            String(
                currentUser.email || ""
            ).toLowerCase() ===
            ADMIN_EMAIL.toLowerCase();


        const ownerMatches =
            foundProduct.sellerId ===
                currentUser.uid ||

            foundProduct.createdBy ===
                currentUser.uid;


        if (!userIsAdmin &&
            !ownerMatches) {

            throw new Error(
                "You are not allowed to edit this product."
            );
        }


        editFirebaseKey =
            foundKey;

        existingProduct =
            foundProduct;


        existingMainImageUrl =
            foundProduct.image ||
            foundProduct.mainImage ||
            (
                Array.isArray(foundProduct.images)
                    ? foundProduct.images[0] || ""
                    : ""
            );


        existingGalleryUrls =
            Array.isArray(foundProduct.images)
                ? foundProduct.images.slice(
                    existingMainImageUrl &&
                    foundProduct.images[0] ===
                        existingMainImageUrl
                        ? 1
                        : 0
                )
                : [];


        existingVideoUrl =
            foundProduct.videoUrl || "";


        removedGalleryUrls.clear();


        populateProductForm(
            foundProduct
        );


        setEditorStatus(
            "Edit Mode Ready",
            true
        );


        setEditorMessage(
            "Existing product loaded. You can now edit it.",
            "success"
        );


    } catch (error) {

        console.error(
            "Product load error:",
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


        if (
            saveProductButton
        ) {

            saveProductButton.disabled =
                true;
        }
    }
}


/*==================================================
 FEATURE: POPULATE PRODUCT FORM
==================================================*/

function populateProductForm(product) {

    if (productNameInput)
        productNameInput.value =
            product.name || "";


    if (categoryInput)
        categoryInput.value =
            product.category || "";


    if (brandInput)
        brandInput.value =
            product.brand || "";


    if (skuInput)
        skuInput.value =
            product.sku || "";


    if (conditionInput)
        conditionInput.value =
            product.condition || "";


    if (priceInput)
        priceInput.value =
            product.price ?? "";


    if (oldPriceInput)
        oldPriceInput.value =
            product.oldPrice ?? "";


    if (stockInput)
        stockInput.value =
            product.stock ?? "";


    if (lowStockLimitInput)
        lowStockLimitInput.value =
            product.lowStockLimit ?? "";


    if (shortDescription)
        shortDescription.value =
            product.shortDescription || "";


    if (fullDescriptionInput)
        fullDescriptionInput.value =
            product.description ||
            product.fullDescription ||
            "";


    if (sellerNameInput)
        sellerNameInput.value =
            product.sellerName || "";


    if (ratingInput)
        ratingInput.value =
            product.rating ?? 0;


    if (reviewsInput)
        reviewsInput.value =
            product.reviews ?? 0;


    if (publishedInput)
        publishedInput.checked =
            product.published !== false;


    if (featuredInput)
        featuredInput.checked =
            product.featured === true;


    if (freeShippingInput)
        freeShippingInput.checked =
            product.freeShipping === true;


    /*
     * Existing main image
     */

    renderMainImagePreview(
        existingMainImageUrl
    );


    /*
     * Existing gallery
     */

    renderGalleryPreview();


    /*
     * Existing video
     */

    if (productVideoUrlInput) {

        productVideoUrlInput.value =
            existingVideoUrl;
    }


    renderVideoPreview(
        existingVideoUrl
    );


    /*
     * Existing content blocks
     */

    detailBlocks =
        normalizeExistingDetailBlocks(
            product.detailBlocks
        );


    renderContentBlocks();

    updatePricePreview();

    updateShortDescriptionCount();


    /*
     * Edit button text
     */

    if (saveProductButton) {

        saveProductButton.textContent =
            "Update Product";
    }
}


/*==================================================
 FEATURE: NORMALIZE EXISTING DETAIL BLOCKS
==================================================*/

function normalizeExistingDetailBlocks(
    blocks
) {

    if (!blocks) return [];


    const source =
        Array.isArray(blocks)
            ? blocks
            : Object.values(blocks);


    return source.map(
        block => {

            return {
                id:
                    block.id ||
                    createBlockId(),

                type:
                    block.type ||
                    "text",

                title:
                    block.title || "",

                text:
                    block.text || "",

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
            };
        }
    );
}


/*==================================================
 FEATURE: VALIDATION
==================================================*/

function validateProductForm() {

    const name =
        productNameInput?.value.trim() || "";

    const category =
        categoryInput?.value.trim() || "";

    const price =
        safeNumber(priceInput?.value);

    const stock =
        safeNumber(stockInput?.value);

    const rating =
        safeNumber(ratingInput?.value);


    if (!name) {

        setEditorMessage(
            "Product name is required.",
            "error"
        );

        productNameInput?.focus();

        return false;
    }


    if (!category) {

        setEditorMessage(
            "Category is required.",
            "error"
        );

        categoryInput?.focus();

        return false;
    }


    if (price <= 0) {

        setEditorMessage(
            "Product price must be greater than 0.",
            "error"
        );

        priceInput?.focus();

        return false;
    }


    if (stock < 0) {

        setEditorMessage(
            "Stock cannot be negative.",
            "error"
        );

        stockInput?.focus();

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

        ratingInput?.focus();

        return false;
    }


    /*
     * Add mode requires a new main image.
     *
     * Edit mode can keep existing image.
     */

    const newMainImage =
        mainImageInput?.files?.[0];


    if (
        !isEditMode &&
        !newMainImage
    ) {

        setEditorMessage(
            "Please select a main product image.",
            "error"
        );

        mainImageInput?.focus();

        return false;
    }


    if (
        isEditMode &&
        !newMainImage &&
        !existingMainImageUrl
    ) {

        setEditorMessage(
            "This product has no main image. Please select one.",
            "error"
        );

        mainImageInput?.focus();

        return false;
    }


    return true;
}


/*==================================================
 FEATURE: CLOUDINARY UPLOAD
==================================================*/

async function uploadFileToCloudinary(
    file,
    folder
) {

    if (!file) return "";


    return await uploadToCloudinary(
        file,
        folder
    );
}


/*==================================================
 FEATURE: SAVE CONTENT BLOCK FILES
==================================================*/

async function prepareDetailBlocks() {

    const savedBlocks = [];


    for (
        const block of detailBlocks
    ) {

        const savedBlock = {

            id: block.id,

            type: block.type,

            title: block.title || "",

            text: block.text || "",

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
         * New content block image
         */

        if (
            block.type === "image" &&
            block.file
        ) {

            savedBlock.imageUrl =
                await uploadFileToCloudinary(
                    block.file,
                    CLOUDINARY_FOLDERS.PRODUCTS
                );
        }


        /*
         * New content block video
         */

        if (
            block.type === "video" &&
            block.file
        ) {

            savedBlock.videoUrl =
                await uploadFileToCloudinary(
                    block.file,
                    CLOUDINARY_FOLDERS.PRODUCTS
                );
        }


        savedBlocks.push(
            savedBlock
        );
    }


    return savedBlocks;
}


/*==================================================
 FEATURE: BUILD PRODUCT DATA
==================================================*/

async function buildProductData() {

    const name =
        productNameInput?.value.trim() || "";

    const category =
        categoryInput?.value.trim() || "";

    const brand =
        brandInput?.value.trim() || "";

    const sku =
        skuInput?.value.trim() || "";

    const condition =
        conditionInput?.value.trim() || "";

    const price =
        safeNumber(priceInput?.value);

    const oldPrice =
        safeNumber(oldPriceInput?.value);

    const stock =
        safeNumber(stockInput?.value);

    const lowStockLimit =
        safeNumber(
            lowStockLimitInput?.value
        );

    const shortDesc =
        shortDescription?.value.trim() || "";

    const description =
        fullDescriptionInput?.value.trim() || "";

    const sellerName =
        sellerNameInput?.value.trim() || "";

    const rating =
        safeNumber(ratingInput?.value);

    const reviews =
        safeNumber(reviewsInput?.value);


    /*
     * Calculate discount
     */

    let discount = 0;


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        discount =
            Math.round(
                ((oldPrice - price) /
                    oldPrice) * 100
            );
    }


    /*
     * Main image
     */

    let mainImageUrl =
        existingMainImageUrl;


    const mainImageFile =
        mainImageInput?.files?.[0];


    if (mainImageFile) {

        mainImageUrl =
            await uploadFileToCloudinary(
                mainImageFile,
                CLOUDINARY_FOLDERS.PRODUCTS
            );
    }


    /*
     * Gallery
     */

    const retainedGallery =
        existingGalleryUrls.filter(
            url =>
                !removedGalleryUrls.has(url)
        );


    const newGalleryUrls = [];


    for (
        const file of galleryFiles
    ) {

        const url =
            await uploadFileToCloudinary(
                file,
                CLOUDINARY_FOLDERS.PRODUCTS
            );

        if (url) {
            newGalleryUrls.push(url);
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


    const videoFile =
        productVideoInput?.files?.[0];


    if (videoFile) {

        videoUrl =
            await uploadFileToCloudinary(
                videoFile,
                CLOUDINARY_FOLDERS.PRODUCTS
            );

    } else {

        const typedVideoUrl =
            productVideoUrlInput?.value.trim() ||
            "";

        if (typedVideoUrl) {

            videoUrl =
                typedVideoUrl;
        }
    }


    /*
     * Content blocks
     */

    const savedContentBlocks =
        await prepareDetailBlocks();


    /*
     * Stock state
     */

    const inStock =
        stock > 0;

    const available =
        stock > 0;


    /*
     * Base data
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

        lowStockLimit,

        inStock,

        available,

        shortDescription: shortDesc,

        description,

        image:
            mainImageUrl,

        images,

        videoUrl,

        detailBlocks:
            savedContentBlocks,

        sellerName,

        rating,

        reviews,

        published:
            publishedInput
                ? publishedInput.checked
                : true,

        featured:
            featuredInput
                ? featuredInput.checked
                : false,

        freeShipping:
            freeShippingInput
                ? freeShippingInput.checked
                : false
    };


    /*
     * IMPORTANT:
     *
     * In Edit Mode we preserve the
     * original seller / creator.
     */

    if (isEditMode) {

        productData.productId =
            existingProduct.productId ||
            editFirebaseKey;

        productData.sellerId =
            existingProduct.sellerId ||
            currentUser.uid;

        productData.createdBy =
            existingProduct.createdBy ||
            currentUser.uid;

        productData.createdAt =
            existingProduct.createdAt ||
            Date.now();

        productData.updatedAt =
            Date.now();


    } else {

        productData.productId = "";

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
 FEATURE: SAVE / UPDATE PRODUCT
==================================================*/

async function saveProduct() {

    if (!currentUser) {

        window.location.href =
            "./login.html";

        return;
    }


    if (!validateProductForm()) {
        return;
    }


    setButtonLoading(true);

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


        if (isEditMode) {

            /*
             * UPDATE EXISTING PRODUCT
             */

            if (!editFirebaseKey) {

                throw new Error(
                    "Firebase product key is missing."
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


            setEditorStatus(
                "Product Updated",
                true
            );


            setEditorMessage(
                "Product updated successfully.",
                "success"
            );


            /*
             * Keep the editor open so the seller
             * can continue checking the changes.
             */

            existingProduct = {
                ...existingProduct,
                ...productData
            };


            existingMainImageUrl =
                productData.image;

            existingGalleryUrls =
                Array.isArray(productData.images)
                    ? productData.images.slice(1)
                    : [];

            existingVideoUrl =
                productData.videoUrl || "";


            galleryFiles = [];

            removedGalleryUrls.clear();

            detailBlocks =
                normalizeExistingDetailBlocks(
                    productData.detailBlocks
                );


            renderMainImagePreview(
                existingMainImageUrl
            );

            renderGalleryPreview();

            renderVideoPreview(
                existingVideoUrl
            );

            renderContentBlocks();


        } else {

            /*
             * CREATE NEW PRODUCT
             */

            const productsRef =
                ref(database, "products");


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
             * Reset only after successful Add.
             */

            resetEditor();
        }


    } catch (error) {

        console.error(
            "Product save/update error:",
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

        setButtonLoading(false);
    }
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


    cleanupAllObjectUrls();


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


    if (isEditMode) {

        if (saveProductButton) {

            saveProductButton.textContent =
                "Update Product";
        }

    } else {

        if (saveProductButton) {

            saveProductButton.textContent =
                "Save Product";
        }
    }
}


/*==================================================
 FEATURE: CLEAR BUTTON
==================================================*/

function setupClearButton() {

    if (!clearButton) return;


    clearButton.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    isEditMode
                        ? "Reset the current form changes?"
                        : "Clear all product fields?"
                );


            if (!confirmed) return;


            if (isEditMode) {

                /*
                 * In edit mode reload the original
                 * Firebase product instead of creating
                 * a blank product.
                 */

                resetEditor();


                if (existingProduct) {

                    /*
                     * Restore existing product state
                     */

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
                            ? existingProduct.images.slice(
                                existingProduct.images[0] ===
                                    existingMainImageUrl
                                    ? 1
                                    : 0
                            )
                            : [];


                    existingVideoUrl =
                        existingProduct.videoUrl ||
                        "";


                    populateProductForm(
                        existingProduct
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


            currentUser = user;


            setEditorStatus(
                isEditMode
                    ? "Checking Product..."
                    : "Ready",
                !isEditMode
            );


            /*
             * Both Seller and Admin are allowed.
             */

            if (isEditMode) {

                await loadExistingProduct();

            } else {

                /*
                 * Add mode
                 */

                if (saveProductButton) {

                    saveProductButton.textContent =
                        "Save Product";
                }


                setEditorStatus(
                    "Ready",
                    true
                );
            }
        }
    );
}


/*==================================================
 FEATURE: INITIAL UI
==================================================*/

function initializeProductEditor() {

    setupProductEditorNavigation();

    setupMainImagePreview();

    setupGalleryInput();

    setupGalleryRemoveEvents();

    setupVideoInputs();

    setupPricePreview();

    setupShortDescriptionCounter();

    setupContentBuilder();

    setupFormSubmit();

    setupClearButton();

    renderContentBlocks();

    updatePricePreview();

    updateShortDescriptionCount();


    /*
     * Edit mode indicator
     */

    if (isEditMode) {

        setEditorStatus(
            "Loading Product...",
            false
        );


        if (saveProductButton) {

            saveProductButton.textContent =
                "Update Product";
        }

    } else {

        setEditorStatus(
            "Ready",
            true
        );
    }
}


/*==================================================
 FEATURE: CLEANUP
==================================================*/

window.addEventListener(
    "beforeunload",
    () => {

        cleanupAllObjectUrls();
    }
);


/*==================================================
 FEATURE: START
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
