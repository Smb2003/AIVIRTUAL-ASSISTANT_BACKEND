const {v2:cloudinary} = require("cloudinary");
const fs = require('fs');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileToUpload) => {
    try {
        const response = await cloudinary.uploader.upload(fileToUpload,{resource_type:"auto"});
        console.log("Cloudinary Image Response: ",response)
        fs.unlinkSync(fileToUpload);
        return response;
    } catch (error) {
        console.log("Cloudinary Error: ",error?.response?.data?.message);
        fs.unlinkSync(fileToUpload);
    }
}
module.exports = {uploadToCloudinary};