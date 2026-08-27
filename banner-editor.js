/*==================================================
SMARTBAZAAR PRO 2
FEATURE: BANNER EDITOR JAVASCRIPT
FIREBASE + CLOUDINARY
==================================================*/


/*==================================================
FIREBASE IMPORTS
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
CLOUDINARY CONFIG
==================================================*/

const CLOUDINARY_CLOUD_NAME = "jlrjn7lu";

const CLOUDINARY_UPLOAD_PRESET =
    "smartbazaar_pro_2_uploads";


/*==================================================
ADMIN CONFIG
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
DATABASE LOCATION
==================================================*/

const bannersRef =
    ref(database, "smartbazaar_pro_2/banners");


/*==================================================
DOM ELEMENTS
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
FORM FIELDS
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
STATE
==================================================*/

let currentUser = null;

let editingBannerId = null;

let currentImageUrl = "";

let allBanners = [];


/*==================================================
FEATURE: ADMIN AUTHENTICATION
==================================================*/

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (!user) {

        showNotAuthorized(
            "Please login first."
        );

        return;

    }


    adminEmail.textContent =
        user.email || "Unknown";


    if (
        user.email &&
        user.email.toLowerCase() ===
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

        await loadBanners();

    } else {

        showNotAuthorized(
            "This account is not authorized as Admin."
        );

    }

});


/*==================================================
UNAUTHORIZED STATE
==================================================*/

function showNotAuthorized(message) {

    adminStatus.textContent =
        "Access Denied";

    adminEmail.textContent =
        message;

    statusBadge.textContent =
        "DENIED";

    statusBadge.style.background =
        "#fff0f0";

    statusBadge.style.color =
        "#d43c3c";


    bannerForm.style.display =
        "none";

    document.querySelector(
        ".banners-section"
    ).style.display =
        "none";

}


/*==================================================
FEATURE: IMAGE PREVIEW
==================================================*/

bannerImage.addEventListener(
    "change",
    () => {

        const file =
            bannerImage.files[0];

        if (!file) return;


        if (!file.type.startsWith("image/")) {

            showToast(
                "Please select an image file."
            );

            bannerImage.value = "";

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


        reader.readAsDataURL(file);

    }
);


/*==================================================
FEATURE: CLOUDINARY IMAGE UPLOAD
==================================================*/

async function uploadImageToCloudinary(file) {

    if (!file) {

        return currentImageUrl || "";

    }


    uploadProgress.style.display =
        "block";

    progressBar.style.width =
        "0%";

    uploadStatus.textContent =
        "Uploading image to Cloudinary...";


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const cloudinaryUrl =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    return new Promise(
        (resolve, reject) => {

            const xhr =
                new XMLHttpRequest();


            xhr.open(
                "POST",
                cloudinaryUrl
            );


            xhr.upload.onprogress =
                (event) => {

                    if (event.lengthComputable) {

                        const percent =
                            Math.round(
                                (
                                    event.loaded /
                                    event.total
                                ) * 100
                            );


                        progressBar.style.width =
                            `${percent}%`;

                        uploadStatus.textContent =
                            `Uploading image... ${percent}%`;

                    }

                };


            xhr.onload =
                () => {

                    if (
                        xhr.status >= 200 &&
                        xhr.status < 300
                    ) {

                        try {

                            const response =
                                JSON.parse(
                                    xhr.responseText
                                );


                            uploadStatus.textContent =
                                "Image uploaded successfully.";

                            progressBar.style.width =
                                "100%";


                            resolve(
                                response.secure_url
                            );

                        } catch (error) {

                            reject(error);

                        }

                    } else {

                        reject(
                            new Error(
                                "Cloudinary upload failed."
                            )
                        );

                    }

                };


            xhr.onerror =
                () => {

                    reject(
                        new Error(
                            "Network error during upload."
                        )
                    );

                };


            xhr.send(formData);

        }
    );

}


/*==================================================
FEATURE: SAVE BANNER
==================================================*/

bannerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            showToast(
                "Please login first."
            );

            return;

        }


        if (
            currentUser.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            showToast(
                "Admin access required."
            );

            return;

        }


        try {

            saveBannerButton.disabled =
                true;


            saveBannerButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>
                 Saving...`;


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


            let imageUrl =
                currentImageUrl;


            if (selectedFile) {

                imageUrl =
                    await uploadImageToCloudinary(
                        selectedFile
                    );

            }


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

            } else {

                bannerData.createdAt =
                    Date.now();


                bannerData.createdBy =
                    currentUser.email;


                const newBannerRef =
                    push(bannersRef);


                await set(
                    newBannerRef,
                    bannerData
                );


                showToast(
                    "Banner added successfully."
                );

            }


            resetForm();

            await loadBanners();


        } catch (error) {

            console.error(
                "Banner Save Error:",
                error
            );


            showToast(
                error.message ||
                "Unable to save banner."
            );

        } finally {

            saveBannerButton.disabled =
                false;


            saveBannerButton.innerHTML =
                `<i class="fa-solid fa-cloud-arrow-up"></i>
                 Save Banner`;

        }

    }
);


/*==================================================
FEATURE: LOAD BANNERS FROM FIREBASE
==================================================*/

async function loadBanners() {

    try {

        const snapshot =
            await get(bannersRef);


        allBanners = [];


        if (snapshot.exists()) {

            const data =
                snapshot.val();


            Object.entries(data).forEach(
                ([id, banner]) => {

                    allBanners.push({
                        id,
                        ...banner
                    });

                }
            );

        }


        allBanners.sort(
            (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );


        renderBanners();


    } catch (error) {

        console.error(
            "Load Banner Error:",
            error
        );


        showToast(
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


    if (!allBanners.length) {

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
        allBanners.map(
            (banner) => {

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


                return `

                    <article
                        class="banner-card"
                        data-id="${banner.id}">

                        <img
                            class="banner-card-image"
                            src="${banner.imageUrl}"
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
                                        data-id="${banner.id}"
                                        title="Edit Banner">

                                        <i class="fa-solid fa-pen"></i>

                                    </button>

                                    <button
                                        type="button"
                                        class="delete-banner"
                                        data-action="delete"
                                        data-id="${banner.id}"
                                        title="Delete Banner">

                                        <i class="fa-solid fa-trash"></i>

                                    </button>

                                </div>

                            </div>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/*==================================================
FEATURE: EDIT / DELETE BUTTONS
==================================================*/

bannersGrid.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) return;


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (action === "edit") {

            editBanner(id);

        }


        if (action === "delete") {

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


    if (!banner) return;


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


    if (currentImageUrl) {

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
        .getElementById("bannerFormCard")
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


    if (!banner) return;


    const confirmed =
        confirm(
            "Are you sure you want to delete this banner?"
        );


    if (!confirmed) return;


    try {

        await remove(
            ref(
                database,
                `banners/${id}`
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


    } catch (error) {

        console.error(
            "Delete Banner Error:",
            error
        );


        showToast(
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

            await signOut(auth);

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(error);

            showToast(
                "Logout failed."
            );

        }

    }
);


/*==================================================
FEATURE: TOAST MESSAGE
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
