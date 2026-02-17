import { Spacer } from "@nattui/react-components"
import { NotionBlockContent } from "@/app/(home)/notion-block-content"
import { getNotionPage, type NotionBlock } from "@/lib/notion"

export default async function HomePage() {
  const { blocks, title } = await getNotionPage()

  return (
    <div className="flex flex-col px-16">
      <Spacer className="h-64" />

      <div className="mx-auto flex max-w-[640px] flex-col">
        {/* Title */}
        <h1 className="text-36 font-500 leading-[1.2]">{title}</h1>
        <Spacer className="h-24" />

        {/* Content */}
        {blocks.map((block: NotionBlock, index) => (
          <NotionBlockContent block={block} blockIndex={index} key={index} />
        ))}
      </div>
      <Spacer className="h-128" />
    </div>
  )
}
