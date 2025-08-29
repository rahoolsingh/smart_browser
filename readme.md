# 🧠 Smart Browser

Smart Browser is an **AI-powered browser automation agent** that can **interact with websites intelligently** and **integrate with WhatsApp** for automation and bot management.  
It uses **DOM inspection**, **dynamic actions**, and **AI-driven decision-making** to automate tasks like opening URLs, clicking buttons, filling forms, scraping data, and controlling a WhatsApp bot.

<iframe width="800" height="450" src="https://www.youtube.com/embed/poLt3p_HRyc"
title="Smart Browser Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
</iframe>


Watch the [Smart Browser Demo Video](https://www.youtube.com/watch?v=poLt3p_HRyc) on YouTube.

---

## 🚀 Features

- 🌐 **Automated Web Browsing** — Opens any website and navigates seamlessly.
- 🧩 **DOM-Based Actions** — Finds and interacts with elements intelligently.
- 🗃️ **Data Extraction** — Scrapes and returns structured content from webpages.
- 🧠 **Smart Decision Making** — Uses AI-driven prompts for efficient actions.
- 🔄 **Multi-Step Automation** — Handles complex tasks with multi-step workflows.
- ⚡ **Fast & Reliable** — Built with performance and stability in mind.
- 💬 **WhatsApp Bot Integration** — Log in, manage sessions, and automate messages.
- 🤖 **Group Management** — Auto-reply, group monitoring, and smart interactions.
- 🧠 **AI-Powered Chatbot** — Uses LLMs to reply in a human-like manner.

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rahoolsingh/smart_browser.git
cd smart_browser
npm install

```

----------

## 🛠️ Usage Overview

### **1. Start the Smart Browser Agent**

```bash
npm start

```

This will launch the browser automation service and start listening for commands.

----------

### **2. Example Browser Usage**

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

----------

## 📱 WhatsApp Bot Integration

Smart Browser comes with an integrated **WhatsApp Bot** built using [Baileys](https://github.com/adiwajshing/Baileys) to manage conversations, automate replies, and perform group operations.

----------

### **1. Start WhatsApp Bot**

```bash
npm run whatsapp

```

This will generate a **QR code** in your terminal.

----------

### **2. Login Process**

1.  Open **WhatsApp** on your mobile.
    
2.  Go to **Settings → Linked Devices → Link a Device**.
    
3.  Scan the QR code displayed in your terminal.
    
4.  The bot will now be **connected** and ready to use.
    

----------

### **3. Bot Features**

-   ✅ **Smart Auto-Replies** — Replies intelligently to messages.
    
-   🏷️ **Group Member Tagging** — Randomly tags members for playful interaction.
    
-   🚫 **Self-Message Protection** — Avoids replying to its own messages.
    
-   🧠 **Gemma 3 AI Integration** — Uses LLM to generate human-like responses.
    
-   📂 **Session Persistence** — No need to log in every time; session data is saved.
    
-   ⚡ **Fast & Lightweight** — Optimized for performance even in large groups.
    

----------

### **4. Manage WhatsApp Sessions**

-   **Logout Session**
    

```bash
npm run whatsapp:logout

```

-   **Check Connection**
    

```bash
npm run whatsapp:status

```

-   **Clear All Sessions**
    

```bash
npm run whatsapp:clear

```

----------

## ⚙️ Project Structure

```
smart_browser/
│── src/
│   ├── agent/            # AI-driven automation logic
│   ├── tools/            # Browser tools for DOM interaction
│   ├── whatsapp/         # WhatsApp bot logic & session handling
│   ├── utils/            # Helper functions & constants
│── package.json          # Project metadata and dependencies
│── README.md             # Documentation

```

----------

## 🔧 Configuration

-   **Browser Engine**: Uses **Puppeteer / Playwright** (configurable)
    
-   **AI Agent**: Handles natural language commands
    
-   **WhatsApp Bot**: Uses **Baileys** for automation
    
-   **AI Model**: Integrated with **Gemma 3 LLM** for smart replies
    

You can customize settings inside `src/config/` for:

-   Browser timeouts
    
-   WhatsApp session storage
    
-   AI model preferences
    

----------

## 🧩 Tech Stack

-   **Node.js** — Backend runtime
    
-   **Puppeteer / Playwright** — Browser automation
    
-   **Baileys** — WhatsApp Web API integration
    
-   **Zod** — Schema validation for commands
    
-   **Gemma 3** — AI-powered conversation engine
    

----------

## 🔗 Repository

[**Smart Browser – GitHub**](https://github.com/rahoolsingh/smart_browser)

----------

**Made with ❤️ by [Veer Rajpoot](https://github.com/rahoolsingh)**
