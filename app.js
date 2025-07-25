const express = require("express");
const cors = require("cors");
const app = express();
const {router} = require("./routes/index.js");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/handleError.js");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
const allowedOrigin = ["http://localhost:5173","https://aivirtual-assistant-frontend.vercel.app"];
app.use(cors({
    origin: function(origin,callback){
        if(!origin || allowedOrigin?.includes(origin)){
            callback(null,true);
        }
    },
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"]
}));
app.use("/api/v1/users",router)
app.use(errorHandler);
module.exports = {app};
