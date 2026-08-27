/*==================================================
SMARTBAZAAR PRO 2
FEATURE: BANNER EDITOR JAVASCRIPT
==================================================*/

import {
    uploadToCloudinary,
    CLOUDINARY_FOLDERS
} from "./cloudinary-config.js";

import {
    addBanner,
    getBanners,
    updateBanner,
    deleteBanner,
    setBannerStatus
} from "./firebase-banner.js";


/*==================================================
DOM ELEMENTS
==================================================*/

const bannerForm =
    document.getElementById("bannerForm");

const bannerId =
    document.getElementById("bannerId");

const desktopImage =
    document.getElementById("desktopImage");

const mobileImage =
    document.getElementById("mobileImage");

const desktopPreview =
    document.getElementById("desktopPreview");

const mobilePreview =
    document.getElementById("mobilePreview");

const desktopUploadStatus =
    document.getElementById(
        "desktopUploadStatus"
    );

const mobileUploadStatus =
    document.getElementById(
        "mobileUploadStatus"
    );

const bannerTitle =
    document.getElementById("bannerTitle");

const bannerSubtitle =
    document.getElementById("bannerSubtitle");

const buttonText =
    document.getElementById("buttonText");

const buttonLink =
    document.getElementById("buttonLink");

const bannerOrder =
    document.getElementById("bannerOrder");

const bannerActive =
    document.getElementById("bannerActive");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const bannerList =
    document.getElementById("bannerList");

const bannerCount =
    document.getElementById("bannerCount");

const formTitle =
    document.getElementById("formTitle");

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );


/*==================================================
TEMPORARY IMAGE URLS
==================================================*/

let desktopImageUrl = "";

let mobileImageUrl = "";


/*==================================================
FEATURE: IMAGE PREVIEW
==================================================*/

desktopImage.addEventListener(
    "change",
    () => {

        const file =
            desktopImage.files[0];

        if (!file) {
            return;
        }

        const url =
            URL.createObjectURL(file);

        desktopPreview.src = url;

        desktopPreview.style.display =
            "block";

    }
);


mobileImage.addEventListener(
    "change",
    () => {

        const file =
            mobileImage.files[0];

        if (!file) {
            return;
        }

        const url =
            URL.createObjectURL(file);

        mobilePreview.src = url;

        mobilePreview.style.display =
            "block";

    }
);


/*==================================================
FEATURE: UPLOAD DESKTOP IMAGE
==================================================*/

async function uploadDesktopImage() {

    const file =
        desktopImage.files[0];

    if (!file) {
        return desktopImageUrl;
    }

    desktopUploadStatus.textContent =
        "Uploading desktop image...";

    const result =
        await uploadToCloudinary(
            file,
            CLOUDINARY_FOLDERS.BANNERS
        );

    desktopImageUrl =
        result.url;

    desktopUploadStatus.textContent =
        "Desktop image uploaded successfully.";

    return desktopImageUrl;
}


/*==================================================
FEATURE: UPLOAD MOBILE IMAGE
==================================================*/

async function uploadMobileImage() {

    const file =
        mobileImage.files[0];

    if (!file) {
        return mobileImageUrl;
    }

    mobileUploadStatus.textContent =
        "Uploading mobile image...";

    const result =
        await uploadToCloudinary(
            file,
            CLOUDINARY_FOLDERS.BANNERS
        );

    mobileImageUrl =
        result.url;

    mobileUploadStatus.textContent =
        "Mobile image uploaded successfully.";

    return mobileImageUrl;
}


/*==================================================
FEATURE: SAVE BANNER
==================================================*/

bannerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            const saveButton =
                document.getElementById(
                    "saveBannerButton"
                );

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Saving...";


            /* Upload images */

            await uploadDesktopImage();

            await uploadMobileImage();


            /* Validation */

            if (!desktopImageUrl) {

                throw new Error(
                    "Please select a desktop banner image."
                );

            }


            /* Banner data */

            const data = {

                imageUrl:
                    desktopImageUrl,

                mobileImageUrl:
                    mobileImageUrl,

                title:
                    bannerTitle.value.trim(),

                subtitle:
                    bannerSubtitle.value.trim(),

                buttonText:
                    buttonText.value.trim(),

                buttonLink:
                    buttonLink.value.trim(),

                order:
                    Number(
                        bannerOrder.value || 0
                    ),

                active:
                    bannerActive.checked,

                startDate:
                    startDate.value,

                endDate:
                    endDate.value

            };


            /* Edit or Add */

            if (bannerId.value) {

                await updateBanner(
                    bannerId.value,
                    data
                );

                alert(
                    "Banner updated successfully."
                );

            } else {

                await addBanner(data);

                alert(
                    "Banner added successfully."
                );

            }


            resetForm();

            await loadBanners();

        }

        catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Something went wrong."
            );

        }

        finally {

            const saveButton =
                document.getElementById(
                    "saveBannerButton"
                );

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Banner";

        }

    }
);


/*==================================================
FEATURE: LOAD BANNERS
==================================================*/

async function loadBanners() {

    bannerList.innerHTML =
        `<div class="loading-message">
            Loading banners...
        </div>`;


    try {

        const banners =
            await getBanners();


        bannerCount.textContent =
            `${banners.length} banner${
                banners.length === 1
                    ? ""
                    : "s"
            }`;


        if (!banners.length) {

            bannerList.innerHTML =
                `<div class="loading-message">
                    No banners found.
                </div>`;

            return;
        }


        bannerList.innerHTML = "";


        banners.forEach(
            (banner) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "banner-item";


                item.innerHTML = `

                    <img
                        src="${banner.imageUrl}"
                        alt="${escapeHtml(
                            banner.title ||
                            "Banner"
                        )}">

                    <div class="banner-item-info">

                        <h3>
                            ${
                                escapeHtml(
                                    banner.title ||
                                    "Untitled Banner"
                                )
                            }
                        </h3>

                        <p>
                            Order:
                            ${banner.order}
                        </p>

                        <p class="${
                            banner.active
                                ? "status-active"
                                : "status-inactive"
                        }">

                            ${
                                banner.active
                                    ? "Active"
                                    : "Inactive"
                            }

                        </p>

                    </div>

                    <div class="banner-item-actions">

                        <button
                            type="button"
                            class="edit-banner"
                            data-action="edit"
                            data-id="${banner.id}">

                            Edit

                        </button>

                        <button
                            type="button"
                            class="delete-banner"
                            data-action="delete"
                            data-id="${banner.id}">

                            Delete

                        </button>

                    </div>
                `;


                bannerList.appendChild(item);

            }
        );

    }

    catch (error) {

        console.error(error);

        bannerList.innerHTML =
            `<div class="loading-message">
                Failed to load banners.
            </div>`;

    }

}


/*==================================================
FEATURE: EDIT / DELETE BUTTONS
==================================================*/

bannerList.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );

        if (!button) {
            return;
        }


        const action =
            button.dataset.action;

        const id =
            button.dataset.id;


        if (action === "edit") {

            await editBanner(id);

        }


        if (action === "delete") {

            await removeBanner(id);

        }

    }
);


/*==================================================
FEATURE: EDIT BANNER
==================================================*/

async function editBanner(id) {

    const banners =
        await getBanners();

    const banner =
        banners.find(
            item =>
                item.id === id
        );


    if (!banner) {

        alert(
            "Banner not found."
        );

        return;
    }


    bannerId.value =
        banner.id;

    desktopImageUrl =
        banner.imageUrl || "";

    mobileImageUrl =
        banner.mobileImageUrl || "";


    bannerTitle.value =
        banner.title || "";

    bannerSubtitle.value =
        banner.subtitle || "";

    buttonText.value =
        banner.buttonText || "";

    buttonLink.value =
        banner.buttonLink || "";

    bannerOrder.value =
        banner.order ?? 0;

    bannerActive.checked =
        banner.active !== false;

    startDate.value =
        banner.startDate || "";

    endDate.value =
        banner.endDate || "";


    if (banner.imageUrl) {

        desktopPreview.src =
            banner.imageUrl;

        desktopPreview.style.display =
            "block";

    }


    if (banner.mobileImageUrl) {

        mobilePreview.src =
            banner.mobileImageUrl;

        mobilePreview.style.display =
            "block";

    }


    formTitle.textContent =
        "Edit Banner";


    document
        .querySelector(
            ".editor-card"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/*==================================================
FEATURE: DELETE BANNER
==================================================*/

async function removeBanner(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this banner?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteBanner(id);

        alert(
            "Banner deleted successfully."
        );

        await loadBanners();

    }

    catch (error) {

        console.error(error);

        alert(
            "Failed to delete banner."
        );

    }

}


/*==================================================
FEATURE: RESET FORM
==================================================*/

function resetForm() {

    bannerForm.reset();

    bannerId.value = "";

    desktopImageUrl = "";

    mobileImageUrl = "";

    desktopPreview.src = "";

    mobilePreview.src = "";

    desktopPreview.style.display =
        "none";

    mobilePreview.style.display =
        "none";

    desktopUploadStatus.textContent =
        "";

    mobileUploadStatus.textContent =
        "";

    formTitle.textContent =
        "Add New Banner";

    bannerActive.checked =
        true;

    bannerOrder.value =
        "1";

}


/*==================================================
FEATURE: CLEAR BUTTON
==================================================*/

cancelEditButton.addEventListener(
    "click",
    resetForm
);


/*==================================================
FEATURE: HTML ESCAPE
==================================================*/

function escapeHtml(value) {

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
FEATURE: INITIAL LOAD
==================================================*/

loadBanners();
