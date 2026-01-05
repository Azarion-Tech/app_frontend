import * as React from "react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        key="overlay"
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div key="content" className="relative z-50">{children}</div>
    </div>
  )
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto p-6 ${className}`}
    >
      {children}
    </div>
  )
}

export function DialogHeader({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function DialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
}

export function DialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`text-sm text-gray-600 mt-2 ${className}`}>{children}</p>
}

export function DialogFooter({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mt-6 flex justify-end gap-2 ${className}`}>{children}</div>
}
