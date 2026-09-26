"use client";

import { useState, type FormEvent } from "react";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real visitors never see or fill this
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (company) return; // a filled honeypot means a bot — silently drop it

    setStatus("pending");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({name, email, message}),
    });

    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <main className="mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Thank you. <br />We&apos;ve received your message.</h1>
        <p className="text-sm text-gray-500">Someone from our team will follow up shortly.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">Get in touch</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message (English or Spanish)</label>
          <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded border p-2 text-sm" />
        </div>

        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={status === "pending"}
          className="w-full rounded bg-black text-white py-2 text-sm disabled:opacity-50"
        >
          {status === "pending" ? "Sending..." : "Send"}
        </button>

        {status === "error" && <p className="text-sm text-red-600">Something went wrong — please try again.</p>}
      </form>
    </main>
  );
}