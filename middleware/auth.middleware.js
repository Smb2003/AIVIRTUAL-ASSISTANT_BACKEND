const { User } = require("../model/user.model");
const { ApiError } = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const JWT = require("jsonwebtoken");

const VerifyJWT = asyncHandler(async (req,res,next) => {
    const token = req?.cookies?.ACCESS_TOKEN;
    if(!token){
        throw new ApiError(400,"Token not found");
    }

    const verifyToken = JWT.verify(token, process.env.JWT_ACCESS_TOKEN);
    // console.log("Verifieed: ",verifyToken)
    if (!verifyToken) {
        throw new ApiError(401, "Unauthorized user");
    }
    const user = await User.findById(verifyToken?._id).select("-password -refreshToken");
    // console.log(user);
    if(!user){
        throw new ApiError(400,"Invalid Token, User not found.");
    }
    req.user = user;
    req.token = token;
    next();
})
module.exports = {VerifyJWT};