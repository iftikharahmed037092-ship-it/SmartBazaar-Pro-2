/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FLASH SALE ADMIN CONTROLLER
FILE: js/flash-sale-admin.js

UPDATED FOR:
- Current admin-panel.html
- Integrated Flash Sale section
- Existing "products" Firebase path
- Existing SmartBazaar Pro 2 Firebase config

IMPORTANT:
- Does NOT create a new Firebase path.
- Does NOT overwrite existing product data.
- Does NOT invent Flash Sale Firebase fields.
- Save campaign connection remains pending until
  the final Flash Sale data structure is confirmed.
==================================================*/


import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    database,
    auth
} from "./firebase-config.js";


/*==================================================
CONFIGURATION
==================================================*/

const PRODUCTS_PATH = "products";

const ADMIN_EMAIL =
    "iftikharahmed037092@gmail.com";


/*==================================================
STATE
==================================================*/

let allProducts = [];

let filteredProducts = [];

let selectedProducts = new Set();

let currentSearch = "";

let currentCategory = "all";

let currentFilter = "all";

let editingProductId = null;

let isAdmin = false;

let initialized = false;

let productsUnsubscribe = null;


/*==================================================
DOM HELPERS
==================================================*/

function getElement(...selectors) {

    for (const selector of selectors) {

        const element =
            document.querySelector(selector);

        if (element) {
            return element;
        }

    }

    return null;

}


function getElements(...selectors) {

    for (const selector of selectors) {

        const elements =
            document.querySelectorAll(selector);

        if (elements.length) {
            return Array.from(elements);
        }

    }

    return [];

}


/*==================================================
ESCAPE HTML
==================================================*/

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
NUMBER FORMAT
==================================================*/

function formatNumber(value) {

    const number =
        Number(value) || 0;

    return number.toLocaleString();

}


/*==================================================
PRICE FORMAT
==================================================*/

function formatPrice(value) {

    const number =
        Number(value) || 0;

    return `Rs. ${number.toLocaleString()}`;

}


/*==================================================
TOAST
==================================================*/

function showFlashSaleToast(
    message,
    type = "success"
) {

    const existingToast =
        document.querySelector(
            ".flash-sale-admin-toast"
        );

    if (existingToast) {
        existingToast.remove();
    }


    const toast =
        document.createElement("div");

    toast.className =
        `flash-sale-admin-toast ${type}`;


    let icon =
        "fa-solid fa-circle-check";


    if (type === "error") {

        icon =
            "fa-solid fa-circle-exclamation";

    } else if (type === "warning") {

        icon =
            "fa-solid fa-triangle-exclamation";

    }


    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;


    document.body.appendChild(toast);


    requestAnimationFrame(() => {

        toast.classList.add("show");

    });


    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            if (toast.parentNode) {
                toast.remove();
            }

        }, 300);

    }, 2800);

}


/*==================================================
PRODUCT HELPERS
==================================================*/

function getProductId(
    product,
    firebaseKey = ""
) {

    return String(
        product?.productId ||
        firebaseKey ||
        ""
    );

}


function getProductName(product) {

    return (
        product?.name ||
        product?.productName ||
        product?.title ||
        "Unnamed Product"
    );

}


function getProductImage(product) {

    if (!product) {
        return "";
    }


    if (
        typeof product.image === "string" &&
        product.image.trim()
    ) {

        return product.image;

    }


    if (
        typeof product.imageUrl === "string" &&
        product.imageUrl.trim()
    ) {

        return product.imageUrl;

    }


    if (
        typeof product.thumbnail === "string" &&
        product.thumbnail.trim()
    ) {

        return product.thumbnail;

    }


    if (Array.isArray(product.images)) {

        const firstImage =
            product.images.find(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );

        if (firstImage) {
            return firstImage;
        }

    }


    if (
        product.images &&
        typeof product.images === "object"
    ) {

        const imageValues =
            Object.values(product.images);


        const firstImage =
            imageValues.find(
                image =>
                    typeof image === "string" &&
                    image.trim()
            );


        if (firstImage) {
            return firstImage;
        }

    }


    return "";

}


function getProductPrice(product) {

    return Number(
        product?.price ??
        product?.salePrice ??
        product?.currentPrice ??
        0
    );

}


function getProductOldPrice(product) {

    return Number(
        product?.oldPrice ??
        product?.originalPrice ??
        product?.regularPrice ??
        product?.compareAtPrice ??
        0
    );

}


function getProductStock(product) {

    const value =
        product?.stock ??
        product?.stockQuantity ??
        product?.quantity ??
        0;

    return Number(value) || 0;

}


function getProductCategory(product) {

    return (
        product?.category ||
        "Uncategorized"
    );

}


/*==================================================
FLASH SALE STATUS
==================================================*/

function getProductStatus(product) {

    if (!product) {
        return "inactive";
    }


    if (product.published !== true) {
        return "inactive";
    }


    /*
     * Read-only compatibility checks.
     *
     * No field is created or changed here.
     */

    const activeFlag =
        product.flashSale ??
        product.isFlashSale ??
        product.flash_sale ??
        product.flashSaleActive;


    if (activeFlag === true) {
        return "active";
    }


    const saleType =
        String(
            product.saleType || ""
        ).trim().toLowerCase();


    if (
        saleType === "flash-sale" ||
        saleType === "flash sale" ||
        saleType === "flashsale"
    ) {

        return "active";

    }


    return "inactive";

}


/*==================================================
NORMALIZE PRODUCT
==================================================*/

function normalizeProduct(
    product,
    firebaseKey
) {

    const productId =
        getProductId(
            product,
            firebaseKey
        );


    return {

        ...product,

        productId,

        name:
            getProductName(product),

        image:
            getProductImage(product),

        price:
            getProductPrice(product),

        oldPrice:
            getProductOldPrice(product),

        stock:
            getProductStock(product),

        category:
            getProductCategory(product),

        status:
            getProductStatus(product)

    };

}


/*==================================================
LOAD PRODUCTS
==================================================*/

function loadProducts() {

    const productsRef =
        ref(
            database,
            PRODUCTS_PATH
        );


    if (typeof productsUnsubscribe === "function") {

        productsUnsubscribe();

    }


    productsUnsubscribe =
        onValue(
            productsRef,
            snapshot => {

                const data =
                    snapshot.val() || {};


                allProducts =
                    Object.entries(data)
                        .map(
                            ([firebaseKey, product]) =>
                                normalizeProduct(
                                    product || {},
                                    firebaseKey
                                )
                        )
                        .filter(
                            product =>
                                product.productId
                        );


                cleanupSelectedProducts();

                buildCategoryFilter();

                applyProductFilters();

                updateAdminStats();

                updateCampaignPreview();

            },
            error => {

                console.error(
                    "Flash Sale Admin products error:",
                    error
                );


                showFlashSaleError(
                    "Products load نہیں ہو سکے۔"
                );

            }
        );

}


/*==================================================
CLEAN INVALID SELECTIONS
==================================================*/

function cleanupSelectedProducts() {

    const validIds =
        new Set(
            allProducts.map(
                product =>
                    product.productId
            )
        );


    selectedProducts =
        new Set(
            Array.from(
                selectedProducts
            )
            .filter(
                id =>
                    validIds.has(id)
            )
        );


    updateSelectedCount();

}


/*==================================================
BUILD CATEGORY FILTER
==================================================*/

function buildCategoryFilter() {

    const categorySelect =
        getElement(
            "#flashSaleProductCategory"
        );


    if (!categorySelect) {
        return;
    }


    const currentValue =
        categorySelect.value ||
        currentCategory ||
        "all";


    const categories =
        Array.from(
            new Set(
                allProducts
                    .map(
                        product =>
                            getProductCategory(product)
                    )
                    .filter(Boolean)
            )
        )
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    categorySelect.innerHTML = `
        <option value="all">
            All Categories
        </option>

        ${
            categories
                .map(
                    category => `
                        <option
                            value="${escapeHtml(category)}"
                        >
                            ${escapeHtml(category)}
                        </option>
                    `
                )
                .join("")
        }
    `;


    const categoryExists =
        categories.includes(
            currentValue
        );


    categorySelect.value =
        categoryExists
            ? currentValue
            : "all";


    currentCategory =
        categorySelect.value;

}


/*==================================================
FILTER PRODUCTS
==================================================*/

function applyProductFilters() {

    const search =
        currentSearch
            .trim()
            .toLowerCase();


    filteredProducts =
        allProducts.filter(product => {

            const name =
                getProductName(product)
                    .toLowerCase();


            const category =
                getProductCategory(product)
                    .toLowerCase();


            const productId =
                String(
                    product.productId || ""
                )
                .toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                category.includes(search) ||
                productId.includes(search);


            if (!matchesSearch) {
                return false;
            }


            if (
                currentCategory !== "all" &&
                getProductCategory(product) !==
                    currentCategory
            ) {

                return false;

            }


            if (currentFilter === "active") {

                return (
                    product.status ===
                    "active"
                );

            }


            if (currentFilter === "inactive") {

                return (
                    product.status ===
                    "inactive"
                );

            }


            if (currentFilter === "published") {

                return (
                    product.published === true
                );

            }


            if (currentFilter === "unpublished") {

                return (
                    product.published !== true
                );

            }


            return true;

        });


    renderProductList();

}


/*==================================================
SEARCH SETUP
==================================================*/

function setupSearch() {

    const searchInput =
        getElement(
            "#flashSaleProductSearch",
            "#flashSaleAdminSearch",
            "#flashSaleSearch",
            ".flash-sale-admin-search input"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value || "";


            applyProductFilters();

        }
    );

}


/*==================================================
CATEGORY SETUP
==================================================*/

function setupCategoryFilter() {

    const categorySelect =
        getElement(
            "#flashSaleProductCategory"
        );


    if (!categorySelect) {
        return;
    }


    categorySelect.addEventListener(
        "change",
        event => {

            currentCategory =
                event.target.value ||
                "all";


            applyProductFilters();

        }
    );

}


/*==================================================
STATUS FILTER
==================================================*/

function setupStatusFilter() {

    const filter =
        getElement(
            "#flashSaleAdminFilter",
            "#flashSaleStatusFilter",
            ".flash-sale-admin-filter"
        );


    if (!filter) {
        return;
    }


    filter.addEventListener(
        "change",
        event => {

            currentFilter =
                event.target.value ||
                "all";


            applyProductFilters();

        }
    );

}


/*==================================================
RENDER PRODUCT LIST
==================================================*/

function renderProductList() {

    const list =
        getElement(
            "#flashSaleAdminProductList",
            "#flashSaleProductList",
            ".flash-sale-product-list"
        );


    if (!list) {
        return;
    }


    if (!filteredProducts.length) {

        list.innerHTML = `
            <div class="flash-sale-admin-empty">

                <div class="flash-sale-admin-empty-icon">
                    <i class="fa-solid fa-box-open"></i>
                </div>

                <h3>No Products Found</h3>

                <p>
                    Search یا category filter بدل کر دوبارہ کوشش کریں۔
                </p>

            </div>
        `;

        return;

    }


    list.innerHTML =
        filteredProducts
            .map(
                product =>
                    createProductItem(product)
            )
            .join("");


    attachProductActions();

}


/*==================================================
CREATE PRODUCT ITEM
==================================================*/

function createProductItem(product) {

    const productId =
        product.productId;


    const selected =
        selectedProducts.has(
            productId
        );


    const image =
        getProductImage(product);


    const status =
        product.status;


    const statusLabel =
        status === "active"
            ? "Flash Sale Active"
            : product.published === true
                ? "Published"
                : "Unpublished";


    const discount =
        calculateDiscount(
            product.price,
            product.oldPrice
        );


    return `
        <article
            class="flash-sale-product-item ${
                selected ? "selected" : ""
            }"
            data-product-id="${escapeHtml(productId)}"
        >

            <div class="flash-sale-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(product.name)}"
                                loading="lazy"
                            >
                        `
                        : `
                            <i class="fa-solid fa-image"></i>
                        `
                }

            </div>


            <div class="flash-sale-product-info">

                <h4 class="flash-sale-product-name">
                    ${escapeHtml(product.name)}
                </h4>


                <div class="flash-sale-product-meta">

                    <span>
                        <i class="fa-solid fa-layer-group"></i>
                        ${escapeHtml(product.category)}
                    </span>


                    <span>
                        <i class="fa-solid fa-box"></i>
                        Stock: ${formatNumber(product.stock)}
                    </span>


                    <span class="flash-sale-status ${status}">

                        <i class="fa-solid fa-circle"></i>

                        ${escapeHtml(statusLabel)}

                    </span>

                </div>


                <div class="flash-sale-product-price">

                    ${formatPrice(product.price)}

                    ${
                        product.oldPrice > 0
                            ? `
                                <del>
                                    ${formatPrice(product.oldPrice)}
                                </del>
                            `
                            : ""
                    }

                    ${
                        discount > 0
                            ? `
                                <small>
                                    ${discount}% OFF
                                </small>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="flash-sale-product-action">

                <button
                    type="button"
                    class="flash-sale-select-button"
                    data-action="select"
                    data-product-id="${escapeHtml(productId)}"
                    aria-label="${
                        selected
                            ? "Remove product"
                            : "Select product"
                    }"
                    title="${
                        selected
                            ? "Remove"
                            : "Select"
                    }"
                >

                    <i class="fa-solid ${
                        selected
                            ? "fa-check"
                            : "fa-plus"
                    }"></i>

                </button>


                <button
                    type="button"
                    class="flash-sale-edit-button"
                    data-action="edit"
                    data-product-id="${escapeHtml(productId)}"
                    aria-label="Edit Flash Sale"
                    title="Edit"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>

            </div>

        </article>
    `;

}


/*==================================================
PRODUCT ACTIONS
==================================================*/

function attachProductActions() {

    const buttons =
        getElements(
            ".flash-sale-product-action button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const productId =
                    button.dataset.productId;


                const action =
                    button.dataset.action;


                if (!productId) {
                    return;
                }


                if (action === "select") {

                    toggleProductSelection(
                        productId
                    );

                    return;

                }


                if (action === "edit") {

                    openProductEditor(
                        productId
                    );

                }

            }
        );

    });


    const productItems =
        getElements(
            ".flash-sale-product-item"
        );


    productItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "button"
                    )
                ) {
                    return;
                }


                const productId =
                    item.dataset.productId;


                if (productId) {

                    toggleProductSelection(
                        productId
                    );

                }

            }
        );

    });

}


/*==================================================
SELECT PRODUCT
==================================================*/

function toggleProductSelection(
    productId
) {

    if (
        selectedProducts.has(
            productId
        )
    ) {

        selectedProducts.delete(
            productId
        );

    } else {

        selectedProducts.add(
            productId
        );

    }


    renderProductList();

    renderSelectedProducts();

    updateSelectedCount();

    updateAdminStats();

    updateCampaignPreview();

}


/*==================================================
SELECT ALL VISIBLE
==================================================*/

function selectAllVisibleProducts() {

    filteredProducts.forEach(
        product => {

            selectedProducts.add(
                product.productId
            );

        }
    );


    renderProductList();

    renderSelectedProducts();

    updateSelectedCount();

    updateAdminStats();

    updateCampaignPreview();

}


/*==================================================
CLEAR SELECTION
==================================================*/

function clearProductSelection() {

    selectedProducts.clear();

    renderProductList();

    renderSelectedProducts();

    updateSelectedCount();

    updateAdminStats();

    updateCampaignPreview();

}


/*==================================================
SELECTION BUTTONS
==================================================*/

function setupSelectionButtons() {

    const selectAllButton =
        getElement(
            "#flashSaleSelectAll",
            ".flash-sale-select-all"
        );


    const clearButton =
        getElement(
            "#flashSaleClearSelection",
            ".flash-sale-clear-selection"
        );


    if (selectAllButton) {

        selectAllButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                selectAllVisibleProducts();

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                clearProductSelection();

            }
        );

    }

}


/*==================================================
SELECTED COUNT
==================================================*/

function updateSelectedCount() {

    const elements =
        getElements(
            "#flashSaleSelectedCount",
            ".flash-sale-selected-count"
        );


    elements.forEach(element => {

        element.textContent =
            `${formatNumber(
                selectedProducts.size
            )} selected`;

    });

}


/*==================================================
RENDER SELECTED PRODUCTS
==================================================*/

function renderSelectedProducts() {

    const container =
        getElement(
            "#flashSaleSelectedProducts"
        );


    if (!container) {
        return;
    }


    const selected =
        Array.from(
            selectedProducts
        )
        .map(
            id =>
                allProducts.find(
                    product =>
                        product.productId === id
                )
        )
        .filter(Boolean);


    if (!selected.length) {

        container.innerHTML = `
            <div class="flash-sale-admin-empty">

                <div class="flash-sale-empty-icon">
                    ⚡
                </div>

                <h3>No Flash Sale Products</h3>

                <p>
                    Select products above to add them
                    to the Flash Sale.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        selected
            .map(
                product =>
                    createSelectedProductCard(
                        product
                    )
            )
            .join("");


    attachSelectedProductActions();

}


/*==================================================
SELECTED PRODUCT CARD
==================================================*/

function createSelectedProductCard(
    product
) {

    const image =
        getProductImage(product);


    const discount =
        calculateDiscount(
            product.price,
            product.oldPrice
        );


    return `
        <article
            class="flash-sale-selected-product"
            data-product-id="${escapeHtml(
                product.productId
            )}"
        >

            <div class="flash-sale-selected-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(product.name)}"
                                loading="lazy"
                            >
                        `
                        : `
                            <i class="fa-solid fa-image"></i>
                        `
                }

            </div>


            <div class="flash-sale-selected-product-info">

                <h4>
                    ${escapeHtml(product.name)}
                </h4>


                <span>
                    ${escapeHtml(product.category)}
                </span>


                <strong>
                    ${formatPrice(product.price)}
                </strong>


                ${
                    discount > 0
                        ? `
                            <small>
                                ${discount}% OFF
                            </small>
                        `
                        : ""
                }

            </div>


            <button
                type="button"
                class="flash-sale-remove-selected"
                data-product-id="${escapeHtml(
                    product.productId
                )}"
                aria-label="Remove product"
                title="Remove"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>

        </article>
    `;

}


/*==================================================
SELECTED PRODUCT ACTIONS
==================================================*/

function attachSelectedProductActions() {

    const buttons =
        getElements(
            ".flash-sale-remove-selected"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const productId =
                    button.dataset.productId;


                if (!productId) {
                    return;
                }


                selectedProducts.delete(
                    productId
                );


                renderProductList();

                renderSelectedProducts();

                updateSelectedCount();

                updateAdminStats();

                updateCampaignPreview();

            }
        );

    });

}


/*==================================================
ADMIN STATS
==================================================*/

function updateAdminStats() {

    const activeProducts =
        allProducts.filter(
            product =>
                product.status === "active"
        );


    const hotCount =
        activeProducts.filter(
            product =>
                calculateDiscount(
                    product.price,
                    product.oldPrice
                ) >= 30
        );


    const highestDiscount =
        allProducts.reduce(
            (highest, product) => {

                const discount =
                    calculateDiscount(
                        product.price,
                        product.oldPrice
                    );


                return Math.max(
                    highest,
                    discount
                );

            },
            0
        );


    setText(
        "#flashSaleActiveCount",
        activeProducts.length
    );


    setText(
        "#flashSaleHotCount",
        hotCount.length
    );


    setTextRaw(
        "#flashSaleHighestDiscount",
        `${highestDiscount}%`
    );


    const status =
        getCampaignStatus();


    setTextRaw(
        "#flashSaleStatus",
        status
    );


    setTextRaw(
        "#flashSaleAdminStatus",
        status
    );


    setText(
        "#flashSaleProductCount",
        allProducts.filter(
            product =>
                product.published === true
        ).length
    );


    setText(
        "#flashSaleStockCount",
        activeProducts.reduce(
            (sum, product) =>
                sum +
                Number(product.stock || 0),
            0
        )
    );


    updateSelectedCount();

}


/*==================================================
SET TEXT
==================================================*/

function setText(
    selector,
    value
) {

    const element =
        getElement(selector);


    if (element) {

        element.textContent =
            formatNumber(value);

    }

}


function setTextRaw(
    selector,
    value
) {

    const element =
        getElement(selector);


    if (element) {

        element.textContent =
            String(value);

    }

}


/*==================================================
CAMPAIGN STATUS
==================================================*/

function getCampaignStatus() {

    const enabled =
        getElement(
            "#flashSaleEnabled"
        );


    const start =
        getElement(
            "#flashSaleStart"
        );


    const end =
        getElement(
            "#flashSaleEnd"
        );


    if (!enabled) {
        return "Not Configured";
    }


    if (!enabled.checked) {
        return "Disabled";
    }


    if (
        start?.value &&
        end?.value
    ) {

        const now =
            Date.now();


        const startTime =
            new Date(
                start.value
            ).getTime();


        const endTime =
            new Date(
                end.value
            ).getTime();


        if (
            !Number.isNaN(startTime) &&
            !Number.isNaN(endTime)
        ) {

            if (now < startTime) {
                return "Scheduled";
            }


            if (now >= startTime && now < endTime) {
                return "Active";
            }


            if (now >= endTime) {
                return "Ended";
            }

        }

    }


    return "Enabled";

}


/*==================================================
CAMPAIGN FORM EVENTS
==================================================*/

function setupCampaignForm() {

    const fields = [
        "#flashSaleTitle",
        "#flashSaleSubtitle",
        "#flashSaleStart",
        "#flashSaleEnd",
        "#flashSaleMaxDiscount",
        "#flashSaleEnabled"
    ];


    fields.forEach(selector => {

        const element =
            getElement(selector);


        if (!element) {
            return;
        }


        element.addEventListener(
            "input",
            updateCampaignPreview
        );


        element.addEventListener(
            "change",
            () => {

                updateCampaignPreview();

                updateAdminStats();

            }
        );

    });

}


/*==================================================
CAMPAIGN PREVIEW
==================================================*/

function updateCampaignPreview() {

    updateAdminStats();

    updateSelectedCount();

}


/*==================================================
CALCULATE DISCOUNT
==================================================*/

function calculateDiscount(
    salePrice,
    oldPrice
) {

    const sale =
        Number(salePrice) || 0;


    const old =
        Number(oldPrice) || 0;


    if (
        old <= 0 ||
        sale <= 0 ||
        sale >= old
    ) {

        return 0;

    }


    return Math.round(
        ((old - sale) / old) * 100
    );

}


/*==================================================
OPEN PRODUCT EDITOR
==================================================*/

function openProductEditor(
    productId
) {

    if (!productId) {
        return;
    }


    editingProductId =
        productId;


    const product =
        allProducts.find(
            item =>
                item.productId === productId
        );


    if (!product) {

        showFlashSaleToast(
            "Product نہیں ملا۔",
            "error"
        );

        return;

    }


    populateEditor(product);

    openAdminModal();

}


/*==================================================
POPULATE PRODUCT EDITOR
==================================================*/

function populateEditor(
    product
) {

    const productName =
        getElement(
            "#flashSaleProductName",
            "#flashSaleEditProductName"
        );


    const productId =
        getElement(
            "#flashSaleProductId",
            "#flashSaleEditProductId"
        );


    const price =
        getElement(
            "#flashSaleProductPrice",
            "#flashSaleEditProductPrice"
        );


    const stock =
        getElement(
            "#flashSaleProductStock",
            "#flashSaleEditProductStock"
        );


    const image =
        getElement(
            "#flashSalePreviewImage",
            ".flash-sale-preview-product-image img"
        );


    if (productName) {

        productName.value =
            getProductName(product);

    }


    if (productId) {

        productId.value =
            product.productId;

    }


    if (price) {

        price.value =
            product.price || "";

    }


    if (stock) {

        stock.value =
            product.stock || "";

    }


    if (
        image &&
        getProductImage(product)
    ) {

        image.src =
            getProductImage(product);

        image.alt =
            getProductName(product);

    }


    updateProductPreview(
        product
    );

}


/*==================================================
PRODUCT PREVIEW
==================================================*/

function updateProductPreview(
    product
) {

    if (!product) {
        return;
    }


    const image =
        getProductImage(product);


    const name =
        getProductName(product);


    const price =
        getProductPrice(product);


    const oldPrice =
        getProductOldPrice(product);


    const discount =
        calculateDiscount(
            price,
            oldPrice
        );


    const imageElement =
        getElement(
            "#flashSalePreviewImage",
            ".flash-sale-preview-product-image img"
        );


    const nameElement =
        getElement(
            "#flashSalePreviewName",
            ".flash-sale-preview-product-info strong"
        );


    const priceElement =
        getElement(
            "#flashSalePreviewPrice",
            ".flash-sale-preview-price"
        );


    const discountElement =
        getElement(
            "#flashSalePreviewDiscount",
            ".flash-sale-preview-discount"
        );


    if (
        imageElement &&
        image
    ) {

        imageElement.src =
            image;

        imageElement.alt =
            name;

    }


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    if (priceElement) {

        priceElement.innerHTML = `
            ${formatPrice(price)}

            ${
                oldPrice > price
                    ? `
                        <del>
                            ${formatPrice(oldPrice)}
                        </del>
                    `
                    : ""
            }
        `;

    }


    if (discountElement) {

        discountElement.textContent =
            discount > 0
                ? `${discount}% OFF`
                : "FLASH SALE";

    }


    updatePreviewStock(
        product
    );

}


/*==================================================
PREVIEW STOCK
==================================================*/

function updatePreviewStock(
    product
) {

    const stock =
        Number(
            product?.stock
        ) || 0;


    const stockText =
        getElement(
            "#flashSalePreviewStockText",
            ".flash-sale-stock-header strong"
        );


    const stockFill =
        getElement(
            "#flashSalePreviewStockFill",
            ".flash-sale-stock-fill"
        );


    if (stockText) {

        stockText.textContent =
            `${formatNumber(stock)} available`;

    }


    if (stockFill) {

        /*
         * Preview only.
         *
         * No Firebase value is changed.
         */

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    stock
                )
            );


        stockFill.style.width =
            `${percentage}%`;

    }

}


/*==================================================
ADMIN MODAL
==================================================*/

function openAdminModal() {

    const modal =
        getElement(
            "#flashSaleAdminModal",
            ".flash-sale-admin-modal"
        );


    if (!modal) {

        /*
         * The current admin-panel.html does not yet
         * require a separate modal for basic selection.
         */

        return;

    }


    modal.classList.add("active");

    modal.removeAttribute("hidden");

    document.body.classList.add(
        "flash-sale-admin-modal-open"
    );

}


function closeAdminModal() {

    const modal =
        getElement(
            "#flashSaleAdminModal",
            ".flash-sale-admin-modal"
        );


    if (!modal) {

        editingProductId = null;

        return;

    }


    modal.classList.remove("active");

    modal.setAttribute(
        "hidden",
        ""
    );


    document.body.classList.remove(
        "flash-sale-admin-modal-open"
    );


    editingProductId = null;

}


/*==================================================
MODAL EVENTS
==================================================*/

function setupModal() {

    const closeButton =
        getElement(
            "#flashSaleAdminModalClose",
            ".flash-sale-admin-modal-close"
        );


    const overlay =
        getElement(
            "#flashSaleAdminModalOverlay",
            ".flash-sale-admin-modal-overlay"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeAdminModal();

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeAdminModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeAdminModal();

            }

        }
    );

}


/*==================================================
SAVE FLASH SALE
==================================================*/

function setupSaveButton() {

    const saveButton =
        getElement(
            "#flashSaleSaveButton",
            ".flash-sale-save-button"
        );


    if (!saveButton) {
        return;
    }


    saveButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            handleFlashSaleSave();

        }
    );

}


/*==================================================
FLASH SALE SAVE
==================================================*/

function handleFlashSaleSave() {

    if (!isAdmin) {

        showFlashSaleToast(
            "آپ کو Flash Sale manage کرنے کی اجازت نہیں ہے۔",
            "error"
        );

        return;

    }


    const title =
        getElement(
            "#flashSaleTitle"
        )?.value.trim() || "";


    const subtitle =
        getElement(
            "#flashSaleSubtitle"
        )?.value.trim() || "";


    const start =
        getElement(
            "#flashSaleStart"
        )?.value || "";


    const end =
        getElement(
            "#flashSaleEnd"
        )?.value || "";


    const maxDiscount =
        Number(
            getElement(
                "#flashSaleMaxDiscount"
            )?.value || 0
        );


    const enabled =
        Boolean(
            getElement(
                "#flashSaleEnabled"
            )?.checked
        );


    if (!selectedProducts.size) {

        showFlashSaleToast(
            "کم از کم ایک product منتخب کریں۔",
            "warning"
        );

        return;

    }


    if (
        start &&
        end
    ) {

        const startTime =
            new Date(start).getTime();


        const endTime =
            new Date(end).getTime();


        if (
            Number.isNaN(startTime) ||
            Number.isNaN(endTime)
        ) {

            showFlashSaleToast(
                "Start یا End date درست نہیں ہے۔",
                "error"
            );

            return;

        }


        if (endTime <= startTime) {

            showFlashSaleToast(
                "End time، Start time کے بعد ہونا چاہیے۔",
                "warning"
            );

            return;

        }

    }


    if (
        maxDiscount < 0 ||
        maxDiscount > 100
    ) {

        showFlashSaleToast(
            "Maximum Discount 0 سے 100 کے درمیان ہونا چاہیے۔",
            "warning"
        );

        return;

    }


    /*
     * IMPORTANT:
     *
     * No Firebase write here.
     *
     * We only prepare the exact campaign information
     * currently present in the Admin UI.
     *
     * The actual Firebase save will be connected after
     * the final Flash Sale data structure is confirmed.
     */

    const campaignDraft = {

        title,

        subtitle,

        start,

        end,

        maxDiscount,

        enabled,

        productIds:
            Array.from(
                selectedProducts
            )

    };


    console.log(
        "SMARTBAZAAR FLASH SALE DRAFT:",
        campaignDraft
    );


    showFlashSaleToast(
        "Flash Sale configuration تیار ہے۔ Firebase Save connection اگلے مرحلے میں لگایا جائے گا۔",
        "warning"
    );

}


/*==================================================
ADD PRODUCT BUTTON
==================================================*/

function setupAddProductButton() {

    const button =
        getElement(
            "#flashSaleAddProductButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const productList =
                getElement(
                    "#flashSaleAdminProductList"
                );


            if (productList) {

                productList.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }


            showFlashSaleToast(
                "اوپر موجود products میں سے product منتخب کریں۔",
                "success"
            );

        }
    );

}


/*==================================================
RESET BUTTON
==================================================*/

function setupResetButton() {

    const button =
        getElement(
            "#flashSaleResetButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            resetFlashSaleForm();

        }
    );

}


/*==================================================
RESET FORM
==================================================*/

function resetFlashSaleForm() {

    const title =
        getElement(
            "#flashSaleTitle"
        );


    const subtitle =
        getElement(
            "#flashSaleSubtitle"
        );


    const start =
        getElement(
            "#flashSaleStart"
        );


    const end =
        getElement(
            "#flashSaleEnd"
        );


    const maxDiscount =
        getElement(
            "#flashSaleMaxDiscount"
        );


    const enabled =
        getElement(
            "#flashSaleEnabled"
        );


    if (title) {
        title.value = "";
    }


    if (subtitle) {
        subtitle.value = "";
    }


    if (start) {
        start.value = "";
    }


    if (end) {
        end.value = "";
    }


    if (maxDiscount) {
        maxDiscount.value = "";
    }


    if (enabled) {
        enabled.checked = false;
    }


    selectedProducts.clear();


    renderProductList();

    renderSelectedProducts();

    updateSelectedCount();

    updateAdminStats();


    showFlashSaleToast(
        "Flash Sale form reset ہو گیا۔",
        "success"
    );

}


/*==================================================
ERROR
==================================================*/

function showFlashSaleError(
    message
) {

    const container =
        getElement(
            "#flashSaleAdminError",
            ".flash-sale-admin-error"
        );


    if (!container) {

        showFlashSaleToast(
            message,
            "error"
        );

        return;

    }


    container.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        ${escapeHtml(message)}
    `;


    container.hidden = false;

}


/*==================================================
ADMIN AUTH
==================================================*/

function verifyAdmin(user) {

    if (!user) {

        isAdmin = false;

        return false;

    }


    const email =
        String(
            user.email || ""
        )
        .trim()
        .toLowerCase();


    isAdmin =
        email ===
        ADMIN_EMAIL.toLowerCase();


    return isAdmin;

}


/*==================================================
AUTH INITIALIZATION
==================================================*/

function initializeAuth() {

    onAuthStateChanged(
        auth,
        user => {

            if (!user) {

                isAdmin = false;

                return;

            }


            if (!verifyAdmin(user)) {

                isAdmin = false;

                console.warn(
                    "Flash Sale Admin: user is not authorized."
                );

                return;

            }


            isAdmin = true;

            initializeFlashSaleAdmin();

        }
    );

}


/*==================================================
INITIALIZATION
==================================================*/

function initializeFlashSaleAdmin() {

    if (initialized) {
        return;
    }


    initialized = true;


    setupSearch();

    setupCategoryFilter();

    setupStatusFilter();

    setupCampaignForm();

    setupSelectionButtons();

    setupAddProductButton();

    setupResetButton();

    setupModal();

    setupSaveButton();

    loadProducts();

}


/*==================================================
AUTO INITIALIZATION
==================================================*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAuth
    );

} else {

    initializeAuth();

}


/*==================================================
GLOBAL CONNECTION
==================================================*/

window.SmartBazaarFlashSaleAdmin = {

    reloadProducts() {

        loadProducts();

    },


    selectAll() {

        selectAllVisibleProducts();

    },


    clearSelection() {

        clearProductSelection();

    },


    closeModal() {

        closeAdminModal();

    },


    reset() {

        resetFlashSaleForm();

    },


    getSelectedProducts() {

        return Array.from(
            selectedProducts
        );

    },


    getProducts() {

        return [
            ...allProducts
        ];

    },


    getFilteredProducts() {

        return [
            ...filteredProducts
        ];

    },


    getCampaignDraft() {

        return {

            title:
                getElement(
                    "#flashSaleTitle"
                )?.value.trim() || "",

            subtitle:
                getElement(
                    "#flashSaleSubtitle"
                )?.value.trim() || "",

            start:
                getElement(
                    "#flashSaleStart"
                )?.value || "",

            end:
                getElement(
                    "#flashSaleEnd"
                )?.value || "",

            maxDiscount:
                Number(
                    getElement(
                        "#flashSaleMaxDiscount"
                    )?.value || 0
                ),

            enabled:
                Boolean(
                    getElement(
                        "#flashSaleEnabled"
                    )?.checked
                ),

            productIds:
                Array.from(
                    selectedProducts
                )

        };

    }

};


/*==================================================
END
==================================================*/
