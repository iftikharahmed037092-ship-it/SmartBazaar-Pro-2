/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ADMIN PANEL JAVASCRIPT
==================================================*/


/*==================================================
FEATURE: FIREBASE IMPORTS
==================================================*/

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";




/*==================================================
FEATURE: FIREBASE CONFIG
==================================================*/

import {
    app
} from "./firebase-config.js";



/*==================================================
FEATURE: FIREBASE REALTIME DATABASE
==================================================*/

import {
    getDatabase,
    ref,
    onValue,
    push,
    set,
    update,
    remove,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";



/*==================================================
FEATURE: ADMIN AUTHENTICATION
==================================================*/

const auth = getAuth(app);


/*==================================================
FEATURE: FIREBASE DATABASE
==================================================*/

const db = getDatabase(app);


/*==================================================
FEATURE: CATEGORY DATABASE PATH
==================================================*/

const categoriesRef =
    ref(
        db,
        "smartbazaar_pro_2/categories"
    );

/*==================================================
FEATURE: ADMIN EMAIL
==================================================*/

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
FEATURE: DOM ELEMENTS
==================================================*/

const adminLoading =
    document.getElementById("adminLoading");

const adminEmail =
    document.getElementById("adminEmail");

const adminName =
    document.getElementById("adminName");

const logoutButton =
    document.getElementById("logoutButton");

const viewWebsiteButton =
    document.getElementById("viewWebsiteButton");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const adminSidebar =
    document.getElementById("adminSidebar");

const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");

const adminToast =
    document.getElementById("adminToast");

const adminToastMessage =
    document.getElementById("adminToastMessage");


/*==================================================
FEATURE: ADMIN ACCESS VERIFICATION
==================================================*/

onAuthStateChanged(auth, (user) => {

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

        signOut(auth)
            .finally(() => {

                alert(
                    "Access Denied. Admin account required."
                );

                window.location.href =
                    "admin-login.html";

            });

        return;

    }


    /*==================================================
    ADMIN VERIFIED
    ==================================================*/

    adminEmail.textContent =
        user.email;


    adminName.textContent =
        user.displayName ||
        "Administrator";


    adminLoading.classList.add(
        "hidden"
    );

});


/*==================================================
FEATURE: SIDEBAR NAVIGATION
==================================================*/

const navigationItems =
    document.querySelectorAll(
        ".admin-nav-item"
    );


const sections =
    document.querySelectorAll(
        ".admin-section"
    );


navigationItems.forEach((item) => {

    item.addEventListener(
        "click",
        (event) => {

            const sectionName =
                item.dataset.section;


            /*==================================================
            FEATURE: ANALYTICS PAGE NAVIGATION
            ==================================================*/

            if (
                sectionName ===
                "analytics"
            ) {

                window.location.href =
                    "analytics.html";

                return;

            }


            /*==================================================
            FEATURE: INTERNAL ADMIN PANEL NAVIGATION
            ==================================================*/

            event.preventDefault();


            openSection(
                sectionName
            );


            /* MOBILE SIDEBAR CLOSE */

            adminSidebar.classList.remove(
                "open"
            );

        }
    );

});


/*==================================================
FEATURE: OPEN ADMIN SECTION
==================================================*/

function openSection(sectionName) {


    navigationItems.forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.section ===
            sectionName
        );

    });


    sections.forEach((section) => {

        section.classList.remove(
            "active"
        );

    });


    const targetSection =
        document.getElementById(
            sectionName + "Section"
        );


    if (targetSection) {

        targetSection.classList.add(
            "active"
        );

    }


    const titles = {

        dashboard: [
            "Dashboard",
            "Welcome back to SmartBazaar Pro 2"
        ],

        banners: [
            "Banners",
            "Manage your homepage banners"
        ],

        products: [
            "Products",
            "Manage marketplace products"
        ],

        categories: [
            "Categories",
            "Organize your marketplace"
        ],

        orders: [
            "Orders",
            "Manage customer orders"
        ],

        users: [
            "Users",
            "Manage marketplace users"
        ],

        analytics: [
            "Analytics",
            "Monitor marketplace performance"
        ],

        settings: [
            "Settings",
            "Manage SmartBazaar Pro 2"
        ]

    };


    if (titles[sectionName]) {

        pageTitle.textContent =
            titles[sectionName][0];

        pageSubtitle.textContent =
            titles[sectionName][1];

    }

}


/*==================================================
SMARTBAZAAR PRO 2
FEATURE: PRODUCT EDITOR NAVIGATION
==================================================*/


/*==================================================
FEATURE: QUICK ACTIONS
==================================================*/

const quickActionButtons =
    document.querySelectorAll(
        "[data-section-action]"
    );


quickActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.sectionAction;


                /*==================================================
                FEATURE: ADD PRODUCT → PRODUCT DETAIL EDITOR
                ==================================================*/

                if (
                    section === "products"
                ) {

                    window.location.href =
                        "product-editor.html";

                    return;

                }


                /*==================================================
                FEATURE: OTHER QUICK ACTIONS
                ==================================================*/

                openSection(
                    section
                );

            }
        );

    }
);


/*==================================================
FEATURE: SIDEBAR MOBILE TOGGLE
==================================================*/

if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            adminSidebar.classList.toggle(
                "open"
            );

        }
    );

}


/*==================================================
FEATURE: VIEW WEBSITE
==================================================*/

if (viewWebsiteButton) {

    viewWebsiteButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


/*==================================================
FEATURE: LOGOUT
==================================================*/

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            try {

                await signOut(auth);

                window.location.href =
                    "admin-login.html";

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

                showToast(
                    "Unable to logout."
                );

            }

        }
    );

}


/*==================================================
FEATURE: ADD BANNER
==================================================*/

const addBannerButton =
    document.getElementById(
        "addBannerButton"
    );


const openBannerEditorButton =
    document.getElementById(
        "openBannerEditorButton"
    );


function openBannerEditor() {

    window.location.href =
        "banner-editor.html";

}


if (addBannerButton) {

    addBannerButton.addEventListener(
        "click",
        openBannerEditor
    );

}


if (openBannerEditorButton) {

    openBannerEditorButton.addEventListener(
        "click",
        openBannerEditor
    );

}


/*==================================================
FEATURE: TOAST MESSAGE
==================================================*/

function showToast(message) {

    adminToastMessage.textContent =
        message;


    adminToast.classList.add(
        "show"
    );


    setTimeout(() => {

        adminToast.classList.remove(
            "show"
        );

    }, 3000);

}


/*==================================================
FEATURE: INITIAL DASHBOARD
==================================================*/

openSection(
    "dashboard"
);



/*==================================================
SMARTBAZAAR PRO 2
FEATURE: CATEGORY MANAGEMENT
FEATURE: CATEGORY CRUD
FEATURE: CATEGORY FIREBASE
FEATURE: CATEGORY SEARCH
FEATURE: CATEGORY FILTER
FEATURE: CATEGORY STATUS
==================================================*/


/*==================================================
FEATURE: CATEGORY DOM ELEMENTS
==================================================*/

const addCategoryButton =
    document.getElementById(
        "addCategoryButton"
    );

const emptyAddCategoryButton =
    document.getElementById(
        "emptyAddCategoryButton"
    );

const categoryModal =
    document.getElementById(
        "categoryModal"
    );

const categoryModalOverlay =
    document.getElementById(
        "categoryModalOverlay"
    );

const closeCategoryModal =
    document.getElementById(
        "closeCategoryModal"
    );

const cancelCategoryButton =
    document.getElementById(
        "cancelCategoryButton"
    );

const categoryForm =
    document.getElementById(
        "categoryForm"
    );

const categoryModalTitle =
    document.getElementById(
        "categoryModalTitle"
    );

const editingCategoryId =
    document.getElementById(
        "editingCategoryId"
    );

const categoryName =
    document.getElementById(
        "categoryName"
    );

const categorySlug =
    document.getElementById(
        "categorySlug"
    );

const categoryDescription =
    document.getElementById(
        "categoryDescription"
    );

const categoryImageUrl =
    document.getElementById(
        "categoryImageUrl"
    );

const categoryIcon =
    document.getElementById(
        "categoryIcon"
    );

const categorySortOrder =
    document.getElementById(
        "categorySortOrder"
    );

const categoryActive =
    document.getElementById(
        "categoryActive"
    );

const categoryAdminList =
    document.getElementById(
        "categoryAdminList"
    );

const categoryAdminLoading =
    document.getElementById(
        "categoryAdminLoading"
    );

const categoryAdminEmpty =
    document.getElementById(
        "categoryAdminEmpty"
    );

const adminCategorySearch =
    document.getElementById(
        "adminCategorySearch"
    );

const categoryStatusFilter =
    document.getElementById(
        "categoryStatusFilter"
    );

const adminCategoryTotal =
    document.getElementById(
        "adminCategoryTotal"
    );

const adminCategoryActive =
    document.getElementById(
        "adminCategoryActive"
    );

const adminCategoryInactive =
    document.getElementById(
        "adminCategoryInactive"
    );


/*==================================================
FEATURE: CATEGORY STATE
==================================================*/

let categories = [];

let categorySearchTerm = "";

let categoryFilterStatus = "all";


/*==================================================
FEATURE: CATEGORY SLUG GENERATOR
==================================================*/

function generateCategorySlug(name) {

    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(
            /[^\p{L}\p{N}]+/gu,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


/*==================================================
FEATURE: OPEN CATEGORY MODAL
==================================================*/

function openCategoryModal(category = null) {

    if (!categoryModal) {
        return;
    }


    categoryModal.hidden = false;

    document.body.classList.add(
        "category-modal-open"
    );


    if (category) {

        categoryModalTitle.textContent =
            "Edit Category";


        editingCategoryId.value =
            category.id || "";


        categoryName.value =
            category.name || "";


        categorySlug.value =
            category.slug || "";


        categoryDescription.value =
            category.description || "";


        categoryImageUrl.value =
            category.imageUrl || "";


        categoryIcon.value =
            category.icon ||
            "fa-solid fa-layer-group";


        categorySortOrder.value =
            Number.isFinite(
                Number(category.sortOrder)
            )
                ? Number(category.sortOrder)
                : 0;


        categoryActive.checked =
            category.active !== false;

    }

    else {

        categoryModalTitle.textContent =
            "Add Category";


        categoryForm.reset();


        editingCategoryId.value =
            "";


        categoryIcon.value =
            "fa-solid fa-layer-group";


        categorySortOrder.value =
            "0";


        categoryActive.checked =
            true;

    }


    setTimeout(() => {

        categoryName.focus();

    }, 50);

}


/*==================================================
FEATURE: CLOSE CATEGORY MODAL
==================================================*/

function closeCategoryModalWindow() {

    if (!categoryModal) {
        return;
    }


    categoryModal.hidden = true;

    document.body.classList.remove(
        "category-modal-open"
    );


    categoryForm.reset();

    editingCategoryId.value = "";

}


/*==================================================
FEATURE: ADD CATEGORY BUTTONS
==================================================*/

if (addCategoryButton) {

    addCategoryButton.addEventListener(
        "click",
        () => {

            openCategoryModal();

        }
    );

}


if (emptyAddCategoryButton) {

    emptyAddCategoryButton.addEventListener(
        "click",
        () => {

            openCategoryModal();

        }
    );

}


if (closeCategoryModal) {

    closeCategoryModal.addEventListener(
        "click",
        closeCategoryModalWindow
    );

}


if (cancelCategoryButton) {

    cancelCategoryButton.addEventListener(
        "click",
        closeCategoryModalWindow
    );

}


if (categoryModalOverlay) {

    categoryModalOverlay.addEventListener(
        "click",
        closeCategoryModalWindow
    );

}


/*==================================================
FEATURE: ESCAPE MODAL
==================================================*/

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            categoryModal &&
            !categoryModal.hidden
        ) {

            closeCategoryModalWindow();

        }

    }
);


/*==================================================
FEATURE: AUTO SLUG
==================================================*/

if (categoryName) {

    categoryName.addEventListener(
        "input",
        () => {

            if (
                !editingCategoryId.value
            ) {

                categorySlug.value =
                    generateCategorySlug(
                        categoryName.value
                    );

            }

        }
    );

}


/*==================================================
FEATURE: SAVE CATEGORY
==================================================*/

if (categoryForm) {

    categoryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                categoryName.value.trim();


            if (!name) {

                showToast(
                    "Category name is required."
                );

                categoryName.focus();

                return;

            }


            const slug =
                categorySlug.value.trim() ||
                generateCategorySlug(name);


            const description =
                categoryDescription.value.trim();


            const imageUrl =
                categoryImageUrl.value.trim();


            const icon =
                categoryIcon.value.trim() ||
                "fa-solid fa-layer-group";


            const sortOrder =
                Math.max(
                    0,
                    Number(
                        categorySortOrder.value
                    ) || 0
                );


            const active =
                categoryActive.checked;


            const categoryId =
                editingCategoryId.value.trim();


            const saveButton =
                document.getElementById(
                    "saveCategoryButton"
                );


            try {

                if (saveButton) {

                    saveButton.disabled = true;

                    saveButton.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

                }


                /*==================================================
                FEATURE: EDIT CATEGORY
                ==================================================*/

                if (categoryId) {

                    const categoryRef =
                        ref(
                            db,
                            `smartbazaar_pro_2/categories/${categoryId}`
                        );


                    await update(
                        categoryRef,
                        {

                            name,

                            slug,

                            description,

                            imageUrl,

                            icon,

                            active,

                            sortOrder,

                            updatedAt:
                                serverTimestamp()

                        }
                    );


                    showToast(
                        "Category updated successfully."
                    );

                }


                /*==================================================
                FEATURE: CREATE CATEGORY
                ==================================================*/

                else {

                    const newCategoryRef =
                        push(
                            categoriesRef
                        );


                    await set(
                        newCategoryRef,
                        {

                            name,

                            slug,

                            description,

                            imageUrl,

                            icon,

                            active,

                            sortOrder,

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }
                    );


                    showToast(
                        "Category created successfully."
                    );

                }


                closeCategoryModalWindow();

            }

            catch (error) {

                console.error(
                    "Category Save Error:",
                    error
                );


                showToast(
                    "Unable to save category."
                );

            }

            finally {

                if (saveButton) {

                    saveButton.disabled = false;

                    saveButton.innerHTML =
                        '<i class="fa-solid fa-floppy-disk"></i> Save Category';

                }

            }

        }
    );

}


/*==================================================
FEATURE: LOAD CATEGORIES
==================================================*/

function loadAdminCategories() {

    if (categoryAdminLoading) {

        categoryAdminLoading.hidden =
            false;

    }


    onValue(
        categoriesRef,
        (snapshot) => {

            const data =
                snapshot.val();


            categories = [];


            if (data) {

                Object.entries(data)
                    .forEach(
                        ([id, category]) => {

                            categories.push({

                                id,

                                ...category

                            });

                        }
                    );

            }


            categories.sort(
                (a, b) => {

                    const orderA =
                        Number(
                            a.sortOrder
                        ) || 0;

                    const orderB =
                        Number(
                            b.sortOrder
                        ) || 0;


                    if (
                        orderA !==
                        orderB
                    ) {

                        return (
                            orderA -
                            orderB
                        );

                    }


                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    );

                }
            );


            updateCategoryStats();

            renderAdminCategories();


            if (categoryAdminLoading) {

                categoryAdminLoading.hidden =
                    true;

            }

        },
        (error) => {

            console.error(
                "Category Load Error:",
                error
            );


            if (categoryAdminLoading) {

                categoryAdminLoading.hidden =
                    true;

            }


            showToast(
                "Unable to load categories."
            );

        }
    );

}


/*==================================================
FEATURE: CATEGORY STATISTICS
==================================================*/

function updateCategoryStats() {

    const total =
        categories.length;


    const active =
        categories.filter(
            (category) =>
                category.active !== false
        ).length;


    const inactive =
        total - active;


    if (adminCategoryTotal) {

        adminCategoryTotal.textContent =
            total;

    }


    if (adminCategoryActive) {

        adminCategoryActive.textContent =
            active;

    }


    if (adminCategoryInactive) {

        adminCategoryInactive.textContent =
            inactive;

    }

}


/*==================================================
FEATURE: FILTER CATEGORIES
==================================================*/

function getFilteredCategories() {

    return categories.filter(
        (category) => {

            const name =
                String(
                    category.name || ""
                ).toLowerCase();


            const description =
                String(
                    category.description || ""
                ).toLowerCase();


            const matchesSearch =
                !categorySearchTerm ||
                name.includes(
                    categorySearchTerm
                ) ||
                description.includes(
                    categorySearchTerm
                );


            const isActive =
                category.active !== false;


            const matchesStatus =
                categoryFilterStatus ===
                    "all"

                    ? true

                    : categoryFilterStatus ===
                        "active"

                        ? isActive

                        : !isActive;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


/*==================================================
FEATURE: RENDER CATEGORY LIST
==================================================*/

function renderAdminCategories() {

    if (!categoryAdminList) {
        return;
    }


    const filtered =
        getFilteredCategories();


    categoryAdminList.innerHTML =
        "";


    if (!filtered.length) {

        if (categoryAdminEmpty) {

            categoryAdminEmpty.hidden =
                false;

        }


        return;

    }


    if (categoryAdminEmpty) {

        categoryAdminEmpty.hidden =
            true;

    }


    filtered.forEach(
        (category) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "category-admin-card";


            const image =
                category.imageUrl
                    ? `
                        <img
                            src="${escapeAttribute(
                                category.imageUrl
                            )}"
                            alt="${escapeAttribute(
                                category.name || "Category"
                            )}"
                            loading="lazy"
                        >
                      `
                    : `
                        <i class="${
                            escapeAttribute(
                                category.icon ||
                                "fa-solid fa-layer-group"
                            )
                        }"></i>
                      `;


            const status =
                category.active !== false;


            card.innerHTML = `

                <div class="category-admin-image">

                    ${image}

                </div>


                <div class="category-admin-info">

                    <div class="category-admin-name-row">

                        <h3>
                            ${escapeHTML(
                                category.name ||
                                "Unnamed Category"
                            )}
                        </h3>

                        <span
                            class="
                                category-status-badge
                                ${
                                    status
                                        ? "active"
                                        : "inactive"
                                }
                            "
                        >
                            ${
                                status
                                    ? "Active"
                                    : "Inactive"
                            }
                        </span>

                    </div>


                    <p>
                        ${
                            escapeHTML(
                                category.description ||
                                "No description"
                            )
                        }
                    </p>


                    <div class="category-admin-meta">

                        <span>
                            <i class="fa-solid fa-link"></i>
                            ${
                                escapeHTML(
                                    category.slug ||
                                    ""
                                )
                            }
                        </span>

                        <span>
                            <i class="fa-solid fa-sort"></i>
                            Order:
                            ${
                                Number(
                                    category.sortOrder
                                ) || 0
                            }
                        </span>

                    </div>

                </div>


                <div class="category-admin-actions">

                    <button
                        type="button"
                        class="category-edit-button"
                        data-category-action="edit"
                        data-category-id="${
                            escapeAttribute(
                                category.id
                            )
                        }"
                        title="Edit Category"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="category-toggle-button"
                        data-category-action="toggle"
                        data-category-id="${
                            escapeAttribute(
                                category.id
                            )
                        }"
                        title="${
                            status
                                ? "Deactivate"
                                : "Activate"
                        }"
                    >

                        <i class="fa-solid ${
                            status
                                ? "fa-eye-slash"
                                : "fa-eye"
                        }"></i>

                    </button>


                    <button
                        type="button"
                        class="category-delete-button"
                        data-category-action="delete"
                        data-category-id="${
                            escapeAttribute(
                                category.id
                            )
                        }"
                        title="Delete Category"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;


            categoryAdminList.appendChild(
                card
            );

        }
    );

}


/*==================================================
FEATURE: CATEGORY ACTIONS
==================================================*/

if (categoryAdminList) {

    categoryAdminList.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    "[data-category-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.categoryAction;


            const id =
                button.dataset.categoryId;


            const category =
                categories.find(
                    (item) =>
                        item.id === id
                );


            if (!category) {
                return;
            }


            /*==================================================
            EDIT
            ==================================================*/

            if (action === "edit") {

                openCategoryModal(
                    category
                );

                return;

            }


            /*==================================================
            TOGGLE STATUS
            ==================================================*/

            if (action === "toggle") {

                try {

                    const categoryRef =
                        ref(
                            db,
                            `smartbazaar_pro_2/categories/${id}`
                        );


                    await update(
                        categoryRef,
                        {

                            active:
                                category.active === false,

                            updatedAt:
                                serverTimestamp()

                        }
                    );


                    showToast(
                        category.active === false
                            ? "Category activated."
                            : "Category deactivated."
                    );

                }

                catch (error) {

                    console.error(
                        "Category Status Error:",
                        error
                    );


                    showToast(
                        "Unable to update category status."
                    );

                }


                return;

            }


            /*==================================================
            DELETE
            ==================================================*/

            if (action === "delete") {

                const confirmed =
                    confirm(
                        `Delete "${category.name}"?\n\nThis action cannot be undone.`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    const categoryRef =
                        ref(
                            db,
                            `smartbazaar_pro_2/categories/${id}`
                        );


                    await remove(
                        categoryRef
                    );


                    showToast(
                        "Category deleted successfully."
                    );

                }

                catch (error) {

                    console.error(
                        "Category Delete Error:",
                        error
                    );


                    showToast(
                        "Unable to delete category."
                    );

                }

            }

        }
    );

}


/*==================================================
FEATURE: CATEGORY SEARCH
==================================================*/

if (adminCategorySearch) {

    adminCategorySearch.addEventListener(
        "input",
        () => {

            categorySearchTerm =
                adminCategorySearch.value
                    .trim()
                    .toLowerCase();


            renderAdminCategories();

        }
    );

}


/*==================================================
FEATURE: CATEGORY STATUS FILTER
==================================================*/

if (categoryStatusFilter) {

    categoryStatusFilter.addEventListener(
        "change",
        () => {

            categoryFilterStatus =
                categoryStatusFilter.value;


            renderAdminCategories();

        }
    );

}


/*==================================================
FEATURE: HTML ESCAPING
==================================================*/

function escapeHTML(value) {

    return String(value ?? "")
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


function escapeAttribute(value) {

    return escapeHTML(value);

}


/*==================================================
FEATURE: START CATEGORY MANAGER
==================================================*/

loadAdminCategories();



/*==================================================
SMARTBAZAAR PRO 2
FEATURE: ADMIN SELLER MANAGEMENT
FEATURE: VISIT SELLER ACCOUNT
==================================================*/


/*==================================================
FEATURE: SELLER MANAGEMENT STATE
==================================================*/

let adminSellers = [];

let adminSellerProducts = {};

let selectedSeller = null;


/*==================================================
FEATURE: LOAD SELLERS
==================================================*/

async function loadAdminSellers() {

    const list =
        document.getElementById(
            "sellerManagementList"
        );


    if (!list || !db) {

        return;

    }


    list.innerHTML = `

        <div class="seller-admin-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Loading sellers...
            </span>

        </div>

    `;


    try {

        /*
        Seller profile data is stored at:

        users/{uid}
        */

        const usersSnapshot =
            await get(
                ref(
                    db,
                    "users"
                )
            );


        const usersData =
            usersSnapshot.exists()
                ? usersSnapshot.val()
                : {};


        /*
        Load products because the permanent
        seller connection is:

        products/{productId}/sellerId
        products/{productId}/createdBy
        */

        const productsSnapshot =
            await get(
                ref(
                    db,
                    "products"
                )
            );


        const productsData =
            productsSnapshot.exists()
                ? productsSnapshot.val()
                : {};


        adminSellerProducts = {};

        /*
        Build seller -> product connection.
        */

        Object.entries(
            productsData
        ).forEach(
            ([productKey, product]) => {

                if (!product) {

                    return;

                }


                const sellerId =
                    product.sellerId ||
                    product.createdBy ||
                    "";


                if (!sellerId) {

                    return;

                }


                if (
                    !adminSellerProducts[sellerId]
                ) {

                    adminSellerProducts[sellerId] = [];

                }


                adminSellerProducts[
                    sellerId
                ].push({

                    ...(product || {}),

                    productId:
                        product.productId ||
                        productKey

                });

            }
        );


        /*
        Detect sellers.

        Primary method:
        role / accountType / userType / isSeller

        Fallback:
        user is referenced by a product
        through sellerId or createdBy.
        */

        adminSellers =
            Object.entries(
                usersData
            )
            .map(
                ([uid, user]) => {

                    const profile =
                        user || {};


                    const role =
                        String(
                            profile.role ||
                            profile.accountType ||
                            profile.userType ||
                            ""
                        )
                        .trim()
                        .toLowerCase();


                    const sellerFlag =
                        profile.isSeller === true;


                    const hasSellerProducts =
                        Boolean(
                            adminSellerProducts[uid] &&
                            adminSellerProducts[uid].length
                        );


                    const isSeller =
                        role === "seller" ||
                        sellerFlag ||
                        hasSellerProducts;


                    if (!isSeller) {

                        return null;

                    }


                    return {

                        ...profile,

                        uid,

                        _sellerProductCount:
                            (
                                adminSellerProducts[uid] ||
                                []
                            ).length

                    };

                }
            )
            .filter(Boolean);


        /*
        Newest / active sellers first where
        possible.
        */

        adminSellers.sort(
            (a, b) => {

                return (
                    Number(
                        b.createdAt ||
                        b.registeredAt ||
                        0
                    ) -
                    Number(
                        a.createdAt ||
                        a.registeredAt ||
                        0
                    )
                );

            }
        );


        renderAdminSellers();

        updateAdminSellerStats();

    } catch (error) {

        console.error(
            "Admin seller loading error:",
            error
        );


        list.innerHTML = `

            <div class="seller-admin-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to Load Sellers
                </h3>

                <p>
                    Please check Firebase Database rules.
                </p>

            </div>

        `;

    }

}


/*==================================================
FEATURE: RENDER SELLERS
==================================================*/

function renderAdminSellers(
    searchTerm = ""
) {

    const list =
        document.getElementById(
            "sellerManagementList"
        );


    if (!list) {

        return;

    }


    const search =
        String(
            searchTerm || ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        adminSellers.filter(
            seller => {

                if (!search) {

                    return true;

                }


                const name =
                    String(
                        seller.fullName ||
                        seller.name ||
                        seller.displayName ||
                        ""
                    )
                    .toLowerCase();


                const email =
                    String(
                        seller.email ||
                        ""
                    )
                    .toLowerCase();


                const uid =
                    String(
                        seller.uid ||
                        ""
                    )
                    .toLowerCase();


                const city =
                    String(
                        seller.city ||
                        ""
                    )
                    .toLowerCase();


                return (
                    name.includes(search) ||
                    email.includes(search) ||
                    uid.includes(search) ||
                    city.includes(search)
                );

            }
        );


    if (!filtered.length) {

        list.innerHTML = `

            <div class="seller-admin-empty">

                <i class="fa-solid fa-store-slash"></i>

                <h3>
                    No Sellers Found
                </h3>

                <p>
                    No seller accounts match your search.
                </p>

            </div>

        `;

        return;

    }


    list.innerHTML =
        filtered
            .map(
                seller =>
                    adminSellerCardHTML(
                        seller
                    )
            )
            .join("");

}


/*==================================================
FEATURE: SELLER CARD
==================================================*/

function adminSellerCardHTML(
    seller
) {

    const name =
        seller.fullName ||
        seller.name ||
        seller.displayName ||
        seller.email?.split("@")[0] ||
        "Seller";


    const email =
        seller.email ||
        "Email unavailable";


    const city =
        seller.city ||
        "City unavailable";


    const photoURL =
        seller.photoURL ||
        "";


    const productCount =
        Number(
            seller._sellerProductCount || 0
        );


    const initial =
        getAdminSellerInitial(
            name
        );


    return `

        <article
            class="seller-admin-card"
            data-seller-uid="${escapeAttribute(
                seller.uid
            )}"
        >

            <div class="seller-admin-avatar">

                ${
                    photoURL
                        ? `

                            <img
                                src="${escapeAttribute(
                                    photoURL
                                )}"
                                alt="${escapeAttribute(
                                    name
                                )}"
                                loading="lazy"
                            >

                        `
                        : `

                            <span>
                                ${escapeHTML(initial)}
                            </span>

                        `
                }

            </div>


            <div class="seller-admin-info">

                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(email)}
                </p>


                <div class="seller-admin-meta">

                    <span>

                        <i class="fa-solid fa-location-dot"></i>

                        ${escapeHTML(city)}

                    </span>


                    <span class="seller-admin-products-count">

                        <i class="fa-solid fa-box"></i>

                        ${productCount}
                        Product${productCount === 1 ? "" : "s"}

                    </span>

                </div>

            </div>


            <button
                type="button"
                class="visit-seller-account-button"
                data-visit-seller="${escapeAttribute(
                    seller.uid
                )}"
            >

                <i class="fa-solid fa-user"></i>

                Visit Account

            </button>

        </article>

    `;

}


/*==================================================
FEATURE: SELLER INITIAL
==================================================*/

function getAdminSellerInitial(
    name
) {

    const value =
        String(
            name || "S"
        )
        .trim();


    return value
        ? value.charAt(0).toUpperCase()
        : "S";

}


/*==================================================
FEATURE: UPDATE SELLER STATS
==================================================*/

function updateAdminSellerStats() {

    const sellerCount =
        document.getElementById(
            "adminSellerCount"
        );


    const productCount =
        document.getElementById(
            "adminSellerProductCount"
        );


    if (sellerCount) {

        sellerCount.textContent =
            String(
                adminSellers.length
            );

    }


    if (productCount) {

        const total =
            Object.values(
                adminSellerProducts
            )
            .reduce(
                (
                    total,
                    products
                ) =>
                    total +
                    products.length,
                0
            );


        productCount.textContent =
            String(total);

    }

}


/*==================================================
FEATURE: OPEN SELLER ACCOUNT
==================================================*/

async function openAdminSellerAccount(
    sellerUID
) {

    if (
        !sellerUID ||
        !db
    ) {

        return;

    }


    try {

        const seller =
            adminSellers.find(
                item =>
                    String(item.uid) ===
                    String(sellerUID)
            );


        if (!seller) {

            return;

        }


        selectedSeller =
            seller;


        const modal =
            document.getElementById(
                "sellerAccountModal"
            );


        if (!modal) {

            return;

        }


        renderAdminSellerProfile(
            seller
        );


        const sellerProducts =
            adminSellerProducts[
                seller.uid
            ] || [];


        renderAdminSellerProducts(
            sellerProducts
        );


        /*
        Load seller-related orders.
        This does NOT sign in as seller.
        */

        const sellerOrders =
            await loadAdminSellerOrders(
                seller.uid
            );


        renderAdminSellerStatsModal(
            sellerProducts,
            sellerOrders
        );


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );

    } catch (error) {

        console.error(
            "Open seller account error:",
            error
        );

        alert(
            "Unable to open seller account."
        );

    }

}


/*==================================================
FEATURE: RENDER SELLER PROFILE
==================================================*/

function renderAdminSellerProfile(
    seller
) {

    const name =
        seller.fullName ||
        seller.name ||
        seller.displayName ||
        seller.email?.split("@")[0] ||
        "Seller";


    const email =
        seller.email ||
        "—";


    const phone =
        seller.phone ||
        "—";


    const city =
        seller.city ||
        "—";


    const uid =
        seller.uid ||
        "—";


    const avatarImage =
        document.getElementById(
            "sellerAccountAvatarImage"
        );


    const avatarLetter =
        document.getElementById(
            "sellerAccountAvatarLetter"
        );


    if (
        avatarImage &&
        seller.photoURL
    ) {

        avatarImage.src =
            seller.photoURL;

        avatarImage.hidden =
            false;


        if (avatarLetter) {

            avatarLetter.hidden =
                true;

        }

    } else {

        if (avatarImage) {

            avatarImage.hidden =
                true;

            avatarImage.removeAttribute(
                "src"
            );

        }


        if (avatarLetter) {

            avatarLetter.hidden =
                false;

            avatarLetter.textContent =
                getAdminSellerInitial(
                    name
                );

        }

    }


    setAdminSellerText(
        "sellerAccountName",
        name
    );


    setAdminSellerText(
        "sellerAccountEmail",
        email
    );


    setAdminSellerText(
        "sellerInfoName",
        name
    );


    setAdminSellerText(
        "sellerInfoEmail",
        email
    );


    setAdminSellerText(
        "sellerInfoPhone",
        phone
    );


    setAdminSellerText(
        "sellerInfoCity",
        city
    );


    setAdminSellerText(
        "sellerInfoUID",
        uid
    );

}


/*==================================================
FEATURE: SAFE SELLER TEXT
==================================================*/

function setAdminSellerText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value || "—";

    }

}


/*==================================================
FEATURE: LOAD SELLER ORDERS
==================================================*/

async function loadAdminSellerOrders(
    sellerUID
) {

    if (!db || !sellerUID) {

        return [];

    }


    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "orders"
                )
            );


        if (!snapshot.exists()) {

            return [];

        }


        const data =
            snapshot.val();


        return Object.entries(
            data
        )
        .map(
            ([key, order]) => ({

                ...(order || {}),

                _key: key

            })
        )
        .filter(
            order =>
                sellerOrderBelongsToUser(
                    order,
                    sellerUID
                )
        );

    } catch (error) {

        console.warn(
            "Seller orders could not be loaded:",
            error
        );


        return [];

    }

}


/*==================================================
FEATURE: CHECK SELLER ORDER OWNER
==================================================*/

function sellerOrderBelongsToUser(
    order,
    sellerUID
) {

    if (!order || !sellerUID) {

        return false;

    }


    const possibleSellerUIDs = [

        order.sellerId,

        order.sellerUID,

        order.vendorId,

        order.vendorUID,

        order.merchantId,

        order.merchantUID

    ];


    /*
    Direct seller order.
    */

    if (
        possibleSellerUIDs.some(
            value =>
                value &&
                String(value) ===
                String(sellerUID)
        )
    ) {

        return true;

    }


    /*
    Multi-product order support.
    */

    if (
        Array.isArray(order.items)
    ) {

        return order.items.some(
            item => {

                const itemSellerId =
                    item?.sellerId ||
                    item?.sellerUID ||
                    item?.vendorId ||
                    item?.vendorUID ||
                    item?.merchantId ||
                    item?.merchantUID;


                return (
                    itemSellerId &&
                    String(itemSellerId) ===
                    String(sellerUID)
                );

            }
        );

    }


    return false;

}


/*==================================================
FEATURE: SELLER MODAL STATISTICS
==================================================*/

function renderAdminSellerStatsModal(
    products,
    orders
) {

    const productCount =
        products.length;


    const orderCount =
        orders.length;


    /*
    Calculate visible seller sales only
    when an order has a recognized total.
    */

    let sales =
        0;


    orders.forEach(
        order => {

            const total =
                Number(
                    order.sellerTotal ??
                    order.sellerAmount ??
                    order.total ??
                    order.totalAmount ??
                    order.grandTotal ??
                    0
                );


            if (
                Number.isFinite(total)
            ) {

                sales += total;

            }

        }
    );


    setAdminSellerText(
        "sellerStatProducts",
        productCount
    );


    setAdminSellerText(
        "sellerStatOrders",
        orderCount
    );


    setAdminSellerText(
        "sellerStatSales",
        `Rs ${formatAdminMoney(sales)}`
    );

}


/*==================================================
FEATURE: SELLER PRODUCTS
==================================================*/

function renderAdminSellerProducts(
    products
) {

    const container =
        document.getElementById(
            "sellerAccountProducts"
        );


    if (!container) {

        return;

    }


    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="seller-account-products-empty">

                <i class="fa-solid fa-box-open"></i>

                <p>
                    This seller has no products yet.
                </p>

            </div>

        `;

        return;

    }


    const visibleProducts =
        products.slice(
            0,
            9
        );


    container.innerHTML =
        visibleProducts
            .map(
                product =>
                    adminSellerProductHTML(
                        product
                    )
            )
            .join("");

}


/*==================================================
FEATURE: SELLER PRODUCT CARD
==================================================*/

function adminSellerProductHTML(
    product
) {

    const name =
        product.name ||
        product.title ||
        "Unnamed Product";


    const image =
        product.image ||
        (
            Array.isArray(
                product.images
            )
                ? product.images[0]
                : ""
        ) ||
        product.imageUrl ||
        product.thumbnail ||
        "";


    const price =
        Number(
            product.price ||
            product.salePrice ||
            0
        );


    return `

        <article
            class="seller-account-product-card"
        >

            <div class="seller-account-product-image">

                ${
                    image
                        ? `

                            <img
                                src="${escapeAttribute(
                                    image
                                )}"
                                alt="${escapeAttribute(
                                    name
                                )}"
                                loading="lazy"
                            >

                        `
                        : `

                            <div class="seller-account-product-no-image">

                                <i class="fa-solid fa-image"></i>

                            </div>

                        `
                }

            </div>


            <div class="seller-account-product-info">

                <h4>
                    ${escapeHTML(name)}
                </h4>


                <div class="seller-account-product-price">

                    Rs ${formatAdminMoney(price)}

                </div>

            </div>

        </article>

    `;

}


/*==================================================
FEATURE: FORMAT ADMIN MONEY
==================================================*/

function formatAdminMoney(
    value
) {

    return (
        Number(value) || 0
    ).toLocaleString(
        "en-PK",
        {
            maximumFractionDigits: 2
        }
    );

}


/*==================================================
FEATURE: CLOSE SELLER ACCOUNT
==================================================*/

function closeAdminSellerAccount() {

    const modal =
        document.getElementById(
            "sellerAccountModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    selectedSeller =
        null;

}


/*==================================================
FEATURE: SELLER MANAGEMENT EVENTS
==================================================*/

function setupAdminSellerManagement() {

    const searchInput =
        document.getElementById(
            "sellerSearchInput"
        );


    const list =
        document.getElementById(
            "sellerManagementList"
        );


    const modal =
        document.getElementById(
            "sellerAccountModal"
        );


    const closeButton =
        document.getElementById(
            "closeSellerAccountModal"
        );


    /*
    Search.
    */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                renderAdminSellers(
                    searchInput.value
                );

            }
        );

    }


    /*
    Visit seller account.
    */

    if (list) {

        list.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-visit-seller]"
                    );


                if (!button) {

                    return;

                }


                const sellerUID =
                    button.dataset.visitSeller;


                openAdminSellerAccount(
                    sellerUID
                );

            }
        );

    }


    /*
    Close button.
    */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAdminSellerAccount
        );

    }


    /*
    Overlay close.
    */

    if (modal) {

        const overlay =
            modal.querySelector(
                ".modal-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeAdminSellerAccount
            );

        }

    }


    /*
    Escape key.
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                closeAdminSellerAccount();

            }

        }
    );

}


/*==================================================
FEATURE: INITIALIZE SELLER MANAGEMENT
==================================================*/

function initializeAdminSellerManagement() {

    setupAdminSellerManagement();

    loadAdminSellers();

}


/*==================================================
FEATURE: OPEN SELLER MANAGEMENT WHEN USERS SECTION OPENS
==================================================*/

const originalAdminOpenSection =
    typeof openSection === "function"
        ? openSection
        : null;


/*
Initialize after DOM is ready.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAdminSellerManagement();

    }
);

