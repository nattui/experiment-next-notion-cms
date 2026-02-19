import { Client } from "@notionhq/client"

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env

export const notion = new Client({
  auth: NOTION_API_KEY,
  notionVersion: "2025-09-03",
})

export type NotionBlock =
  | {
      alt: string
      type: "image"
      url: string
    }
  | {
      code: string
      language: string
      type: "code"
    }
  | {
      segments: NotionRichTextSegment[]
      type: "h2" | "h3" | "paragraph"
    }

export interface NotionPage {
  blocks: NotionBlock[]
  createdTime: string
  title: string
}

export interface NotionRichTextSegment {
  bold: boolean
  code: boolean
  href: null | string
  italic: boolean
  strikethrough: boolean
  text: string
  underline: boolean
}

interface NotionRichTextInput {
  annotations: {
    bold: boolean
    code: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
  }
  href: null | string
  plain_text: string
}

export async function getNotionPage(): Promise<NotionPage> {
  if (!NOTION_API_KEY || !NOTION_PAGE_ID) {
    throw new Error("NOTION_API_KEY and NOTION_PAGE_ID are required")
  }

  // Keep a stable fallback when page metadata is missing or unexpected.
  const DEFAULT_EMPTY = {
    blocks: [],
    createdTime: "",
    title: "",
  }

  const [metaContent, metaPage] = await Promise.all([
    notion.blocks.children.list({ block_id: NOTION_PAGE_ID }),
    notion.pages.retrieve({ page_id: NOTION_PAGE_ID }),
  ])

  if (!("properties" in metaPage)) {
    return DEFAULT_EMPTY
  }

  const titleProperty = metaPage.properties.title

  if (!titleProperty || titleProperty.type !== "title") {
    return DEFAULT_EMPTY
  }

  let title = ""
  const titleArray = titleProperty.title
  if (titleArray.length > 0) {
    title = titleArray[0].plain_text
  }

  const blocks: NotionBlock[] = []

  // Shared paragraph/heading handler: skip empty text and normalize segment shape.
  function pushRichTextBlock(
    richText: NotionRichTextInput[],
    type: Extract<NotionBlock, { segments: NotionRichTextSegment[] }>["type"],
  ): void {
    if (richText.length === 0) {
      return
    }

    blocks.push({
      segments: toNotionRichTextSegments(richText),
      type,
    })
  }

  // Convert Notion API blocks into the small renderable union used by the UI.
  for (const result of metaContent.results) {
    if (!("type" in result)) {
      return DEFAULT_EMPTY
    }

    if (result.type === "paragraph") {
      pushRichTextBlock(result.paragraph.rich_text, "paragraph")
    }

    if (result.type === "heading_1") {
      // Notion heading_1 is rendered as h2 for this page.
      pushRichTextBlock(result.heading_1.rich_text, "h2")
    }

    if (result.type === "heading_2") {
      pushRichTextBlock(result.heading_2.rich_text, "h3")
    }

    if (result.type === "image") {
      const url =
        result.image.type === "external" ? result.image.external.url : result.image.file.url

      const alt = result.image.caption.map((textBlock) => textBlock.plain_text).join("")

      blocks.push({ alt, type: "image", url })
    }

    if (result.type === "code") {
      const code = result.code.rich_text.map((textBlock) => textBlock.plain_text).join("")
      if (code.length > 0) {
        blocks.push({ code, language: result.code.language, type: "code" })
      }
    }
  }

  return {
    blocks,
    createdTime: metaPage.created_time,
    title,
  }
}

// Map Notion rich text objects to the formatting fields consumed by components.
function toNotionRichTextSegments(richText: NotionRichTextInput[]): NotionRichTextSegment[] {
  return richText.map((textBlock) => ({
    bold: textBlock.annotations.bold,
    code: textBlock.annotations.code,
    href: textBlock.href,
    italic: textBlock.annotations.italic,
    strikethrough: textBlock.annotations.strikethrough,
    text: textBlock.plain_text,
    underline: textBlock.annotations.underline,
  }))
}
