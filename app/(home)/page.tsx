// https://www.notion.so/nattwasm/Writings-30ab76f65e6e809e881ff95294eaac61

import { Spacer } from "@nattui/react-components"
import { Client } from "@notionhq/client"

const { NOTION_API_KEY, NOTION_PAGE_ID } = process.env

const notion = new Client({
  auth: NOTION_API_KEY,
})

export default async function HomePage() {
  if (!NOTION_API_KEY || !NOTION_PAGE_ID) {
    throw new Error("NOTION_API_KEY and NOTION_PAGE_ID are required")
  }

  const response = await notion.blocks.children.list({
    block_id: NOTION_PAGE_ID,
  })

  const blocks: string[] = []

  for (const result of response.results) {
    if (!("type" in result)) {
      return
    }

    if (result.type === "paragraph") {
      const richText = result.paragraph.rich_text
      if (richText.length > 0) {
        const content = richText[0].plain_text
        blocks.push(content)
      }
    }
  }

  return (
    <div className="flex flex-col">
      <Spacer className="h-64" />
      <div className="mx-auto flex max-w-672 flex-col gap-y-24">
        {blocks.map((block, index) => (
          <p className="text-16 leading-[1.825]" key={index}>
            {block}
          </p>
        ))}
      </div>
      <Spacer className="h-128" />
    </div>
  )
}
