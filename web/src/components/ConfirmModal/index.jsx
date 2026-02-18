import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  icon: Icon, // Recebe o componente de ícone
  confirmButtonText = 'Confirmar',
  variant = 'default', // default, destructive, success
  isLoading = false
}) {
  // Mapeamento de cores baseado na variante
  const variants = {
    destructive: 'bg-red-50 text-red-900 confirm-button-red',
    success: 'bg-green-50 text-green-900 confirm-button-green',
    default: 'bg-blue-50 text-blue-900 confirm-button-blue'
  }

  const btnColors = {
    destructive: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    default: 'bg-primary hover:bg-primary/90'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[450px] border-none shadow-2xl p-0 overflow-hidden outline-none">
        <DialogHeader
          className={`p-6 ${variants[variant] || variants.default}`}
        >
          <DialogTitle className="flex items-center gap-3 font-bold text-lg">
            {Icon && <Icon size={24} />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="text-neutral-600 text-sm leading-relaxed">
            {content}
          </div>
        </div>
        {(onConfirm || onClose) && !isLoading && (
          <DialogFooter className="p-4 bg-muted/20 border-t flex flex-row justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="font-regular text-neutral-500 hover:bg-neutral-100 shadow-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${btnColors[variant] || btnColors.default} text-white font-regular gap-2 shadow-sm px-6`}
            >
              {isLoading ? 'Processando...' : confirmButtonText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
