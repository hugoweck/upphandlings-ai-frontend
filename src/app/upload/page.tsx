"use client";
import { useState } from "react";

type AnalyzeResult = {
  ska_krav?: string[];
  bor_krav?: string[];
  deadlines?: string[];
};

/** ---- HJÄLPFUNKTIONER (läggs kvar i denna fil) ---- */
// Ta bort rader som bara är rubriker i datan
const isHeader = (s: string) => {
  const t = s.trim().toLowerCase();
  return (
    t.startsWith("ska-krav") ||
    t.startsWith("bör-krav") ||
    t.startsWith("deadline")
  );
};

// Ta bort ledande punkt/streck och extra whitespace
const clean = (s: string) => s.replace(/^[\s\-•\u2022]+/, "").trim();
/** --------------------------------------------------- */

export default function UploadPage() {
  const [res, setRes] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch(
        (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") + "/analyze",
        { method: "POST", body: form }
      );
      if (!r.ok) throw new Error("Backend svarade inte OK");
      const j = (await r.json()) as AnalyzeResult;
      setRes(j);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Något gick fel vid uppladdning";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ladda upp upphandlings-PDF</h1>
      <input type="file" accept="application/pdf" onChange={onUpload} />
      {loading && <p>Analyserar…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {res && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* SKA-KRAV */}
          <div>
            <h2 className="font-semibold mb-2">Ska-krav</h2>
            <ul className="list-disc ml-5 space-y-1">
              {(res.ska_krav ?? [])
                .filter((x) => !isHeader(x))
                .map((x, i) => <li key={i}>{clean(x)}</li>)}
              {(!res.ska_krav || res.ska_krav.filter((x)=>!isHeader(x)).length===0) && (
                <li className="opacity-70 list-none">Inget hittat.</li>
              )}
            </ul>
          </div>

          {/* BÖR-KRAV */}
          <div>
            <h2 className="font-semibold mb-2">Bör-krav</h2>
            <ul className="list-disc ml-5 space-y-1">
              {(res.bor_krav ?? [])
                .filter((x) => !isHeader(x))
                .map((x, i) => <li key={i}>{clean(x)}</li>)}
              {(!res.bor_krav || res.bor_krav.filter((x)=>!isHeader(x)).length===0) && (
                <li className="opacity-70 list-none">Inget hittat.</li>
              )}
            </ul>
          </div>

          {/* DEADLINES */}
          <div>
            <h2 className="font-semibold mb-2">Deadlines</h2>
            <ul className="list-disc ml-5 space-y-1">
              {(res.deadlines ?? [])
                .filter((x) => !isHeader(x))
                .map((x, i) => <li key={i}>{clean(x)}</li>)}
              {(!res.deadlines || res.deadlines.filter((x)=>!isHeader(x)).length===0) && (
                <li className="opacity-70 list-none">Inget hittat.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
