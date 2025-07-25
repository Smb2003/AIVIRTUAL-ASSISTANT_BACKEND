const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        required:true,
        index: true,
    },
    password: {
        type: String,
        required:[true,"Password must be greater than 6 length."],
        minLength: 6
    },
    refreshToken: {
        type: String
    }
},{timestamps:true})

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt); 
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return  bcrypt.compare(password,this.password);
};
userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        name: this.name
    };
    const token = JWT.sign(payload,process.env.JWT_ACCESS_TOKEN,{expiresIn: "1h"});
    return token;
};

userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
    };
    const token = JWT.sign(payload,process.env.JWT_REFRESH_TOKEN,{expiresIn: "1h"});
    return token;
};
const User =  mongoose.model("User",userSchema);
module.exports = {User};