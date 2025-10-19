'use client'

import React, { useState } from 'react'
import { Upload } from './ui/upload'
import { Button } from './ui/button'
import { formatBytes } from '@/lib/utils'
import { ParsedData } from '@/lib/excel-parser'

interface FileUploadProps {
  onDataParsed?: (data: ParsedData) => void
}

export function FileUpload({ onDataParsed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      if (onDataParsed && result.data) {
        onDataParsed(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Upload onFileSelect={handleFileSelect} disabled={uploading} />
      
      {file && (
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-slate-100">{file.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="ml-4 bg-teal-600 hover:bg-teal-500 text-white border-teal-600"
            >
              {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}