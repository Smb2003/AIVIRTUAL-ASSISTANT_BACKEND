require("dotenv").config();
const {app} = require("./app.js");
const { gemini } = require("./controller/geminiApi.js");
const {connect_to_database} = require("./database/index.js");





connect_to_database()
.then(()=>{
    console.log("Connected successfully.");
})
.catch((error)=>{
    console.log(`Error: ${error}`);
})


app.listen(process.env.PORT || 3000, ()=>{
    console.log(`Server is listening at port: ${process.env.PORT}`);
});