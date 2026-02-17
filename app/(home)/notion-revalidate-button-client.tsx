"use client"

import { Button } from "@nattui/react-components"
import { useFormStatus } from "react-dom"

export function NotionRevalidateButtonClient() {
  const { pending } = useFormStatus()

  return (
    <Button isLoading={pending} type="submit">
      {pending ? "Refreshing..." : "Refresh Notion content cache"}
    </Button>
  )
}
