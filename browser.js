import { z } from "zod";
import puppeteer from "puppeteer";
import fs from "fs";
import { tool } from "@openai/agents";
import { whatsappSender, whatsappSocket } from "./whatsapp.js";
import secrets from "./secrets.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
    headless: false,
    args: [
        "--start-maximized",
        "--disable-extensions",
        "--disable-file-system",
    ],
    defaultViewport: null,
});

const page = await browser.newPage();

const takeScreenShot = tool({
    name: "take_screenshot",
    description: "Take screenshot of current page for inspection",
    parameters: z.object({}),
    async execute() {
        const screenshot = await page.screenshot({ fullPage: true });
        if (!fs.existsSync("temp")) {
            fs.mkdirSync("temp");
        }
        const filePath = `temp/screenshot-${Date.now()}.png`;
        await fs.promises.writeFile(filePath, screenshot);
        await whatsappSocket.sendMessage(whatsappSender, {
            image: { url: filePath },
        });
        await whatsappSocket.sendMessage(whatsappSender, {
            text: `Screenshot taken: ${filePath}`,
        });

        console.log("Screenshot taken:", filePath);
        return { filePath };
    },
});

const openBrowserUrl = tool({
    name: "open_browser_url",
    description: "Open a url in the browser",
    parameters: z.object({ url: z.string() }),
    async execute({ url }) {
        await page.goto(url, { waitUntil: "networkidle2" });
        await delay(300);
        console.log("Navigated to:", url);
        return { success: true };
    },
});

const getWebpageStructure = tool({
    name: "get_webpage_structure",
    description:
        "Get the DOM structure of the current webpage, including forms, inputs, buttons, and links",
    parameters: z.object({
        focusArea: z
            .string()
            .nullable()
            .default("body")
            .describe(
                "Specific area to focus on like 'form', 'inputs', 'buttons', 'links'"
            ),
    }),
    async execute({ focusArea = "body" }) {
        const structure = await page.evaluate((focus) => {
            const elements = [];

            // Get all form elements
            const forms = document.querySelectorAll("form");
            forms.forEach((form, formIndex) => {
                elements.push({
                    tag: "form",
                    selector: `form:nth-child(${formIndex + 1})`,
                    id: form.id,
                    className: form.className,
                    action: form.action,
                });
            });

            const inputs = document.querySelectorAll("input, textarea, select");
            inputs.forEach((input, inputIndex) => {
                const selectors = [];
                if (input.id) selectors.push(`#${input.id}`);
                if (input.name) selectors.push(`[name="${input.name}"]`);
                if (input.type) selectors.push(`input[type="${input.type}"]`);
                if (input.placeholder)
                    selectors.push(`[placeholder="${input.placeholder}"]`);

                elements.push({
                    tag: input.tagName.toLowerCase(),
                    type: input.type,
                    id: input.id,
                    name: input.name,
                    className: input.className,
                    placeholder: input.placeholder,
                    selectors: selectors,
                    value: input.value,
                    required: input.required,
                    visible: input.offsetParent !== null,
                });
            });

            const buttons = document.querySelectorAll(
                'button, input[type="submit"], input[type="button"], a[role="button"], [role="button"]'
            );
            buttons.forEach((button, buttonIndex) => {
                const selectors = [];

                if (button.id) selectors.push(`#${button.id}`);
                if (button.className) {
                    const classes = button.className
                        .split(" ")
                        .filter((c) => c);
                    if (classes.length > 0)
                        selectors.push(`.${classes.join(".")}`);
                }
                if (button.type) selectors.push(`[type="${button.type}"]`);

                elements.push({
                    tag: button.tagName.toLowerCase(),
                    type: button.type,
                    id: button.id,
                    className: button.className,
                    textContent: button.textContent?.trim(),
                    value: button.value,
                    selectors: selectors,
                    visible: button.offsetParent !== null,
                });
            });

            // ✅ Get all links
            const links = document.querySelectorAll("a[href]");
            links.forEach((link, linkIndex) => {
                elements.push({
                    tag: "a",
                    textContent: link.textContent?.trim(),
                    href: link.href,
                    selector: `a:nth-child(${linkIndex + 1})`,
                    visible: link.offsetParent !== null,
                });
            });

            return elements;
        }, focusArea || "body");

        return { structure };
    },
});

const getNavigationStructure = tool({
    name: "get_navigation_structure",
    description: "Get the navigation structure of the current webpage",
    parameters: z.object({
        focusArea: z
            .string()
            .nullable()
            .default("nav")
            .describe(
                "Specific area to focus on like 'nav', 'header', 'footer'"
            ),
    }),
    async execute({ focusArea = "nav" }) {
        const structure = await page.evaluate((focus) => {
            const element = document.querySelector(focus);
            if (!element) return null;

            const links = Array.from(element.querySelectorAll("a"));
            return links.map((link) => ({
                text: link.innerText.trim(),
                href: link.href,
            }));
        }, focusArea);

        if (!structure) {
            throw new Error(`No content found in focus area: ${focusArea}`);
        }

        return structure;
    },
});

// const getWebpageTextStructure = tool({
//     name: "get_webpage_text_structure",
//     description: "Get the text structure of the current webpage",
//     parameters: z.object({
//         focusArea: z
//             .string()
//             .nullable()
//             .default("body")
//             .describe("Specific area to focus on like 'body', 'header', 'footer'")
//     }),
//     async execute({ focusArea = "body" }) {
//         const structure = await page.evaluate((focus) => {
//             const element = document.querySelector(focus);
//             if (!element) return null;

//             const textContent = element.innerText.trim();
//             return {
//                 textContent,
//                 fullTextLength: textContent.length,
//                 selector: focus
//             };
//         }, focusArea);

//         if (!structure) {
//             throw new Error(`No content found in focus area: ${focusArea}`);
//         }

//         return structure;
//     },
// });

// const elementByMatchingSelector = tool({
//     name: "element_by_matching_selector",
//     description: "Get an element by matching a specific selector",
//     parameters: z.object({
//         selector: z.string().describe("CSS selector to match"),
//     }),
//     async execute({ selector }) {
//         const element = await page.$(selector);
//         if (!element) {
//             throw new Error(`No element found for selector: ${selector}`);
//         }
//         return { element };
//     },
// });

// const getStructuredTextContentInBrief = tool({
//     name: "get_structured_text_content_in_brief",
//     description: "Get a summarized structured text content from the webpage",
//     parameters: z.object({
//         focusArea: z
//             .string()
//             .describe("CSS selector of the area to extract brief text from"),
//         maxLength: z.number().optional().default(300), // default: 300 chars
//     }),
//     async execute({ focusArea, maxLength }) {
//         const content = await page.evaluate(
//             ({ focusArea, maxLength }) => {
//                 const element = document.querySelector(focusArea);
//                 if (!element) return null;

//                 const fullText = element.innerText.trim();
//                 const briefText =
//                     fullText.length > maxLength
//                         ? fullText.slice(0, maxLength) + "..."
//                         : fullText;

//                 return {
//                     briefText,
//                     fullTextLength: fullText.length,
//                     selector: focusArea,
//                 };
//             },
//             { focusArea, maxLength }
//         );

//         if (!content) {
//             throw new Error(`No content found in focus area: ${focusArea}`);
//         }

//         return content;
//     },
// });

// const getDetailedTextContent = tool({
//     name: "get_detailed_text_content",
//     description: "Fetch full structured text content for a specific element/section",
//     parameters: z.object({
//         selector: z.string().describe("CSS selector of the element to extract full text from"),
//     }),
//     async execute({ selector }) {
//         const content = await page.evaluate((selector) => {
//             const element = document.querySelector(selector);
//             if (!element) return null;
//             return { fullText: element.innerText.trim() };
//         }, selector);

//         if (!content) {
//             throw new Error(`No content found for selector: ${selector}`);
//         }

//         return content;
//     },
// });

const fillInput = tool({
    name: "fill_input",
    description:
        "Fill a form input field, will try multiple selectors if provided",
    parameters: z.object({
        selectors: z
            .array(z.string())
            .describe("Array of CSS selectors to try in order"),
        value: z.string().describe("Value to type in"),
    }),
    async execute({ selectors, value }) {
        let success = false;
        let lastError = null;

        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, {
                    visible: true,
                    timeout: 5000,
                });
                await page.click(selector, { clickCount: 3 });
                await delay(500);
                await page.type(selector, value, { delay: 100 });

                console.log(`Successfully filled ${selector} with "${value}"`);
                success = true;
                break;
            } catch (error) {
                lastError = error.message;
                console.log(`Failed to fill ${selector}: ${error.message}`);
                continue;
            }
        }

        if (!success) {
            throw new Error(
                `Failed to fill input with any selector. Last error: ${lastError}`
            );
        }

        return { success: true, usedSelector: selectors.find((s) => success) };
    },
});

const clickElement = tool({
    name: "click_element",
    description: "Click an element, will try multiple selectors if provided",
    parameters: z.object({
        selectors: z
            .array(z.string())
            .describe("Array of CSS selectors to try in order"),
    }),
    async execute({ selectors }) {
        let success = false;
        let lastError = null;

        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, {
                    visible: true,
                    timeout: 5000,
                });
                await page.click(selector);

                console.log(`Successfully clicked element: ${selector}`);
                success = true;
                break;
            } catch (error) {
                lastError = error.message;
                console.log(`Failed to click ${selector}: ${error.message}`);
                continue;
            }
        }

        if (!success) {
            throw new Error(
                `Failed to click element with any selector. Last error: ${lastError}`
            );
        }

        return { success: true, usedSelector: selectors.find((s) => success) };
    },
});

const keyPress = tool({
    name: "key_press",
    description: "Simulate a key press event",
    parameters: z.object({
        key: z.string().describe("The key to press"),
    }),
    async execute({ key }) {
        await page.keyboard.press(key);
        console.log(`Pressed key: ${key}`);
        return { success: true };
    },
});

// const keyCombination = tool({
//     name: "key_combination",
//     description: "Simulate a combination of key press events",
//     parameters: z.object({
//         keys: z.array(z.string()).describe("Array of keys to press"),
//     }),
//     async execute({ keys }) {
//         for (const key of keys) {
//             await page.keyboard.press(key);
//             console.log(`Pressed key: ${key}`);
//         }
//         return { success: true };
//     },
// });

const fillSecretInInput = tool({
    name: "fill_secret_in_input",
    description: "Fill an input field with a secret value",
    parameters: z.object({
        service: z
            .string()
            .describe(
                "The service to retrieve secrets for eg. 'github', 'facebook'"
            ),
        key: z
            .string()
            .describe("Specific key to retrieve eg. 'username', 'password'"),
        selector: z.string().describe("The CSS selector of the input field"),
    }),
    async execute({ service, key, selector }) {
        const secret = secrets[service];
        if (!secret) {
            throw new Error(`No secrets found for service: ${service}`);
        }
        const value = secret[key];
        if (!value) {
            throw new Error(`No secret found for key: ${key}`);
        }

        try {
            await page.waitForSelector(selector, {
                visible: true,
                timeout: 5000,
            });
            await page.click(selector, { clickCount: 3 });
            await delay(300);
            await page.type(selector, value, { delay: 100 });

            console.log(`Filled secret for ${service} -> ${key}`);
            return { success: true, selector, valueHidden: true };
        } catch (err) {
            throw new Error(
                `Failed to fill secret in selector "${selector}": ${err.message}`
            );
        }
    },
});

export {
    takeScreenShot,
    openBrowserUrl,
    getWebpageStructure,
    getNavigationStructure,
    // getWebpageTextStructure,
    // elementByMatchingSelector,
    // getStructuredTextContentInBrief,
    // getDetailedTextContent,
    fillInput,
    clickElement,
    keyPress,
    // keyCombination,
    fillSecretInInput,
};

export default browser;
