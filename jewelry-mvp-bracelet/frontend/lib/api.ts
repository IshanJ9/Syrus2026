const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeJewelry(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/generate`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

export async function customizeJewelry(req: Record<string, unknown>) {
  const res = await fetch(`${API}/api/customize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Customize failed: ${res.statusText}`);
  return res.json();
}

export async function getPrice(designId: string) {
  const res = await fetch(`${API}/api/price/${designId}`);
  if (!res.ok) throw new Error(`Price fetch failed: ${res.statusText}`);
  return res.json();
}

export async function getDesign(designId: string) {
  const res = await fetch(`${API}/api/design/${designId}`);
  if (!res.ok) throw new Error(`Design fetch failed: ${res.statusText}`);
  return res.json();
}

export function getMeshUrl(designId: string): string {
  return `${API}/api/mesh/${designId}`;
}

export function getExportUrl(designId: string, format = "glb"): string {
  return `${API}/api/export/${designId}?format=${format}`;
}
