import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "dotenv";
import { z } from "zod";
import rl from "readline/promises"; // readline to get the input
import { HumanMessage, AIMessage, AIMessageChunk, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
//import { HumanMessage, AIMessage , AIMessageChunk, SystemMessage  , tool , createAgent} from "langchain/schema"; // to maintain the conversation history
import { tavily } from "@tavily/core"; // replace with the actual module you need from Tavily
config();

console.log("Key =", process.env.MISTRAL_AI_API_KEY);

const tvly=tavily({apiKey:process.env.TAVILY_API_KEY ?? process.env.API_KEY}) // initialize the tavily with the api key

async function getLatestInfo({query}){ // Functions to get the data - Tool
    

const response = await tvly.search(query); // search the query in the tavily and get the response from response obj

 const results = response.results; // get the results from the response
 const content = results.map(result => result.content).join("\n"); // get the content from the results and join them with new line
    return content; // return the content
//     return "India is a country in South Asia. It is the seventh-largest country by land area, the second-most populous country, and the most populous democracy in the world. Bounded by the Indian Ocean on the south, the Arabian Sea on the southwest, and the Bay of Bengal on the southeast, it shares land borders with Pakistan to the west; China, Nepal, and Bhutan to the north; and Bangladesh and Myanmar to the east. In the Indian Ocean, India is in the vicinity of Sri Lanka and the Maldives; its Andaman and Nicobar Islands share a maritime border with Thailand and Indonesia."

}

// TOOL To search the latest info from the internet and then we can pass that info to the model and then we can get the response from the model with the latest info
const getLatestInfoTool = tool(
  async ({ query }) => {
    return getLatestInfo({ query });
  },
  {
    name: "getLatestInfo",
    description: "Get latest info from the internet",
    schema: z.object({
      query: z.string()
    })
  }
);


const readline = rl.createInterface({ // input and output from the terminal
    input: process.stdin,
    output: process.stdout
})

// const userPrompt = await readline.question("Enter your prompt: "); // get the input from the user

const model = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_AI_API_KEY ?? process.env.API_KEY
});

const agent = createAgent({
    model: model,
    tools: [getLatestInfoTool]
})

const apiKey = process.env.MISTRAL_AI_API_KEY ?? process.env.API_KEY;

if (!apiKey) {
    throw new Error("Missing MISTRAL_AI_API_KEY in .env");
}

const messages = [

    new SystemMessage(`You are ALEX and you are joyful senior developer who explains things related to MERN and current date is ${new Date().toLocaleDateString()} time ${new Date().toLocaleTimeString()}`) // system instruction that should be the first message and the rules how should behave current
]; // array to maintain the conversation history along system instruction

while (true) {
    // infinite loop to keep asking the user for input until they exit
    const userPrompt = await readline.question("Enter your prompt: "); // get the input from the user
     // push this input to humanmessage new
    messages.push(new HumanMessage(userPrompt)); // add user message to the conversation history
    
   // const stream = await model.stream(messages); //  model was usd earlier -send the entire conversation history to the model
  
  
  
   // now agent will send response  - model
  
 const stream = await model.stream(messages);
    
    let aiResponse = ""; // variable to store the model response 

    for await (const chunk of stream) {
        if(chunk instanceof AIMessageChunk){
            process.stdout.write(chunk.text);
            aiResponse += chunk.text; // append the chunk to the model response
        }
    }

    // push this ai response output to ai message new
    messages.push(new AIMessage(aiResponse)); // add model response to the conversation history

    process.stdout.write("\n");  // move to the next line after the response is printed to the console else it will take input in that line

    //  terminal pr chatbot create - have the package - readline to have the input from the user from terminal and then we can pass that input to the model and get the response from the model and then we can print the response to the console
    // console.log(userPrompt); // print the input from the user to the console
    // console.log("Response from the model: "); // print the response from the model to the console

    //READLINE we need to close as well so that user can opt out from input and then we can close the readline interface
    // readline.close(); 
} // end of while loop





//  llm - by default old history dont have teh access to there conversation
 // FLOW
  
// user -> prompt -> mistral server -> server will send this prompt to the model -> model will generate the response -> server will send the response back to the user
// mistral server  and LLM - input and output didn't stored

// QQ - then how the chatgpt and the claude and other open ai models are able to store the conversation history and then they can use that history to generate the response for the next prompt


// we need to create this thing 

// user interact with LLM then we maintain the array and both input and the output
// full array we will send to the misteral server LLM 

// when we get the output we store the output in the same array and then we can use that array to generate the response for the next prompt

// to maintain the conversation history, we can create an array to store both the user prompts and the model responses. Each time the user provides a new prompt, we append it to the array along with the corresponding response from the model. This way, we can send the entire conversation history to the model for context when generating responses for subsequent prompts.

// QQ - NOTE -  we have the problem in this that if 10000 of messages are there in the array then it will be difficult to send the entire array to the model for context. So we can limit the number of messages in the array to a certain number, say 10 or 20, and then we can send only the last 10 or 20 messages to the model for context. This way, we can maintain the conversation history without overwhelming the model with too much data.

// Compact chat - summary and then pass with the last message 
 // OR
 // send last n number of messages to the model for context. This way, we can maintain the conversation history without overwhelming the model with too much data.





 //------
//we need the 2 message import humanmessage and ai message

//  let message =[]
// messages.push(new HumanMessage(userPrompt)); // add user message to the conversation history

// let aiResponse = ""; // variable to store the model response

// const stream = await model.stream(messages); // send the entire conversation history to the model
// for await (const chunk of stream) {
//     process.stdout.write(chunk.text);
//     aiResponse += chunk.text; // append the chunk to the model response
// }

// messages.push(new AIMessage(aiResponse)); // add model response to the conversation history





// Q- LLM - doesnt know the Todays date and time exact 
// deep learning data we took from dataset and  train-> LLM


// Q - LLM - let me the latest news and info 

// which data llm is trained last this model it has old info 

// to have the latest info we can use the web search and then we can pass that info to the model and then we can get the response from the model with the latest info



//  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// System Instructions - we can give the system instructions to the model to behave in a certain way. For example, we can give the system instructions to the model to behave like a doctor or a lawyer or a teacher or a friend or a mentor or a coach or a guide or a companion or a partner or a collaborator or a teammate or a colleague or a peer or a friend or a mentor or a coach or a guide or a companion or a partner or a collaborator or a teammate or a colleague or a peer.

// SYSTEM INSTRUCTIONS MAINLY AI KO BTANE K LIYE AAPKO BEHAVE KAISA KARNA H 

// how behave + Additonal Info like (current date)

// only we can have 1 system instruction and it should be the first message in the conversation


// AI always hallucinate and it will give the wrong answer and it will give the wrong answer with confidence. So we can give the system instructions to the model to behave like a doctor or a lawyer or a teacher or a friend or a mentor or a coach or a guide or a companion or a partner or a collaborator or a teammate or a colleague or a peer. This way, we can make the model behave in a certain way and we can get the response from the model in that way.

// misteral model trained in 2024 so it can tell till that

//-------------------------------------------------------
//internet 
// llm dont have access to internet so we provided access to tools

// 1. web search tool - we can use the web search tool to get the latest info from the internet and then we can pass that info to the model and then we can get the response from the model with the latest info
// 2. calculator tool - we can use the calculator tool to do the calculations and then we can pass that info to the model and then we can get the response from the model with the latest info 


// import { ChatMistralAI } from "@langchain/mistralai";
// import { config } from "dotenv";
// import rl from "readline/promises";
// import {
//   HumanMessage,
//   AIMessage,
//   SystemMessage,
// } from "@langchain/core/messages";

// config();

// const readline = rl.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const apiKey =
//   process.env.MISTRAL_AI_API_KEY ?? process.env.API_KEY;

// if (!apiKey) {
//   throw new Error("Missing MISTRAL_AI_API_KEY in .env");
// }

// console.log("Mistral API Key:", apiKey ? "FOUND" : "MISSING");

// const model = new ChatMistralAI({
//   model: "mistral-small-latest",
//   apiKey,
// });

// const messages = [
//   new SystemMessage(
//     `You are ALEX and you are a joyful senior developer who explains MERN concepts. Current date is ${new Date().toLocaleDateString()} and current time is ${new Date().toLocaleTimeString()}`
//   ),
// ];

// while (true) {
//   try {
//     const userPrompt = await readline.question(
//       "Enter your prompt: "
//     );

//     if (userPrompt.toLowerCase() === "exit") {
//       readline.close();
//       process.exit(0);
//     }

//     messages.push(new HumanMessage(userPrompt));

//     console.log("\nCalling Mistral...\n");

//     const response = await model.invoke(messages);

//     let aiResponse = "";

//     if (typeof response.content === "string") {
//       aiResponse = response.content;
//     } else {
//       aiResponse = JSON.stringify(response.content, null, 2);
//     }

//     console.log(aiResponse);

//     messages.push(new AIMessage(aiResponse));

//     console.log("\n");
//     // readline.close();
//   } catch (error) {
//     console.error("ERROR:");
//     console.error(error);
//   }
// }