import { createHmac, timingSafeEqual } from "node:crypto"
import { revalidatePath } from "next/cache"

const { NOTION_WEBHOOK_VERIFICATION_TOKEN } = process.env

const REVALIDATE_PATH = "/"
const NOTION_SIGNATURE_HEADER = "x-notion-signature"

/**
 * Handles Notion webhook requests and revalidates "/" when signature validation passes.
 *
 * @param {Request} request Incoming webhook request.
 * @returns {Promise<Response>} A JSON response for success or validation failure.
 */
export async function POST(request: Request): Promise<Response> {
  if (!NOTION_WEBHOOK_VERIFICATION_TOKEN) {
    return Response.json(
      {
        error: "Missing NOTION_WEBHOOK_VERIFICATION_TOKEN",
        ok: false,
      },
      { status: 500 },
    )
  }

  const signatureHeader = request.headers.get(NOTION_SIGNATURE_HEADER)

  if (!signatureHeader) {
    return Response.json(
      {
        error: "Missing signature header",
        ok: false,
      },
      { status: 400 },
    )
  }

  let body: unknown = undefined

  try {
    body = await request.json()
  } catch {
    return Response.json(
      {
        error: "Invalid JSON body",
        ok: false,
      },
      { status: 400 },
    )
  }

  if (
    !isTrustedPayload({
      body,
      signatureHeader,
      verificationToken: NOTION_WEBHOOK_VERIFICATION_TOKEN,
    })
  ) {
    return Response.json(
      {
        error: "Untrusted payload",
        ok: false,
      },
      { status: 401 },
    )
  }

  revalidatePath(REVALIDATE_PATH)

  return Response.json(
    {
      ok: true,
      revalidated: REVALIDATE_PATH,
    },
    { status: 200 },
  )
}

function isTrustedPayload(props: {
  body: unknown
  signatureHeader: string
  verificationToken: string
}): boolean {
  const { body, signatureHeader, verificationToken } = props
  const calculatedSignature = `sha256=${createHmac("sha256", verificationToken)
    .update(JSON.stringify(body))
    .digest("hex")}`
  const calculatedBuffer = Buffer.from(calculatedSignature)
  const receivedBuffer = Buffer.from(signatureHeader)

  return timingSafeEqual(calculatedBuffer, receivedBuffer)
}
