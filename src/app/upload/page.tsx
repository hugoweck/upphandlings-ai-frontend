"use client";
import { useState } from "react";

export default function UploadPage() {
  const [res, setRes] = useState<any>(null);
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
      const r = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/analyze", {
        method: "POST",
        body: form,
      });
      if (!r.ok) throw new Error("Backend svarade inte OK");
      const j = await r.json();
      setRes(j);
    } catch (err:any) {
      setError(err?.message || "Något gick fel");
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
          <div>
            <h2 className="font-semibold mb-2">Ska-krav</h2>
            <ul className="list-disc ml-5 space-y-1">
              {res.ska_krav?.map((x:string,i:number)=><li key={i}>{x}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Bör-krav</h2>
            <ul className="list-disc ml-5 space-y-1">
              {res.bor_krav?.map((x:string,i:number)=><li key={i}>{x}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Deadlines</h2>
            <ul className="list-disc ml-5 space-y-1">
              {res.deadlines?.map((x:string,i:number)=><li key={i}>{x}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
