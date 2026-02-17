import { Spacer } from "@nattui/react-components"
import { highlight } from "sugar-high"
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

  if (block.type === "paragraph") {
    return (
      <>
        <p className="text-gray-12 text-16 leading-1-625">
          <NotionRichTextSegments blockIndex={blockIndex} segments={block.segments} />
        </p>
        <Spacer className="h-24" />
      </>
    )
  }

  if (block.type === "image") {
    return (
      <>
        {/* Notion serves image URLs from varying hosts, so render a plain image tag. */}
        {/* oxlint-disable-next-line @next/next/no-img-element */}
        <img alt={block.alt} className="h-auto w-full" loading="lazy" src={block.url} />
        <Spacer className="h-24" />
      </>
    )
  }

  if (block.type === "code") {
    const codeHTML = highlight(block.code)

    return (
      <>
        <pre className="rounded-8 bg-gray-3 text-13 overflow-x-auto p-16">
          <code
            aria-label={block.language}
            // oxlint-disable-next-line react/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{ __html: codeHTML }}
          />
        </pre>
        <Spacer className="h-24" />
      </>
    )
  }

  // oxlint-disable-next-line react/jsx-no-useless-fragment
  return <></>
}
