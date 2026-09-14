/*==================================================
SMARTBAZAAR PRO 2
FEATURE: FLASH SALE ADMIN
EXISTING PRODUCTS + FLASH SALE PRODUCT EDITOR
==================================================*/

import {
    ref,
    onValue,
    update
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    database,
    auth
} from "../firebase-config.js";


/*==================================================
CONFIGURATION
==================================================*/

const PRODUCTS_PATH = "products";

const ADMIN_EMAIL = "iftikharahmed037092@gmail.com";


/*==================================================
STATE
==================================================*/

let allProducts = [];
let filteredProducts = [];

let selectedProducts = new Set();

let currentSearch = "";
let currentCategory = "all";

let editingProductId = null;

let isAdmin = false;
let initialized = false;

let productsUnsubscribe = null;


/*==================================================
HELPERS
==================================================*/

function getProductId(product, fallbackId = "") {

    return String(
        product?.productId ||
        product?.id ||
        fallbackId ||
        ""
    );

}


function getProductName(product) {

    return (
        product?.name ||
        product?.title ||
        "Unnamed Product"
    );

}


function getProductImage(product) {

    return (
        product?.image ||
        product?.thumbnail ||
        product?.images?.[0] ||
        ""
    );

}


function getProductPrice(product) {

    const price = Number(
        product?.price ??
        product?.salePrice ??
        0
    );

    return Number.isFinite(price) ? price : 0;

}


function getProductOldPrice(product) {

    const oldPrice = Number(
        product?.oldPrice ??
        0
    );

    return Number.isFinite(oldPrice) ? oldPrice : 0;

}


function getProductStock(product) {

    const stock = Number(
        product?.stock ??
        product?.quantity ??
        0
    );

    return Number.isFinite(stock) ? stock : 0;

}


function getProductCategory(product) {

    return (
        product?.category ||
        "Uncategorized"
    );

}


/*==================================================
NORMALIZE PRODUCT
==================================================*/

function normalizeProduct(product, id) {

    return {
        ...product,

        productId: getProductId(product, id),

        name: getProductName(product),

        image: getProductImage(product),

        price: getProductPrice(product),

        oldPrice: getProductOldPrice(product),

        stock: getProductStock(product),

        category: getProductCategory(product)
    };

}


/*==================================================
FLASH SALE DATA
==================================================*/

function getFlashSale(product) {

    if (
        product &&
        typeof product.flashSale === "object" &&
        product.flashSale !== null
    ) {

        return product.flashSale;

    }

    return null;

}


/*==================================================
AUTH
==================================================*/

function initializeAuth() {

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            isAdmin = false;

            showAccessError(
                "Admin login required."
            );

            return;

        }


        if (
            user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            isAdmin = false;

            showAccessError(
                "You are not authorized to manage Flash Sale."
            );

            return;

        }


        isAdmin = true;

        initializeFlashSaleAdmin();

    });

}


/*==================================================
ACCESS ERROR
==================================================*/

function showAccessError(message) {

    const list =
        document.getElementById(
            "flashSaleAdminProductList"
        );

    if (list) {

        list.innerHTML = `
            <div class="flash-sale-admin-empty">
                <div class="flash-sale-empty-icon">🔒</div>

                <h3>Access Denied</h3>

                <p>${escapeHtml(message)}</p>
            </div>
        `;

    }

}


/*==================================================
LOAD EXISTING PRODUCTS
==================================================*/

function loadProducts() {

    if (!isAdmin) return;


    const productsRef =
        ref(database, PRODUCTS_PATH);


    if (productsUnsubscribe) {

        productsUnsubscribe();

        productsUnsubscribe = null;

    }


    productsUnsubscribe = onValue(
        productsRef,
        (snapshot) => {

            const data =
                snapshot.val();


            allProducts = [];


            if (data && typeof data === "object") {

                Object.entries(data).forEach(
                    ([id, product]) => {

                        if (
                            product &&
                            typeof product === "object"
                        ) {

                            allProducts.push(
                                normalizeProduct(
                                    product,
                                    id
                                )
                            );

                        }

                    }
                );

            }


            allProducts.sort(
                (a, b) =>
                    String(a.name)
                        .localeCompare(
                            String(b.name)
                        )
            );


            cleanupSelectedProducts();

            buildCategoryFilter();

            applyFilters();

            renderSelectedProducts();

            updateStats();

        },
        (error) => {

            console.error(
                "Flash Sale products error:",
                error
            );


            const list =
                document.getElementById(
                    "flashSaleAdminProductList"
                );

            if (list) {

                list.innerHTML = `
                    <div class="flash-sale-admin-empty">

                        <div class="flash-sale-empty-icon">
                            ⚠️
                        </div>

                        <h3>Products Could Not Load</h3>

                        <p>
                            Firebase products data load نہیں ہو سکا۔
                        </p>

                    </div>
                `;

            }

        }
    );

}


/*==================================================
CLEAN SELECTED PRODUCTS
==================================================*/

function cleanupSelectedProducts() {

    const validIds =
        new Set(
            allProducts.map(
                product => product.productId
            )
        );


    selectedProducts =
        new Set(
            [...selectedProducts].filter(
                id => validIds.has(id)
            )
        );

}


/*==================================================
CATEGORY FILTER
==================================================*/

function buildCategoryFilter() {

    const select =
        document.getElementById(
            "flashSaleProductCategory"
        );


    if (!select) return;


    const currentValue =
        select.value || "all";


    const categories =
        [...new Set(
            allProducts
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)
        )]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        );


    select.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });


    if (
        categories.includes(currentValue)
    ) {

        select.value = currentValue;

    } else {

        select.value = "all";

    }

}


/*==================================================
FILTER PRODUCTS
==================================================*/

function applyFilters() {

    const search =
        currentSearch
            .trim()
            .toLowerCase();


    filteredProducts =
        allProducts.filter(product => {

            const matchesSearch =
                !search ||
                getProductName(product)
                    .toLowerCase()
                    .includes(search) ||
                getProductId(product)
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                currentCategory === "all" ||
                getProductCategory(product) ===
                currentCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    renderProductList();

}


/*==================================================
RENDER PRODUCT LIST
==================================================*/

function renderProductList() {

    const container =
        document.getElementById(
            "flashSaleAdminProductList"
        );


    if (!container) return;


    if (!filteredProducts.length) {

        container.innerHTML = `
            <div class="flash-sale-admin-empty">

                <div class="flash-sale-empty-icon">
                    🔍
                </div>

                <h3>No Products Found</h3>

                <p>
                    Search یا category filter تبدیل کریں۔
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        filteredProducts
            .map(product =>
                createProductCard(product)
            )
            .join("");

}


/*==================================================
PRODUCT CARD
==================================================*/

function createProductCard(product) {

    const productId =
        getProductId(product);


    const selected =
        selectedProducts.has(productId);


    const flashSale =
        getFlashSale(product);


    const image =
        getProductImage(product);


    const price =
        getProductPrice(product);


    const stock =
        getProductStock(product);


    const salePrice =
        flashSale?.salePrice != null
            ? Number(flashSale.salePrice)
            : null;


    let saleInfo = "";


    if (
        flashSale &&
        flashSale.enabled === true
    ) {

        saleInfo = `
            <span class="flash-sale-product-active">
                ⚡ Flash Sale Active
            </span>
        `;

    }


    return `
        <div
            class="flash-sale-admin-product-card
            ${selected ? "selected" : ""}"
            data-product-id="${escapeAttribute(productId)}"
        >

            <div class="flash-sale-admin-product-image">

                ${
                    image
                    ?
                    `
                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(
                            getProductName(product)
                        )}"
                    >
                    `
                    :
                    `
                    <div class="flash-sale-product-no-image">
                        📦
                    </div>
                    `
                }

            </div>


            <div class="flash-sale-admin-product-info">

                <h3>
                    ${escapeHtml(
                        getProductName(product)
                    )}
                </h3>

                <span class="flash-sale-product-id">
                    ${escapeHtml(productId)}
                </span>


                <div class="flash-sale-product-meta">

                    <strong>
                        Rs. ${formatNumber(price)}
                    </strong>

                    <span>
                        Stock: ${formatNumber(stock)}
                    </span>

                </div>


                ${saleInfo}

            </div>


            <div class="flash-sale-admin-product-actions">

                <button
                    type="button"
                    class="admin-secondary-button flash-sale-edit-product-button"
                    data-product-id="${escapeAttribute(productId)}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="admin-primary-button flash-sale-select-product-button"
                    data-product-id="${escapeAttribute(productId)}"
                >
                    ${selected ? "Selected ✓" : "Select"}
                </button>

            </div>

        </div>
    `;

}


/*==================================================
SELECT PRODUCT
==================================================*/

function toggleProductSelection(productId) {

    if (!productId) return;


    if (selectedProducts.has(productId)) {

        selectedProducts.delete(productId);

    } else {

        selectedProducts.add(productId);

    }


    renderProductList();

    renderSelectedProducts();

    updateStats();


    const product =
        findProduct(productId);


    if (product) {

        openProductEditor(productId);

    }

}


/*==================================================
FIND PRODUCT
==================================================*/

function findProduct(productId) {

    return allProducts.find(
        product =>
            getProductId(product) ===
            String(productId)
    ) || null;

}


/*==================================================
SELECTED PRODUCTS
==================================================*/

function renderSelectedProducts() {

    const container =
        document.getElementById(
            "flashSaleSelectedProducts"
        );


    const countElement =
        document.getElementById(
            "flashSaleSelectedCount"
        );


    if (countElement) {

        countElement.textContent =
            `${selectedProducts.size} selected`;

    }


    if (!container) return;


    if (!selectedProducts.size) {

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


    const products =
        [...selectedProducts]
            .map(id => findProduct(id))
            .filter(Boolean);


    container.innerHTML =
        products
            .map(product =>
                createSelectedProduct(product)
            )
            .join("");

}


/*==================================================
SELECTED PRODUCT CARD
==================================================*/

function createSelectedProduct(product) {

    const productId =
        getProductId(product);


    const flashSale =
        getFlashSale(product);


    const salePrice =
        flashSale?.salePrice != null
            ? Number(flashSale.salePrice)
            : 0;


    return `
        <div class="flash-sale-selected-product">

            <div class="flash-sale-selected-product-image">

                ${
                    getProductImage(product)
                    ?
                    `
                    <img
                        src="${escapeAttribute(
                            getProductImage(product)
                        )}"
                        alt="${escapeAttribute(
                            getProductName(product)
                        )}"
                    >
                    `
                    :
                    "📦"
                }

            </div>


            <div class="flash-sale-selected-product-info">

                <h3>
                    ${escapeHtml(
                        getProductName(product)
                    )}
                </h3>

                <span>
                    ${escapeHtml(productId)}
                </span>

                <strong>
                    ${
                        salePrice > 0
                        ? `Sale: Rs. ${formatNumber(salePrice)}`
                        : "Sale price not set"
                    }
                </strong>

            </div>


            <div class="flash-sale-selected-product-actions">

                <button
                    type="button"
                    class="admin-secondary-button flash-sale-edit-product-button"
                    data-product-id="${escapeAttribute(productId)}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="admin-secondary-button flash-sale-remove-product-button"
                    data-product-id="${escapeAttribute(productId)}"
                >
                    Remove
                </button>

            </div>

        </div>
    `;

}


/*==================================================
OPEN PRODUCT EDITOR
==================================================*/

function openProductEditor(productId) {

    const product =
        findProduct(productId);


    if (!product) return;


    editingProductId =
        productId;


    selectedProducts.add(productId);


    populateEditor(product);

}


/*==================================================
POPULATE PRODUCT EDITOR
==================================================*/

function populateEditor(product) {

    const empty =
        document.getElementById(
            "flashSaleEditorEmpty"
        );


    const content =
        document.getElementById(
            "flashSaleEditorContent"
        );


    const status =
        document.getElementById(
            "flashSaleProductEditorStatus"
        );


    if (empty) {

        empty.hidden = true;

    }


    if (content) {

        content.hidden = false;

    }


    if (status) {

        status.textContent =
            "Product Selected";

    }


    setText(
        "flashSaleEditorProductName",
        getProductName(product)
    );


    setText(
        "flashSaleEditorProductId",
        getProductId(product)
    );


    setText(
        "flashSaleEditorCurrentPrice",
        `Rs. ${formatNumber(
            getProductPrice(product)
        )}`
    );


    setText(
        "flashSaleEditorCurrentStock",
        formatNumber(
            getProductStock(product)
        )
    );


    const image =
        document.getElementById(
            "flashSaleEditorImage"
        );


    if (image) {

        image.src =
            getProductImage(product) || "";

        image.alt =
            getProductName(product);

    }


    const flashSale =
        getFlashSale(product);


    const salePriceInput =
        document.getElementById(
            "flashSaleEditorSalePrice"
        );


    const saleStockInput =
        document.getElementById(
            "flashSaleEditorSaleStock"
        );


    const startInput =
        document.getElementById(
            "flashSaleEditorStart"
        );


    const endInput =
        document.getElementById(
            "flashSaleEditorEnd"
        );


    const enabledInput =
        document.getElementById(
            "flashSaleEditorEnabled"
        );


    if (salePriceInput) {

        salePriceInput.value =
            flashSale?.salePrice != null
                ? flashSale.salePrice
                : "";

    }


    if (saleStockInput) {

        saleStockInput.value =
            flashSale?.saleStock != null
                ? flashSale.saleStock
                : "";

    }


    if (startInput) {

        startInput.value =
            timestampToLocalInput(
                flashSale?.startAt
            );

    }


    if (endInput) {

        endInput.value =
            timestampToLocalInput(
                flashSale?.endAt
            );

    }


    if (enabledInput) {

        enabledInput.checked =
            flashSale?.enabled === true;

    }


    updateEditorDiscount();

}


/*==================================================
UPDATE DISCOUNT
==================================================*/

function updateEditorDiscount() {

    const product =
        editingProductId
        ? findProduct(editingProductId)
        : null;


    if (!product) return;


    const currentPrice =
        getProductPrice(product);


    const salePriceInput =
        document.getElementById(
            "flashSaleEditorSalePrice"
        );


    const salePrice =
        Number(
            salePriceInput?.value || 0
        );


    let discount = 0;

    let saving = 0;


    if (
        currentPrice > 0 &&
        salePrice > 0 &&
        salePrice < currentPrice
    ) {

        saving =
            currentPrice - salePrice;


        discount =
            Math.round(
                (saving / currentPrice) * 100
            );

    }


    setText(
        "flashSaleEditorDiscount",
        `${discount}%`
    );


    setText(
        "flashSaleEditorSaving",
        `Rs. ${formatNumber(saving)}`
    );

}


/*==================================================
SAVE PRODUCT FLASH SALE
==================================================*/

async function saveProductFlashSale() {

    if (!isAdmin) {

        alert(
            "Admin access required."
        );

        return;

    }


    if (!editingProductId) {

        alert(
            "پہلے ایک product select کریں۔"
        );

        return;

    }


    const product =
        findProduct(editingProductId);


    if (!product) {

        alert(
            "Product نہیں ملا۔"
        );

        return;

    }


    const salePriceInput =
        document.getElementById(
            "flashSaleEditorSalePrice"
        );


    const saleStockInput =
        document.getElementById(
            "flashSaleEditorSaleStock"
        );


    const startInput =
        document.getElementById(
            "flashSaleEditorStart"
        );


    const endInput =
        document.getElementById(
            "flashSaleEditorEnd"
        );


    const enabledInput =
        document.getElementById(
            "flashSaleEditorEnabled"
        );


    const salePrice =
        Number(
            salePriceInput?.value || 0
        );


    const saleStock =
        Number(
            saleStockInput?.value || 0
        );


    const start =
        startInput?.value || "";


    const end =
        endInput?.value || "";


    const enabled =
        enabledInput?.checked === true;


    const currentPrice =
        getProductPrice(product);


    const currentStock =
        getProductStock(product);


    if (
        !salePrice ||
        salePrice <= 0
    ) {

        alert(
            "Flash Sale Price درج کریں۔"
        );

        return;

    }


    if (
        salePrice >= currentPrice
    ) {

        alert(
            "Flash Sale Price موجودہ product price سے کم ہونی چاہیے۔"
        );

        return;

    }


    if (
        !saleStock ||
        saleStock <= 0
    ) {

        alert(
            "Flash Sale Stock درج کریں۔"
        );

        return;

    }


    if (
        currentStock > 0 &&
        saleStock > currentStock
    ) {

        alert(
            "Flash Sale Stock available stock سے زیادہ نہیں ہو سکتی۔"
        );

        return;

    }


    if (!start || !end) {

        alert(
            "Flash Sale Start اور End دونوں مقرر کریں۔"
        );

        return;

    }


    const startAt =
        new Date(start).getTime();


    const endAt =
        new Date(end).getTime();


    if (
        !Number.isFinite(startAt) ||
        !Number.isFinite(endAt)
    ) {

        alert(
            "Date & Time درست نہیں ہے۔"
        );

        return;

    }


    if (
        endAt <= startAt
    ) {

        alert(
            "Flash Sale End، Start کے بعد ہونا چاہیے۔"
        );

        return;

    }


    const discount =
        Math.round(
            ((currentPrice - salePrice) /
            currentPrice) * 100
        );


    const flashSale = {

        enabled,

        salePrice,

        saleStock,

        soldQuantity:
            Number(
                getFlashSale(product)
                    ?.soldQuantity || 0
            ),

        startAt,

        endAt,

        discount

    };


    const productRef =
        ref(
            database,
            `${PRODUCTS_PATH}/${editingProductId}`
        );


    try {

        await update(
            productRef,
            {
                flashSale
            }
        );


        alert(
            "Product Flash Sale successfully saved."
        );


        selectedProducts.add(
            editingProductId
        );


        const updatedProduct =
            findProduct(editingProductId);


        if (updatedProduct) {

            updatedProduct.flashSale =
                flashSale;

            populateEditor(
                updatedProduct
            );

        }


        renderProductList();

        renderSelectedProducts();

        updateStats();


    } catch (error) {

        console.error(
            "Flash Sale save error:",
            error
        );


        alert(
            "Flash Sale save نہیں ہو سکی۔ Firebase console دیکھیں۔"
        );

    }

}


/*==================================================
CLEAR EDITOR
==================================================*/

function clearProductEditor() {

    editingProductId = null;


    const empty =
        document.getElementById(
            "flashSaleEditorEmpty"
        );


    const content =
        document.getElementById(
            "flashSaleEditorContent"
        );


    const status =
        document.getElementById(
            "flashSaleProductEditorStatus"
        );


    if (empty) {

        empty.hidden = false;

    }


    if (content) {

        content.hidden = true;

    }


    if (status) {

        status.textContent =
            "No Product Selected";

    }


    [
        "flashSaleEditorSalePrice",
        "flashSaleEditorSaleStock",
        "flashSaleEditorStart",
        "flashSaleEditorEnd"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    const enabled =
        document.getElementById(
            "flashSaleEditorEnabled"
        );


    if (enabled) {

        enabled.checked = false;

    }


    setText(
        "flashSaleEditorDiscount",
        "0%"
    );


    setText(
        "flashSaleEditorSaving",
        "Rs. 0"
    );

}


/*==================================================
REMOVE SELECTED PRODUCT
==================================================*/

function removeSelectedProduct(productId) {

    selectedProducts.delete(
        productId
    );


    if (
        editingProductId === productId
    ) {

        clearProductEditor();

    }


    renderProductList();

    renderSelectedProducts();

    updateStats();

}


/*==================================================
STATS
==================================================*/

function updateStats() {

    const activeProducts =
        allProducts.filter(product => {

            const flashSale =
                getFlashSale(product);

            return (
                flashSale?.enabled === true
            );

        });


    const hotDeals =
        activeProducts.filter(product => {

            const discount =
                Number(
                    getFlashSale(product)
                        ?.discount || 0
                );

            return discount >= 30;

        });


    const highestDiscount =
        activeProducts.reduce(
            (highest, product) => {

                const discount =
                    Number(
                        getFlashSale(product)
                            ?.discount || 0
                    );

                return Math.max(
                    highest,
                    discount
                );

            },
            0
        );


    setText(
        "flashSaleActiveCount",
        String(
            activeProducts.length
        )
    );


    setText(
        "flashSaleHotCount",
        String(
            hotDeals.length
        )
    );


    setText(
        "flashSaleHighestDiscount",
        `${highestDiscount}%`
    );


    const status =
        document.getElementById(
            "flashSaleStatus"
        );


    const adminStatus =
        document.getElementById(
            "flashSaleAdminStatus"
        );


    if (activeProducts.length > 0) {

        if (status) {

            status.textContent =
                "Active";

        }

        if (adminStatus) {

            adminStatus.textContent =
                "Active";

        }

    } else {

        if (status) {

            status.textContent =
                "Not Configured";

        }

        if (adminStatus) {

            adminStatus.textContent =
                "Not Configured";

        }

    }

}


/*==================================================
CAMPAIGN FORM
==================================================*/

function setupCampaignForm() {

    const saveButton =
        document.getElementById(
            "flashSaleSaveButton"
        );


    const resetButton =
        document.getElementById(
            "flashSaleResetButton"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveCampaign
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetCampaignForm
        );

    }

}


/*==================================================
CAMPAIGN SAVE
==================================================*/

function saveCampaign() {

    const title =
        document.getElementById(
            "flashSaleTitle"
        )?.value.trim() || "";


    const subtitle =
        document.getElementById(
            "flashSaleSubtitle"
        )?.value.trim() || "";


    const start =
        document.getElementById(
            "flashSaleStart"
        )?.value || "";


    const end =
        document.getElementById(
            "flashSaleEnd"
        )?.value || "";


    const maxDiscount =
        Number(
            document.getElementById(
                "flashSaleMaxDiscount"
            )?.value || 0
        );


    const enabled =
        document.getElementById(
            "flashSaleEnabled"
        )?.checked === true;


    if (!title) {

        alert(
            "Sale Title درج کریں۔"
        );

        return;

    }


    if (!start || !end) {

        alert(
            "Campaign Start اور End مقرر کریں۔"
        );

        return;

    }


    if (
        new Date(end).getTime() <=
        new Date(start).getTime()
    ) {

        alert(
            "Campaign End، Start کے بعد ہونا چاہیے۔"
        );

        return;

    }


    if (
        maxDiscount < 0 ||
        maxDiscount > 100
    ) {

        alert(
            "Maximum Discount 0 سے 100 کے درمیان ہونا چاہیے۔"
        );

        return;

    }


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
        "Flash Sale Campaign:",
        campaignDraft
    );


    const status =
        document.getElementById(
            "flashSaleAdminStatus"
        );


    if (status) {

        status.textContent =
            enabled
            ? "Active"
            : "Disabled";

    }


    alert(
        "Campaign settings تیار ہیں۔ Product Flash Sale الگ سے Save کریں۔"
    );

}


/*==================================================
RESET CAMPAIGN
==================================================*/

function resetCampaignForm() {

    const fields = [
        "flashSaleTitle",
        "flashSaleSubtitle",
        "flashSaleStart",
        "flashSaleEnd",
        "flashSaleMaxDiscount"
    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = "";

        }

    });


    const enabled =
        document.getElementById(
            "flashSaleEnabled"
        );


    if (enabled) {

        enabled.checked = false;

    }

}


/*==================================================
SEARCH
==================================================*/

function setupSearch() {

    const input =
        document.getElementById(
            "flashSaleProductSearch"
        );


    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            currentSearch =
                input.value || "";

            applyFilters();

        }
    );

}


/*==================================================
CATEGORY
==================================================*/

function setupCategoryFilter() {

    const select =
        document.getElementById(
            "flashSaleProductCategory"
        );


    if (!select) return;


    select.addEventListener(
        "change",
        () => {

            currentCategory =
                select.value || "all";

            applyFilters();

        }
    );

}


/*==================================================
PRODUCT BUTTON EVENTS
==================================================*/

function setupProductEvents() {

    const list =
        document.getElementById(
            "flashSaleAdminProductList"
        );


    const selected =
        document.getElementById(
            "flashSaleSelectedProducts"
        );


    if (list) {

        list.addEventListener(
            "click",
            (event) => {

                const selectButton =
                    event.target.closest(
                        ".flash-sale-select-product-button"
                    );


                const editButton =
                    event.target.closest(
                        ".flash-sale-edit-product-button"
                    );


                if (selectButton) {

                    const id =
                        selectButton.dataset.productId;

                    toggleProductSelection(id);

                    return;

                }


                if (editButton) {

                    const id =
                        editButton.dataset.productId;

                    toggleSelectionAndOpenEditor(id);

                }

            }
        );

    }


    if (selected) {

        selected.addEventListener(
            "click",
            (event) => {

                const editButton =
                    event.target.closest(
                        ".flash-sale-edit-product-button"
                    );


                const removeButton =
                    event.target.closest(
                        ".flash-sale-remove-product-button"
                    );


                if (editButton) {

                    const id =
                        editButton.dataset.productId;

                    openProductEditor(id);

                    return;

                }


                if (removeButton) {

                    const id =
                        removeButton.dataset.productId;

                    removeSelectedProduct(id);

                }

            }
        );

    }

}


/*==================================================
SELECT + OPEN EDITOR
==================================================*/

function toggleSelectionAndOpenEditor(productId) {

    if (!productId) return;


    selectedProducts.add(
        productId
    );


    openProductEditor(
        productId
    );


    renderProductList();

    renderSelectedProducts();

    updateStats();

}


/*==================================================
EDITOR EVENTS
==================================================*/

function setupEditorEvents() {

    const saveButton =
        document.getElementById(
            "flashSaleEditorSaveButton"
        );


    const cancelButton =
        document.getElementById(
            "flashSaleEditorCancelButton"
        );


    const salePrice =
        document.getElementById(
            "flashSaleEditorSalePrice"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveProductFlashSale
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            clearProductEditor
        );

    }


    if (salePrice) {

        salePrice.addEventListener(
            "input",
            updateEditorDiscount
        );

    }

}


/*==================================================
ADD PRODUCT BUTTON
==================================================*/

function setupAddProductButton() {

    const button =
        document.getElementById(
            "flashSaleAddProductButton"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const list =
                document.getElementById(
                    "flashSaleAdminProductList"
                );


            if (list) {

                list.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


/*==================================================
GLOBAL EVENTS
==================================================*/

function setupGlobalEvents() {

    document.addEventListener(
        "click",
        (event) => {

            const navItem =
                event.target.closest(
                    '[data-section="flash-sale"]'
                );


            if (navItem) {

                setTimeout(
                    () => {

                        applyFilters();

                    },
                    100
                );

            }

        }
    );

}


/*==================================================
INITIALIZE
==================================================*/

function initializeFlashSaleAdmin() {

    if (initialized) return;

    initialized = true;


    setupSearch();

    setupCategoryFilter();

    setupProductEvents();

    setupEditorEvents();

    setupCampaignForm();

    setupAddProductButton();

    setupGlobalEvents();

    loadProducts();

}


/*==================================================
UTILITY
==================================================*/

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function formatNumber(value) {

    const number =
        Number(value || 0);


    return number.toLocaleString(
        "en-PK"
    );

}


function timestampToLocalInput(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";

    }


    let timestamp =
        Number(value);


    if (!Number.isFinite(timestamp)) {

        return "";

    }


    const date =
        new Date(timestamp);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const pad =
        number =>
            String(number).padStart(
                2,
                "0"
            );


    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        "T" +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes())
    );

}


function escapeHtml(value) {

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

    return escapeHtml(value);

}


/*==================================================
PUBLIC API
==================================================*/

window.SmartBazaarFlashSaleAdmin = {

    getProducts: () =>
        allProducts,

    getSelectedProducts: () =>
        Array.from(
            selectedProducts
        ),

    selectProduct:
        toggleProductSelection,

    openProductEditor,

    clearProductEditor,

    saveProductFlashSale,

    reloadProducts:
        loadProducts

};


/*==================================================
START
==================================================*/

initializeAuth();


/*==================================================
END FLASH SALE ADMIN
==================================================*/
