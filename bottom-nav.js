/*==================================================
SMARTBAZAAR PRO 2
FEATURE: COMMON BOTTOM NAVIGATION SYSTEM
==================================================*/

(function () {

    "use strict";


    /*==================================================
    FEATURE: COMMON BOTTOM NAVIGATION MARKUP
    ایک ہی Navigation پورے Website میں استعمال ہوگی
    ==================================================*/

    const bottomNavigationHTML = `
        <nav class="mobile-bottom-navigation"
             id="smartBazaarBottomNavigation"
             aria-label="Main Navigation">

            <a href="./index.html"
               class="bottom-nav-item"
               data-page="home">

                <i class="fa-solid fa-house"></i>

                <span>
                    Home
                </span>

            </a>


            <a href="./category.html"
               class="bottom-nav-item"
               data-page="categories">

                <i class="fa-solid fa-layer-group"></i>

                <span>
                    Categories
                </span>

            </a>


            <a href="./deals.html"
               class="bottom-nav-item"
               data-page="deals">

                <i class="fa-solid fa-bolt"></i>

                <span>
                    Deals
                </span>

            </a>


            <a href="./wishlist.html"
               class="bottom-nav-item"
               data-page="wishlist">

                <i class="fa-regular fa-heart"></i>

                <span>
                    Wishlist
                </span>

            </a>


            <a href="./account.html"
               class="bottom-nav-item"
               data-page="account">

                <i class="fa-regular fa-user"></i>

                <span>
                    My Account
                </span>

            </a>

        </nav>
    `;


    /*==================================================
    FEATURE: INSERT COMMON NAVIGATION
    ==================================================*/

    function insertBottomNavigation() {

        /*
         اگر Page میں پہلے سے Common Navigation موجود ہے
         تو دوبارہ نہیں بنائی جائے گی۔
        */

        if (
            document.getElementById(
                "smartBazaarBottomNavigation"
            )
        ) {
            setActiveNavigation();
            return;
        }


        document.body.insertAdjacentHTML(
            "beforeend",
            bottomNavigationHTML
        );


        setActiveNavigation();
    }



    /*==================================================
    FEATURE: ACTIVE PAGE DETECTION
    ==================================================*/

    function setActiveNavigation() {

        const navigation =
            document.getElementById(
                "smartBazaarBottomNavigation"
            );


        if (!navigation) {
            return;
        }


        const currentFile =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        let currentPage = "home";


        if (
            currentFile === "category.html" ||
            currentFile === "categories.html"
        ) {

            currentPage = "categories";

        }

        else if (currentFile === "deals.html") {

            currentPage = "deals";

        }

        else if (currentFile === "wishlist.html") {

            currentPage = "wishlist";

        }

        else if (currentFile === "account.html") {

            currentPage = "account";

        }

        else if (
            currentFile === "" ||
            currentFile === "index.html"
        ) {

            currentPage = "home";

        }


        const items =
            navigation.querySelectorAll(
                ".bottom-nav-item"
            );


        items.forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.page === currentPage
            ) {

                item.classList.add("active");

            }

        });

    }



    /*==================================================
    FEATURE: PAGE READY
    ==================================================*/

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            insertBottomNavigation
        );

    } else {

        insertBottomNavigation();

    }


})();
