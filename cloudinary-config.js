/==================================================
SMARTBAZAAR PRO 2
CLOUDINARY CONFIGURATION
==================================================/

const cloudName = "jlrjn7lu";

const uploadPreset = "smartbazaar_pro_2_uploads";

/==================================================
FEATURE: CLOUDINARY UPLOAD
==================================================/

export async function uploadToCloudinary(
file,
folder = "smartbazaar_pro_2/other"
) {

if (!file) {  
    throw new Error("Please select a file.");  
}  


/*==================================================  
CLOUDINARY UPLOAD URL  
==================================================*/  

const uploadUrl =  
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;  


/*==================================================  
FORM DATA  
==================================================*/  

const formData = new FormData();  

formData.append("file", file);  

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
    await fetch(uploadUrl, {  
        method: "POST",  
        body: formData  
    });  


/*==================================================  
HANDLE ERROR  
==================================================*/  

if (!response.ok) {  

    const errorData =  
        await response.json();  

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
UPLOAD RESULT  
==================================================*/  

const data =  
    await response.json();  


/*==================================================  
RETURN CLOUDINARY DATA  
==================================================*/  

return {  

    url: data.secure_url,  

    publicId: data.public_id,  

    resourceType: data.resource_type,  

    format: data.format,  

    width: data.width,  

    height: data.height  

};

}

/==================================================
FEATURE: CLOUDINARY FOLDER PATHS
==================================================/

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
