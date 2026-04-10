import { db } from "@/api/base44Client";

const SESSION_KEY = "beampd_plugin_session";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signUp(username, email, password) {
  // Check username not taken
  const existing = await db.entities.PluginAccount.filter({ username });
  if (existing.length > 0) throw new Error("Username already taken.");
  const existingEmail = await db.entities.PluginAccount.filter({ email });
  if (existingEmail.length > 0) throw new Error("Email already registered.");

  const password_hash = await hashPassword(password);
  const account = await db.entities.PluginAccount.create({ username, email, password_hash });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: account.id, username, email }));
  return account;
}

export async function logIn(username, password) {
  const accounts = await db.entities.PluginAccount.filter({ username });
  if (accounts.length === 0) throw new Error("Invalid username or password.");
  const account = accounts[0];
  const password_hash = await hashPassword(password);
  if (account.password_hash !== password_hash) throw new Error("Invalid username or password.");
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: account.id, username: account.username, email: account.email }));
  return account;
}

export function logOut() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
