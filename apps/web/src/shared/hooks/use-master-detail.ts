import { useEffect, useState } from "react"

import { useIsMobile } from "@/shared/hooks/use-mobile"

type Identifiable = {
  id: string
}

export function useMasterDetail<T extends Identifiable>(items: T[]) {
  const isMobile = useIsMobile()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null)
      setMobileShowDetail(false)
      return
    }

    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null)
    }
  }, [items, selectedId])

  useEffect(() => {
    if (!isMobile) {
      setMobileShowDetail(false)
    }
  }, [isMobile])

  const selected =
    items.find((item) => item.id === selectedId) ?? null

  const showMaster = !isMobile || !mobileShowDetail
  const showDetail = !isMobile || mobileShowDetail

  function select(id: string) {
    setSelectedId(id)
    if (isMobile) {
      setMobileShowDetail(true)
    }
  }

  function revealDetail(id?: string) {
    if (id) {
      setSelectedId(id)
    }
    if (isMobile) {
      setMobileShowDetail(true)
    }
  }

  function backToMaster() {
    setMobileShowDetail(false)
  }

  return {
    isMobile,
    selectedId,
    setSelectedId,
    selected,
    mobileShowDetail,
    showMaster,
    showDetail,
    select,
    revealDetail,
    backToMaster,
  }
}
