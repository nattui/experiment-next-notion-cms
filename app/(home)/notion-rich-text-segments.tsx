import type { NotionRichTextSegment } from "@/lib/notion"

interface NotionRichTextSegmentsProps {
  blockIndex: number
  segments: NotionRichTextSegment[]
}

export function NotionRichTextSegments(props: NotionRichTextSegmentsProps) {
  const { blockIndex, segments } = props

  return segments.map((segment, segmentIndex) => {
    let segmentContent = segment.code ? (
      <code className="rounded-4 bg-gray-3 text-14 px-4 py-2">{segment.text}</code>
    ) : (
      segment.text
    )

    if (segment.bold) {
      segmentContent = <strong>{segmentContent}</strong>
    }

    if (segment.italic) {
      segmentContent = <em>{segmentContent}</em>
    }

    if (segment.strikethrough) {
      segmentContent = <s>{segmentContent}</s>
    }

    if (segment.underline) {
      segmentContent = <u>{segmentContent}</u>
    }

    if (segment.href) {
      return (
        <a
          className="decoration-gray-9 underline decoration-1 underline-offset-2 hover:no-underline"
          href={segment.href}
          key={`${blockIndex}-${segmentIndex}`}
          rel="noreferrer"
          target="_blank"
        >
          {segmentContent}
        </a>
      )
    }

    return <span key={`${blockIndex}-${segmentIndex}`}>{segmentContent}</span>
  })
}
