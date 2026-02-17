import { Spacer } from "@nattui/react-components"
import { Fragment } from "react"
import { getNotionPage, type NotionBlock, type NotionRichTextSegment } from "@/lib/notion"

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
        {blocks.map((block: NotionBlock, index) => renderBlockContent(block, index))}
      </div>
      <Spacer className="h-128" />
    </div>
  )
}

function renderBlockContent(block: NotionBlock, blockIndex: number) {
  if (block.type === "h2") {
    return (
      <Fragment key={blockIndex}>
        <Spacer className="h-24" />
        <h2 className="text-30 font-500 leading-[1.3]">
          {renderSegments(block.segments, blockIndex)}
        </h2>
        <Spacer className="h-24" />
      </Fragment>
    )
  }

  if (block.type === "h3") {
    return (
      <Fragment key={blockIndex}>
        <Spacer className="h-24" />
        <h3 className="text-24 font-500 leading-[1.4]">
          {renderSegments(block.segments, blockIndex)}
        </h3>
        <Spacer className="h-24" />
      </Fragment>
    )
  }

  return (
    <Fragment key={blockIndex}>
      <p className="text-16 leading-1-625">{renderSegments(block.segments, blockIndex)}</p>
      <Spacer className="h-24" />
    </Fragment>
  )
}

function renderSegments(segments: NotionRichTextSegment[], blockIndex: number) {
  return segments.map((segment, segmentIndex) => {
    if (segment.href) {
      return (
        <a
          className="text-primary-9 underline hover:no-underline"
          href={segment.href}
          key={`${blockIndex}-${segmentIndex}`}
          rel="noreferrer"
          target="_blank"
        >
          {segment.text}
        </a>
      )
    }

    return <span key={`${blockIndex}-${segmentIndex}`}>{segment.text}</span>
  })
}
