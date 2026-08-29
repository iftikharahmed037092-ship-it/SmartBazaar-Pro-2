/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PREMIUM PRODUCT DETAIL EDITOR
FEATURES:

- Firebase Authentication
- Firebase Realtime Database
- Cloudinary Images
- Cloudinary Video
- Multiple Gallery Images
- Content Block Builder
- Rating & Reviews
- SKU / Condition
- Low Stock Alert
- Featured Product
- Free Shipping
- Publish Settings
  ==================================================*/

/==================================================
FEATURE: FIREBASE IMPORT
==================================================/

import {
database,
auth
} from "./firebase-config.js";

/==================================================
FEATURE: FIREBASE DATABASE METHODS
==================================================/

import {
ref,
push,
set
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

/==================================================
FEATURE: FIREBASE AUTH
==================================================/

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

/==================================================
FEATURE: CLOUDINARY
==================================================/

import {
uploadToCloudinary,
CLOUDINARY_FOLDERS
} from "./cloudinary-config.js";

/==================================================
FEATURE: ADMIN EMAIL
==================================================/

const ADMIN_EMAIL =
"iftikharahmed037092@gmail.com";

/==================================================
FEATURE: DOM ELEMENTS
==================================================/

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

const mainImagePreview =
document.getElementById("mainImagePreview");

const galleryPreview =
document.getElementById("galleryPreview");

const videoPreview =
document.getElementById("videoPreview");

const productVideoUrl =
document.getElementById("productVideoUrl");

const contentBlocks =
document.getElementById("contentBlocks");

const contentEmptyState =
document.getElementById("contentEmptyState");

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

/==================================================
FEATURE: LOCAL STATE
==================================================/

let contentBlockData = [];

let selectedVideoFile = null;

/==================================================
FEATURE: ADMIN ACCESS CONTROL
==================================================/

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

/==================================================
FEATURE: MAIN IMAGE PREVIEW
==================================================/

mainImageInput.addEventListener(
"change",
() => {

    const file =
        mainImageInput.files[0];


    mainImagePreview.innerHTML =
        "";


    if (!file) {

        mainImagePreview.style.display =
            "none";

        return;
    }


    if (
        !file.type.startsWith("image/")
    ) {

        showMessage(
            "Please select a valid image file.",
            "error"
        );

        mainImageInput.value =
            "";

        return;
    }


    const image =
        document.createElement("img");


    image.src =
        URL.createObjectURL(file);


    image.alt =
        "Main Product Image";


    mainImagePreview.appendChild(
        image
    );


    mainImagePreview.style.display =
        "block";

}

);

/==================================================
FEATURE: MULTIPLE GALLERY PREVIEW
==================================================/

galleryImagesInput.addEventListener(
"change",
() => {

    galleryPreview.innerHTML =
        "";


    const files =
        Array.from(
            galleryImagesInput.files
        );


    files.forEach(
        (file, index) => {

            if (
                !file.type.startsWith("image/")
            ) {
                return;
            }


            const wrapper =
                document.createElement("div");


            wrapper.className =
                "gallery-image";


            const image =
                document.createElement("img");


            image.src =
                URL.createObjectURL(file);


            image.alt =
                `Gallery Image ${index + 1}`;


            wrapper.appendChild(
                image
            );


            galleryPreview.appendChild(
                wrapper
            );

        }
    );

}

);

/==================================================
FEATURE: VIDEO PREVIEW
==================================================/

productVideoInput.addEventListener(
"change",
() => {

    const file =
        productVideoInput.files[0];


    selectedVideoFile =
        file || null;


    videoPreview.innerHTML =
        "";


    if (!file) {
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

        selectedVideoFile =
            null;

        return;
    }


    const video =
        document.createElement("video");


    video.src =
        URL.createObjectURL(file);


    video.controls =
        true;


    video.preload =
        "metadata";


    video.style.width =
        "100%";


    video.style.maxWidth =
        "700px";


    video.style.borderRadius =
        "14px";


    videoPreview.appendChild(
        video
    );

}

);

/==================================================
FEATURE: VIDEO URL PREVIEW
==================================================/

productVideoUrl.addEventListener(
"input",
() => {

    if (
        selectedVideoFile
    ) {
        return;
    }


    const url =
        productVideoUrl.value.trim();


    if (!url) {

        videoPreview.innerHTML =
            "";

        return;
    }


    try {

        new URL(url);

    } catch {

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


    video.style.width =
        "100%";


    video.style.maxWidth =
        "700px";


    video.style.borderRadius =
        "14px";


    videoPreview.appendChild(
        video
    );

}

);

/==================================================
FEATURE: PRICE PREVIEW
==================================================/

priceInput.addEventListener(
"input",
updatePricePreview
);

oldPriceInput.addEventListener(
"input",
updatePricePreview
);

function updatePricePreview() {

const price =
    Number(priceInput.value) || 0;


const oldPrice =
    Number(oldPriceInput.value) || 0;


previewPrice.textContent =
    formatPrice(price);


previewOldPrice.textContent =
    "";


previewDiscount.textContent =
    "";


if (
    oldPrice > price &&
    oldPrice > 0
) {

    previewOldPrice.textContent =
        formatPrice(oldPrice);


    const discount =
        Math.round(
            (
                (oldPrice - price)
                /
                oldPrice
            ) * 100
        );


    previewDiscount.textContent =
        `-${discount}%`;

}

}

/==================================================
FEATURE: SHORT DESCRIPTION COUNTER
==================================================/

shortDescription.addEventListener(
"input",
() => {

    shortDescriptionCount.textContent =
        shortDescription.value.length;

}

);

/==================================================
FEATURE: CONTENT BUILDER
==================================================/

document
.querySelectorAll(".content-add-button")
.forEach(
(button) => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.blockType;

                addContentBlock(type);

            }
        );

    }
);

function addContentBlock(type) {

const blockId =
    "block_" +
    Date.now() +
    "_" +
    Math.random()
        .toString(36)
        .substring(2, 8);


const block = {

    id:
        blockId,

    type:
        type,

    title:
        "",

    text:
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

/==================================================
FEATURE: RENDER CONTENT BLOCKS
==================================================/

function renderContentBlocks() {

contentBlocks.innerHTML =
    "";


if (
    contentBlockData.length === 0
) {

    contentBlocks.appendChild(
        contentEmptyState
    );

    return;
}


contentBlockData.forEach(
    (block, index) => {

        const wrapper =
            document.createElement("div");


        wrapper.className =
            "content-builder-block";


        wrapper.dataset.blockId =
            block.id;


        const header =
            document.createElement("div");


        header.className =
            "content-block-header";


        const title =
            document.createElement("strong");


        title.textContent =
            `${index + 1}. ${getBlockTitle(block.type)}`;


        const removeButton =
            document.createElement("button");


        removeButton.type =
            "button";


        removeButton.className =
            "content-remove-button";


        removeButton.innerHTML =
            `<i class="fa-solid fa-trash"></i>`;


        removeButton.addEventListener(
            "click",
            () => {

                contentBlockData =
                    contentBlockData.filter(
                        item =>
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


        const editor =
            createBlockEditor(
                block
            );


        wrapper.appendChild(
            editor
        );


        contentBlocks.appendChild(
            wrapper
        );

    }
);

}

/==================================================
FEATURE: BLOCK TITLES
==================================================/

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
    titles[type]
    ||
    "Content Block"
);

}

/==================================================
FEATURE: BLOCK EDITOR
==================================================/

function createBlockEditor(block) {

const editor =
    document.createElement("div");


editor.className =
    "content-block-editor";


if (
    block.type === "heading"
) {

    editor.innerHTML =
        `
            <label>Heading Title</label>

            <input
                type="text"
                value="${escapeAttribute(block.title)}"
                placeholder="Enter section heading"
            >
        `;


    const input =
        editor.querySelector("input");


    input.addEventListener(
        "input",
        () => {

            block.title =
                input.value;

        }
    );

}


if (
    block.type === "text"
) {

    editor.innerHTML =
        `
            <label>Text Content</label>

            <textarea
                rows="6"
                placeholder="Write detailed product information..."
            >${escapeHtml(block.text)}</textarea>
        `;


    const textarea =
        editor.querySelector("textarea");


    textarea.addEventListener(
        "input",
        () => {

            block.text =
                textarea.value;

        }
    );

}


if (
    block.type === "image"
) {

    editor.innerHTML =
        `
            <label>Image URL</label>

            <input
                type="url"
                value="${escapeAttribute(block.imageUrl)}"
                placeholder="https://..."
            >
        `;


    const input =
        editor.querySelector("input");


    input.addEventListener(
        "input",
        () => {

            block.imageUrl =
                input.value;

        }
    );

}


if (
    block.type === "video"
) {

    editor.innerHTML =
        `
            <label>Video URL</label>

            <input
                type="url"
                value="${escapeAttribute(block.videoUrl)}"
                placeholder="https://..."
            >
        `;


    const input =
        editor.querySelector("input");


    input.addEventListener(
        "input",
        () => {

            block.videoUrl =
                input.value;

        }
    );

}


if (
    block.type === "specifications"
) {

    editor.innerHTML =
        `
            <div class="specification-editor">

                <div class="specification-list"></div>

                <button
                    type="button"
                    class="add-specification-button"
                >
                    <i class="fa-solid fa-plus"></i>
                    Add Specification
                </button>

            </div>
        `;


    const list =
        editor.querySelector(
            ".specification-list"
        );


    const addButton =
        editor.querySelector(
            ".add-specification-button"
        );


    function renderSpecifications() {

        list.innerHTML =
            "";


        block.specifications
            .forEach(
                (spec, specIndex) => {

                    const row =
                        document.createElement("div");


                    row.className =
                        "specification-row";


                    row.innerHTML =
                        `
                            <input
                                type="text"
                                placeholder="Specification"
                                value="${escapeAttribute(spec.key)}"
                            >

                            <input
                                type="text"
                                placeholder="Value"
                                value="${escapeAttribute(spec.value)}"
                            >

                            <button
                                type="button"
                                class="remove-specification-button"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        `;


                    const inputs =
                        row.querySelectorAll(
                            "input"
                        );


                    inputs[0].addEventListener(
                        "input",
                        () => {

                            spec.key =
                                inputs[0].value;

                        }
                    );


                    inputs[1].addEventListener(
                        "input",
                        () => {

                            spec.value =
                                inputs[1].value;

                        }
                    );


                    row
                        .querySelector(
                            ".remove-specification-button"
                        )
                        .addEventListener(
                            "click",
                            () => {

                                block.specifications
                                    .splice(
                                        specIndex,
                                        1
                                    );

                                renderSpecifications();

                            }
                        );


                    list.appendChild(
                        row
                    );

                }
            );

    }


    addButton.addEventListener(
        "click",
        () => {

            block.specifications.push({

                key:
                    "",

                value:
                    ""

            });


            renderSpecifications();

        }
    );


    renderSpecifications();

}


if (
    block.type === "divider"
) {

    editor.innerHTML =
        `
            <p class="divider-block-info">
                A professional divider will appear
                between product detail sections.
            </p>
        `;

}


return editor;

}

/==================================================
FEATURE: SAVE PRODUCT
==================================================/

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
    FEATURE: FORM DATA
    ==================================================*/

    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const category =
        document
            .getElementById("productCategory")
            .value
            .trim();


    const brand =
        document
            .getElementById("productBrand")
            .value
            .trim();


    const sku =
        document
            .getElementById("productSKU")
            .value
            .trim();


    const condition =
        document
            .getElementById("productCondition")
            .value;


    const price =
        Number(priceInput.value);


    const oldPrice =
        Number(oldPriceInput.value) || 0;


    const stock =
        Number(
            document
                .getElementById("productStock")
                .value
        );


    const lowStockLimit =
        Number(
            document
                .getElementById("lowStockLimit")
                .value
        ) || 0;


    const shortDescriptionValue =
        shortDescription.value.trim();


    const description =
        document
            .getElementById("fullDescription")
            .value
            .trim();


    const sellerName =
        document
            .getElementById("sellerName")
            .value
            .trim();


    const rating =
        Number(
            document
                .getElementById("productRating")
                .value
        ) || 0;


    const reviews =
        Number(
            document
                .getElementById("productReviews")
                .value
        ) || 0;


    const published =
        document
            .getElementById("productPublished")
            .checked;


    const featured =
        document
            .getElementById("productFeatured")
            .checked;


    const freeShipping =
        document
            .getElementById("freeShipping")
            .checked;


    /*==================================================
    FEATURE: VALIDATION
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
        reviews < 0
    ) {

        showMessage(
            "Review count cannot be negative.",
            "error"
        );

        return;
    }


    if (
        !mainImageInput.files[0]
    ) {

        showMessage(
            "Please select the main product image.",
            "error"
        );

        return;
    }


    /*==================================================
    FEATURE: DISABLE SAVE
    ==================================================*/

    saveProductButton.disabled =
        true;


    try {

        /*==================================================
        FEATURE: MAIN IMAGE UPLOAD
        ==================================================*/

        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Uploading Main Image...
            `;


        setEditorStatus(
            "Uploading",
            false
        );


        const mainUpload =
            await uploadToCloudinary(
                mainImageInput.files[0],
                CLOUDINARY_FOLDERS.PRODUCTS
            );


        const mainImageUrl =
            mainUpload.url;


        /*==================================================
        FEATURE: GALLERY UPLOAD
        ==================================================*/

        const galleryUrls =
            [];


        const galleryFiles =
            Array.from(
                galleryImagesInput.files
            );


        for (
            let index = 0;
            index < galleryFiles.length;
            index++
        ) {

            saveProductButton.innerHTML =
                `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Uploading Gallery ${index + 1}/${galleryFiles.length}...
                `;


            const upload =
                await uploadToCloudinary(
                    galleryFiles[index],
                    CLOUDINARY_FOLDERS.PRODUCTS
                );


            galleryUrls.push(
                upload.url
            );

        }


        /*==================================================
        FEATURE: VIDEO UPLOAD
        ==================================================*/

        let uploadedVideoUrl =
            productVideoUrl.value.trim();


        if (
            selectedVideoFile
        ) {

            saveProductButton.innerHTML =
                `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Uploading Product Video...
                `;


            const videoUpload =
                await uploadToCloudinary(
                    selectedVideoFile,
                    CLOUDINARY_FOLDERS.PRODUCTS,
                    "video"
                );


            uploadedVideoUrl =
                videoUpload.url;

        }


        /*==================================================
        FEATURE: IMAGES ARRAY
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
                    ) * 100
                );

        }


        /*==================================================
        FEATURE: STOCK STATUS
        ==================================================*/

        let stockStatus =
            "in-stock";


        if (
            stock <= 0
        ) {

            stockStatus =
                "out-of-stock";

        } else if (
            stock <= lowStockLimit
        ) {

            stockStatus =
                "low-stock";

        }


        /*==================================================
        FEATURE: FIREBASE PRODUCT REFERENCE
        ==================================================*/

        const productsRef =
            ref(
                database,
                "products"
            );


        const newProductRef =
            push(productsRef);


        const productId =
            newProductRef.key;


        /*==================================================
        FEATURE: COMPLETE PRODUCT DATA
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

            stockStatus:
                stockStatus,

            shortDescription:
                shortDescriptionValue,

            description:
                description,

            image:
                mainImageUrl,

            images:
                images,

            video:
                uploadedVideoUrl,

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

        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saving Product...
            `;


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

        productForm.reset();


        contentBlockData =
            [];


        selectedVideoFile =
            null;


        mainImagePreview.innerHTML =
            "";


        mainImagePreview.style.display =
            "none";


        galleryPreview.innerHTML =
            "";


        videoPreview.innerHTML =
            "";


        shortDescriptionCount.textContent =
            "0";


        renderContentBlocks();


        updatePricePreview();

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


        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-cloud-arrow-up"></i>
                Save Product
            `;

    }

}

);

/==================================================
FEATURE: CLEAR FORM
==================================================/

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


    productForm.reset();


    contentBlockData =
        [];


    selectedVideoFile =
        null;


    mainImagePreview.innerHTML =
        "";


    mainImagePreview.style.display =
        "none";


    galleryPreview.innerHTML =
        "";


    videoPreview.innerHTML =
        "";


    shortDescriptionCount.textContent =
        "0";


    renderContentBlocks();


    updatePricePreview();


    hideMessage();


    setEditorStatus(
        "Ready",
        true
    );

}

);

/==================================================
FEATURE: PRICE FORMAT
==================================================/

function formatPrice(value) {

return (
    "Rs. " +
    Number(value)
        .toLocaleString("en-PK")
);

}

/==================================================
FEATURE: STATUS
==================================================/

function setEditorStatus(
text,
online
) {

editorStatusText.textContent =
    text;


editorStatusDot.style.background =
    online
        ? "#2e7d32"
        : "#f39c12";

}

/==================================================
FEATURE: SHOW MESSAGE
==================================================/

function showMessage(
message,
type
) {

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

/==================================================
FEATURE: HIDE MESSAGE
==================================================/

function hideMessage() {

editorMessage.textContent =
    "";


editorMessage.className =
    "editor-message";

}

/==================================================
FEATURE: HTML ESCAPE
==================================================/

function escapeHtml(value) {

return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

function escapeAttribute(value) {

return escapeHtml(value);

}

/==================================================
FEATURE: INITIAL UI
==================================================/

updatePricePreview();

renderContentBlocks();
