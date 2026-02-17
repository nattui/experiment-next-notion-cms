import { Button, Spacer } from "@nattui/react-components"
import { createElement, type JSX } from "react"
import { highlight } from "sugar-high"
import { NotionRichTextSegments } from "@/app/(home)/notion-rich-text-segments"
import type { NotionBlock } from "@/lib/notion"

interface NotionBlockContentProps {
  block: NotionBlock
  blockIndex: number
}

const COMPONENT_MARKER = "// component"
const componentMap = {
  Button,
} as const

export function NotionBlockContent(props: NotionBlockContentProps): JSX.Element {
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
    const mappedComponentElements = renderMappedComponents(block.code)
    if (mappedComponentElements) {
      return (
        <>
          <div className="rounded-8 bg-gray-3 p-16">
            <div className="flex flex-col gap-16">{mappedComponentElements}</div>
          </div>
          <Spacer className="h-24" />
        </>
      )
    }

    const codeHTML = highlight(block.code)

    return (
      <>
        <pre className="rounded-8 bg-gray-3 text-13 overflow-x-auto p-16 whitespace-break-spaces">
          <code aria-label={block.language} dangerouslySetInnerHTML={{ __html: codeHTML }} />
        </pre>
        <Spacer className="h-24" />
      </>
    )
  }

  return <></>
}

function renderMappedComponents(code: string): JSX.Element | undefined {
  const trimmedCode = code.trim()
  if (!trimmedCode.startsWith(COMPONENT_MARKER)) {
    return
  }

  const componentMarkup = trimmedCode.slice(COMPONENT_MARKER.length).trim()
  if (!componentMarkup) {
    return
  }

  const componentLines = componentMarkup
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (componentLines.length === 0) {
    return
  }

  const renderedElements: JSX.Element[] = []

  for (const [index, line] of componentLines.entries()) {
    const pairedTagMatch = line.match(/^<([A-Z][\w]*)>([\s\S]*)<\/\1>$/)
    if (pairedTagMatch) {
      const [, componentName, children] = pairedTagMatch
      const Component = componentMap[componentName as keyof typeof componentMap]
      if (Component) {
        renderedElements.push(createElement(Component, { key: `${componentName}-${index}` }, children))
      }
    } else {
      const selfClosingTagMatch = line.match(/^<([A-Z][\w]*)\s*\/>$/)
      if (selfClosingTagMatch) {
        const [, componentName] = selfClosingTagMatch
        const Component = componentMap[componentName as keyof typeof componentMap]
        if (Component) {
          renderedElements.push(createElement(Component, { key: `${componentName}-${index}` }))
        }
      }
    }
  }
  if (renderedElements.length !== componentLines.length) {
    return
  }

  return <>{renderedElements}</>
}
