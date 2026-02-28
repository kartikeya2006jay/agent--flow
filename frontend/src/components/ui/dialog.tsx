'use client'

import * as React from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop - prevents interaction with page behind */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Content - sits on top of backdrop */}
      <div className="relative z-[10000] w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        {children}
      </div>
    </div>
  )
}

export function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <span onClick={onClick} className="cursor-pointer">{children}</span>
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={className}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function DialogClose({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors"
      aria-label="Close"
    >
      <X className="h-4 w-4 text-slate-500" />
      {children}
    </button>
  )
}
