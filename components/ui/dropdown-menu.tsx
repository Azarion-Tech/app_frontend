import * as React from "react"

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            key: index,
            open,
            setOpen,
          })
        }
        return child
      })}
    </div>
  )
}

export function DropdownMenuTrigger({
  children,
  asChild,
  open,
  setOpen,
}: {
  children: React.ReactNode
  asChild?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
}) {
  const handleClick = () => {
    setOpen?.(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    })
  }

  return <div onClick={handleClick}>{children}</div>
}

export function DropdownMenuContent({
  children,
  align = "start",
  className = "",
  open,
  setOpen,
}: {
  children: React.ReactNode
  align?: "start" | "end"
  className?: string
  open?: boolean
  setOpen?: (open: boolean) => void
}) {
  if (!open) return null

  React.useEffect(() => {
    const handleClickOutside = () => setOpen?.(false)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [setOpen])

  return (
    <div
      className={`absolute z-50 mt-2 ${
        align === "end" ? "right-0" : "left-0"
      } min-w-[200px] bg-white rounded-md shadow-lg border border-gray-200 py-1 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-gray-200 my-1" />
}
