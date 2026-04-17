'use client'

/**
 * UploadZone — Camera/gallery upload panel.
 * Allows taking a photo or uploading from device gallery.
 * Shows a preview of the selected image with a clear action.
 */
import { useState, useRef } from 'react'
import { Camera, ImagePlus, X, CheckCircle, Loader2, ScanLine } from 'lucide-react'

export default function UploadZone() {
  const [preview, setPreview]   = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [done, setDone]         = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setDone(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearPreview() {
    setPreview(null)
    setDone(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleScan() {
    setScanning(true)
    // TODO: Wire up Gemini Vision API here
    await new Promise((r) => setTimeout(r, 2000))
    setScanning(false)
    setDone(true)
  }

  return (
    <div className="rounded-3xl overflow-hidden glass-border shadow-xl bg-white/65 dark:bg-slate-800/60 backdrop-blur-2xl transition-colors duration-300">
      {/* Drop zone / preview area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="m-6 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-blue-200 rounded-2xl py-16 px-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
            <ScanLine size={36} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-base">Drop your receipt here</p>
            <p className="text-sm text-slate-400 mt-1">PNG, JPG, HEIC — up to 10 MB</p>
          </div>
          <p className="text-xs text-slate-400">or use the buttons below</p>
        </div>
      ) : (
        <div className="m-6 relative rounded-2xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Receipt preview" className="w-full max-h-72 object-cover" />
          <button
            onClick={clearPreview}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
          {done && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg">
                <CheckCircle size={20} className="text-emerald-600" />
                <p className="font-bold text-slate-800 text-sm">Receipt scanned! Review below.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

      {/* Action buttons */}
      <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
        {/* Take Photo — triggers camera on mobile */}
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.setAttribute('capture', 'environment')
              fileRef.current.click()
            }
          }}
          className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Camera size={20} />
          Take Photo
        </button>

        {/* Upload from Gallery */}
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.removeAttribute('capture')
              fileRef.current.click()
            }
          }}
          className="flex-1 flex items-center justify-center gap-3 font-bold py-4 rounded-2xl glass-border hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:scale-[1.02] active:scale-95 transition-all bg-white/40 dark:bg-white/5"
        >
          <ImagePlus size={20} />
          Upload from Gallery
        </button>
      </div>

      {/* Scan button — shown only when image is selected */}
      {preview && !done && (
        <div className="px-6 pb-6">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all"
          >
            {scanning ? <Loader2 size={18} className="animate-spin" /> : <ScanLine size={18} />}
            {scanning ? 'Scanning with AI...' : 'Scan with Gemini AI'}
          </button>
        </div>
      )}
    </div>
  )
}
