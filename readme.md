# 🧠 Smart Browser

Smart Browser is an **AI-powered browser automation agent** that can interact with websites intelligently.  
It uses **DOM inspection**, **dynamic actions**, and **smart decision-making** to automate tasks such as opening URLs, clicking buttons, filling forms, scraping data, and extracting structured content.

---

## 🚀 Features

- 🌐 **Automated Web Browsing** — Opens any website and navigates seamlessly.
- 🧩 **DOM-Based Actions** — Finds and interacts with elements intelligently.
- 🗃️ **Data Extraction** — Scrapes and returns structured content from webpages.
- 🧠 **Smart Decision Making** — Uses AI-driven prompts for efficient actions.
- 🔄 **Multi-Step Automation** — Handles complex tasks with multi-step workflows.
- ⚡ **Fast & Reliable** — Built with performance and stability in mind.

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rahoolsingh/smart_browser.git
cd smart_browser
npm install
````

---

## 🛠️ Usage Overview

### **1. Start the Smart Browser Agent**

```bash
npm start
```

```

This will launch the browser automation service and start listening for commands.

---

### **2. Example Usage**

#### **Open a Website**

```bash
Open flipkart.com
```

#### **Search for a Product**

```bash
Open flipkart.com and search for hot chocolate
```

#### **Extract Data**

```bash
Get me the names of the first 2 hot chocolate products listed on Flipkart
```

---

## ⚙️ Project Structure

```
smart_browser/
│── src/
│   ├── agent/          # AI-driven automation logic
│   ├── tools/          # Browser tools for DOM interaction
│   ├── utils/          # Helper functions & constants
│── package.json        # Project metadata and dependencies
│── README.md           # Documentation
```

---

## 🔧 Configuration

* **Browser Engine**: Uses **Puppeteer / Playwright** (based on your implementation).
* **AI Agent**: Processes natural language commands.
* **Selector Intelligence**: Finds DOM elements dynamically.

You can customize configurations inside `src/config/` for browser settings, timeouts, and automation preferences.

---

## 🧩 Tech Stack

* **Node.js** — Backend runtime
* **Puppeteer** — Browser automation
* **Zod** — Schema validation for commands
* **AI Prompting** — Smart natural language-driven automation

---

## 🔗 Repository

[**Smart Browser – GitHub**](https://github.com/rahoolsingh/smart_browser)

---

**Made with ❤️ by [Veer Rajpoot](https://github.com/rahoolsingh)**
