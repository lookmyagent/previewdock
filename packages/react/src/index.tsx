import React, { type CSSProperties } from 'react'
import type { FileSource, OpenResult, ViewerEngine, ViewerStatus } from '@previewdock/core'
import {
  mountPreviewDock,
  type PreviewDockController,
  type PreviewDockLocale,
  type PreviewDockMessages,
  type PreviewDockWatermark,
} from '@previewdock/web'

const { forwardRef, useEffect, useImperativeHandle, useRef } = React

export interface PreviewDockProps {
  engine: ViewerEngine
  source?: FileSource | null
  fileName?: string
  mimeType?: string
  showToolbar?: boolean
  emptyTitle?: string
  locale?: PreviewDockLocale
  messages?: Partial<PreviewDockMessages>
  watermark?: PreviewDockWatermark
  className?: string
  style?: CSSProperties
  onReady?: (result: OpenResult) => void
  onError?: (error: unknown) => void
  onStatus?: (status: ViewerStatus) => void
}

export interface PreviewDockRef {
  open(source: FileSource, options?: { fileName?: string; mimeType?: string }): Promise<void>
}

export const PreviewDock = forwardRef<PreviewDockRef, PreviewDockProps>(function PreviewDock(
  props,
  forwardedRef,
) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<PreviewDockController | null>(null)

  useImperativeHandle(forwardedRef, () => ({
    async open(source, options) {
      if (!controllerRef.current) throw new Error('PreviewDock has not mounted')
      await controllerRef.current.open(source, options)
    },
  }), [])

  useEffect(() => {
    if (!hostRef.current) return
    const controller = mountPreviewDock(hostRef.current, props)
    controllerRef.current = controller
    return () => {
      controllerRef.current = null
      void controller.dispose()
    }
  }, [props.engine])

  useEffect(() => {
    controllerRef.current?.update({
      source: props.source,
      fileName: props.fileName,
      mimeType: props.mimeType,
      showToolbar: props.showToolbar,
      emptyTitle: props.emptyTitle,
      locale: props.locale,
      messages: props.messages,
      watermark: props.watermark,
      onReady: props.onReady,
      onError: props.onError,
      onStatus: props.onStatus,
    })
  }, [
    props.source, props.fileName, props.mimeType, props.showToolbar, props.emptyTitle,
    props.locale, props.messages, props.watermark, props.onReady, props.onError, props.onStatus,
  ])

  return <div ref={hostRef} className={props.className} style={{ height: '100%', ...props.style }} />
})

export default PreviewDock
export type { PreviewDockLocale, PreviewDockMessages, PreviewDockWatermark, PreviewDockWatermarkOptions } from '@previewdock/web'
