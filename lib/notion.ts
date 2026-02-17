import { Client } from "@notionhq/client"

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env

export const notion = new Client({ auth: NOTION_API_KEY })

export async function getNotionPage(): Promise<string[]> {
  if (!NOTION_API_KEY || !NOTION_PAGE_ID) {
    throw new Error("NOTION_API_KEY and NOTION_PAGE_ID are required")
  }

  const response = await notion.blocks.children.list({
    block_id: NOTION_PAGE_ID,
  })

  const blocks: string[] = []

  for (const result of response.results) {
    if (!("type" in result)) {
      return []
    }

    if (result.type === "paragraph") {
      const richText = result.paragraph.rich_text
      if (richText.length > 0) {
        const content = richText[0].plain_text
        blocks.push(content)
      }
    }
  }

  return blocks
}
