import "server-only";

/** Token Turnstile hanya berlaku sekali dan hanya valid kalau diperiksa di server dengan secret key. */
export async function verifikasiTurnstile(token: string, ip: string | null): Promise<boolean> {
  const rahasia = process.env.TURNSTILE_SECRET_KEY;
  if (!rahasia) throw new Error("TURNSTILE_SECRET_KEY belum diisi (lihat .env.example).");

  const isi = new URLSearchParams({ secret: rahasia, response: token });
  if (ip) isi.set("remoteip", ip);

  const respons = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: isi,
    cache: "no-store",
  });
  if (!respons.ok) return false;
  const hasil = (await respons.json()) as { success?: boolean };
  return hasil.success === true;
}
