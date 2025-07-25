const mongoose = require("mongoose");
const {DB_NAME} = require("../constant.js");

const connect_to_database = async () => {
    try {
        await mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`);

        mongoose.connection.on("connected",()=>{
            console.log("Connected to database");
        });
        mongoose.connection.on("error",()=>{
            console.log("Error occured while connecting MongoDB");
        })
    } catch (error) {
        console.log(`Error occured in connecting db`);
        process.exit(1);
    }
}

module.exports = {connect_to_database};