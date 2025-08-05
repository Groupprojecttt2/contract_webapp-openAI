"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SignaturePad, SignatureDisplay } from "@/components/signature-pad"
import {
  Edit,
  Save,
  X,
  Highlighter,
  Eye,
  Undo,
  Redo,
  Bookmark,
  MessageSquare,
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PenTool,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Highlight {
  id: string
  start: number
  end: number
  text: string
  color: string
  note?: string
  type: 'important' | 'warning' | 'info' | 'custom'
  userId?: string
  username?: string
  createdAt?: Date
}

interface Signature {
  id: string
  data: string
  name: string
  position: { x: number; y: number }
}

interface ContractEditorProps {
  content: string
  onContentChange: (newContent: string) => void
  highlights?: Highlight[]
  onHighlightsChange?: (highlights: Highlight[]) => void
  signatures?: Signature[]
  onSignaturesChange?: (signatures: Signature[]) => void
  isReadOnly?: boolean
  contractId?: string
  currentUserId?: string
  currentUserName?: string
}

const HIGHLIGHT_COLORS = {
  important: 'bg-yellow-300 text-yellow-900 border-yellow-400',
  warning: 'bg-red-300 text-red-900 border-red-400',
  info: 'bg-blue-300 text-blue-900 border-blue-400',
  custom: 'bg-green-300 text-green-900 border-green-400',
}

const HIGHLIGHT_COLORS_BG = {
  important: 'bg-yellow-200',
  warning: 'bg-red-200',
  info: 'bg-blue-200',
  custom: 'bg-green-200',
}

const HIGHLIGHT_COLORS_BORDER = {
  important: 'border-yellow-300',
  warning: 'border-red-300',
  info: 'border-blue-300',
  custom: 'border-green-300',
}

export function ContractEditor({
  content,
  onContentChange,
  highlights = [],
  onHighlightsChange,
  signatures = [],
  onSignaturesChange,
  isReadOnly = false,
  contractId,
  currentUserId,
  currentUserName
}: ContractEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [selectedText, setSelectedText] = useState('')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [showHighlightDialog, setShowHighlightDialog] = useState(false)
  const [highlightNote, setHighlightNote] = useState('')
  const [highlightType, setHighlightType] = useState<'important' | 'warning' | 'info' | 'custom'>('important')
  const [showHighlights, setShowHighlights] = useState(true)
  const [showSignatures, setShowSignatures] = useState(true)
  const [editHistory, setEditHistory] = useState<string[]>([content])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditedContent(content)
    setEditHistory([content])
    setHistoryIndex(0)
  }, [content])

  const addToHistory = (newContent: string) => {
    const newHistory = editHistory.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setEditHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setEditedContent(editHistory[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditedContent(editHistory[newIndex])
    }
  }

  const handleSave = () => {
    onContentChange(editedContent)
    setIsEditing(false)
    toast.success("Changes saved successfully!")
  }

  const handleCancel = () => {
    setEditedContent(content)
    setIsEditing(false)
    setEditHistory([content])
    setHistoryIndex(0)
  }

  const handleTextSelection = () => {
    if (isReadOnly) return

    const selection = window.getSelection()
    if (!selection || selection.toString().length === 0) return

    const selectedText = selection.toString()
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(contentRef.current!)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    const end = preCaretRange.toString().length

    setSelectedText(selectedText)
    setSelectionStart(end - selectedText.length)
    setSelectionEnd(end)
    setShowHighlightDialog(true)
  }

  const handleHighlight = () => {
    if (!selectedText.trim()) return

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      start: selectionStart,
      end: selectionEnd,
      text: selectedText,
      color: HIGHLIGHT_COLORS[highlightType],
      note: highlightNote,
      type: highlightType,
      userId: currentUserId,
      username: currentUserName,
      createdAt: new Date(),
    }

    const updatedHighlights = [...highlights, newHighlight]
    onHighlightsChange?.(updatedHighlights)
    
    setShowHighlightDialog(false)
    setSelectedText('')
    setHighlightNote('')
    setHighlightType('important')
    
    toast.success("Text highlighted successfully!")
  }

  const removeHighlight = (highlightId: string) => {
    const updatedHighlights = highlights.filter(h => h.id !== highlightId)
    onHighlightsChange?.(updatedHighlights)
    toast.success("Highlight removed!")
  }

  // Remove all auto-formatting logic. Render as plain preformatted text.
  const renderContentWithHighlights = () => {
    let result = editedContent

    // Apply highlights if enabled
    if (showHighlights && highlights.length > 0) {
      // Insert highlight markers into the plain text
      const sortedHighlights = [...highlights].sort((a, b) => b.start - a.start)
      sortedHighlights.forEach(highlight => {
        const before = result.substring(0, highlight.start)
        const after = result.substring(highlight.end)
        const highlightedText = result.substring(highlight.start, highlight.end)
        result = before + `[HIGHLIGHT:${highlight.id}:${highlight.type}]${escapeHtml(highlightedText)}[/HIGHLIGHT]` + after
      })
    }

    // Replace signature placeholders with actual signatures
    if (showSignatures && signatures.length > 0) {
      signatures.forEach((signature) => {
        const placeholder = `[${signature.name.toUpperCase()} SIGNATURE: _________________ DATE: _______]`
        const signatureHtml = `
          <span class="inline-block align-middle">
            <img src="${signature.data}" alt="${signature.name} signature" class="inline-block max-w-24 max-h-12 object-contain border border-gray-300 rounded" />
          </span>
        `
        result = result.replace(new RegExp(escapeHtml(placeholder), 'g'), signatureHtml)
      })
    }

    // Replace highlight markers with HTML (allow newlines in text)
    let htmlResult = `<pre style='white-space: pre-wrap; font-family: inherit; font-size: inherit;'>` +
      result.replace(
        /\[HIGHLIGHT:([^:]+):([^\]]+)\]([\s\S]*?)\[\/HIGHLIGHT\]/g,
        (match, id, type, text) => {
          const highlight = highlights.find(h => h.id === id)
          const highlightType = type as 'important' | 'warning' | 'info' | 'custom'
          return `<span class="highlight ${HIGHLIGHT_COLORS_BG[highlightType]} ${HIGHLIGHT_COLORS_BORDER[highlightType]} px-1 py-0.5 rounded cursor-pointer border-2 font-medium" 
            data-highlight-id="${id}" 
            title="${highlight?.note || text}">${text}</span>`
        }
      ) + `</pre>`

    return htmlResult
  }

  // Helper to escape HTML special characters
  function escapeHtml(text: string) {
    return text.replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c
    })
  }

  const handleHighlightClick = (highlightId: string) => {
    const highlight = highlights.find(h => h.id === highlightId)
    if (highlight?.note) {
      toast.info(highlight.note, {
        description: `Highlight: "${highlight.text}"`
      })
    }
  }

  const handleSignatureSave = (signatureData: string, signatureName: string) => {
    if (!onSignaturesChange) return

    const newSignature: Signature = {
      id: Date.now().toString(),
      data: signatureData,
      name: signatureName,
      position: { x: 0, y: 0 }
    }

    const updatedSignatures = [...signatures, newSignature]
    onSignaturesChange(updatedSignatures)
    toast.success(`${signatureName} added successfully!`)
  }

  const handleSignatureRemove = (signatureId: string) => {
    if (!onSignaturesChange) return

    const updatedSignatures = signatures.filter(s => s.id !== signatureId)
    onSignaturesChange(updatedSignatures)
    toast.success("Signature removed successfully!")
  }

  const insertSignaturePlaceholder = (signatureName: string) => {
    const placeholder = `[${signatureName.toUpperCase()} SIGNATURE: _________________ DATE: _______]`
    const newContent = editedContent + placeholder
    setEditedContent(newContent)
    addToHistory(newContent)
  }

  const insertCompleteSignatureBlock = () => {
    const signatureBlock = `

**14. SIGNATURE BLOCKS**

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above.

**Party A:**
Signature: [PARTY A SIGNATURE: _________________ DATE: _______]
Name: _________________
Date: _________________

**Party B:**
Signature: [PARTY B SIGNATURE: _________________ DATE: _______]
Name: _________________
Title: _________________
Date: _________________

**DISCLAIMER:**
This document has been generated using AI technology. Please review all terms and conditions carefully before signing.`
    
    const newContent = editedContent + signatureBlock
    setEditedContent(newContent)
    addToHistory(newContent)
  }

  return (
    <div className="space-y-4">
      {/* Editor Toolbar */}
      <Card className="aramco-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Type className="w-5 h-5" />
              Contract Editor
              {isEditing && <Badge className="aramco-accent-green">Editing Mode</Badge>}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* View/Edit Toggle */}
              {!isReadOnly && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="aramco-button-secondary"
                >
                  {isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? "View" : "Edit"}
                </Button>
              )}

              {/* Undo/Redo */}
              {isEditing && (
                <>
                  <Button
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    variant="outline"
                    size="sm"
                    className="aramco-button-secondary"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleRedo}
                    disabled={historyIndex === editHistory.length - 1}
                    variant="outline"
                    size="sm"
                    className="aramco-button-secondary"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Save/Cancel */}
              {isEditing && (
                <>
                  <Button
                    onClick={handleSave}
                    className="aramco-button-primary"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="aramco-button-secondary"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}

              {/* Highlight Toggle */}
              <Button
                onClick={() => setShowHighlights(!showHighlights)}
                variant="outline"
                size="sm"
                className={`${showHighlights ? 'aramco-accent-blue' : 'aramco-button-secondary'}`}
              >
                <Highlighter className="w-4 h-4 mr-2" />
                {showHighlights ? "Hide" : "Show"} Highlights
              </Button>

              {/* Signature Toggle */}
              <Button
                onClick={() => setShowSignatures(!showSignatures)}
                variant="outline"
                size="sm"
                className={`${showSignatures ? 'aramco-accent-green' : 'aramco-button-secondary'}`}
              >
                <PenTool className="w-4 h-4 mr-2" />
                {showSignatures ? "Hide" : "Show"} Signatures
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contract Content */}
      <Card className="aramco-card">
        <CardContent className="p-6">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => {
                const newContent = e.target.value
                setEditedContent(newContent)
                addToHistory(newContent)
              }}
              className="min-h-[600px] font-mono text-sm leading-relaxed resize-none border-0 bg-transparent focus:ring-0"
              placeholder="Start editing your contract..."
              disabled={isReadOnly}
            />
          ) : (
            <div
              ref={contentRef}
              className="min-h-[600px] font-mono text-sm leading-relaxed cursor-text"
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{ __html: renderContentWithHighlights() }}
            />
          )}
        </CardContent>
      </Card>

      {/* Signature Controls - Only show when editing */}
      {showSignatures && isEditing && (
        <Card className="aramco-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Add Party Signatures
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Signature Controls */}
              <div className="flex flex-wrap gap-2">
                <SignaturePad
                  onSignatureSave={handleSignatureSave}
                  signatureName="Party A"
                  className="aramco-button-secondary"
                />
                <SignaturePad
                  onSignatureSave={handleSignatureSave}
                  signatureName="Party B"
                  className="aramco-button-secondary"
                />
              </div>

              {/* Insert Signature Block */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Insert Signature Block:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={insertCompleteSignatureBlock}
                    className="aramco-button-secondary"
                  >
                    Insert Complete Signature Block
                  </Button>
                </div>
              </div>

              {/* Insert Individual Signatures */}
              {signatures.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Insert Individual Signatures:</h4>
                  <div className="flex flex-wrap gap-2">
                    {signatures.map((signature) => (
                      <Button
                        key={signature.id}
                        variant="outline"
                        size="sm"
                        onClick={() => insertSignaturePlaceholder(signature.name)}
                        className="aramco-button-secondary"
                      >
                        Insert {signature.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Highlight Dialog */}
      <Dialog open={showHighlightDialog} onOpenChange={setShowHighlightDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Highlight</DialogTitle>
            <DialogDescription>
              Select a highlight type and add a note for the selected text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Selected Text:</label>
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                "{selectedText}"
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Highlight Type:</label>
              <div className="flex gap-2 mt-2">
                {(['important', 'warning', 'info', 'custom'] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setHighlightType(type)}
                    variant={highlightType === type ? "default" : "outline"}
                    size="sm"
                    className={`${highlightType === type ? HIGHLIGHT_COLORS[type] : ''}`}
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Note (Optional):</label>
              <Textarea
                value={highlightNote}
                onChange={(e) => setHighlightNote(e.target.value)}
                placeholder="Add a note about this highlight..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHighlightDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleHighlight} className="aramco-button-primary">
              <Highlighter className="w-4 h-4 mr-2" />
              Add Highlight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 