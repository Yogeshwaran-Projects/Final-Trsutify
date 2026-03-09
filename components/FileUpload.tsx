"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface UploadedFile {
  name: string
  cid: string
  size: number
  mimeType: string
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
}

export function FileUpload({ onFilesChange, maxFiles = 5 }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (fileList: FileList) => {
      if (files.length + fileList.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      setUploading(true)
      setError("")
      const newFiles: UploadedFile[] = []

      for (const file of Array.from(fileList)) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} exceeds 10MB limit`)
          continue
        }

        const form = new FormData()
        form.append("file", file)

        try {
          const res = await fetch("/api/upload", { method: "POST", body: form })
          if (!res.ok) {
            const data = await res.json()
            setError(data.error || "Upload failed")
            continue
          }
          const data = await res.json()
          newFiles.push({
            name: file.name,
            cid: data.cid,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
          })
        } catch {
          setError(`Failed to upload ${file.name}`)
        }
      }

      const updated = [...files, ...newFiles]
      setFiles(updated)
      onFilesChange(updated)
      setUploading(false)
    },
    [files, maxFiles, onFilesChange]
  )

  const removeFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index)
      setFiles(updated)
      onFilesChange(updated)
    },
    [files, onFilesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files)
    },
    [upload]
  )

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-neutral-500 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <Upload className="w-6 h-6" />
            <span className="text-sm">
              Drop files here or click to browse (max 10MB each)
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={f.cid}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-sm text-neutral-200 truncate">
                  {f.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {(f.size / 1024).toFixed(0)}KB
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
