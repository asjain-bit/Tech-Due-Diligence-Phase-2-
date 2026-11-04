'use client'

/**
 * CopyButton — Molecule
 * Small icon button that copies a value to the clipboard and confirms with a tick.
 * Used in: BriefDecisionModal
 */

import React, { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { CopyButtonProps } from './CopyButton.types'

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label, className = '' }) => {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard can be blocked (insecure context, permissions); still confirm nothing broke
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`inline-flex items-center gap-1 text-xs font-medium cursor-pointer transition ${
        copied ? 'text-[#16a34a]' : 'text-[#64748b] hover:text-[#0d212c]'
      } ${className}`.trim()}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
