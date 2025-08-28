import dotenv from "dotenv";
import { Agent, Runner } from "@openai/agents";

import { SMART_WEB_AGENT_PROMPT } from "./constants.js";
import { z } from "zod";

dotenv.config();
import browser, {
    takeScreenShot,
    openBrowserUrl,
    getWebpageStructure,
    elementByMatchingSelector,
    fillInput,
    clickElement,
    keyPress,
    keyCombination,
} from "./browser.js";
import { pageSummarizationAgent } from "./miniAgents.js";

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
        fillInput,
        clickElement,
        keyPress,
        keyCombination,
    ],
});

async function chatWithAgent(query) {
    const runner = new Runner({});
    try {
        const response = await runner.run(websiteAutomationAgent, query, {
            maxTurns: 30,
        });
        console.log("Final response:", response.finalOutput);
        await browser.close();
    } catch (error) {
        console.error("Agent execution failed:", error);
        await browser.close();
    }
}

chatWithAgent(`
go to bing and search for mobile and tell me the first site and links
`);
