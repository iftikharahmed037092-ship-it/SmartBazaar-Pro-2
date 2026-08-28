/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PRODUCT DETAIL EDITOR
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
    document.getElementById(
        "productForm"
    );


const saveProductButton =
    document.getElementById(
        "saveProductButton"
    );


const clearButton =
    document.getElementById(
        "clearButton"
    );


const mainImageInput =
    document.getElementById(
        "mainImage"
    );


const galleryImagesInput =
    document.getElementById(
        "galleryImages"
    );


const mainImagePreview =
    document.getElementById(
        "mainImagePreview"
    );


const galleryPreview =
    document.getElementById(
        "galleryPreview"
    );


const editorMessage =
    document.getElementById(
        "editorMessage"
    );


const editorStatusDot =
    document.getElementById(
        "editorStatusDot"
    );


const editorStatusText =
    document.getElementById(
        "editorStatusText"
    );


const previewPrice =
    document.getElementById(
        "previewPrice"
    );


const previewOldPrice =
    document.getElementById(
        "previewOldPrice"
    );


const previewDiscount =
    document.getElementById(
        "previewDiscount"
    );


const shortDescription =
    document.getElementById(
        "shortDescription"
    );


const shortDescriptionCount =
    document.getElementById(
        "shortDescriptionCount"
    );


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
==================================================*/

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
            !file.type.startsWith(
                "image/"
            )
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
            document.createElement(
                "img"
            );


        image.src =
            URL.createObjectURL(
                file
            );


        image.alt =
            "Main Product Image";


        mainImagePreview.appendChild(
            image
        );


        mainImagePreview.style.display =
            "block";

    }
);


/*==================================================
FEATURE: GALLERY PREVIEW
==================================================*/

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
            (file) => {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    return;

                }


                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "gallery-image";


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    URL.createObjectURL(
                        file
                    );


                image.alt =
                    "Product Gallery Image";


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


/*==================================================
FEATURE: PRICE PREVIEW
==================================================*/

const priceInput =
    document.getElementById(
        "productPrice"
    );


const oldPriceInput =
    document.getElementById(
        "productOldPrice"
    );


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
        oldPrice > price
        &&
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
                *
                100
            );


        previewDiscount.textContent =
            `-${discount}%`;

    }

}


/*==================================================
FEATURE: SHORT DESCRIPTION COUNTER
==================================================*/

shortDescription.addEventListener(
    "input",
    () => {

        shortDescriptionCount.textContent =
            shortDescription.value.length;

    }
);


/*==================================================
FEATURE: SAVE PRODUCT
==================================================*/

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


        if (
            currentUser.email.toLowerCase()
            !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            showMessage(
                "You are not authorized to add products.",
                "error"
            );

            return;

        }


        /*==================================================
        READ FORM DATA
        ==================================================*/

        const name =
            document.getElementById(
                "productName"
            ).value.trim();


        const category =
            document.getElementById(
                "productCategory"
            ).value.trim();


        const brand =
            document.getElementById(
                "productBrand"
            ).value.trim();


        const price =
            Number(
                priceInput.value
            );


        const oldPrice =
            Number(
                oldPriceInput.value
            ) || 0;


        const stock =
            Number(
                document.getElementById(
                    "productStock"
                ).value
            );


        const shortDescriptionValue =
            shortDescription.value.trim();


        const description =
            document.getElementById(
                "fullDescription"
            ).value.trim();


        const sellerName =
            document.getElementById(
                "sellerName"
            ).value.trim();


        const published =
            document.getElementById(
                "productPublished"
            ).checked;


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
            !Number.isFinite(price)
            ||
            price < 0
        ) {

            showMessage(
                "Please enter a valid selling price.",
                "error"
            );

            return;

        }


        if (
            !Number.isInteger(stock)
            ||
            stock < 0
        ) {

            showMessage(
                "Please enter a valid stock quantity.",
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
        DISABLE SAVE BUTTON
        ==================================================*/

        saveProductButton.disabled =
            true;


        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Uploading...
            `;


        setEditorStatus(
            "Uploading",
            false
        );


        try {


            /*==================================================
            FEATURE: MAIN IMAGE UPLOAD
            ==================================================*/

            const mainUpload =
                await uploadToCloudinary(
                    mainImageInput.files[0],
                    CLOUDINARY_FOLDERS.PRODUCTS
                );


            const mainImageUrl =
                mainUpload.url;


            /*==================================================
            FEATURE: GALLERY IMAGE UPLOAD
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
                        Uploading Image ${index + 1}/${galleryFiles.length}...
                    `;


                const galleryUpload =
                    await uploadToCloudinary(
                        galleryFiles[index],
                        CLOUDINARY_FOLDERS.PRODUCTS
                    );


                galleryUrls.push(
                    galleryUpload.url
                );

            }


            /*==================================================
            FEATURE: COMPLETE IMAGE ARRAY
            ==================================================*/

            const images = [
                mainImageUrl,
                ...galleryUrls
            ];


            /*==================================================
            FEATURE: DISCOUNT CALCULATION
            ==================================================*/

            let discount =
                0;


            if (
                oldPrice > price
                &&
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
                        *
                        100
                    );

            }


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

                price:
                    price,

                oldPrice:
                    oldPrice,

                discount:
                    discount,

                stock:
                    stock,

                shortDescription:
                    shortDescriptionValue,

                description:
                    description,

                image:
                    mainImageUrl,

                images:
                    images,

                sellerName:
                    sellerName
                    ||
                    "SmartBazaar Seller",

                rating:
                    0,

                reviews:
                    0,

                published:
                    published,

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
            FEATURE: RESET FORM
            ==================================================*/

            productForm.reset();


            mainImagePreview.innerHTML =
                "";

            mainImagePreview.style.display =
                "none";


            galleryPreview.innerHTML =
                "";


            shortDescriptionCount.textContent =
                "0";


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


/*==================================================
FEATURE: CLEAR FORM
==================================================*/

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


        mainImagePreview.innerHTML =
            "";

        mainImagePreview.style.display =
            "none";


        galleryPreview.innerHTML =
            "";


        shortDescriptionCount.textContent =
            "0";


        updatePricePreview();


        hideMessage();


        setEditorStatus(
            "Ready",
            true
        );

    }
);


/*==================================================
FEATURE: PRICE FORMAT
==================================================*/

function formatPrice(
    value
) {

    return (
        "Rs. "
        +
        Number(value)
            .toLocaleString(
                "en-PK"
            )
    );

}


/*==================================================
FEATURE: EDITOR STATUS
==================================================*/

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


/*==================================================
FEATURE: SHOW MESSAGE
==================================================*/

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


/*==================================================
FEATURE: HIDE MESSAGE
==================================================*/

function hideMessage() {

    editorMessage.textContent =
        "";

    editorMessage.className =
        "editor-message";

}
