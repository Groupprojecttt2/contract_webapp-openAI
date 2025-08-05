"use client"

import React, { useRef, useState, useCallback } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { X, RotateCcw, Download, Upload } from 'lucide-react'

interface SignaturePadProps {
  onSignatureSave: (signatureData: string, signatureName: string) => void
  signatureName?: string
  className?: string
}

export function SignaturePad({ onSignatureSave, signatureName = "Signature", className }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [currentSignatureName, setCurrentSignatureName] = useState(signatureName)

  const clearSignature = useCallback(() => {
    signatureRef.current?.clear()
  }, [])

  const saveSignature = useCallback(() => {
    if (signatureRef.current?.isEmpty()) {
      alert('Please draw a signature first')
      return
    }

    try {
      const signatureData = signatureRef.current?.getTrimmedCanvas().toDataURL('image/png')
      if (signatureData) {
        onSignatureSave(signatureData, currentSignatureName)
        setIsOpen(false)
        clearSignature()
      }
    } catch (error) {
      console.error('Error saving signature:', error)
      alert('Error saving signature. Please try again.')
    }
  }, [onSignatureSave, currentSignatureName, clearSignature])

  const downloadSignature = useCallback(() => {
    if (signatureRef.current?.isEmpty()) {
      alert('Please draw a signature first')
      return
    }

    try {
      const signatureData = signatureRef.current?.getTrimmedCanvas().toDataURL('image/png')
      if (signatureData) {
        const link = document.createElement('a')
        link.download = `${currentSignatureName}.png`
        link.href = signatureData
        link.click()
      }
    } catch (error) {
      console.error('Error downloading signature:', error)
      alert('Error downloading signature. Please try again.')
    }
  }, [currentSignatureName])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Upload className="w-4 h-4 mr-2" />
          Add {signatureName}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draw Your {signatureName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label htmlFor="signature-name" className="text-sm font-medium">
              Signature Name:
            </label>
            <input
              id="signature-name"
              type="text"
              value={currentSignatureName}
              onChange={(e) => setCurrentSignatureName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-black"
              placeholder="Enter signature name"
            />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-64 cursor-crosshair',
                    style: { 
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white'
                    }
                  }}
                  backgroundColor="white"
                  penColor="black"
                  minWidth={2}
                  maxWidth={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSignature}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveSignature}
                className="bg-aramco-green-600 hover:bg-aramco-green-700"
              >
                Save Signature
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SignatureDisplayProps {
  signatureData: string
  signatureName: string
  onRemove?: () => void
  className?: string
}

export function SignatureDisplay({ signatureData, signatureName, onRemove, className }: SignatureDisplayProps) {
  return (
    <div className={`inline-block relative ${className}`}>
      <img
        src={signatureData}
        alt={signatureName}
        className="max-w-48 max-h-24 object-contain border border-gray-300 rounded"
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="text-xs text-gray-500 mt-1 text-center">{signatureName}</div>
    </div>
  )
} 