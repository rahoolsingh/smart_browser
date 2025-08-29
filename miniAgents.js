import { Agent, Runner } from "@openai/agents";
// import { getStructuredTextContentInBrief } from "./browser.js";

import "dotenv/config";

const pageSummarizationAgent = new Agent({
    name: "Page Summarization Agent",
    instructions:
        "Summarize the main content of the given webpage focus area briefly with relevant details.",
    // tools: [getStructuredTextContentInBrief],
    model: process.env.MINI_MODEL || "gemini-2.5-flash",
});

export { pageSummarizationAgent };
