import { revalidatePath } from "next/cache"

const { NOTION_PAGE_ID, NOTION_WEBHOOK_VERIFICATION_TOKEN } = process.env

const NOTION_CONTENT_EVENT_TYPES = new Set(["page.content_updated", "page.properties_updated"])
const REVALIDATE_PATH = "/"

interface NotionWebhookEventPayload {
  entity?: {
    id?: string
    type?: string
  }
  type?: string
}

type NotionWebhookPayload = NotionWebhookEventPayload | NotionWebhookVerificationPayload

interface NotionWebhookVerificationPayload {
  verification_token: string
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text()

  if (rawBody.length === 0) {
    return Response.json({ error: "Missing request body", ok: false }, { status: 400 })
  }

  const payload = parseWebhookPayload(rawBody)
  if (!payload) {
    return Response.json({ error: "Invalid JSON payload", ok: false }, { status: 400 })
  }

  if (isVerificationPayload(payload)) {
    console.info("[notion-webhook] verification_token:", payload.verification_token)
    return Response.json({ ok: true, receivedVerificationToken: true })
  }

  if (!NOTION_WEBHOOK_VERIFICATION_TOKEN) {
    return Response.json(
      { error: "Missing NOTION_WEBHOOK_VERIFICATION_TOKEN", ok: false },
      { status: 500 },
    )
  }

  const signatureHeader = request.headers.get("x-notion-signature")
  const signature = typeof signatureHeader === "string" ? signatureHeader.trim() : ""
  const isTrusted = signature
    ? await isTrustedPayload(rawBody, signature, NOTION_WEBHOOK_VERIFICATION_TOKEN)
    : false

  if (!isTrusted) {
    return Response.json({ error: "Invalid Notion signature", ok: false }, { status: 401 })
  }

  if (!isContentUpdateEvent(payload)) {
    return Response.json({ ignored: true, ok: true, reason: "Unsupported event type" })
  }

  const entityId = payload.entity ? payload.entity.id : undefined
  if (!isConfiguredPageEvent(entityId)) {
    return Response.json({ ignored: true, ok: true, reason: "Different page id" })
  }

  revalidatePath(REVALIDATE_PATH)

  return Response.json({ ok: true, revalidated: REVALIDATE_PATH })
}

function isConfiguredPageEvent(entityId: string | undefined): boolean {
  if (!NOTION_PAGE_ID) {
    return true
  }

  if (!entityId) {
    return false
  }

  return normalizeNotionId(entityId) === normalizeNotionId(NOTION_PAGE_ID)
}

function isContentUpdateEvent(payload: NotionWebhookEventPayload): boolean {
  const { entity, type } = payload
  if (!type) {
    return false
  }

  if (!entity || entity.type !== "page") {
    return false
  }

  return NOTION_CONTENT_EVENT_TYPES.has(type)
}

async function isTrustedPayload(
  rawBody: string,
  signature: string,
  verificationToken: string,
): Promise<boolean> {
  const signatureBytes = toSignatureBytes(signature)
  if (!signatureBytes) {
    return false
  }

  const key = await toHmacKey(verificationToken, ["verify"])
  const rawBodyBytes = new TextEncoder().encode(rawBody)
  const signatureBuffer = new ArrayBuffer(signatureBytes.byteLength)
  new Uint8Array(signatureBuffer).set(signatureBytes)

  return crypto.subtle.verify("HMAC", key, signatureBuffer, rawBodyBytes)
}

function isVerificationPayload(
  payload: NotionWebhookPayload,
): payload is NotionWebhookVerificationPayload {
  return "verification_token" in payload && typeof payload.verification_token === "string"
}

function normalizeNotionId(id: string): string {
  return id.replaceAll("-", "").toLowerCase()
}

function parseWebhookPayload(rawBody: string): NotionWebhookPayload | undefined {
  try {
    const parsed: unknown = JSON.parse(rawBody)
    if (!parsed || typeof parsed !== "object") {
      return undefined
    }

    return parsed as NotionWebhookPayload
  } catch {
    return undefined
  }
}

async function toHmacKey(verificationToken: string, keyUsages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(verificationToken),
    {
      hash: "SHA-256",
      name: "HMAC",
    },
    false,
    keyUsages,
  )
}

function toSignatureBytes(signature: string): Uint8Array | undefined {
  if (!signature.startsWith("sha256=")) {
    return undefined
  }

  const hex = signature.slice("sha256=".length)
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[\da-f]+$/i.test(hex)) {
    return undefined
  }

  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    const start = index * 2
    const parsed = Number.parseInt(hex.slice(start, start + 2), 16)
    if (Number.isNaN(parsed)) {
      return undefined
    }

    bytes[index] = parsed
  }

  return bytes
}
