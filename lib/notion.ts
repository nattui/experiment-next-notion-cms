import { Client } from "@notionhq/client"

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env

export const notion = new Client({ auth: NOTION_API_KEY })

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
  title: string
}

export interface NotionRichTextSegment {
  href: null | string
  text: string
}

export async function getNotionPage(): Promise<NotionPage> {
  if (!NOTION_API_KEY || !NOTION_PAGE_ID) {
    throw new Error("NOTION_API_KEY and NOTION_PAGE_ID are required")
  }

  const DEFAULT_EMPTY = {
    blocks: [],
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

  for (const result of metaContent.results) {
    if (!("type" in result)) {
      return DEFAULT_EMPTY
    }

    console.log(result.type)

    if (result.type === "paragraph") {
      const richText = result.paragraph.rich_text
      if (richText.length > 0) {
        const segments = richText.map((textBlock) => ({
          href: textBlock.href,
          text: textBlock.plain_text,
        }))
        blocks.push({ segments, type: "paragraph" })
      }
    }

    if (result.type === "heading_1") {
      const richText = result.heading_1.rich_text
      if (richText.length > 0) {
        const segments = richText.map((textBlock) => ({
          href: textBlock.href,
          text: textBlock.plain_text,
        }))
        // Notion heading_1 is rendered as h2 for this page.
        blocks.push({ segments, type: "h2" })
      }
    }

    if (result.type === "heading_2") {
      const richText = result.heading_2.rich_text
      if (richText.length > 0) {
        const segments = richText.map((textBlock) => ({
          href: textBlock.href,
          text: textBlock.plain_text,
        }))
        blocks.push({ segments, type: "h3" })
      }
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
    title,
  }
}
