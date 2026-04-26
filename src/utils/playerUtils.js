// Derives a stable player ID from nickname + password using SHA-256.
// Same inputs always produce the same ID, across devices and sessions.
export async function derivePlayerId(nickname, password) {
  const input = `${nickname.trim().toLowerCase()}:${password}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
}
