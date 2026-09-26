// src/app/inquiries/[id]/page.tsx
import {notFound} from "next/navigation";
import {eq} from "drizzle-orm";
import {db} from "@/db";
import {inquiries} from "@/db/schema";
import {ReviewPanel} from "./ReviewPanel";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params;
  const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));

  if (!inquiry) notFound();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <ReviewPanel inquiry={inquiry} />
    </main>
  );
}