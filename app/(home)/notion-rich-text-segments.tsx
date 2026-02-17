import type { NotionRichTextSegment } from "@/lib/notion"

interface NotionRichTextSegmentsProps {
  blockIndex: number
  segments: NotionRichTextSegment[]
}

export function NotionRichTextSegments(props: NotionRichTextSegmentsProps) {
  const { blockIndex, segments } = props

  return segments.map((segment, segmentIndex) => {
    if (segment.href) {
      return (
        <a
          className="decoration-gray-9 underline decoration-1 underline-offset-2 hover:no-underline"
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
