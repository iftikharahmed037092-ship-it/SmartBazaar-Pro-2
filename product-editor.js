/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PREMIUM PRODUCT DETAIL EDITOR
FEATURE: FIREBASE + CLOUDINARY + MEDIA + CONTENT BUILDER
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

const productVideoUrl =
    document.getElementById("productVideoUrl");

const mainImagePreview =
    document.getElementById("mainImagePreview");

const galleryPreview =
    document.getElementById("galleryPreview");

const videoPreview =
    document.getElementById("videoPreview");

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

const priceInput =
    document.getElementById("productPrice");

const oldPriceInput =
    document.getElementById("productOldPrice");

const contentBlocks =
    document.getElementById("contentBlocks");

const contentEmptyState =
    document.getElementById("contentEmptyState");

const contentBuilderToolbar =
    document.getElementById("contentBuilderToolbar");


/*==================================================
FEATURE: LOCAL MEDIA ARRAYS
==================================================*/

let selectedGalleryFiles = [];

let contentBlockData = [];

let mainImageObjectUrl = null;

let videoObjectUrl = null;


/*==================================================
FEATURE: ADMIN ACCESS CONTROL
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
FIX: IMAGE NOW APPEARS INSIDE PREVIEW BOX
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
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                showMessage(
                    "Please select a valid image file.",
                    "error"
                );

                mainImageInput.value = "";

                return;
            }


            mainImageObjectUrl =
                URL.createObjectURL(file);


            const image =
                document.createElement("img");


            image.src =
                mainImageObjectUrl;


            image.alt =
                "Main Product Image";


            image.onload =
                () => {

                    mainImagePreview.style.display =
                        "block";

                };


            image.onerror =
                () => {

                    clearMainImagePreview();

                    showMessage(
                        "Unable to preview this image.",
                        "error"
                    );

                };


            mainImagePreview.appendChild(
                image
            );


            mainImagePreview.style.display =
                "block";

        }
    );

}


/*==================================================
FEATURE: CLEAR MAIN IMAGE PREVIEW
==================================================*/

function clearMainImagePreview() {

    if (
        mainImageObjectUrl
    ) {

        URL.revokeObjectURL(
            mainImageObjectUrl
        );

        mainImageObjectUrl =
            null;
    }


    if (mainImagePreview) {

        mainImagePreview.innerHTML =
            "";

        mainImagePreview.style.display =
            "none";
    }

}


/*==================================================
FEATURE: GALLERY IMAGE SELECTION
==================================================*/

if (galleryImagesInput) {

    galleryImagesInput.addEventListener(
        "change",
        () => {

            const files =
                Array.from(
                    galleryImagesInput.files || []
                );


            const validFiles =
                files.filter(
                    (file) =>
                        file.type &&
                        file.type.startsWith("image/")
                );


            if (!validFiles.length) {

                showMessage(
                    "Please select valid image files.",
                    "error"
                );

                return;
            }


            /*
            Add new files instead of replacing
            existing selected gallery images.
            */

            selectedGalleryFiles.push(
                ...validFiles
            );


            renderGalleryPreview();


            /*
            Reset input so the same image can
            also be selected again if required.
            */

            galleryImagesInput.value =
                "";

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


    selectedGalleryFiles.forEach(
        (file, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "gallery-image";


            wrapper.dataset.index =
                index;


            const image =
                document.createElement("img");


            const objectUrl =
                URL.createObjectURL(file);


            image.src =
                objectUrl;


            image.alt =
                `Product Gallery Image ${index + 1}`;


            image.onload =
                () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                };


            const removeButton =
                document.createElement("button");


            removeButton.type =
                "button";


            removeButton.className =
                "gallery-remove-button";


            removeButton.innerHTML =
                `
                    <i class="fa-solid fa-xmark"></i>
                    Remove
                `;


            removeButton.addEventListener(
                "click",
                () => {

                    selectedGalleryFiles.splice(
                        index,
                        1
                    );


                    renderGalleryPreview();

                }
            );


            wrapper.appendChild(
                image
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


            clearVideoPreview();


            if (!file) {
                return;
            }


            if (
                !file.type ||
                !file.type.startsWith("video/")
            ) {

                showMessage(
                    "Please select a valid video file.",
                    "error"
                );

                productVideoInput.value =
                    "";

                return;
            }


            videoObjectUrl =
                URL.createObjectURL(file);


            const video =
                document.createElement("video");


            video.src =
                videoObjectUrl;


            video.controls =
                true;


            video.playsInline =
                true;


            video.preload =
                "metadata";


            video.className =
                "product-video-element";


            videoPreview.appendChild(
                video
            );


            videoPreview.style.display =
                "block";

        }
    );

}


/*==================================================
FEATURE: CLEAR VIDEO PREVIEW
==================================================*/

function clearVideoPreview() {

    if (
        videoObjectUrl
    ) {

        URL.revokeObjectURL(
            videoObjectUrl
        );

        videoObjectUrl =
            null;
    }


    if (videoPreview) {

        videoPreview.innerHTML =
            "";

        videoPreview.style.display =
            "none";
    }

}


/*==================================================
FEATURE: VIDEO URL PREVIEW
==================================================*/

if (productVideoUrl) {

    productVideoUrl.addEventListener(
        "input",
        () => {

            /*
            Do not create URL preview while
            a local video file is selected.
            */

            if (
                productVideoInput &&
                productVideoInput.files &&
                productVideoInput.files.length
            ) {

                return;
            }


            const url =
                productVideoUrl.value.trim();


            if (!url) {

                clearVideoUrlPreview();

                return;
            }


            if (
                !isValidUrl(url)
            ) {

                return;
            }


            renderVideoUrlPreview(
                url
            );

        }
    );

}


/*==================================================
FEATURE: VIDEO URL PREVIEW
==================================================*/

function renderVideoUrlPreview(url) {

    clearVideoUrlPreview();


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "video-url-preview";


    const video =
        document.createElement("video");


    video.src =
        url;


    video.controls =
        true;


    video.playsInline =
        true;


    video.preload =
        "metadata";


    video.className =
        "product-video-element";


    wrapper.appendChild(
        video
    );


    videoPreview.appendChild(
        wrapper
    );


    videoPreview.style.display =
        "block";

}


/*==================================================
FEATURE: CLEAR VIDEO URL PREVIEW
==================================================*/

function clearVideoUrlPreview() {

    if (
        !videoPreview
    ) {
        return;
    }


    if (
        productVideoInput &&
        productVideoInput.files &&
        productVideoInput.files.length
    ) {

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

    if (
        !previewPrice ||
        !priceInput ||
        !oldPriceInput
    ) {
        return;
    }


    const price =
        Number(
            priceInput.value
        ) || 0;


    const oldPrice =
        Number(
            oldPriceInput.value
        ) || 0;


    previewPrice.textContent =
        formatPrice(
            price
        );


    previewOldPrice.textContent =
        "";


    previewDiscount.textContent =
        "";


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        previewOldPrice.textContent =
            formatPrice(
                oldPrice
            );


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


        previewDiscount.textContent =
            `-${discount}%`;

    }

}


/*==================================================
FEATURE: SHORT DESCRIPTION COUNTER
==================================================*/

if (shortDescription) {

    shortDescription.addEventListener(
        "input",
        updateDescriptionCounter
    );


    updateDescriptionCounter();

}


function updateDescriptionCounter() {

    if (
        !shortDescription ||
        !shortDescriptionCount
    ) {
        return;
    }


    shortDescriptionCount.textContent =
        shortDescription.value.length;

}


/*==================================================
FEATURE: CONTENT BUILDER
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


            const blockType =
                button.dataset.blockType;


            if (!blockType) {
                return;
            }


            addContentBlock(
                blockType
            );

        }
    );

}


/*==================================================
FEATURE: ADD CONTENT BLOCK
==================================================*/

function addContentBlock(
    type
) {

    const blockId =
        `block_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;


    const block = {

        id:
            blockId,

        type:
            type,

        title:
            "",

        content:
            "",

        imageUrl:
            "",

        videoUrl:
            "",

        specifications:
            []

    };


    contentBlockData.push(
        block
    );


    renderContentBlocks();

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
        !contentBlockData.length
    ) {

        if (contentEmptyState) {

            contentBlocks.appendChild(
                contentEmptyState
            );

        }

        return;
    }


    contentBlockData.forEach(
        (block, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "content-block-editor";


            wrapper.dataset.blockId =
                block.id;


            const header =
                document.createElement("div");


            header.className =
                "content-block-header";


            const title =
                document.createElement("strong");


            title.textContent =
                `${capitalize(block.type)} Block ${index + 1}`;


            const removeButton =
                document.createElement("button");


            removeButton.type =
                "button";


            removeButton.className =
                "content-block-remove";


            removeButton.innerHTML =
                `
                    <i class="fa-solid fa-trash"></i>
                    Remove
                `;


            removeButton.addEventListener(
                "click",
                () => {

                    contentBlockData =
                        contentBlockData.filter(
                            (item) =>
                                item.id !== block.id
                        );


                    renderContentBlocks();

                }
            );


            header.appendChild(
                title
            );


            header.appendChild(
                removeButton
            );


            wrapper.appendChild(
                header
            );


            /*
            HEADING
            */

            if (
                block.type === "heading"
            ) {

                const input =
                    createTextInput(
                        "Heading",
                        block.title,
                        (value) => {

                            block.title =
                                value;

                        }
                    );


                wrapper.appendChild(
                    input
                );

            }


            /*
            TEXT
            */

            if (
                block.type === "text"
            ) {

                const textarea =
                    createTextarea(
                        "Text Content",
                        block.content,
                        (value) => {

                            block.content =
                                value;

                        }
                    );


                wrapper.appendChild(
                    textarea
                );

            }


            /*
            IMAGE
            */

            if (
                block.type === "image"
            ) {

                const input =
                    createTextInput(
                        "Image URL",
                        block.imageUrl,
                        (value) => {

                            block.imageUrl =
                                value;

                        }
                    );


                wrapper.appendChild(
                    input
                );


                const note =
                    document.createElement("small");


                note.textContent =
                    "You can use a Cloudinary image URL here.";


                wrapper.appendChild(
                    note
                );

            }


            /*
            VIDEO
            */

            if (
                block.type === "video"
            ) {

                const input =
                    createTextInput(
                        "Video URL",
                        block.videoUrl,
                        (value) => {

                            block.videoUrl =
                                value;

                        }
                    );


                wrapper.appendChild(
                    input
                );

            }


            /*
            SPECIFICATIONS
            */

            if (
                block.type === "specifications"
            ) {

                const specificationsBox =
                    document.createElement("div");


                specificationsBox.className =
                    "specifications-editor";


                renderSpecificationEditor(
                    specificationsBox,
                    block
                );


                wrapper.appendChild(
                    specificationsBox
                );

            }


            /*
            DIVIDER
            */

            if (
                block.type === "divider"
            ) {

                const divider =
                    document.createElement("div");


                divider.className =
                    "content-preview-divider";


                wrapper.appendChild(
                    divider
                );

            }


            contentBlocks.appendChild(
                wrapper
            );

        }
    );

}


/*==================================================
FEATURE: TEXT INPUT CREATOR
==================================================*/

function createTextInput(
    labelText,
    value,
    callback
) {

    const group =
        document.createElement("div");


    group.className =
        "content-field";


    const label =
        document.createElement("label");


    label.textContent =
        labelText;


    const input =
        document.createElement("input");


    input.type =
        "text";


    input.value =
        value || "";


    input.addEventListener(
        "input",
        () => {

            callback(
                input.value
            );

        }
    );


    group.appendChild(
        label
    );


    group.appendChild(
        input
    );


    return group;

}


/*==================================================
FEATURE: TEXTAREA CREATOR
==================================================*/

function createTextarea(
    labelText,
    value,
    callback
) {

    const group =
        document.createElement("div");


    group.className =
        "content-field";


    const label =
        document.createElement("label");


    label.textContent =
        labelText;


    const textarea =
        document.createElement("textarea");


    textarea.rows =
        6;


    textarea.value =
        value || "";


    textarea.addEventListener(
        "input",
        () => {

            callback(
                textarea.value
            );

        }
    );


    group.appendChild(
        label
    );


    group.appendChild(
        textarea
    );


    return group;

}


/*==================================================
FEATURE: SPECIFICATIONS EDITOR
==================================================*/

function renderSpecificationEditor(
    container,
    block
) {

    container.innerHTML =
        "";


    const rows =
        document.createElement("div");


    rows.className =
        "specification-rows";


    block.specifications.forEach(
        (item, index) => {

            const row =
                document.createElement("div");


            row.className =
                "specification-row";


            const nameInput =
                document.createElement("input");


            nameInput.type =
                "text";


            nameInput.placeholder =
                "Specification name";


            nameInput.value =
                item.name || "";


            const valueInput =
                document.createElement("input");


            valueInput.type =
                "text";


            valueInput.placeholder =
                "Value";


            valueInput.value =
                item.value || "";


            const remove =
                document.createElement("button");


            remove.type =
                "button";


            remove.className =
                "specification-remove";


            remove.innerHTML =
                `
                    <i class="fa-solid fa-xmark"></i>
                `;


            nameInput.addEventListener(
                "input",
                () => {

                    block.specifications[index].name =
                        nameInput.value;

                }
            );


            valueInput.addEventListener(
                "input",
                () => {

                    block.specifications[index].value =
                        valueInput.value;

                }
            );


            remove.addEventListener(
                "click",
                () => {

                    block.specifications.splice(
                        index,
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
                remove
            );


            rows.appendChild(
                row
            );

        }
    );


    const addButton =
        document.createElement("button");


    addButton.type =
        "button";


    addButton.className =
        "add-specification-button";


    addButton.innerHTML =
        `
            <i class="fa-solid fa-plus"></i>
            Add Specification
        `;


    addButton.addEventListener(
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


    container.appendChild(
        rows
    );


    container.appendChild(
        addButton
    );

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


            /*==================================================
            READ BASIC DATA
            ==================================================*/

            const name =
                getValue("productName");


            const category =
                getValue("productCategory");


            const brand =
                getValue("productBrand");


            const sku =
                getValue("productSKU");


            const condition =
                getValue("productCondition") ||
                "new";


            const price =
                Number(
                    getValue("productPrice")
                );


            const oldPrice =
                Number(
                    getValue("productOldPrice")
                ) || 0;


            const stock =
                Number(
                    getValue("productStock")
                );


            const lowStockLimit =
                Number(
                    getValue("lowStockLimit")
                ) || 5;


            const shortDescriptionValue =
                getValue("shortDescription");


            const description =
                getValue("fullDescription");


            const sellerName =
                getValue("sellerName");


            const published =
                getChecked(
                    "productPublished"
                );


            const featured =
                getChecked(
                    "productFeatured"
                );


            const freeShipping =
                getChecked(
                    "freeShipping"
                );


            const rating =
                Number(
                    getValue("productRating")
                ) || 0;


            const reviews =
                Number(
                    getValue("productReviews")
                ) || 0;


            const videoUrl =
                getValue("productVideoUrl");


            /*==================================================
            VALIDATION
            ==================================================*/

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


            /*==================================================
            DISABLE SAVE BUTTON
            ==================================================*/

            saveProductButton.disabled =
                true;


            setSaveButton(
                "Uploading..."
            );


            setEditorStatus(
                "Uploading",
                false
            );


            try {

                /*==================================================
                FEATURE: MAIN IMAGE CLOUDINARY UPLOAD
                ==================================================*/

                const mainFile =
                    mainImageInput.files[0];


                const mainUpload =
                    await uploadToCloudinary(
                        mainFile,
                        CLOUDINARY_FOLDERS.PRODUCTS
                    );


                const mainImageUrl =
                    mainUpload.url;


                /*==================================================
                FEATURE: GALLERY CLOUDINARY UPLOAD
                ==================================================*/

                const galleryUrls =
                    [];


                for (
                    let index = 0;
                    index < selectedGalleryFiles.length;
                    index++
                ) {

                    setSaveButton(
                        `Uploading Image ${index + 1}/${selectedGalleryFiles.length}...`
                    );


                    const upload =
                        await uploadToCloudinary(
                            selectedGalleryFiles[index],
                            CLOUDINARY_FOLDERS.PRODUCTS
                        );


                    galleryUrls.push(
                        upload.url
                    );

                }


                /*==================================================
                FEATURE: PRODUCT VIDEO UPLOAD
                ==================================================*/

                let uploadedVideoUrl =
                    videoUrl;


                if (
                    productVideoInput &&
                    productVideoInput.files &&
                    productVideoInput.files[0]
                ) {

                    setSaveButton(
                        "Uploading Product Video..."
                    );


                    const videoUpload =
                        await uploadToCloudinary(
                            productVideoInput.files[0],
                            CLOUDINARY_FOLDERS.PRODUCTS
                        );


                    uploadedVideoUrl =
                        videoUpload.url;

                }


                /*==================================================
                FEATURE: COMPLETE IMAGE ARRAY
                ==================================================*/

                const images = [

                    mainImageUrl,

                    ...galleryUrls

                ];


                /*==================================================
                FEATURE: DISCOUNT
                ==================================================*/

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


                /*==================================================
                FEATURE: AVAILABILITY
                ==================================================*/

                const inStock =
                    stock > 0;


                const lowStock =
                    stock > 0 &&
                    stock <= lowStockLimit;


                const availability =
                    stock <= 0
                        ? "out_of_stock"
                        : lowStock
                            ? "low_stock"
                            : "in_stock";


                /*==================================================
                FEATURE: PRODUCT ID
                ==================================================*/

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


                /*==================================================
                FEATURE: PRODUCT DATA
                ==================================================*/

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
                        inStock,

                    availability:
                        availability,

                    shortDescription:
                        shortDescriptionValue,

                    description:
                        description,

                    image:
                        mainImageUrl,

                    images:
                        images,

                    video:
                        uploadedVideoUrl || "",

                    videoUrl:
                        uploadedVideoUrl || "",

                    contentBlocks:
                        contentBlockData,

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


                /*==================================================
                FEATURE: SAVE TO FIREBASE
                ==================================================*/

                setSaveButton(
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


                /*==================================================
                FEATURE: SUCCESS
                ==================================================*/

                showMessage(
                    `Product saved successfully. Product ID: ${productId}`,
                    "success"
                );


                setEditorStatus(
                    "Saved",
                    true
                );


                /*==================================================
                FEATURE: RESET
                ==================================================*/

                resetEditor();


            }

            catch (error) {

                console.error(
                    "Product Editor Error:",
                    error
                );


                showMessage(
                    error.message ||
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


                setSaveButton(
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


    selectedGalleryFiles =
        [];


    contentBlockData =
        [];


    clearMainImagePreview();


    clearVideoPreview();


    if (galleryPreview) {

        galleryPreview.innerHTML =
            "";

    }


    if (galleryImagesInput) {

        galleryImagesInput.value =
            "";

    }


    if (mainImageInput) {

        mainImageInput.value =
            "";

    }


    if (productVideoInput) {

        productVideoInput.value =
            "";

    }


    if (productVideoUrl) {

        productVideoUrl.value =
            "";

    }


    renderContentBlocks();


    updatePricePreview();


    updateDescriptionCounter();

}


/*==================================================
FEATURE: GET VALUE
==================================================*/

function getValue(
    id
) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";

}


/*==================================================
FEATURE: GET CHECKED
==================================================*/

function getChecked(
    id
) {

    const element =
        document.getElementById(id);


    return element
        ? element.checked
        : false;

}


/*==================================================
FEATURE: VALID URL
==================================================*/

function isValidUrl(
    value
) {

    try {

        new URL(value);

        return true;

    }

    catch {

        return false;

    }

}


/*==================================================
FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(
    value
) {

    return (
        "Rs. " +
        Number(value)
            .toLocaleString("en-PK")
    );

}


/*==================================================
FEATURE: SAVE BUTTON
==================================================*/

function setSaveButton(
    text
) {

    if (!saveProductButton) {
        return;
    }


    if (
        text === "Save Product"
    ) {

        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-cloud-arrow-up"></i>
                Save Product
            `;

        return;

    }


    saveProductButton.innerHTML =
        `
            <i class="fa-solid fa-spinner fa-spin"></i>
            ${text}
        `;

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
FEATURE: CAPITALIZE
==================================================*/

function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}
