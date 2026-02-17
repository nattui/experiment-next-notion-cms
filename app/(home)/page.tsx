import { Spacer } from "@nattui/react-components"
import { getNotionPage } from "@/lib/notion"

export default async function HomePage() {
  const blocks = await getNotionPage()

  return (
    <div className="flex flex-col">
      <Spacer className="h-64" />

      {/* Content */}
      <div className="mx-auto flex max-w-672 flex-col gap-y-24">
        {blocks.map((block, index) => (
          <p className="text-16 leading-[1.825]" key={index}>
            {block}
          </p>
        ))}
      </div>
      <Spacer className="h-128" />
    </div>
  )
}
