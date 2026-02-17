import { Spacer } from "@nattui/react-components"
import { NotionRichTextSegments } from "@/app/(home)/notion-rich-text-segments"
import type { NotionBlock } from "@/lib/notion"

interface NotionBlockContentProps {
  block: NotionBlock
  blockIndex: number
}

export function NotionBlockContent(props: NotionBlockContentProps) {
  const { block, blockIndex } = props

  if (block.type === "h2") {
    return (
      <>
        <Spacer className="h-24" />
        <h2 className="text-gray-12 text-24 font-500 leading-[1.3]">
          <NotionRichTextSegments blockIndex={blockIndex} segments={block.segments} />
        </h2>
        <Spacer className="h-12" />
      </>
    )
  }

  if (block.type === "h3") {
    return (
      <>
        <Spacer className="h-24" />
        <h3 className="text-gray-12 text-20 font-500 leading-[1.4]">
          <NotionRichTextSegments blockIndex={blockIndex} segments={block.segments} />
        </h3>
        <Spacer className="h-12" />
      </>
    )
  }

  return (
    <>
      <p className="text-gray-12 text-16 leading-1-625">
        <NotionRichTextSegments blockIndex={blockIndex} segments={block.segments} />
      </p>
      <Spacer className="h-24" />
    </>
  )
}
