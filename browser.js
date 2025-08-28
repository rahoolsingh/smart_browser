import { z } from "zod";
import puppeteer from "puppeteer";
import fs from "fs";
import { tool } from "@openai/agents";

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
        "Get the DOM structure of the current webpage with a focus on specific elements",
    parameters: z.object({
        focusArea: z
            .string()
            .nullable()
            .default("form")
            .describe(
                "Specific area to focus on like 'form', 'inputs', 'buttons', 'links'"
            ),
    }),
    async execute({ focusArea = "form" }) {
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
                'button, input[type="submit"], input[type="button"]'
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

            return elements;
        }, focusArea || "form");

        return { structure };
    },
});

const elementByMatchingSelector = tool({
    name: "element_by_matching_selector",
    description: "Get an element by matching a specific selector",
    parameters: z.object({
        selector: z.string().describe("CSS selector to match"),
    }),
    async execute({ selector }) {
        const element = await page.$(selector);
        if (!element) {
            throw new Error(`No element found for selector: ${selector}`);
        }
        return { element };
    },
});

const getStructuredTextContentInBrief = tool({
    name: "get_structured_text_content_in_brief",
    description: "Get structured text content from the webpage",
    parameters: z.object({
        focusArea: z.string().describe("The area of the page to focus on div, a section, or any other container"),
    }),
    async execute({ focusArea }) {
        const content = await page.evaluate((focusArea) => {
            const element = document.querySelector(focusArea);
            if (!element) return null;

            const textContent = element.innerText.trim();
            return { textContent };
        }, focusArea);

        if (!content) {
            throw new Error(`No content found in focus area: ${focusArea}`);
        }

        return { content };
    },
});

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

const keyCombination = tool({
    name: "key_combination",
    description: "Simulate a combination of key press events",
    parameters: z.object({
        keys: z.array(z.string()).describe("Array of keys to press"),
    }),
    async execute({ keys }) {
        for (const key of keys) {
            await page.keyboard.press(key);
            console.log(`Pressed key: ${key}`);
        }
        return { success: true };
    },
});

export {
    takeScreenShot,
    openBrowserUrl,
    getWebpageStructure,
    elementByMatchingSelector,
    getStructuredTextContentInBrief,
    fillInput,
    clickElement,
    keyPress,
    keyCombination,
};

export default browser;
