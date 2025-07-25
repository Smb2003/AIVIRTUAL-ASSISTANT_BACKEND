const mongoose = require("mongoose");

const aiVirtualAssistanceSchema = new mongoose.Schema({
    assistantName: {
        type: String
    },
    image: {
        type: String
    },
    history: [
        {
            type: String
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

const AiVirtualAssistant = mongoose.model("AiVirtualAssistant",aiVirtualAssistanceSchema);
module.exports = {AiVirtualAssistant};