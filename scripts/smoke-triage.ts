
import {readFileSync} from "fs";
import {triageInquiry} from "../src/lib/ai/triage";

async function main() {
  const facts = readFileSync("data/business-facts.md", "utf-8");
  const result = await triageInquiry(
    "Hola, quisiera saber el precio de una clase privada y si tienen disponibilidad el sábado",
    facts
  );
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);