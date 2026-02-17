import { evaluate } from "@mdx-js/mdx"
import { Button, Input, Spacer } from "@nattui/react-components"
import type { ElementType, JSX } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { highlight } from "sugar-high"
import { NotionRichTextSegments } from "@/app/(home)/notion-rich-text-segments"
import type { NotionBlock } from "@/lib/notion"

interface NotionBlockContentProps {
  block: NotionBlock
  blockIndex: number
}

export async function NotionBlockContent(props: NotionBlockContentProps): Promise<JSX.Element> {
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
        <img alt={block.alt} className="rounded-12 h-auto w-full" loading="lazy" src={block.url} />
        <Spacer className="h-24" />
      </>
    )
  }

  if (block.type === "code") {
    const mappedComponentElements = await renderMappedComponents(block.code)

    if (mappedComponentElements) {
      return (
        <>
          <div className="rounded-12 bg-gray-2 border-gray-4 flex flex-wrap justify-center gap-16 border p-16">
            {mappedComponentElements}
          </div>
          <Spacer className="h-24" />
        </>
      )
    }

    const codeHTML = highlight(block.code)

    return (
      <>
        <pre className="rounded-12 bg-gray-2 border-gray-4 text-13 overflow-x-auto border p-16 whitespace-break-spaces">
          <code aria-label={block.language} dangerouslySetInnerHTML={{ __html: codeHTML }} />
        </pre>
        <Spacer className="h-24" />
      </>
    )
  }

  return <></>
}

const COMPONENT_MARKER = "// component"

const components: Record<string, ElementType> = {
  Button,
  Input,
  Spacer,
}

async function renderMappedComponents(code: string): Promise<JSX.Element | undefined> {
  const trimmedCode = code.trim()

  if (!trimmedCode.startsWith(COMPONENT_MARKER)) {
    return
  }

  const mdxSource = trimmedCode.slice(COMPONENT_MARKER.length).trim()
  if (!mdxSource) {
    return
  }

  try {
    const evaluated = await evaluate(mdxSource, {
      Fragment,
      development: false,
      jsx,
      jsxs,
    })
    const MdxContent = evaluated.default
    return <MdxContent components={components} />
  } catch {
    // Invalid component markup falls back to the highlighted code block renderer.
  }
}
