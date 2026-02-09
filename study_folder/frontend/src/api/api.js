export async function checkBackend() {
  const res = await fetch("http://127.0.0.1:5000/health");
  return res.json();
}

export async function registerUser(email, password) {
  const res = await fetch("http://127.0.0.1:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}
