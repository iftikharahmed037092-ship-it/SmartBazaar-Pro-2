/*==================================================
SMARTBAZAAR PRO 2
FEATURE: BANNER FIREBASE SYSTEM
==================================================*/

import {
    database
} from "./firebase-config.js";

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    query,
    orderByChild
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/*==================================================
FEATURE: BANNER DATABASE PATH
==================================================*/

const bannersRef = ref(
    database,
    "smartbazaar_pro_2/banners"
);


/*==================================================
FEATURE: ADD BANNER
==================================================*/

export async function addBanner(bannerData) {

    const newBannerRef = push(bannersRef);

    const banner = {

        id: newBannerRef.key,

        imageUrl:
            bannerData.imageUrl || "",

        mobileImageUrl:
            bannerData.mobileImageUrl || "",

        title:
            bannerData.title || "",

        subtitle:
            bannerData.subtitle || "",

        buttonText:
            bannerData.buttonText || "",

        buttonLink:
            bannerData.buttonLink || "",

        order:
            Number(bannerData.order || 0),

        active:
            bannerData.active !== false,

        startDate:
            bannerData.startDate || "",

        endDate:
            bannerData.endDate || "",

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };

    await set(
        newBannerRef,
        banner
    );

    return banner;
}


/*==================================================
FEATURE: GET ALL BANNERS
==================================================*/

export async function getBanners() {

    const bannersQuery = query(
        bannersRef,
        orderByChild("order")
    );

    const snapshot =
        await get(bannersQuery);

    if (!snapshot.exists()) {
        return [];
    }

    const data =
        snapshot.val();

    return Object.values(data);
}


/*==================================================
FEATURE: GET SINGLE BANNER
==================================================*/

export async function getBanner(bannerId) {

    const bannerRef =
        ref(
            database,
            `smartbazaar_pro_2/banners/${bannerId}`
        );

    const snapshot =
        await get(bannerRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.val();
}


/*==================================================
FEATURE: UPDATE BANNER
==================================================*/

export async function updateBanner(
    bannerId,
    bannerData
) {

    const bannerRef =
        ref(
            database,
            `smartbazaar_pro_2/banners/${bannerId}`
        );

    await update(
        bannerRef,
        {
            ...bannerData,
            updatedAt: Date.now()
        }
    );

    return true;
}


/*==================================================
FEATURE: DELETE BANNER
==================================================*/

export async function deleteBanner(
    bannerId
) {

    const bannerRef =
        ref(
            database,
            `smartbazaar_pro_2/banners/${bannerId}`
        );

    await remove(bannerRef);

    return true;
}


/*==================================================
FEATURE: CHANGE BANNER STATUS
==================================================*/

export async function setBannerStatus(
    bannerId,
    active
) {

    const bannerRef =
        ref(
            database,
            `smartbazaar_pro_2/banners/${bannerId}`
        );

    await update(
        bannerRef,
        {
            active: Boolean(active),
            updatedAt: Date.now()
        }
    );

    return true;
}
