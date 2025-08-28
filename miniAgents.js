import dotenv from "dotenv";
import { Agent, Runner } from "@openai/agents";
import { getStructuredTextContentInBrief } from "./browser.js";

dotenv.config();

const pageSummarizationAgent = new Agent({
    name: "Page Summarization Agent",
    instructions: "Summarize the main content of the given webpage focus area briefly with relevant details.",
    tools: [getStructuredTextContentInBrief],
    model: "gpt-4o-mini",
});

export { pageSummarizationAgent };