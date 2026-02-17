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
