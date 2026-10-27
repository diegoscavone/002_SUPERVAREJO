import React, { useId, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function SelectCustom({
  id,
  label,
  value,
  defaultValue,
  placeholder = 'Selecione...',
  className,
  containerClassName,
  labelClassName,
  error,
  disabled,
  options,
  children,
  onChangeType,
  onChangeId,
  onChangeImage,
  onValueChange,
  ...rest
}) {
  const generatedId = useId()
  const selectId = id || generatedId

  const parsedOptions = useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map(opt => ({
        value: String(opt.value),
        label: opt.label ?? String(opt.value),
        id: opt.id ? String(opt.id) : undefined,
        image: opt.image || opt['data-image']
      }))
    }

    if (children) {
      return React.Children.toArray(children)
        .filter(React.isValidElement)
        .map(child => {
          const optValue = String(child.props.value ?? '')
          const optLabel = child.props.children ?? optValue
          const optId = child.props.id ? String(child.props.id) : undefined
          const optImage = child.props['data-image'] || child.props.image

          return {
            value: optValue,
            label: optLabel,
            id: optId,
            image: optImage
          }
        })
    }

    return []
  }, [options, children])

  function handleValueChange(selectedValue) {
    const selectedItem = parsedOptions.find(
      item => item.value === selectedValue
    )

    if (onValueChange) onValueChange(selectedValue)
    if (onChangeType) onChangeType(selectedValue)
    if (onChangeId && selectedItem?.id) onChangeId(selectedItem.id)
    if (onChangeImage && selectedItem?.image) onChangeImage(selectedItem.image)
  }

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      {label && (
        <Label
          htmlFor={selectId}
          className={cn(
            'text-sm font-medium text-zinc-600 dark:text-zinc-300',
            error && 'text-destructive font-medium',
            labelClassName
          )}
        >
          {label}
        </Label>
      )}

      <Select
        value={value !== undefined ? String(value) : undefined}
        defaultValue={
          defaultValue !== undefined ? String(defaultValue) : undefined
        }
        onValueChange={handleValueChange}
        disabled={disabled}
        {...rest}
      >
        <SelectTrigger
          id={selectId}
          className={cn(
            'h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-base font-normal text-zinc-800 dark:text-zinc-100 transition-all',
            // Força o ring de 2px via outline nativo sobrepondo a borda (à prova de conflito com box-shadow)
            'focus:border-ring focus:outline-none focus:ring-0',
            'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-0',
            'data-[state=open]:border-ring data-[state=open]:outline-none data-[state=open]:ring-0',
            'focus:[box-shadow:0_0_0_1px_hsl(var(--ring))] focus-visible:[box-shadow:0_0_0_1px_hsl(var(--ring))] data-[state=open]:[box-shadow:0_0_0_1px_hsl(var(--ring))] shadow-none',
            error &&
              'border-destructive focus:border-destructive focus:[box-shadow:0_0_0_1px_hsl(var(--destructive))] data-[state=open]:border-destructive data-[state=open]:[box-shadow:0_0_0_1px_hsl(var(--destructive))]',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-72 overflow-y-auto">
          {parsedOptions.map(option => (
            <SelectItem
              key={option.id || option.value}
              value={option.value}
              className="cursor-pointer focus:bg-gray-100 focus:text-zinc-800 dark:focus:bg-green-950 dark:focus:text-green-300 transition-colors text-base"
            >
              <div className="flex items-center gap-2">
                {option.image && (
                  <img
                    src={option.image}
                    alt={String(option.label)}
                    className="h-8 w-8 rounded object-contain"
                  />
                )}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <span className="text-xs font-normal text-destructive">{error}</span>
      )}
    </div>
  )
}
