import { revalidatePath } from "next/cache"

const { NOTION_WEBHOOK_VERIFICATION_TOKEN } = process.env

const REVALIDATE_PATH = "/"

/**
 * Handles Notion webhook requests and revalidates "/" when token validation passes.
 *
 * @param {Request} request Incoming webhook request.
 * @returns {Promise<Response>} A JSON response for success or validation failure.
 */
export async function POST(request: Request): Promise<Response> {
  if (!NOTION_WEBHOOK_VERIFICATION_TOKEN) {
    return Response.json(
      { error: "Missing NOTION_WEBHOOK_VERIFICATION_TOKEN", ok: false },
      { status: 500 },
    )
  }
  const jsonBody = await request.json()
  console.log("jsonBody", jsonBody)

  const rawBody = await request.text()
  console.log("rawBody", rawBody)
  const verificationToken = rawBody.trim()
  if (verificationToken.length === 0) {
    return Response.json({ error: "Missing verification token body", ok: false }, { status: 400 })
  }

  if (verificationToken !== NOTION_WEBHOOK_VERIFICATION_TOKEN) {
    return Response.json({ error: "Invalid verification token", ok: false }, { status: 401 })
  }

  revalidatePath(REVALIDATE_PATH)

  return Response.json({ ok: true, revalidated: REVALIDATE_PATH })
}
