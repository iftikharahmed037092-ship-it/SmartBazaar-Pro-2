/*==================================================
SMARTBAZAAR PRO 2
CLOUDINARY CONFIGURATION
==================================================*/


/*==================================================
CLOUDINARY ACCOUNT
==================================================*/

const cloudName =
    "jlrjn7lu";


const uploadPreset =
    "smartbazaar_pro_2_uploads";


/*==================================================
FEATURE: CLOUDINARY UPLOAD
==================================================*/

export async function uploadToCloudinary(
    file,
    folder = "smartbazaar_pro_2/other"
) {

    if (!file) {

        throw new Error(
            "Please select a file."
        );

    }


    /*==================================================
    CLOUDINARY UPLOAD URL
    ==================================================*/

    const uploadUrl =
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;


    /*==================================================
    FORM DATA
    ==================================================*/

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


    formData.append(
        "folder",
        folder
    );


    /*==================================================
    SEND FILE TO CLOUDINARY
    ==================================================*/

    const response =
        await fetch(
            uploadUrl,
            {
                method: "POST",
                body: formData
            }
        );


    /*==================================================
    HANDLE CLOUDINARY ERROR
    ==================================================*/

    if (!response.ok) {

        let errorData = {};

        try {

            errorData =
                await response.json();

        }

        catch (error) {

            console.error(
                "Cloudinary Error Response:",
                error
            );

        }


        console.error(
            "Cloudinary Upload Error:",
            errorData
        );


        throw new Error(
            errorData?.error?.message ||
            "Cloudinary upload failed."
        );

    }


    /*==================================================
    GET UPLOAD RESULT
    ==================================================*/

    const data =
        await response.json();


    /*==================================================
    VALIDATE RESULT
    ==================================================*/

    if (!data.secure_url) {

        throw new Error(
            "Cloudinary did not return an image URL."
        );

    }


    /*==================================================
    RETURN CLOUDINARY DATA
    ==================================================*/

    return {

        url:
            data.secure_url,

        publicId:
            data.public_id || "",

        resourceType:
            data.resource_type || "",

        format:
            data.format || "",

        width:
            data.width || 0,

        height:
            data.height || 0

    };

}


/*==================================================
FEATURE: CLOUDINARY FOLDER PATHS
==================================================*/

export const CLOUDINARY_FOLDERS = {

    BANNERS:
        "smartbazaar_pro_2/banners",

    PRODUCTS:
        "smartbazaar_pro_2/products",

    CATEGORIES:
        "smartbazaar_pro_2/categories",

    BRANDS:
        "smartbazaar_pro_2/brands",

    PROFILES:
        "smartbazaar_pro_2/profiles",

    OTHER:
        "smartbazaar_pro_2/other"

};
