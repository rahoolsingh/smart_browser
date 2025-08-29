import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
} from "@whiskeysockets/baileys";

import path from "path";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { chatWithAgent } from "./browserAgent.js";

const { state, saveCreds } = await useMultiFileAuthState(
    path.join("auth_info_baileys")
);
const { version } = await fetchLatestBaileysVersion();

let whatsappSocket;
let whatsappSender;

const sock = makeWASocket({
    version,
    auth: state,
    defaultQueryTimeoutMs: 60000,
    logger: pino({ level: "silent" }),
});

sock.ev.on("creds.update", saveCreds);
const selfJid = () => sock.user?.id.split(":")[0] + "@s.whatsapp.net";

sock.ev.on("connection.update", (update) => {
    if (update.qr) console.log(qrcode.generate(update.qr, { small: true }));

    if (update.connection === "open") {
        console.log("✅ Mohini is online and excited to chat!");
    }
    if (
        update.connection === "close" &&
        update.lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut
    ) {
        console.log("🔄 Mohini is reconnecting...");
    }
});

sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const botJid = selfJid();
        const author = msg.key.participant || msg.key.remoteJid;
        if (author === botJid) return;

        let text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";
        if (!text.trim()) return;

        console.log("Received message:", text);

        // Step 1 — Acknowledge request
        await sock.sendPresenceUpdate("composing", sender);
        await sock.sendMessage(sender, { text: "⚡ Mohini is working on it..." });

        // Step 2 — Wait until automation is FULLY done
        const response = await chatWithAgent(text.trim());

        // Step 3 — Send final result
        await sock.sendPresenceUpdate("composing", sender);
        await sock.sendMessage(sender, { text: response });
    } catch (err) {
        console.error("Message handling error:", err);
    }
});


export { whatsappSender, whatsappSocket };
