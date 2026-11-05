// The site's forms only send strings, so any other body is malformed or hand-crafted.
export async function readFormBody(req: Request): Promise<Record<string, string> | null> {
  const body: unknown = await req.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  if (Object.values(body).some((v) => typeof v !== 'string')) return null
  return body as Record<string, string>
}
