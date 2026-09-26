
import {readFileSync} from "fs";
import {triageInquiry} from "../src/lib/ai/triage";

async function main() {
  const facts = readFileSync("data/business-facts.md", "utf-8");
  const message = process.argv[2] ?? "Hola, quisiera saber el precio de una clase privada";
  const result = await triageInquiry(message, facts);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);