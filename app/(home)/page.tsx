import { Spacer } from "@nattui/react-components"
import { NotionBlockContent } from "@/app/(home)/notion-block-content"
import { NotionRevalidateButton } from "@/app/(home)/notion-revalidate-button"
import { getNotionPage, type NotionBlock } from "@/lib/notion"

export default async function HomePage() {
  const { blocks, createdTime, title } = await getNotionPage()
  const formattedCreatedTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(createdTime))

  return (
    <div className="flex flex-col px-16">
      <Spacer className="h-64" />

      <div className="mx-auto flex max-w-[620px] flex-col">
        {/* Title */}
        <h1 className="text-36 font-500 leading-[1.2]">{title}</h1>
        <Spacer className="h-12" />

        {/* Created Time */}
        <p className="text-gray-11 text-14 flex items-center gap-x-8">
          <span>{formattedCreatedTime}</span>
          <span>·</span>
          <span>Natt Nguyen</span>
        </p>
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
