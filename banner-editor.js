/*==================================================
SMARTBAZAAR PRO 2
FEATURE: BANNER EDITOR JAVASCRIPT
FIREBASE + CLOUDINARY
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
FEATURE: CLOUDINARY CONFIGURATION
==================================================*/

const CLOUDINARY_CLOUD_NAME =
    "jlrjn7lu";

const CLOUDINARY_UPLOAD_PRESET =
    "smartbazaar_pro_2_uploads";


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
    document.getElementById(
        "bannerForm"
    );

const bannerImage =
    document.getElementById(
        "bannerImage"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const uploadPlaceholder =
    document.getElementById(
        "uploadPlaceholder"
    );

const uploadProgress =
    document.getElementById(
        "uploadProgress"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const uploadStatus =
    document.getElementById(
        "uploadStatus"
    );

const bannersGrid =
    document.getElementById(
        "bannersGrid"
    );

const bannerCount =
    document.getElementById(
        "bannerCount"
    );

const adminStatus =
    document.getElementById(
        "adminStatus"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );

const statusBadge =
    document.getElementById(
        "statusBadge"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const resetFormButton =
    document.getElementById(
        "resetFormButton"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const saveBannerButton =
    document.getElementById(
        "saveBannerButton"
    );

const toast =
    document.getElementById(
        "toast"
    );

const toastMessage =
    document.getElementById(
        "toastMessage"
    );


/*==================================================
FEATURE: FORM FIELDS
==================================================*/

const bannerTitle =
    document.getElementById(
        "bannerTitle"
    );

const bannerSubtitle =
    document.getElementById(
        "bannerSubtitle"
    );

const bannerDescription =
    document.getElementById(
        "bannerDescription"
    );

const buttonText =
    document.getElementById(
        "buttonText"
    );

const buttonLink =
    document.getElementById(
        "buttonLink"
    );

const bannerOrder =
    document.getElementById(
        "bannerOrder"
    );

const bannerActive =
    document.getElementById(
        "bannerActive"
    );


/*==================================================
FEATURE: STATE
==================================================*/

let currentUser =
    null;

let editingBannerId =
    null;

let currentImageUrl =
    "";

let allBanners =
    [];


/*==================================================
FEATURE: CHECK DOM
==================================================*/

if (!bannerForm) {

    console.error(
        "Banner Editor Error: bannerForm not found."
    );

}

if (!bannerImage) {

    console.error(
        "Banner Editor Error: bannerImage not found."
    );

}

if (!imagePreview) {

    console.error(
        "Banner Editor Error: imagePreview not found."
    );

}


/*==================================================
FEATURE: IMAGE PREVIEW
IMPORTANT:
This works locally BEFORE Cloudinary upload.
==================================================*/

if (bannerImage) {

    bannerImage.addEventListener(
        "change",
        handleImageSelection
    );

}


function handleImageSelection(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {

        return;

    }


    /*==================================================
    FEATURE: VALIDATE IMAGE
    ==================================================*/

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please select a valid image."
        );

        bannerImage.value =
            "";

        return;

    }


    /*==================================================
    FEATURE: FILE SIZE CHECK
    ==================================================*/

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        showToast(
            "Image must be smaller than 10 MB."
        );

        bannerImage.value =
            "";

        return;

    }


    /*==================================================
    FEATURE: CREATE LOCAL IMAGE PREVIEW
    ==================================================*/

    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            if (!imagePreview) {
                return;
            }


            imagePreview.src =
                event.target.result;


            imagePreview.style.display =
                "block";


            if (uploadPlaceholder) {

                uploadPlaceholder.style.display =
                    "none";

            }

        };


    reader.onerror =
        function() {

            showToast(
                "Unable to preview selected image."
            );

        };


    reader.readAsDataURL(
        file
    );

}


/*==================================================
FEATURE: CLOUDINARY IMAGE UPLOAD
==================================================*/

async function uploadImageToCloudinary(
    file
) {

    if (!file) {

        return currentImageUrl || "";

    }


    if (!file.type.startsWith("image/")) {

        throw new Error(
            "Selected file is not an image."
        );

    }


    /*==================================================
    FEATURE: SHOW PROGRESS
    ==================================================*/

    if (uploadProgress) {

        uploadProgress.style.display =
            "block";

    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    if (uploadStatus) {

        uploadStatus.textContent =
            "Uploading image to Cloudinary...";

    }


    /*==================================================
    FEATURE: CLOUDINARY URL
    ==================================================*/

    const uploadUrl =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    /*==================================================
    FEATURE: FORM DATA
    ==================================================*/

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


    /*==================================================
    FEATURE: UPLOAD WITH XHR
    ==================================================*/

    return new Promise(
        (resolve, reject) => {

            const xhr =
                new XMLHttpRequest();


            xhr.open(
                "POST",
                uploadUrl,
                true
            );


            /*------------------------------------------
            UPLOAD PROGRESS
            ------------------------------------------*/

            xhr.upload.onprogress =
                function(event) {

                    if (
                        event.lengthComputable
                    ) {

                        const percent =
                            Math.round(
                                (
                                    event.loaded /
                                    event.total
                                ) *
                                100
                            );


                        if (progressBar) {

                            progressBar.style.width =
                                `${percent}%`;

                        }


                        if (uploadStatus) {

                            uploadStatus.textContent =
                                `Uploading image... ${percent}%`;

                        }

                    }

                };


            /*------------------------------------------
            UPLOAD SUCCESS / ERROR
            ------------------------------------------*/

            xhr.onload =
                function() {

                    let response =
                        null;


                    try {

                        response =
                            JSON.parse(
                                xhr.responseText
                            );

                    }

                    catch (error) {

                        reject(
                            new Error(
                                "Invalid response from Cloudinary."
                            )
                        );

                        return;

                    }


                    if (
                        xhr.status >= 200 &&
                        xhr.status < 300
                    ) {

                        if (
                            !response.secure_url
                        ) {

                            reject(
                                new Error(
                                    "Cloudinary did not return an image URL."
                                )
                            );

                            return;

                        }


                        if (progressBar) {

                            progressBar.style.width =
                                "100%";

                        }


                        if (uploadStatus) {

                            uploadStatus.textContent =
                                "Image uploaded successfully.";

                        }


                        resolve(
                            response.secure_url
                        );

                    }

                    else {

                        console.error(
                            "Cloudinary Error:",
                            response
                        );


                        reject(
                            new Error(
                                response?.error?.message ||
                                "Cloudinary upload failed."
                            )
                        );

                    }

                };


            /*------------------------------------------
            NETWORK ERROR
            ------------------------------------------*/

            xhr.onerror =
                function() {

                    reject(
                        new Error(
                            "Network error while uploading image."
                        )
                    );

                };


            /*------------------------------------------
            TIMEOUT
            ------------------------------------------*/

            xhr.timeout =
                60000;


            xhr.ontimeout =
                function() {

                    reject(
                        new Error(
                            "Cloudinary upload timed out. Please try again."
                        )
                    );

                };


            xhr.send(
                formData
            );

        }
    );

}


/*==================================================
FEATURE: ADMIN AUTHENTICATION
==================================================*/

onAuthStateChanged(
    auth,
    async function(user) {

        currentUser =
            user;


        /*------------------------------------------
        NO USER
        ------------------------------------------*/

        if (!user) {

            showNotAuthorized(
                "Please login first."
            );

            return;

        }


        /*------------------------------------------
        SHOW USER EMAIL
        ------------------------------------------*/

        if (adminEmail) {

            adminEmail.textContent =
                user.email ||
                "Unknown";

        }


        const loggedInEmail =
            (
                user.email ||
                ""
            ).toLowerCase();


        const adminEmailLower =
            ADMIN_EMAIL.toLowerCase();


        /*------------------------------------------
        ADMIN CHECK
        ------------------------------------------*/

        if (
            loggedInEmail !==
            adminEmailLower
        ) {

            showNotAuthorized(
                "This account is not authorized as Admin."
            );

            return;

        }


        /*------------------------------------------
        ADMIN GRANTED
        ------------------------------------------*/

        if (adminStatus) {

            adminStatus.textContent =
                "Admin Access Granted";

        }


        if (statusBadge) {

            statusBadge.textContent =
                "ADMIN";

            statusBadge.style.background =
                "#e7f7ed";

            statusBadge.style.color =
                "#198754";

        }


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


        /*------------------------------------------
        LOAD BANNERS
        ------------------------------------------*/

        await loadBanners();

    }
);


/*==================================================
FEATURE: UNAUTHORIZED STATE
==================================================*/

function showNotAuthorized(
    message
) {

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
FEATURE: SAVE BANNER
==================================================*/

if (bannerForm) {

    bannerForm.addEventListener(
        "submit",
        saveBanner
    );

}


async function saveBanner(event) {

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

    const loggedInEmail =
        (
            currentUser.email ||
            ""
        ).toLowerCase();


    if (
        loggedInEmail !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        showToast(
            "Admin access required."
        );

        return;

    }


    try {

        /*--------------------------------------
        DISABLE SAVE BUTTON
        --------------------------------------*/

        if (saveBannerButton) {

            saveBannerButton.disabled =
                true;

            saveBannerButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

        }


        /*--------------------------------------
        GET SELECTED IMAGE
        --------------------------------------*/

        const selectedFile =
            bannerImage?.files?.[0] ||
            null;


        /*--------------------------------------
        IMAGE VALIDATION
        --------------------------------------*/

        if (
            !selectedFile &&
            !currentImageUrl
        ) {

            throw new Error(
                "Please select a banner image."
            );

        }


        /*--------------------------------------
        IMAGE UPLOAD
        --------------------------------------*/

        let imageUrl =
            currentImageUrl;


        if (selectedFile) {

            imageUrl =
                await uploadImageToCloudinary(
                    selectedFile
                );

        }


        /*--------------------------------------
        CREATE BANNER DATA
        --------------------------------------*/

        const bannerData = {

            title:
                bannerTitle?.value.trim() ||
                "",

            subtitle:
                bannerSubtitle?.value.trim() ||
                "",

            description:
                bannerDescription?.value.trim() ||
                "",

            buttonText:
                buttonText?.value.trim() ||
                "",

            buttonLink:
                buttonLink?.value.trim() ||
                "",

            imageUrl:
                imageUrl,

            order:
                Number(
                    bannerOrder?.value ||
                    0
                ),

            active:
                bannerActive?.checked ??
                true,

            updatedAt:
                Date.now(),

            updatedBy:
                currentUser.email

        };


        /*--------------------------------------
        UPDATE EXISTING
        --------------------------------------*/

        if (editingBannerId) {

            await update(
                ref(
                    database,
                    `banners/${editingBannerId}`
                ),
                bannerData
            );


            showToast(
                "Banner updated successfully."
            );

        }


        /*--------------------------------------
        CREATE NEW
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
        RESET
        --------------------------------------*/

        resetForm();


        /*--------------------------------------
        RELOAD
        --------------------------------------*/

        await loadBanners();

    }

    catch (error) {

        console.error(
            "Banner Save Error:",
            error
        );


        showToast(
            error?.message ||
            "Unable to save banner."
        );

    }

    finally {

        if (saveBannerButton) {

            saveBannerButton.disabled =
                false;

            saveBannerButton.innerHTML =
                `<i class="fa-solid fa-cloud-arrow-up"></i> Save Banner`;

        }

    }

}


/*==================================================
FEATURE: LOAD BANNERS
==================================================*/

async function loadBanners() {

    try {

        const snapshot =
            await get(
                bannersRef
            );


        allBanners =
            [];


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            Object.entries(
                data
            ).forEach(
                function([id, banner]) {

                    allBanners.push({

                        id:

                            id,

                        ...banner

                    });

                }
            );

        }


        /*--------------------------------------
        SORT
        --------------------------------------*/

        allBanners.sort(
            function(a, b) {

                return (
                    Number(
                        a.order ||
                        0
                    ) -
                    Number(
                        b.order ||
                        0
                    )
                );

            }
        );


        renderBanners();

    }

    catch (error) {

        console.error(
            "Load Banner Error:",
            error
        );


        showToast(
            error?.message ||
            "Unable to load banners."
        );

    }

}


/*==================================================
FEATURE: RENDER BANNERS
==================================================*/

function renderBanners() {

    if (!bannerCount || !bannersGrid) {

        return;

    }


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
            function(banner) {

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


                const id =
                    escapeAttribute(
                        banner.id
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
                                        data-id="${id}">

                                        <i class="fa-solid fa-pen"></i>

                                    </button>

                                    <button
                                        type="button"
                                        class="delete-banner"
                                        data-action="delete"
                                        data-id="${id}">

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
FEATURE: EDIT / DELETE EVENTS
==================================================*/

if (bannersGrid) {

    bannersGrid.addEventListener(
        "click",
        async function(event) {

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

            }


            if (
                action === "delete"
            ) {

                await deleteBanner(id);

            }

        }
    );

}


/*==================================================
FEATURE: EDIT BANNER
==================================================*/

function editBanner(id) {

    const banner =
        allBanners.find(
            function(item) {

                return item.id === id;

            }
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
        banner.imageUrl ||
        "";


    if (bannerTitle) {

        bannerTitle.value =
            banner.title ||
            "";

    }


    if (bannerSubtitle) {

        bannerSubtitle.value =
            banner.subtitle ||
            "";

    }


    if (bannerDescription) {

        bannerDescription.value =
            banner.description ||
            "";

    }


    if (buttonText) {

        buttonText.value =
            banner.buttonText ||
            "";

    }


    if (buttonLink) {

        buttonLink.value =
            banner.buttonLink ||
            "";

    }


    if (bannerOrder) {

        bannerOrder.value =
            banner.order ??
            0;

    }


    if (bannerActive) {

        bannerActive.checked =
            banner.active !== false;

    }


    /*--------------------------------------
    SHOW EXISTING IMAGE
    --------------------------------------*/

    if (
        currentImageUrl &&
        imagePreview
    ) {

        imagePreview.src =
            currentImageUrl;

        imagePreview.style.display =
            "block";


        if (uploadPlaceholder) {

            uploadPlaceholder.style.display =
                "none";

        }

    }


    if (formTitle) {

        formTitle.textContent =
            "Edit Banner";

    }


    if (saveBannerButton) {

        saveBannerButton.innerHTML =
            `<i class="fa-solid fa-floppy-disk"></i> Update Banner`;

    }


    const formCard =
        document.getElementById(
            "bannerFormCard"
        );


    if (formCard) {

        formCard.scrollIntoView({
            behavior:
                "smooth"
        });

    }

}


/*==================================================
FEATURE: DELETE BANNER
==================================================*/

async function deleteBanner(id) {

    const banner =
        allBanners.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!banner) {

        return;

    }


    const confirmed =
        window.confirm(
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
            "Delete Banner Error:",
            error
        );


        showToast(
            error?.message ||
            "Unable to delete banner."
        );

    }

}


/*==================================================
FEATURE: RESET FORM
==================================================*/

function resetForm() {

    if (bannerForm) {

        bannerForm.reset();

    }


    if (bannerActive) {

        bannerActive.checked =
            true;

    }


    if (bannerOrder) {

        bannerOrder.value =
            0;

    }


    editingBannerId =
        null;


    currentImageUrl =
        "";


    if (bannerImage) {

        bannerImage.value =
            "";

    }


    if (imagePreview) {

        imagePreview.src =
            "";

        imagePreview.style.display =
            "none";

    }


    if (uploadPlaceholder) {

        uploadPlaceholder.style.display =
            "flex";

    }


    if (uploadProgress) {

        uploadProgress.style.display =
            "none";

    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    if (uploadStatus) {

        uploadStatus.textContent =
            "";

    }


    if (formTitle) {

        formTitle.textContent =
            "Add New Banner";

    }


    if (saveBannerButton) {

        saveBannerButton.innerHTML =
            `<i class="fa-solid fa-cloud-arrow-up"></i> Save Banner`;

    }

}


/*==================================================
FEATURE: RESET BUTTON
==================================================*/

if (resetFormButton) {

    resetFormButton.addEventListener(
        "click",
        resetForm
    );

}


/*==================================================
FEATURE: LOGOUT
==================================================*/

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "index.html";

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                showToast(
                    error?.message ||
                    "Logout failed."
                );

            }

        }
    );

}


/*==================================================
FEATURE: TOAST
==================================================*/

function showToast(message) {

    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function() {

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


/*==================================================
FEATURE: BANNER EDITOR READY
==================================================*/

console.log(
    "SmartBazaar Pro 2 Banner Editor loaded successfully."
);
