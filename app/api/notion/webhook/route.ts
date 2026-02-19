import { revalidatePath } from "next/cache"

const { NOTION_WEBHOOK_VERIFICATION_TOKEN } = process.env

const REVALIDATE_PATH = "/"

interface NotionWebhookPayload {
  verification_token: string
}

export async function POST(request: Request): Promise<Response> {
  if (!NOTION_WEBHOOK_VERIFICATION_TOKEN) {
    return Response.json(
      { error: "Missing NOTION_WEBHOOK_VERIFICATION_TOKEN", ok: false },
      { status: 500 },
    )
  }

  const payload = await parseWebhookPayload(request)
  if (!payload) {
    return Response.json({ error: "Invalid JSON payload", ok: false }, { status: 400 })
  }

  if (payload.verification_token !== NOTION_WEBHOOK_VERIFICATION_TOKEN) {
    return Response.json({ error: "Invalid verification token", ok: false }, { status: 401 })
  }

  revalidatePath(REVALIDATE_PATH)

  return Response.json({ ok: true, revalidated: REVALIDATE_PATH })
}

async function parseWebhookPayload(request: Request): Promise<NotionWebhookPayload | undefined> {
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== "object") {
      return undefined
    }

    if (!("verification_token" in parsed)) {
      return undefined
    }

    const { verification_token: verificationToken } = parsed as {
      verification_token?: unknown
    }
    if (typeof verificationToken !== "string") {
      return undefined
    }

    return { verification_token: verificationToken }
  } catch {
    return undefined
  }
}
