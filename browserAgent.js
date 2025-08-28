import "dotenv/config";
import {
    Agent,
    OpenAIProvider,
    Runner,
    setDefaultOpenAIClient,
    setOpenAIAPI,
    setTracingDisabled,
} from "@openai/agents";

import { SMART_WEB_AGENT_PROMPT } from "./constants.js";
import { z } from "zod";

setDefaultOpenAIClient(
    new OpenAI({
        apiKey: process.env.GOOGLE_GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    })
);
setOpenAIAPI("chat_completions");
setTracingDisabled(true);

import browser, {
    takeScreenShot,
    openBrowserUrl,
    getWebpageStructure,
    getDetailedTextContent,
    elementByMatchingSelector,
    fillInput,
    clickElement,
    keyPress,
    keyCombination,
} from "./browser.js";
import { pageSummarizationAgent } from "./miniAgents.js";
import OpenAI from "openai";

const websiteAutomationAgent = new Agent({
    name: "Website Automation Agent",
    instructions: SMART_WEB_AGENT_PROMPT,
    tools: [
        takeScreenShot,
        openBrowserUrl,
        getWebpageStructure,
        elementByMatchingSelector,
        pageSummarizationAgent.asTool({
            toolName: "pageSummarizationAgent",
            description:
                "Extract and summarize key text content from the page based on the specified focus area like a div, section, or any other container.",
            parameters: z.object({
                focusArea: z.string(),
            }),
        }),
        getDetailedTextContent,
        fillInput,
        clickElement,
        keyPress,
        keyCombination,
    ],
    model: process.env.AI_MODEL || "gemini-2.5-flash",
});

const message = [];

async function chatWithAgent(query) {
    const runner = new Runner({
        modelProvider: new OpenAIProvider({
            openAIClient: new OpenAI({
                apiKey: process.env.GOOGLE_GEMINI_API_KEY,
                baseURL:
                    "https://generativelanguage.googleapis.com/v1beta/openai/",
            }),
        }),
    });
    try {
        console.log("Running query:", query);
        message.push({ role: "user", content: query });
        const response = await runner.run(websiteAutomationAgent, query, {
            maxTurns: 30,
        });
        console.log("Final response:", response.finalOutput);
        message.push({ role: "assistant", content: response.finalOutput });

        return response.finalOutput;
    } catch (error) {
        console.error("Agent execution failed:", error);
        throw error;
    }
}

export { chatWithAgent };
