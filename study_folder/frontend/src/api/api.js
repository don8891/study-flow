export async function checkBackend() {
  const res = await fetch("http://127.0.0.1:5000/health");
  return res.json();
}
