
const asyncHandler = require("../utils/asyncHandler");

const gemini = async (command,assistantName,username) => {
    try {
        console.log(command,assistantName,username);
        const prompt = `You are a virtual assistant name ${assistantName} created by ${username}. 
        You are not a google. You will no behave like a voice-enabled assistant.
        Your task is to understand the user's natural language input and respond with a JSON object like this:
        
        {
            "type": "general" | "google_search" | "youtube_search" | "youtube_play" | 
            "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "intagram_open" |
            "facebook_open" | "weather_show",
            "userinput": "<original user input>" {only remove your username from userinput if
            exists} and agar kisi ne google ya youtube pe kuch search krne bola ho to userinput
            me only wo search wala text jaye,
            "response": "< a short spoken response to read out loud to the user>"

            instructions: 
            - "type": determine the intent of the user. 
            - "userinput": original sentence the user spoke. 
            - "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here' what I found", "Today is Tuesday", etc. 
            
            Type meanings: 
            - "general": if it's a factual or informational question. 
            - "google_search": if user wants to search something on Google 
            - "youtube_search": if user wants to search something on YouTube. 
            - "youtube_play": if user wants to directly play a video or song. 
            - "calculator_open": if user wants to open a calculator 
            - "instagram_open": if user wants to open instagram 
            - "facebook_open": if user wants to open facebook. 
            -"weather_show": if user wants to know weather 
            - "get_time": if user asks for current time.
            - "get_date": if user asks for today's date.
            - "get_day": if user asks what day it is.
            - "get_month": if user asks for the current month.
            
            Important:
            - Use ${username} agar koi puche tume kisne banaya
            - Only respond with the JSON object, nothing else.
            
            now your userInput-${command}
            ;
        }`
        const api_Url = `${process.env.GEMINI_API_URL_AND_KEY}`;

        console.log(api_Url);

        const response = await fetch(api_Url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            { "text": prompt }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error("Post Failed.");
        }

        const data = await response.json();
        console.log("GEMINI API RESPONSE:", data);
        let raw = data.candidates[0].content.parts[0].text;

        raw = raw.replace(/^```json\s*|```$/g, '');

        const parsed = JSON.parse(raw);
        return parsed; 
    } catch (error) {
        console.log("GEMINI API ERROR RESPONSE:", error);
        throw error;
    }
}

module.exports = { gemini };
