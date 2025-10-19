'use client'

import React, { useRef } from 'react'
import { Upload as UploadIcon, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadProps {
  onFileSelect?: (file: File) => void
  accept?: string
  className?: string
  disabled?: boolean
}

export function Upload({ onFileSelect, accept = '.xlsx,.xls', className, disabled }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div
        onClick={handleClick}
        className={cn(
          "border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-teal-400 hover:bg-slate-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <UploadIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-slate-100 mb-2">
          Click to upload Excel file
        </p>
        <p className="text-sm text-slate-400">
          Supports .xlsx and .xls files
        </p>
      </div>
    </div>
  )
}