import { Spacer } from "@nattui/react-components"
import { Fragment } from "react"
import { getNotionPage } from "@/lib/notion"

export default async function HomePage() {
  const { blocks, title } = await getNotionPage()

  return (
    <div className="flex flex-col">
      <Spacer className="h-64" />

      <div className="mx-auto flex max-w-672 flex-col">
        {/* Title */}
        <h1 className="text-36 leading-[1.2] font-bold">{title}</h1>
        <Spacer className="h-16" />

        {/* Content */}
        {blocks.map((block, index) => (
          <Fragment key={index}>
            <p className="text-16 leading-[1.825]">
              {block.segments.map((segment, segmentIndex) =>
                segment.href ? (
                  <a
                    className="underline"
                    href={segment.href}
                    key={segmentIndex}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {segment.text}
                  </a>
                ) : (
                  <span key={segmentIndex}>{segment.text}</span>
                ),
              )}
            </p>
            <Spacer className="h-24" />
          </Fragment>
        ))}
      </div>
      <Spacer className="h-128" />
    </div>
  )
}
