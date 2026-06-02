"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

type PrimitiveSelectRootProps = React.ComponentProps<typeof SelectPrimitive.Root>

type SelectRootProps<TValue extends string = string> = Omit<
  PrimitiveSelectRootProps,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: TValue | null
  onValueChange?: (value: TValue) => void
  value?: TValue | null
}

type SelectDisplayContextValue = {
  labels: Record<string, string>
  registerItem: (value: unknown, label: string) => void
  selectedKey: string | null
}

const SelectDisplayContext =
  React.createContext<SelectDisplayContextValue | null>(null)

function getValueKey(value: unknown) {
  if (value === null || value === undefined) {
    return null
  }

  return String(value)
}

function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children
      .map(getTextFromChildren)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  }

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{
      children?: React.ReactNode
    }>

    return getTextFromChildren(element.props.children)
  }

  return ""
}

function collectSelectItemLabels(
  children: React.ReactNode,
  labels: Record<string, string> = {}
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return
    }

    const element = child as React.ReactElement<{
      children?: React.ReactNode
      value?: unknown
    }>

    if (element.type === SelectItem) {
      const key = getValueKey(element.props.value)
      const label = getTextFromChildren(element.props.children)

      if (key && label) {
        labels[key] = label
      }
    }

    collectSelectItemLabels(element.props.children, labels)
  })

  return labels
}

function Select<TValue extends string = string>({
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: SelectRootProps<TValue>) {
  const [registeredLabels, setRegisteredLabels] = React.useState<
    Record<string, string>
  >({})
  const [internalValue, setInternalValue] = React.useState<TValue | null>(
    value ?? defaultValue ?? null
  )

  const staticLabels = React.useMemo(
    () => collectSelectItemLabels(children),
    [children]
  )

  const selectedValue = value ?? internalValue
  const selectedKey = getValueKey(selectedValue)

  const registerItem = React.useCallback((itemValue: unknown, label: string) => {
    const key = getValueKey(itemValue)

    if (!key || !label) {
      return
    }

    setRegisteredLabels((current) => {
      if (current[key] === label) {
        return current
      }

      return { ...current, [key]: label }
    })
  }, [])

  const labels = React.useMemo(
    () => ({ ...staticLabels, ...registeredLabels }),
    [registeredLabels, staticLabels]
  )

  const contextValue = React.useMemo(
    () => ({
      labels,
      registerItem,
      selectedKey,
    }),
    [labels, registerItem, selectedKey]
  )

  const handleValueChange = React.useCallback(
    (nextValue: unknown) => {
      const nextKey = getValueKey(nextValue)

      setInternalValue((nextKey as TValue | null) ?? null)

      if (nextKey !== null) {
        onValueChange?.(nextKey as TValue)
      }
    },
    [onValueChange]
  )

  return (
    <SelectDisplayContext.Provider value={contextValue}>
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={
          handleValueChange as PrimitiveSelectRootProps["onValueChange"]
        }
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectDisplayContext.Provider>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  const displayContext = React.useContext(SelectDisplayContext)
  const selectedLabel = displayContext?.selectedKey
    ? displayContext.labels[displayContext.selectedKey]
    : undefined

  if (selectedLabel) {
    return (
      <span
        data-slot="select-value"
        className={cn("flex flex-1 text-left", className)}
      >
        {selectedLabel}
      </span>
    )
  }

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  const displayContext = React.useContext(SelectDisplayContext)
  const registerItem = displayContext?.registerItem
  const itemLabel = React.useMemo(() => getTextFromChildren(children), [children])

  React.useEffect(() => {
    registerItem?.(props.value, itemLabel)
  }, [itemLabel, props.value, registerItem])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
