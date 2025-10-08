import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { X, Copy, Download, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface CodePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  language: string
  filename?: string
  explanation?: string
}

export function CodePreviewModal({
  isOpen,
  onClose,
  code,
  language,
  filename = 'generated_code.py',
  explanation
}: CodePreviewModalProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
      toast.error('Failed to copy code')
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Code downloaded successfully!')
    } catch (error) {
      console.error('Failed to download code:', error)
      toast.error('Failed to download code')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Generated {language === 'python' ? 'Python' : language.charAt(0).toUpperCase() + language.slice(1)} Code
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {filename}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200 border border-gray-600 hover:border-gray-500"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200 border border-gray-600 hover:border-gray-500"
              title="Download code"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-200"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Explanation */}
          {explanation && (
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-sm font-medium text-white mb-2">Code Explanation:</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
            </div>
          )}

          {/* Code Display */}
          <div className="flex-1 overflow-auto">
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700">
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </span>
              </div>
              <SyntaxHighlighter
                language={language === 'typescript' ? 'typescript' : language === 'python' ? 'python' : 'javascript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  backgroundColor: '#1f2937',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  minHeight: '300px'
                }}
                showLineNumbers
                lineNumberStyle={{
                  color: '#6b7280',
                  paddingRight: '1em',
                  userSelect: 'none'
                }}
                wrapLines
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Lines: {code.split('\n').length} | Characters: {code.length}
          </div>
          <div className="text-xs text-gray-400">
            Use Ctrl+C to copy selected text
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodePreviewModal