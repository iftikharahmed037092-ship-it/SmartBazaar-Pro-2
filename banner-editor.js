/*==================================================
SMARTBAZAAR PRO 2
FEATURE: BANNER EDITOR JAVASCRIPT
FIREBASE + CENTRAL CLOUDINARY CONFIG
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORTS
==================================================*/

import {
    database,
    auth
} from "./firebase-config.js";


import {
    ref,
    push,
    set,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/*==================================================
FEATURE: CENTRAL CLOUDINARY IMPORT
==================================================*/

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
FEATURE: FIREBASE DATABASE LOCATION
==================================================*/

const bannersRef =
    ref(
        database,
        "smartbazaar_pro_2/banners"
    );


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const bannerForm =
    document.getElementById("bannerForm");

const bannerImage =
    document.getElementById("bannerImage");

const imagePreview =
    document.getElementById("imagePreview");

const uploadPlaceholder =
    document.getElementById("uploadPlaceholder");

const uploadProgress =
    document.getElementById("uploadProgress");

const progressBar =
    document.getElementById("progressBar");

const uploadStatus =
    document.getElementById("uploadStatus");

const bannersGrid =
    document.getElementById("bannersGrid");

const bannerCount =
    document.getElementById("bannerCount");

const adminStatus =
    document.getElementById("adminStatus");

const adminEmail =
    document.getElementById("adminEmail");

const statusBadge =
    document.getElementById("statusBadge");

const logoutButton =
    document.getElementById("logoutButton");

const resetFormButton =
    document.getElementById("resetFormButton");

const formTitle =
    document.getElementById("formTitle");

const saveBannerButton =
    document.getElementById("saveBannerButton");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/*==================================================
FEATURE: FORM FIELDS
==================================================*/

const bannerTitle =
    document.getElementById("bannerTitle");

const bannerSubtitle =
    document.getElementById("bannerSubtitle");

const bannerDescription =
    document.getElementById("bannerDescription");

const buttonText =
    document.getElementById("buttonText");

const buttonLink =
    document.getElementById("buttonLink");

const bannerOrder =
    document.getElementById("bannerOrder");

const bannerActive =
    document.getElementById("bannerActive");


/*==================================================
FEATURE: STATE
==================================================*/

let currentUser = null;

let editingBannerId = null;

let currentImageUrl = "";

let allBanners = [];


/*==================================================
FEATURE: ADMIN AUTHENTICATION
==================================================*/

onAuthStateChanged(
    auth,
    async (user) => {

        currentUser = user;


        if (!user) {

            showNotAuthorized(
                "Please login first."
            );

            return;

        }


        adminEmail.textContent =
            user.email || "Unknown";


        const userEmail =
            (user.email || "")
                .toLowerCase();


        if (
            userEmail ===
            ADMIN_EMAIL.toLowerCase()
        ) {

            adminStatus.textContent =
                "Admin Access Granted";


            statusBadge.textContent =
                "ADMIN";


            statusBadge.style.background =
                "#e7f7ed";


            statusBadge.style.color =
                "#198754";


            if (bannerForm) {

                bannerForm.style.display =
                    "";

            }


            const bannersSection =
                document.querySelector(
                    ".banners-section"
                );


            if (bannersSection) {

                bannersSection.style.display =
                    "";

            }


            await loadBanners();

        }

        else {

            showNotAuthorized(
                "This account is not authorized as Admin."
            );

        }

    }
);


/*==================================================
FEATURE: UNAUTHORIZED STATE
==================================================*/

function showNotAuthorized(message) {

    if (adminStatus) {

        adminStatus.textContent =
            "Access Denied";

    }


    if (adminEmail) {

        adminEmail.textContent =
            message;

    }


    if (statusBadge) {

        statusBadge.textContent =
            "DENIED";

        statusBadge.style.background =
            "#fff0f0";

        statusBadge.style.color =
            "#d43c3c";

    }


    if (bannerForm) {

        bannerForm.style.display =
            "none";

    }


    const bannersSection =
        document.querySelector(
            ".banners-section"
        );


    if (bannersSection) {

        bannersSection.style.display =
            "none";

    }

}


/*==================================================
FEATURE: IMAGE PREVIEW
==================================================*/

bannerImage.addEventListener(
    "change",
    () => {

        const file =
            bannerImage.files[0];


        if (!file) {

            return;

        }


        if (
            !file.type.startsWith("image/")
        ) {

            showToast(
                "Please select an image file."
            );

            bannerImage.value =
                "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            (event) => {

                imagePreview.src =
                    event.target.result;

                imagePreview.style.display =
                    "block";

                uploadPlaceholder.style.display =
                    "none";

            };


        reader.onerror =
            () => {

                showToast(
                    "Unable to preview image."
                );

            };


        reader.readAsDataURL(file);

    }
);


/*==================================================
FEATURE: CLOUDINARY BANNER IMAGE UPLOAD
==================================================*/

async function uploadBannerImage(file) {

    if (!file) {

        return currentImageUrl || "";

    }


    uploadProgress.style.display =
        "block";


    progressBar.style.width =
        "10%";


    uploadStatus.textContent =
        "Preparing image upload...";


    try {

        /*------------------------------------------
        CENTRAL CLOUDINARY UPLOAD
        ------------------------------------------*/

        progressBar.style.width =
            "25%";


        uploadStatus.textContent =
            "Uploading image to Cloudinary...";


        const result =
            await uploadToCloudinary(
                file,
                CLOUDINARY_FOLDERS.BANNERS
            );


        /*------------------------------------------
        VALIDATE RESPONSE
        ------------------------------------------*/

        if (
            !result ||
            !result.url
        ) {

            throw new Error(
                "Cloudinary did not return an image URL."
            );

        }


        /*------------------------------------------
        SUCCESS
        ------------------------------------------*/

        progressBar.style.width =
            "100%";


        uploadStatus.textContent =
            "Image uploaded successfully.";


        return result.url;

    }

    catch (error) {

        console.error(
            "FEATURE: CLOUDINARY BANNER UPLOAD ERROR:",
            error
        );


        progressBar.style.width =
            "0%";


        uploadStatus.textContent =
            error.message ||
            "Cloudinary upload failed.";


        throw error;

    }

}


/*==================================================
FEATURE: SAVE BANNER
==================================================*/

bannerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        /*------------------------------------------
        AUTH CHECK
        ------------------------------------------*/

        if (!currentUser) {

            showToast(
                "Please login first."
            );

            return;

        }


        /*------------------------------------------
        ADMIN CHECK
        ------------------------------------------*/

        if (
            (currentUser.email || "")
                .toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            showToast(
                "Admin access required."
            );

            return;

        }


        try {

            /*--------------------------------------
            START SAVING
            --------------------------------------*/

            saveBannerButton.disabled =
                true;


            saveBannerButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>
                 Saving...`;


            /*--------------------------------------
            GET IMAGE
            --------------------------------------*/

            const selectedFile =
                bannerImage.files[0];


            if (
                !selectedFile &&
                !currentImageUrl
            ) {

                throw new Error(
                    "Please select a banner image."
                );

            }


            /*--------------------------------------
            UPLOAD IMAGE
            --------------------------------------*/

            let imageUrl =
                currentImageUrl;


            if (selectedFile) {

                imageUrl =
                    await uploadBannerImage(
                        selectedFile
                    );

            }


            if (!imageUrl) {

                throw new Error(
                    "Banner image URL is missing."
                );

            }


            /*--------------------------------------
            CREATE BANNER DATA
            --------------------------------------*/

            const bannerData = {

                title:
                    bannerTitle.value.trim(),

                subtitle:
                    bannerSubtitle.value.trim(),

                description:
                    bannerDescription.value.trim(),

                buttonText:
                    buttonText.value.trim(),

                buttonLink:
                    buttonLink.value.trim(),

                imageUrl:
                    imageUrl,

                order:
                    Number(
                        bannerOrder.value || 0
                    ),

                active:
                    bannerActive.checked,

                updatedAt:
                    Date.now(),

                updatedBy:
                    currentUser.email

            };


            /*--------------------------------------
            UPDATE EXISTING BANNER
            --------------------------------------*/

            if (editingBannerId) {

                await update(
                    ref(
                        database,
                        `smartbazaar_pro_2/banners/${editingBannerId}`
                    ),
                    bannerData
                );


                showToast(
                    "Banner updated successfully."
                );

            }


            /*--------------------------------------
            CREATE NEW BANNER
            --------------------------------------*/

            else {

                bannerData.createdAt =
                    Date.now();


                bannerData.createdBy =
                    currentUser.email;


                const newBannerRef =
                    push(
                        bannersRef
                    );


                await set(
                    newBannerRef,
                    bannerData
                );


                showToast(
                    "Banner added successfully."
                );

            }


            /*--------------------------------------
            RESET FORM
            --------------------------------------*/

            resetForm();


            /*--------------------------------------
            LOAD UPDATED BANNERS
            --------------------------------------*/

            await loadBanners();

        }

        catch (error) {

            console.error(
                "FEATURE: BANNER SAVE ERROR:",
                error
            );


            showToast(
                error.message ||
                "Unable to save banner."
            );

        }

        finally {

            saveBannerButton.disabled =
                false;


            saveBannerButton.innerHTML =
                `<i class="fa-solid fa-cloud-arrow-up"></i>
                 Save Banner`;

        }

    }
);


/*==================================================
FEATURE: LOAD BANNERS
==================================================*/

async function loadBanners() {

    try {

        const snapshot =
            await get(
                bannersRef
            );


        allBanners = [];


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            Object.entries(data)
                .forEach(
                    ([id, banner]) => {

                        allBanners.push({

                            id: id,

                            ...banner

                        });

                    }
                );

        }


        /*--------------------------------------
        SORT BY DISPLAY ORDER
        --------------------------------------*/

        allBanners.sort(
            (a, b) => {

                return (
                    Number(a.order ?? 0) -
                    Number(b.order ?? 0)
                );

            }
        );


        renderBanners();

    }

    catch (error) {

        console.error(
            "FEATURE: LOAD BANNERS ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to load banners."
        );

    }

}


/*==================================================
FEATURE: RENDER BANNERS
==================================================*/

function renderBanners() {

    bannerCount.textContent =
        `${allBanners.length} Banner${
            allBanners.length === 1
                ? ""
                : "s"
        }`;


    if (
        !allBanners.length
    ) {

        bannersGrid.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-images"></i>

                <h3>
                    No Banners Yet
                </h3>

                <p>
                    Create your first homepage banner.
                </p>

            </div>

        `;

        return;

    }


    bannersGrid.innerHTML =
        allBanners
            .map(
                (banner) => {

                    const id =
                        escapeAttribute(
                            banner.id
                        );


                    const title =
                        escapeHTML(
                            banner.title ||
                            "Untitled Banner"
                        );


                    const subtitle =
                        escapeHTML(
                            banner.subtitle ||
                            ""
                        );


                    const imageUrl =
                        escapeAttribute(
                            banner.imageUrl ||
                            ""
                        );


                    return `

                        <article
                            class="banner-card"
                            data-id="${id}">

                            <img
                                class="banner-card-image"
                                src="${imageUrl}"
                                alt="${title}"
                                loading="lazy">

                            <div class="banner-card-body">

                                <div class="banner-card-title">
                                    ${title}
                                </div>

                                <div class="banner-card-subtitle">
                                    ${subtitle}
                                </div>

                                <div class="banner-card-meta">

                                    <span
                                        class="banner-status ${
                                            banner.active
                                                ? "active"
                                                : "inactive"
                                        }">

                                        ${
                                            banner.active
                                                ? "ACTIVE"
                                                : "INACTIVE"
                                        }

                                    </span>

                                    <div class="banner-actions">

                                        <button
                                            type="button"
                                            class="edit-banner"
                                            data-action="edit"
                                            data-id="${id}"
                                            title="Edit Banner">

                                            <i class="fa-solid fa-pen"></i>

                                        </button>

                                        <button
                                            type="button"
                                            class="delete-banner"
                                            data-action="delete"
                                            data-id="${id}"
                                            title="Delete Banner">

                                            <i class="fa-solid fa-trash"></i>

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");

}


/*==================================================
FEATURE: EDIT / DELETE EVENTS
==================================================*/

bannersGrid.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (
            action === "edit"
        ) {

            editBanner(id);

            return;

        }


        if (
            action === "delete"
        ) {

            await deleteBanner(id);

        }

    }
);


/*==================================================
FEATURE: EDIT BANNER
==================================================*/

function editBanner(id) {

    const banner =
        allBanners.find(
            item =>
                item.id === id
        );


    if (!banner) {

        showToast(
            "Banner not found."
        );

        return;

    }


    editingBannerId =
        id;


    currentImageUrl =
        banner.imageUrl || "";


    bannerTitle.value =
        banner.title || "";


    bannerSubtitle.value =
        banner.subtitle || "";


    bannerDescription.value =
        banner.description || "";


    buttonText.value =
        banner.buttonText || "";


    buttonLink.value =
        banner.buttonLink || "";


    bannerOrder.value =
        banner.order ?? 0;


    bannerActive.checked =
        banner.active !== false;


    if (
        currentImageUrl
    ) {

        imagePreview.src =
            currentImageUrl;

        imagePreview.style.display =
            "block";

        uploadPlaceholder.style.display =
            "none";

    }


    formTitle.textContent =
        "Edit Banner";


    saveBannerButton.innerHTML =
        `<i class="fa-solid fa-floppy-disk"></i>
         Update Banner`;


    document
        .getElementById(
            "bannerFormCard"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/*==================================================
FEATURE: DELETE BANNER
==================================================*/

async function deleteBanner(id) {

    const banner =
        allBanners.find(
            item =>
                item.id === id
        );


    if (!banner) {

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this banner?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await remove(
            ref(
                database,
                `smartbazaar_pro_2/banners/${id}`
            )
        );


        showToast(
            "Banner deleted successfully."
        );


        if (
            editingBannerId === id
        ) {

            resetForm();

        }


        await loadBanners();

    }

    catch (error) {

        console.error(
            "FEATURE: DELETE BANNER ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to delete banner."
        );

    }

}


/*==================================================
FEATURE: RESET FORM
==================================================*/

function resetForm() {

    bannerForm.reset();


    bannerActive.checked =
        true;


    bannerOrder.value =
        0;


    editingBannerId =
        null;


    currentImageUrl =
        "";


    bannerImage.value =
        "";


    imagePreview.src =
        "";


    imagePreview.style.display =
        "none";


    uploadPlaceholder.style.display =
        "flex";


    uploadProgress.style.display =
        "none";


    progressBar.style.width =
        "0%";


    uploadStatus.textContent =
        "";


    formTitle.textContent =
        "Add New Banner";


    saveBannerButton.innerHTML =
        `<i class="fa-solid fa-cloud-arrow-up"></i>
         Save Banner`;

}


/*==================================================
FEATURE: RESET BUTTON
==================================================*/

resetFormButton.addEventListener(
    "click",
    resetForm
);


/*==================================================
FEATURE: LOGOUT
==================================================*/

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "index.html";

        }

        catch (error) {

            console.error(
                "FEATURE: LOGOUT ERROR:",
                error
            );


            showToast(
                error.message ||
                "Logout failed."
            );

        }

    }
);


/*==================================================
FEATURE: TOAST
==================================================*/

function showToast(message) {

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/*==================================================
FEATURE: HTML ESCAPE
==================================================*/

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/*==================================================
FEATURE: ATTRIBUTE ESCAPE
==================================================*/

function escapeAttribute(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}
