/* =========================================================
   SMARTBAZAAR PRO
   FEATURE: PRODUCT DETAIL EDITOR
   ========================================================= */


/* =========================================================
   FIREBASE IMPORTS
   ========================================================= */

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


import {
    app
} from "./firebase-config.js";


/* =========================================================
   FIREBASE DATABASE
   ========================================================= */

const db =
    getDatabase(app);


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const productForm =
    document.getElementById(
        "productForm"
    );


const saveProductButton =
    document.getElementById(
        "saveProductButton"
    );


const cancelButton =
    document.getElementById(
        "cancelButton"
    );


const saveMessage =
    document.getElementById(
        "saveMessage"
    );


const mainImage =
    document.getElementById(
        "mainImage"
    );


const galleryImages =
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


/* =========================================================
   MAIN IMAGE PREVIEW
   ========================================================= */

mainImage.addEventListener(
    "change",
    () => {

        const file =
            mainImage.files[0];


        mainImagePreview.innerHTML =
            "";


        if (!file) {

            mainImagePreview.style.display =
                "none";

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


/* =========================================================
   GALLERY PREVIEW
   ========================================================= */

galleryImages.addEventListener(
    "change",
    () => {

        galleryPreview.innerHTML =
            "";


        const files =
            Array.from(
                galleryImages.files
            );


        files.forEach(
            file => {

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


/* =========================================================
   FORM SUBMIT
   ========================================================= */

productForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        hideMessage();


        const productName =
            document.getElementById(
                "productName"
            ).value.trim();


        const productCategory =
            document.getElementById(
                "productCategory"
            ).value.trim();


        const productBrand =
            document.getElementById(
                "productBrand"
            ).value.trim();


        const productPrice =
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            );


        const productOldPrice =
            Number(
                document.getElementById(
                    "productOldPrice"
                ).value
            ) || 0;


        const productStock =
            Number(
                document.getElementById(
                    "productStock"
                ).value
            );


        const shortDescription =
            document.getElementById(
                "shortDescription"
            ).value.trim();


        const fullDescription =
            document.getElementById(
                "fullDescription"
            ).value.trim();


        const sellerName =
            document.getElementById(
                "sellerName"
            ).value.trim();


        /* =================================================
           BASIC VALIDATION
           ================================================= */

        if (
            !productName
            ||
            !productCategory
            ||
            productPrice < 0
            ||
            productStock < 0
        ) {

            showMessage(
                "Please fill all required fields correctly.",
                "error"
            );

            return;

        }


        if (
            !mainImage.files[0]
        ) {

            showMessage(
                "Please select the main product image.",
                "error"
            );

            return;

        }


        /* =================================================
           DISABLE BUTTON
           ================================================= */

        saveProductButton.disabled =
            true;


        saveProductButton.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saving...
            `;


        try {

            /* =============================================
               UPLOAD MAIN IMAGE
               ============================================= */

            const mainImageUrl =
                await uploadToCloudinary(
                    mainImage.files[0]
                );


            /* =============================================
               UPLOAD GALLERY
               ============================================= */

            const galleryUrls =
                [];


            const galleryFiles =
                Array.from(
                    galleryImages.files
                );


            for (
                const file
                of galleryFiles
            ) {

                const url =
                    await uploadToCloudinary(
                        file
                    );


                galleryUrls.push(
                    url
                );

            }


            /* =============================================
               ALL IMAGES
               ============================================= */

            const images = [
                mainImageUrl,
                ...galleryUrls
            ];


            /* =============================================
               DISCOUNT
               ============================================= */

            let discount =
                0;


            if (
                productOldPrice > productPrice
                &&
                productOldPrice > 0
            ) {

                discount =
                    Math.round(
                        (
                            (
                                productOldPrice
                                -
                                productPrice
                            )
                            /
                            productOldPrice
                        )
                        *
                        100
                    );

            }


            /* =============================================
               PRODUCT OBJECT
               ============================================= */

            const product = {

                name:
                    productName,

                category:
                    productCategory,

                brand:
                    productBrand,

                price:
                    productPrice,

                oldPrice:
                    productOldPrice,

                discount:
                    discount,

                stock:
                    productStock,

                shortDescription:
                    shortDescription,

                description:
                    fullDescription,

                images:
                    images,

                image:
                    mainImageUrl,

                sellerName:
                    sellerName
                    ||
                    "SmartBazaar Seller",

                rating:
                    0,

                reviews:
                    0,

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now()

            };


            /* =============================================
               CREATE FIREBASE PRODUCT ID
               ============================================= */

            const productsRef =
                ref(
                    db,
                    "products"
                );


            const newProductRef =
                push(
                    productsRef
                );


            const productId =
                newProductRef.key;


            /* =============================================
               SAVE PRODUCT
               ============================================= */

            await set(
                newProductRef,
                product
            );


            /* =============================================
               SUCCESS
               ============================================= */

            showMessage(
                `Product saved successfully. Product ID: ${productId}`,
                "success"
            );


            productForm.reset();


            mainImagePreview.innerHTML =
                "";

            mainImagePreview.style.display =
                "none";


            galleryPreview.innerHTML =
                "";


        } catch (error) {

            console.error(
                "Product save error:",
                error
            );


            showMessage(
                "Product could not be saved. Please try again.",
                "error"
            );

        } finally {

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


/* =========================================================
   CLOUDINARY UPLOAD
   ========================================================= */

async function uploadToCloudinary(
    file
) {

    /*
        Your existing Cloudinary configuration.
        If cloudinary-config.js already exports these values,
        we can later import them directly.
    */


    const cloudName =
        "jlrjn7lu";


    const uploadPreset =
        "smartbazaar_uploads";


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        uploadPreset
    );


    const response =
        await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method:
                    "POST",

                body:
                    formData
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Cloudinary upload failed."
        );

    }


    const data =
        await response.json();


    if (
        !data.secure_url
    ) {

        throw new Error(
            "Cloudinary did not return an image URL."
        );

    }


    return data.secure_url;

}


/* =========================================================
   CLEAR FORM
   ========================================================= */

cancelButton.addEventListener(
    "click",
    () => {

        productForm.reset();


        mainImagePreview.innerHTML =
            "";

        mainImagePreview.style.display =
            "none";


        galleryPreview.innerHTML =
            "";


        hideMessage();

    }
);


/* =========================================================
   SUCCESS / ERROR MESSAGE
   ========================================================= */

function showMessage(
    message,
    type
) {

    saveMessage.textContent =
        message;


    saveMessage.className =
        `save-message ${type}`;


    saveMessage.scrollIntoView({
        behavior:
            "smooth",

        block:
            "center"
    });

}


function hideMessage() {

    saveMessage.textContent =
        "";

    saveMessage.className =
        "save-message";

}
