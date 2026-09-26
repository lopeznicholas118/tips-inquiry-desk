import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries, INQUIRY_STATUSES, type InquiryStatus } from "@/db/schema";
import { StatusBadge } from "@/components/StatusBadge";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams; // Next.js 15+: searchParams is a Promise, must be awaited
  const filter = INQUIRY_STATUSES.includes(status as InquiryStatus) ? (status as InquiryStatus) : undefined;

  const rows = filter
    ? await db.select().from(inquiries).where(eq(inquiries.status, filter)).orderBy(desc(inquiries.createdAt))
    : await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Inquiries</h1>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/inquiries" className={`px-3 py-1 rounded-full border ${!filter ? "bg-black text-white" : ""}`}>
          All
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/inquiries?status=${s}`}
            className={`px-3 py-1 rounded-full border ${filter === s ? "bg-black text-white" : ""}`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Urgency</th>
            <th className="py-2 pr-4">Lang</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="py-2 pr-4">{row.customerName}</td>
              <td className="py-2 pr-4">{row.category ?? "—"}</td>
              <td className="py-2 pr-4">{row.urgency ?? "—"}</td>
              <td className="py-2 pr-4 uppercase">{row.detectedLanguage ?? "—"}</td>
              <td className="py-2 pr-4">
                <StatusBadge status={row.status as InquiryStatus} />
              </td>
              <td className="py-2 pr-4">
                <Link href={`/inquiries/${row.id}`} className="text-blue-600 hover:underline">
                  Review
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-400">
                No inquiries yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}