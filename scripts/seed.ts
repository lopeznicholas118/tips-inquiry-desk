// scripts/seed.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { inquiries } from "../src/db/schema";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

async function main() {
  const now = new Date();
  await db.insert(inquiries).values([
    {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      customerName: "Marta Delgado",
      customerEmail: "marta@example.com",
      originalMessage: "¿Tienen disponibilidad para una clase privada el sábado?",
      detectedLanguage: "es",
      category: "lessons",
      urgency: "normal",
      messageEn: "Do you have availability for a private lesson on Saturday?",
      messageEs: "¿Tienen disponibilidad para una clase privada el sábado?",
      draftReply: "¡Gracias por escribirnos! Voy a revisar la disponibilidad del sábado y le aviso pronto.",
      draftReplyEn: "Thanks for reaching out! I'll check Saturday's availability and let you know shortly.",
      missingInfo: JSON.stringify(["confirm exact time slot availability"]),
      needsHuman: false,
      status: "needs_review",
    },
    {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      customerName: "Joseph León Lopez",
      customerEmail: "josephleonlopez@example.com",
      originalMessage: "What is the price for the group classes?",
      detectedLanguage: "en",
      category: "pricing",
      urgency: "low",
      messageEn: "What is the price for the group classes?",
      messageEs: "¿Qué es el precio de las clases grupales?",
      draftReply: "Thanks for reaching out! The prices for the group classes are $60/person. Let me know what date and time you want to book the classes.",
      draftReplyEn: "Thanks for reaching out! The prices for the group classes are $60/person. Let me know what date and time you want to book the classes.",
      missingInfo: JSON.stringify(["confirm exact time slot availability"]),
      needsHuman: false,
      status: "approved",
    }
  ]);
  console.log("Seeded demo inquiries.");
}

main();