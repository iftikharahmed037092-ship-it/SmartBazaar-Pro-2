/*==================================================
 SMARTBAZAAR PRO 2
 FEATURE: PREMIUM PRODUCT DETAIL EDITOR
 VERSION: PRODUCT EDITOR V2.1
==================================================*/


/*==================================================
 FEATURE: FIREBASE IMPORT
 KEEP EXISTING CONNECTION
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
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
 FEATURE: FIREBASE AUTH METHODS
==================================================*/

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
 FEATURE: CLOUDINARY IMPORT
 KEEP EXISTING CONNECTION
==================================================*/

import {
    uploadToCloudinary,
    CLOUDINARY_FOLDERS
} from "./cloudinary-config.js";


/*==================================================
 FEATURE: ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
 FEATURE: DOM ELEMENTS
==================================================*/

const productForm =
    document.getElementById("productForm");

const saveProductButton =
    document.getElementById("saveProductButton");

const clearButton =
    document.getElementById("clearButton");

const mainImageInput =
    document.getElementById("mainImage");

const galleryImagesInput =
    document.getElementById("galleryImages");

const productVideoInput =
    document.getElementById("productVideo");

const productVideoUrlInput =
    document.getElementById("productVideoUrl");

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
 FEATURE: ADDITIONAL DOM ELEMENTS
==================================================*/

const priceInput =
    document.getElementById("productPrice");

const oldPriceInput =
    document.getElementById("productOldPrice");

const productStockInput =
    document.getElementById("productStock");

const lowStockLimitInput =
    document.getElementById("lowStockLimit");

const productSKUInput =
    document.getElementById("productSKU");

const productConditionInput =
    document.getElementById("productCondition");

const productRatingInput =
    document.getElementById("productRating");

const productReviewsInput =
    document.getElementById("productReviews");

const productPublishedInput =
    document.getElementById("productPublished");

const productFeaturedInput =
    document.getElementById("productFeatured");

const freeShippingInput =
    document.getElementById("freeShipping");


/*==================================================
 FEATURE: LOCAL EDITOR STATE
==================================================*/

/*
 Gallery files remain locally selected
 until Save Product is pressed.
*/

let galleryFiles = [];


/*
 Product detail content blocks.
*/

let detailBlocks = [];


/*
 Temporary browser object URLs.
*/

const objectUrls =
    new Set();


/*==================================================
 FEATURE: ADMIN ACCESS CONTROL
 KEEP EXISTING AUTH SYSTEM
==================================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "admin-login.html";

            return;
        }


        const loggedInEmail =
            user.email
                ? user.email.toLowerCase()
                : "";


        if (
            loggedInEmail !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            window.location.href =
                "admin-login.html";

            return;
        }


        setEditorStatus(
            "Ready",
            true
        );

    }
);


/*==================================================
 FEATURE: MAIN IMAGE PREVIEW
==================================================*/

if (mainImageInput) {

    mainImageInput.addEventListener(
        "change",
        () => {

            const file =
                mainImageInput.files &&
                mainImageInput.files[0];


            clearMainImagePreview();


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                showMessage(
                    "Please select a valid image file.",
                    "error"
                );

                mainImageInput.value = "";

                return;
            }


            const objectUrl =
                createObjectUrl(file);


            const image =
                document.createElement("img");


            image.src =
                objectUrl;

            image.alt =
                "Main Product Image";


            image.style.display =
                "block";

            image.style.width =
                "100%";

            image.style.height =
                "100%";

            image.style.objectFit =
                "contain";


            mainImagePreview.appendChild(
                image
            );


            mainImagePreview.style.display =
                "block";

            mainImagePreview.style.visibility =
                "visible";

            mainImagePreview.style.opacity =
                "1";

        }
    );

}


/*==================================================
 FEATURE: GALLERY IMAGE SELECTION
 MULTIPLE + ADD MORE
==================================================*/

if (galleryImagesInput) {

    galleryImagesInput.addEventListener(
        "change",
        () => {

            const selectedFiles =
                Array.from(
                    galleryImagesInput.files || []
                );


            selectedFiles.forEach(
                (file) => {

                    if (
                        file.type.startsWith("image/")
                    ) {

                        galleryFiles.push(file);

                    }

                }
            );


            /*
             Reset native input.
             This allows selecting the same
             image again if required.
            */

            galleryImagesInput.value =
                "";


            renderGalleryPreview();

        }
    );

}


/*==================================================
 FEATURE: RENDER GALLERY PREVIEW
==================================================*/

function renderGalleryPreview() {

    if (!galleryPreview) {
        return;
    }


    galleryPreview.innerHTML =
        "";


    galleryFiles.forEach(
        (file, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "gallery-image";


            wrapper.style.position =
                "relative";

            wrapper.style.overflow =
                "hidden";


            const image =
                document.createElement("img");


            image.src =
                createObjectUrl(file);

            image.alt =
                `Gallery Image ${index + 1}`;


            image.style.display =
                "block";

            image.style.width =
                "100%";

            image.style.height =
                "100%";

            image.style.objectFit =
                "cover";


            wrapper.appendChild(
                image
            );


            const removeButton =
                document.createElement("button");


            removeButton.type =
                "button";


            removeButton.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';


            removeButton.title =
                "Remove image";


            removeButton.style.position =
                "absolute";

            removeButton.style.top =
                "6px";

            removeButton.style.right =
                "6px";

            removeButton.style.width =
                "30px";

            removeButton.style.height =
                "30px";

            removeButton.style.border =
                "0";

            removeButton.style.borderRadius =
                "50%";

            removeButton.style.cursor =
                "pointer";

            removeButton.style.background =
                "rgba(0,0,0,0.70)";

            removeButton.style.color =
                "#ffffff";


            removeButton.addEventListener(
                "click",
                () => {

                    galleryFiles.splice(
                        index,
                        1
                    );

                    renderGalleryPreview();

                }
            );


            wrapper.appendChild(
                removeButton
            );


            galleryPreview.appendChild(
                wrapper
            );

        }
    );

}


/*==================================================
 FEATURE: VIDEO FILE PREVIEW
==================================================*/

if (productVideoInput) {

    productVideoInput.addEventListener(
        "change",
        () => {

            const file =
                productVideoInput.files &&
                productVideoInput.files[0];


            if (!file) {

                clearVideoPreview();

                return;
            }


            if (
                !file.type.startsWith("video/")
            ) {

                showMessage(
                    "Please select a valid video file.",
                    "error"
                );

                productVideoInput.value =
                    "";

                clearVideoPreview();

                return;
            }


            /*
             Local video file has priority
             over Video URL.
            */

            renderVideoFilePreview(
                file
            );

        }
    );

}


/*==================================================
 FEATURE: VIDEO URL PREVIEW
==================================================*/

if (productVideoUrlInput) {

    productVideoUrlInput.addEventListener(
        "input",
        () => {

            /*
             Local selected video always
             has priority.
            */

            if (
                productVideoInput &&
                productVideoInput.files &&
                productVideoInput.files[0]
            ) {

                return;
            }


            const url =
                productVideoUrlInput.value.trim();


            if (!url) {

                clearVideoPreview();

                return;
            }


            renderVideoUrlPreview(url);

        }
    );

}


/*==================================================
 FEATURE: VIDEO FILE PREVIEW RENDER
==================================================*/

function renderVideoFilePreview(file) {

    if (!videoPreview) {
        return;
    }


    videoPreview.innerHTML =
        "";


    const video =
        document.createElement("video");


    video.src =
        createObjectUrl(file);

    video.controls =
        true;

    video.preload =
        "metadata";

    video.playsInline =
        true;


    video.style.display =
        "block";

    video.style.width =
        "100%";

    video.style.maxWidth =
        "700px";

    video.style.maxHeight =
        "420px";

    video.style.borderRadius =
        "14px";


    videoPreview.appendChild(
        video
    );


    videoPreview.style.display =
        "block";

}


/*==================================================
 FEATURE: VIDEO URL PREVIEW RENDER
==================================================*/

function renderVideoUrlPreview(url) {

    if (!videoPreview) {
        return;
    }


    videoPreview.innerHTML =
        "";


    const video =
        document.createElement("video");


    video.src =
        url;

    video.controls =
        true;

    video.preload =
        "metadata";

    video.playsInline =
        true;


    video.style.display =
        "block";

    video.style.width =
        "100%";

    video.style.maxWidth =
        "700px";

    video.style.maxHeight =
        "420px";

    video.style.borderRadius =
        "14px";


    videoPreview.appendChild(
        video
    );


    videoPreview.style.display =
        "block";

}


/*==================================================
 FEATURE: CLEAR VIDEO PREVIEW
==================================================*/

function clearVideoPreview() {

    if (!videoPreview) {
        return;
    }


    videoPreview.innerHTML =
        "";

    videoPreview.style.display =
        "none";

}


/*==================================================
 FEATURE: PRICE PREVIEW
==================================================*/

if (priceInput) {

    priceInput.addEventListener(
        "input",
        updatePricePreview
    );

}


if (oldPriceInput) {

    oldPriceInput.addEventListener(
        "input",
        updatePricePreview
    );

}


function updatePricePreview() {

    const price =
        Number(
            priceInput?.value
        ) || 0;


    const oldPrice =
        Number(
            oldPriceInput?.value
        ) || 0;


    if (previewPrice) {

        previewPrice.textContent =
            formatPrice(price);

    }


    if (previewOldPrice) {

        previewOldPrice.textContent =
            "";

    }


    if (previewDiscount) {

        previewDiscount.textContent =
            "";

    }


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        if (previewOldPrice) {

            previewOldPrice.textContent =
                formatPrice(oldPrice);

        }


        const discount =
            Math.round(
                (
                    (
                        oldPrice -
                        price
                    )
                    /
                    oldPrice
                )
                * 100
            );


        if (previewDiscount) {

            previewDiscount.textContent =
                `-${discount}%`;

        }

    }

}


/*==================================================
 FEATURE: SHORT DESCRIPTION COUNTER
==================================================*/

if (shortDescription) {

    shortDescription.addEventListener(
        "input",
        () => {

            if (shortDescriptionCount) {

                shortDescriptionCount.textContent =
                    shortDescription.value.length;

            }

        }
    );

}


/*==================================================
 FEATURE: CONTENT BUILDER TOOLBAR
==================================================*/

if (contentBuilderToolbar) {

    contentBuilderToolbar.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".content-add-button"
                );


            if (!button) {
                return;
            }


            const type =
                button.dataset.blockType;


            if (!type) {
                return;
            }


            addContentBlock(type);

        }
    );

}


/*==================================================
 FEATURE: ADD CONTENT BLOCK
==================================================*/

function addContentBlock(type) {

    const block = {

        id:
            createBlockId(),

        type:
            type,

        title:
            "",

        text:
            "",

        file:
            null,

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


/*==================================================
 FEATURE: CREATE BLOCK ID
==================================================*/

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


/*==================================================
 FEATURE: RENDER CONTENT BLOCKS
==================================================*/

function renderContentBlocks() {

    if (!contentBlocks) {
        return;
    }


    contentBlocks.innerHTML =
        "";


    if (
        detailBlocks.length === 0
    ) {

        if (contentEmptyState) {

            contentBlocks.appendChild(
                contentEmptyState
            );

        }

        return;
    }


    detailBlocks.forEach(
        (block, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "content-editor-block";


            wrapper.dataset.blockId =
                block.id;


            wrapper.style.position =
                "relative";

            wrapper.style.padding =
                "18px";

            wrapper.style.marginBottom =
                "15px";

            wrapper.style.border =
                "1px solid #e1e5e9";

            wrapper.style.borderRadius =
                "14px";

            wrapper.style.background =
                "#ffffff";


            const header =
                document.createElement("div");


            header.style.display =
                "flex";

            header.style.alignItems =
                "center";

            header.style.justifyContent =
                "space-between";

            header.style.gap =
                "10px";

            header.style.marginBottom =
                "15px";


            const title =
                document.createElement("strong");


            title.textContent =
                `${index + 1}. ${getBlockTitle(block.type)}`;


            header.appendChild(
                title
            );


            const deleteButton =
                document.createElement("button");


            deleteButton.type =
                "button";

            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash"></i>';

            deleteButton.title =
                "Delete block";


            deleteButton.style.border =
                "0";

            deleteButton.style.background =
                "#fff0f0";

            deleteButton.style.color =
                "#c62828";

            deleteButton.style.padding =
                "8px 11px";

            deleteButton.style.borderRadius =
                "8px";

            deleteButton.style.cursor =
                "pointer";


            deleteButton.addEventListener(
                "click",
                () => {

                    detailBlocks =
                        detailBlocks.filter(
                            (item) =>
                                item.id !==
                                block.id
                        );


                    renderContentBlocks();

                }
            );


            header.appendChild(
                deleteButton
            );


            wrapper.appendChild(
                header
            );


            const editorArea =
                createBlockEditor(
                    block
                );


            wrapper.appendChild(
                editorArea
            );


            contentBlocks.appendChild(
                wrapper
            );

        }
    );

}


/*==================================================
 FEATURE: BLOCK TITLE
==================================================*/

function getBlockTitle(type) {

    const titles = {

        heading:
            "Heading",

        text:
            "Text",

        image:
            "Image",

        video:
            "Video",

        specifications:
            "Specifications",

        divider:
            "Divider"

    };


    return (
        titles[type] ||
        "Content Block"
    );

}


/*==================================================
 FEATURE: CREATE BLOCK EDITOR
==================================================*/

function createBlockEditor(block) {

    const container =
        document.createElement("div");


    /*================================================
     HEADING BLOCK
    ================================================*/

    if (
        block.type === "heading"
    ) {

        const field =
            createTextInput(
                "Heading",
                "Enter section heading..."
            );


        const input =
            field.input;


        input.value =
            block.title || "";


        input.addEventListener(
            "input",
            () => {

                block.title =
                    input.value;

            }
        );


        container.appendChild(
            field.wrapper
        );

    }


    /*================================================
     TEXT BLOCK
    ================================================*/

    if (
        block.type === "text"
    ) {

        const textarea =
            document.createElement("textarea");


        textarea.rows =
            6;


        textarea.placeholder =
            "Write detailed product information...";


        textarea.value =
            block.text || "";


        textarea.style.width =
            "100%";

        textarea.style.padding =
            "12px";

        textarea.style.border =
            "1px solid #dce1e5";

        textarea.style.borderRadius =
            "10px";

        textarea.style.fontFamily =
            "inherit";

        textarea.style.resize =
            "vertical";


        textarea.addEventListener(
            "input",
            () => {

                block.text =
                    textarea.value;

            }
        );


        container.appendChild(
            textarea
        );

    }


    /*================================================
     IMAGE BLOCK
    ================================================*/

    if (
        block.type === "image"
    ) {

        const input =
            document.createElement("input");


        input.type =
            "file";

        input.accept =
            "image/*";


        input.style.width =
            "100%";


        input.addEventListener(
            "change",
            () => {

                const file =
                    input.files &&
                    input.files[0];


                if (!file) {
                    return;
                }


                if (
                    !file.type.startsWith("image/")
                ) {

                    showMessage(
                        "Please select a valid image.",
                        "error"
                    );

                    input.value =
                        "";

                    return;
                }


                block.file =
                    file;


                renderBlockFilePreview(
                    container,
                    file,
                    "image"
                );

            }
        );


        container.appendChild(
            input
        );


        if (block.file) {

            renderBlockFilePreview(
                container,
                block.file,
                "image"
            );

        }

    }


    /*================================================
     VIDEO BLOCK
    ================================================*/

    if (
        block.type === "video"
    ) {

        const input =
            document.createElement("input");


        input.type =
            "file";

        input.accept =
            "video/*";


        input.style.width =
            "100%";


        input.addEventListener(
            "change",
            () => {

                const file =
                    input.files &&
                    input.files[0];


                if (!file) {
                    return;
                }


                if (
                    !file.type.startsWith("video/")
                ) {

                    showMessage(
                        "Please select a valid video.",
                        "error"
                    );

                    input.value =
                        "";

                    return;
                }


                block.file =
                    file;


                renderBlockFilePreview(
                    container,
                    file,
                    "video"
                );

            }
        );


        container.appendChild(
            input
        );


        const urlField =
            createTextInput(
                "Video URL (optional)",
                "https://..."
            );


        const urlInput =
            urlField.input;


        urlInput.value =
            block.videoUrl || "";


        urlInput.style.marginTop =
            "12px";


        urlInput.addEventListener(
            "input",
            () => {

                block.videoUrl =
                    urlInput.value.trim();

            }
        );


        container.appendChild(
            urlField.wrapper
        );


        if (block.file) {

            renderBlockFilePreview(
                container,
                block.file,
                "video"
            );

        }

    }


    /*================================================
     SPECIFICATIONS BLOCK
    ================================================*/

    if (
        block.type === "specifications"
    ) {

        const specificationWrapper =
            document.createElement("div");


        const addSpecButton =
            document.createElement("button");


        addSpecButton.type =
            "button";

        addSpecButton.textContent =
            "+ Add Specification";


        addSpecButton.style.marginBottom =
            "12px";

        addSpecButton.style.padding =
            "9px 13px";

        addSpecButton.style.border =
            "1px solid #dce1e5";

        addSpecButton.style.borderRadius =
            "8px";

        addSpecButton.style.background =
            "#ffffff";

        addSpecButton.style.cursor =
            "pointer";


        addSpecButton.addEventListener(
            "click",
            () => {

                block.specifications.push({

                    name:
                        "",

                    value:
                        ""

                });


                renderContentBlocks();

            }
        );


        specificationWrapper.appendChild(
            addSpecButton
        );


        block.specifications.forEach(
            (spec, specIndex) => {

                const row =
                    document.createElement("div");


                row.style.display =
                    "grid";

                row.style.gridTemplateColumns =
                    "1fr 1fr auto";

                row.style.gap =
                    "8px";

                row.style.marginBottom =
                    "8px";


                const nameInput =
                    document.createElement("input");


                nameInput.type =
                    "text";

                nameInput.placeholder =
                    "Specification";

                nameInput.value =
                    spec.name || "";


                const valueInput =
                    document.createElement("input");


                valueInput.type =
                    "text";

                valueInput.placeholder =
                    "Value";

                valueInput.value =
                    spec.value || "";


                const removeButton =
                    document.createElement("button");


                removeButton.type =
                    "button";

                removeButton.innerHTML =
                    '<i class="fa-solid fa-xmark"></i>';


                nameInput.addEventListener(
                    "input",
                    () => {

                        spec.name =
                            nameInput.value;

                    }
                );


                valueInput.addEventListener(
                    "input",
                    () => {

                        spec.value =
                            valueInput.value;

                    }
                );


                removeButton.addEventListener(
                    "click",
                    () => {

                        block.specifications.splice(
                            specIndex,
                            1
                        );


                        renderContentBlocks();

                    }
                );


                row.appendChild(
                    nameInput
                );

                row.appendChild(
                    valueInput
                );

                row.appendChild(
                    removeButton
                );


                specificationWrapper.appendChild(
                    row
                );

            }
        );


        container.appendChild(
            specificationWrapper
        );

    }


    /*================================================
     DIVIDER BLOCK
    ================================================*/

    if (
        block.type === "divider"
    ) {

        const divider =
            document.createElement("hr");


        divider.style.border =
            "0";

        divider.style.borderTop =
            "2px solid #e1e5e9";

        divider.style.margin =
            "15px 0";


        container.appendChild(
            divider
        );

    }


    return container;

}


/*==================================================
 FEATURE: CREATE TEXT INPUT
 FIXED INPUT REFERENCE
==================================================*/

function createTextInput(
    labelText,
    placeholder
) {

    const wrapper =
        document.createElement("div");


    const label =
        document.createElement("label");


    label.textContent =
        labelText;


    label.style.display =
        "block";

    label.style.marginBottom =
        "7px";

    label.style.fontWeight =
        "700";


    const input =
        document.createElement("input");


    input.type =
        "text";

    input.placeholder =
        placeholder;


    input.style.width =
        "100%";

    input.style.padding =
        "12px";

    input.style.border =
        "1px solid #dce1e5";

    input.style.borderRadius =
        "10px";

    input.style.fontFamily =
        "inherit";


    wrapper.appendChild(
        label
    );


    wrapper.appendChild(
        input
    );


    return {

        wrapper:
            wrapper,

        input:
            input

    };

}


/*==================================================
 FEATURE: BLOCK FILE PREVIEW
==================================================*/

function renderBlockFilePreview(
    container,
    file,
    type
) {

    const oldPreview =
        container.querySelector(
            ".block-file-preview"
        );


    if (oldPreview) {

        oldPreview.remove();

    }


    const preview =
        document.createElement("div");


    preview.className =
        "block-file-preview";


    preview.style.marginTop =
        "12px";


    if (
        type === "image"
    ) {

        const image =
            document.createElement("img");


        image.src =
            createObjectUrl(file);


        image.alt =
            "Detail Image";


        image.style.display =
            "block";

        image.style.width =
            "100%";

        image.style.maxWidth =
            "500px";

        image.style.maxHeight =
            "350px";

        image.style.objectFit =
            "contain";

        image.style.borderRadius =
            "12px";


        preview.appendChild(
            image
        );

    }


    if (
        type === "video"
    ) {

        const video =
            document.createElement("video");


        video.src =
            createObjectUrl(file);


        video.controls =
            true;

        video.playsInline =
            true;

        video.preload =
            "metadata";


        video.style.display =
            "block";

        video.style.width =
            "100%";

        video.style.maxWidth =
            "600px";

        video.style.maxHeight =
            "400px";

        video.style.borderRadius =
            "12px";


        preview.appendChild(
            video
        );

    }


    container.appendChild(
        preview
    );

}


/*==================================================
 FEATURE: OBJECT URL CREATOR
==================================================*/

function createObjectUrl(file) {

    const url =
        URL.createObjectURL(file);


    objectUrls.add(url);


    return url;

}


/*==================================================
 FEATURE: SAVE PRODUCT
==================================================*/

if (productForm) {

    productForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            hideMessage();


            const currentUser =
                auth.currentUser;


            if (!currentUser) {

                showMessage(
                    "Please login as administrator first.",
                    "error"
                );

                return;
            }


            const currentEmail =
                currentUser.email
                    ? currentUser.email.toLowerCase()
                    : "";


            if (
                currentEmail !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                showMessage(
                    "You are not authorized to add products.",
                    "error"
                );

                return;
            }


            /*========================================
             READ BASIC DATA
            ========================================*/

            const name =
                document.getElementById(
                    "productName"
                )?.value.trim() || "";


            const category =
                document.getElementById(
                    "productCategory"
                )?.value.trim() || "";


            const brand =
                document.getElementById(
                    "productBrand"
                )?.value.trim() || "";


            const sku =
                productSKUInput
                    ? productSKUInput.value.trim()
                    : "";


            const condition =
                productConditionInput
                    ? productConditionInput.value
                    : "new";


            /*========================================
             PRICING
            ========================================*/

            const price =
                Number(
                    priceInput?.value
                );


            const oldPrice =
                Number(
                    oldPriceInput?.value
                ) || 0;


            const stock =
                Number(
                    productStockInput?.value
                );


            const lowStockLimit =
                Number(
                    lowStockLimitInput?.value
                ) || 0;


            /*========================================
             DESCRIPTION
            ========================================*/

            const shortDescriptionValue =
                shortDescription
                    ? shortDescription.value.trim()
                    : "";


            const description =
                document.getElementById(
                    "fullDescription"
                )?.value.trim() || "";


            /*========================================
             SELLER
            ========================================*/

            const sellerName =
                document.getElementById(
                    "sellerName"
                )?.value.trim() || "";


            /*========================================
             RATING
            ========================================*/

            const rating =
                Number(
                    productRatingInput?.value
                ) || 0;


            const reviews =
                Number(
                    productReviewsInput?.value
                ) || 0;


            /*========================================
             SETTINGS
            ========================================*/

            const published =
                productPublishedInput
                    ? productPublishedInput.checked
                    : true;


            const featured =
                productFeaturedInput
                    ? productFeaturedInput.checked
                    : false;


            const freeShipping =
                freeShippingInput
                    ? freeShippingInput.checked
                    : false;


            /*========================================
             VALIDATION
            ========================================*/

            if (!name) {

                showMessage(
                    "Please enter the product name.",
                    "error"
                );

                return;
            }


            if (!category) {

                showMessage(
                    "Please enter the product category.",
                    "error"
                );

                return;
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                showMessage(
                    "Please enter a valid selling price.",
                    "error"
                );

                return;
            }


            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                showMessage(
                    "Please enter a valid stock quantity.",
                    "error"
                );

                return;
            }


            if (
                rating < 0 ||
                rating > 5
            ) {

                showMessage(
                    "Rating must be between 0 and 5.",
                    "error"
                );

                return;
            }


            if (
                reviews < 0 ||
                !Number.isInteger(reviews)
            ) {

                showMessage(
                    "Please enter a valid review count.",
                    "error"
                );

                return;
            }


            if (
                !mainImageInput ||
                !mainImageInput.files ||
                !mainImageInput.files[0]
            ) {

                showMessage(
                    "Please select the main product image.",
                    "error"
                );

                return;
            }


            /*========================================
             DISABLE SAVE BUTTON
            ========================================*/

            saveProductButton.disabled =
                true;


            setSaveButtonText(
                "Uploading..."
            );


            setEditorStatus(
                "Uploading",
                false
            );


            try {

                /*====================================
                 MAIN IMAGE UPLOAD
                ====================================*/

                const mainUpload =
                    await uploadToCloudinary(
                        mainImageInput.files[0],
                        CLOUDINARY_FOLDERS.PRODUCTS
                    );


                const mainImageUrl =
                    mainUpload.url;


                /*====================================
                 GALLERY UPLOAD
                ====================================*/

                const galleryUrls =
                    [];


                for (
                    let index = 0;
                    index < galleryFiles.length;
                    index++
                ) {

                    setSaveButtonText(
                        `Uploading Image ${index + 1}/${galleryFiles.length}...`
                    );


                    const galleryUpload =
                        await uploadToCloudinary(
                            galleryFiles[index],
                            CLOUDINARY_FOLDERS.PRODUCTS
                        );


                    if (
                        galleryUpload &&
                        galleryUpload.url
                    ) {

                        galleryUrls.push(
                            galleryUpload.url
                        );

                    }

                }


                /*====================================
                 PRODUCT VIDEO
                ====================================*/

                let productVideoUrl =
                    productVideoUrlInput
                        ? productVideoUrlInput.value.trim()
                        : "";


                if (
                    productVideoInput &&
                    productVideoInput.files &&
                    productVideoInput.files[0]
                ) {

                    setSaveButtonText(
                        "Uploading Product Video..."
                    );


                    const videoUpload =
                        await uploadToCloudinary(
                            productVideoInput.files[0],
                            CLOUDINARY_FOLDERS.PRODUCTS,
                            "video"
                        );


                    if (
                        videoUpload &&
                        videoUpload.url
                    ) {

                        productVideoUrl =
                            videoUpload.url;

                    }

                }


                /*====================================
                 COMPLETE IMAGE ARRAY
                ====================================*/

                const images = [

                    mainImageUrl,

                    ...galleryUrls

                ];


                /*====================================
                 DISCOUNT
                ====================================*/

                let discount =
                    0;


                if (
                    oldPrice > price &&
                    oldPrice > 0
                ) {

                    discount =
                        Math.round(
                            (
                                (
                                    oldPrice -
                                    price
                                )
                                /
                                oldPrice
                            )
                            * 100
                        );

                }


                /*====================================
                 CONTENT BLOCK UPLOAD
                ====================================*/

                const savedContentBlocks =
                    [];


                for (
                    let index = 0;
                    index < detailBlocks.length;
                    index++
                ) {

                    const block =
                        detailBlocks[index];


                    const savedBlock = {

                        id:
                            block.id,

                        type:
                            block.type,

                        title:
                            block.title || "",

                        text:
                            block.text || "",

                        videoUrl:
                            block.videoUrl || "",

                        specifications:
                            Array.isArray(
                                block.specifications
                            )
                                ? block.specifications
                                : []

                    };


                    /*================================
                     CONTENT IMAGE UPLOAD
                    =================================*/

                    if (
                        block.type === "image" &&
                        block.file
                    ) {

                        setSaveButtonText(
                            `Uploading Detail Image ${index + 1}...`
                        );


                        const upload =
                            await uploadToCloudinary(
                                block.file,
                                CLOUDINARY_FOLDERS.PRODUCTS
                            );


                        if (
                            upload &&
                            upload.url
                        ) {

                            savedBlock.imageUrl =
                                upload.url;

                        }

                    }


                    /*================================
                     CONTENT VIDEO UPLOAD
                    =================================*/

                    if (
                        block.type === "video" &&
                        block.file
                    ) {

                        setSaveButtonText(
                            `Uploading Detail Video ${index + 1}...`
                        );


                        const upload =
                            await uploadToCloudinary(
                                block.file,
                                CLOUDINARY_FOLDERS.PRODUCTS,
                                "video"
                            );


                        if (
                            upload &&
                            upload.url
                        ) {

                            savedBlock.videoUrl =
                                upload.url;

                        }

                    }


                    savedContentBlocks.push(
                        savedBlock
                    );

                }


                /*====================================
                 PRODUCT ID
                ====================================*/

                const productsRef =
                    ref(
                        database,
                        "products"
                    );


                const newProductRef =
                    push(
                        productsRef
                    );


                const productId =
                    newProductRef.key;


                /*====================================
                 COMPLETE PRODUCT DATA
                ====================================*/

                const productData = {

                    productId:
                        productId,

                    name:
                        name,

                    category:
                        category,

                    brand:
                        brand,

                    sku:
                        sku,

                    condition:
                        condition,

                    price:
                        price,

                    oldPrice:
                        oldPrice,

                    discount:
                        discount,

                    stock:
                        stock,

                    lowStockLimit:
                        lowStockLimit,

                    inStock:
                        stock > 0,

                    available:
                        stock > 0,

                    shortDescription:
                        shortDescriptionValue,

                    description:
                        description,

                    image:
                        mainImageUrl,

                    images:
                        images,

                    videoUrl:
                        productVideoUrl,

                    detailBlocks:
                        savedContentBlocks,

                    sellerName:
                        sellerName ||
                        "SmartBazaar Seller",

                    rating:
                        rating,

                    reviews:
                        reviews,

                    published:
                        published,

                    featured:
                        featured,

                    freeShipping:
                        freeShipping,

                    createdBy:
                        currentUser.uid,

                    sellerId:
                        currentUser.uid,

                    createdAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                };


                /*====================================
                 SAVE TO FIREBASE
                ====================================*/

                setSaveButtonText(
                    "Saving Product..."
                );


                setEditorStatus(
                    "Saving",
                    false
                );


                await set(
                    newProductRef,
                    productData
                );


                /*====================================
                 SUCCESS
                ====================================*/

                showMessage(
                    `Product saved successfully. Product ID: ${productId}`,
                    "success"
                );


                setEditorStatus(
                    "Saved",
                    true
                );


                /*====================================
                 RESET EDITOR
                ====================================*/

                resetEditor();

            }

            catch (error) {

                console.error(
                    "Product Editor Error:",
                    error
                );


                showMessage(
                    error?.message ||
                    "Unable to save product. Please try again.",
                    "error"
                );


                setEditorStatus(
                    "Error",
                    false
                );

            }

            finally {

                saveProductButton.disabled =
                    false;


                setSaveButtonText(
                    "Save Product"
                );

            }

        }
    );

}


/*==================================================
 FEATURE: CLEAR FORM
==================================================*/

if (clearButton) {

    clearButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Clear all product information?"
                );


            if (!confirmed) {
                return;
            }


            resetEditor();


            hideMessage();


            setEditorStatus(
                "Ready",
                true
            );

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


    galleryFiles =
        [];


    detailBlocks =
        [];


    clearMainImagePreview();


    if (galleryPreview) {

        galleryPreview.innerHTML =
            "";

    }


    clearVideoPreview();


    if (contentBlocks) {

        renderContentBlocks();

    }


    if (shortDescriptionCount) {

        shortDescriptionCount.textContent =
            "0";

    }


    updatePricePreview();


    cleanupObjectUrls();

}


/*==================================================
 FEATURE: CLEAR MAIN IMAGE PREVIEW
==================================================*/

function clearMainImagePreview() {

    if (!mainImagePreview) {
        return;
    }


    mainImagePreview.innerHTML =
        "";


    mainImagePreview.style.display =
        "none";


    mainImagePreview.style.visibility =
        "hidden";


    mainImagePreview.style.opacity =
        "0";

}


/*==================================================
 FEATURE: CLEANUP OBJECT URLS
==================================================*/

function cleanupObjectUrls() {

    objectUrls.forEach(
        (url) => {

            try {

                URL.revokeObjectURL(
                    url
                );

            }

            catch (error) {

                console.warn(
                    "Object URL cleanup error:",
                    error
                );

            }

        }
    );


    objectUrls.clear();

}


/*==================================================
 FEATURE: SAVE BUTTON TEXT
==================================================*/

function setSaveButtonText(text) {

    if (!saveProductButton) {
        return;
    }


    if (
        text !==
        "Save Product"
    ) {

        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                ${escapeHtml(text)}
            `;

        return;
    }


    saveProductButton.innerHTML =
        `
            <i class="fa-solid fa-cloud-arrow-up"></i>
            Save Product
        `;

}


/*==================================================
 FEATURE: SAFE HTML TEXT
==================================================*/

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*==================================================
 FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(value) {

    return (
        "Rs. " +
        Number(value)
            .toLocaleString("en-PK")
    );

}


/*==================================================
 FEATURE: EDITOR STATUS
==================================================*/

function setEditorStatus(
    text,
    online
) {

    if (editorStatusText) {

        editorStatusText.textContent =
            text;

    }


    if (editorStatusDot) {

        editorStatusDot.style.background =
            online
                ? "#2e7d32"
                : "#f39c12";

    }

}


/*==================================================
 FEATURE: SHOW MESSAGE
==================================================*/

function showMessage(
    message,
    type
) {

    if (!editorMessage) {
        return;
    }


    editorMessage.textContent =
        message;


    editorMessage.className =
        `editor-message ${type}`;


    editorMessage.scrollIntoView({
        behavior:
            "smooth",

        block:
            "center"
    });

}


/*==================================================
 FEATURE: HIDE MESSAGE
==================================================*/

function hideMessage() {

    if (!editorMessage) {
        return;
    }


    editorMessage.textContent =
        "";

    editorMessage.className =
        "editor-message";

}


/*==================================================
 FEATURE: INITIAL UI
==================================================*/

updatePricePreview();


if (contentBlocks) {

    renderContentBlocks();

}
