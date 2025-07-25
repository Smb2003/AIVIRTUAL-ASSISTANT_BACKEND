const { User } = require("../model/user.model.js");
const { AiVirtualAssistant } = require("../model/virtualAssistant.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { uploadToCloudinary } = require("../utils/cloudinary.js");
const { gemini } = require("./geminiApi.js");
const moment = require("moment");
// const {ObjectId} = require("mongoose.Schema.Types");
const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();
    user.refreshToken = RefreshToken;
    await user.save({validateBeforeSave: false});

    return {AccessToken,RefreshToken};
}

const register = asyncHandler(async (req,res)=>{
    console.log(req.body);
    const {name,email,password} = req.body;
    
    if([name,email,password].some(item => item?.trim() == "")){
        throw new ApiError(400,"All fields are required.");
    }

    const existingUser = await User.findOne({
        $or:[{name:name},{email:email}]
    });
    
    if(existingUser){
        throw new ApiError(400,"User already exist.");
    }

    const user = await User.create({
        name,
        email,
        password
    });

    res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User registered successfully."
    ))
});

const login = asyncHandler(async (req,res)=>{
    console.log(req.body);
    const {email,password} = req.body;

    if([email,password].some(item => item?.trim() == "")){
        throw new ApiError(400,"All fields are required.");
    }

    const findUser = await User.findOne({email:email});

    if(!findUser){
        throw new ApiError(400,"Invalid email address");
    }

    const cmpPassword = await findUser.isPasswordCorrect(password);

    if(!cmpPassword){
        throw new ApiError(400,"Invalid Credentials.");
    }

    const {AccessToken,RefreshToken} = await generateAccessAndRefreshToken(findUser?.id);
    const user = await User.findById(findUser?._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "Lax"
    };

    res
    .status(201)
    .cookie("ACCESS_TOKEN",AccessToken,options)
    .cookie("REFRESH_TOKEN",RefreshToken,options)
    .json(new ApiResponse(
        200,
        user,
        "User loggedIn successfully."
    ))
})

const logOut = asyncHandler(async (req,res) => {
    const updateUser = await User.findByIdAndUpdate(req?.user?._id,{
        $set:{
            refreshToken: undefined
        }
    })
    const Options = {
        httpOnly: true,
        sameSite: "Lax",
        secure: false
    }
    res
    .status(200)
    .clearCookie("ACCESS_TOKEN",Options)
    .clearCookie("REFRESH_TOKEN",Options)
    .json(new ApiResponse(
        200,
        "User loggedOut successfully."
    ))
});

const addVirtualAsssitantData = asyncHandler(async (req,res)=>{
    const {assistantName,image} = req?.body;
    console.log("AssistantNamme: ",assistantName);
    if(!assistantName){
        throw new ApiError(400,"Assistant Name is missing.");
    } 
    let imageURL;
    if(req?.files && req?.files?.image && req?.files?.image?.length > 0 ){
        imageURL = req?.files?.image[0].path;
    }else{
        imageURL = image;
    }
    console.log("Image: ",imageURL);
    if(!image){
        const imageURL = await uploadToCloudinary(imageURL);
        console.log("UploadedTOCloudingary: ",image);
        if(!imageURL){
            throw new ApiError(400, "Error occured in uploading Image.");
        }
    }

    const virtualAssistant = await AiVirtualAssistant.create({
        assistantName,
        image:imageURL,
        owner: req?.user?._id
    });
    
    res
    .status(200)
    .json(new ApiResponse(
        200,
        virtualAssistant,
        "Virtual Assistant created successfully."
    ))
})

const getVirtualAssistantData = asyncHandler(async (req,res) =>{
    if(req?.user){
        const findData = await AiVirtualAssistant.find();
        if(!findData || findData.length == 0){
            throw new ApiError(400,"No record found");
        }
        res
        .status(200)
        .json(new ApiResponse(
            200,
            findData,
            "Record fetched successfully."
        ))
    }
})

const editVirtualAsssitantData = asyncHandler(async (req,res)=>{
    const {assistantName,image} = req?.body;
    console.log("AssistantNamme: ",assistantName);
    if(!assistantName){
        throw new ApiError(400,"Assistant Name is missing.");
    } 
    let imageURL;
    if(req?.files && req?.files?.image && req?.files?.image?.length > 0 ){
        imageURL = req?.files?.image[0].path;
    }else{
        imageURL = image;
    }
    console.log("Image: ",imageURL);
    if(!image){
        const imageURL = await uploadToCloudinary(imageURL);
        console.log("UploadedTOCloudingary: ",image);
        if(!imageURL){
            throw new ApiError(400, "Error occured in uploading Image.");
        }
    }

    const virtualAssistant = await AiVirtualAssistant.findOneAndUpdate({owner: req?.user?._id},{
        assistantName,
        image: imageURL,
        owner: req?.user?._id
    })
    
    res
    .status(200)
    .json(new ApiResponse(
        200,
        virtualAssistant,
        "Virtual Assistant created successfully."
    ))
})

const askToAssistant = asyncHandler(async (req,res)=> {
    const {command} = req.body;
    const userName = req?.user?.name;
    const assistant = await AiVirtualAssistant.findOne({ owner: req?.user?._id });
    
    if(!assistant){
        throw new ApiError(400,"No virtual assistant found.");
    }
    const result = await gemini(command,assistant?.assistantName,userName);
    if(!result){
        throw new ApiError(400,"No response from Gemini.");
    }
    switch(result.type){
        case "get_date": 
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {...result,response: `Current date is: ${moment().format("YYYY-MM-DD")}`},
            "Response from Gemini"
        ))
        case "get_time":
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                {...result,response:`Current time is: ${moment().format("hh:mm A")}`},
                "Response from Gemini"
            ))
        case "get_day":
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                {...result,response: `Today is ${moment().format("dddd")}`},
                "Response from Gemini"
            ))
        case "general":
        case "calculator_open":
        case "facebook_open":
        case "instagram_open":
        case "youtube_open":
        case "youtube_play":
        case "weather_show":
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                result,
                "Response from Gemini"
            ))
        default:
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                result,
                "Response from Gemini"
            ))
    }
    
})
module.exports = {
    register,
    login,
    logOut,
    addVirtualAsssitantData,
    getVirtualAssistantData,
    editVirtualAsssitantData,
    askToAssistant
}