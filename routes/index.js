const express = require("express");
const { register, login, logOut, addVirtualAsssitantData, getVirtualAssistantData, editVirtualAsssitantData, askToAssistant } = require("../controller/auth.controller");
const { VerifyJWT } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const { gemini } = require("../controller/geminiApi");
const router = express.Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logOut").post(VerifyJWT,logOut);
router.route("/check").get(VerifyJWT,(req,res)=>{
    const user = req?.user;
    // console.log(user)
    return res.status(200).json({
        success: true,
        data:user,
        message: "User fetched successfully"
    })
})
router.route("/addData").post(VerifyJWT,upload.fields([{name: "image",maxCount:1}]),addVirtualAsssitantData);
router.route("/getData").get(VerifyJWT,getVirtualAssistantData);
router.route("/editData").post(VerifyJWT,upload.fields([{name: "image",maxCount:1}]),editVirtualAsssitantData);

router.route("/askToAssistant").post(VerifyJWT,askToAssistant);
module.exports = {router};