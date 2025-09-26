"use client"

import * as React from "react"
import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarContextProps {
  isExpanded: boolean
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isExpanded, setIsExpanded] = React.useState(!isMobile)

  React.useEffect(() => {
    setIsExpanded(!isMobile)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"aside">
>(({ className, ...props }, ref) => {
  const { isExpanded } = useSidebar()
  return (
    <aside
      ref={ref}
      className={cn(
        "hidden md:flex flex-col transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-14",
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { isExpanded, setIsExpanded } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-2", isExpanded && "justify-between", className)}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-2 overflow-hidden transition-all",
          isExpanded ? "w-52" : "w-0"
        )}
      >
        {props.children}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronFirst /> : <ChevronLast />}
      </Button>
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("flex flex-col", className)} {...props} />
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("", className)} {...props} />
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { isActive?: boolean; tooltip: string }
>(({ asChild, isActive, tooltip, ...props }, ref) => {
  const { isExpanded } = useSidebar()
  const Comp = asChild ? "div" : "button"

  const buttonContent = (
    <Button
      ref={ref}
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        !isExpanded && "justify-center",
        props.className
      )}
      {...props}
    >
      <div className={cn("flex items-center", isExpanded && "w-full gap-2")}>
        {props.children}
      </div>
    </Button>
  )

  if (isExpanded) {
    return buttonContent
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { isExpanded } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between border-t p-2",
        !isExpanded && "flex-col",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, any>(
  (props, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        {...props}
      />
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { isExpanded } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-300 ease-in-out",
        isExpanded ? "md:pl-64" : "md:pl-14"
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

export {
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
}
