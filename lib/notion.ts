import { Client } from "@notionhq/client"

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env

export const notion = new Client({ auth: NOTION_API_KEY })

interface NotionPage {
  blocks: NotionParagraph[]
  title: string
}

interface NotionParagraph {
  segments: NotionRichTextSegment[]
}

interface NotionRichTextSegment {
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

  const blocks: NotionParagraph[] = []

  for (const result of metaContent.results) {
    if (!("type" in result)) {
      return DEFAULT_EMPTY
    }

    if (result.type === "paragraph") {
      const richText = result.paragraph.rich_text
      if (richText.length > 0) {
        const segments = richText.map((textBlock) => ({
          href: textBlock.href,
          text: textBlock.plain_text,
        }))
        blocks.push({ segments })
      }
    }
  }

  return {
    blocks,
    title,
  }
}
