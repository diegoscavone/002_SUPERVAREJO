import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Check,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Search,
  X
} from 'lucide-react'
import { useRef } from 'react'
import { DataTable } from '../DataTable'
import { InputCustom } from '../InputCustom'

export function ProductSearchModal({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  products = [],
  isLoading,
  selectedProductIds = [],
  onSelectProduct,
  onSelectProducts,
  onConfirm,
  formatCurrency
}) {
  const searchInputRef = useRef(null)

  // Unifica a prop de callback (com ou sem 's')
  const updateSelection = onSelectProducts || onSelectProduct

  // Normalização defensiva: garante sempre array de strings
  const selectedList = Array.isArray(selectedProductIds)
    ? selectedProductIds.map(String)
    : selectedProductIds
      ? [String(selectedProductIds)]
      : []

  const handleConfirm = () => {
    onConfirm()
    onSearchChange('')
  }

  // Alterna seleção individual
  const handleToggleProduct = id => {
    if (!id) return
    const stringId = String(id)
    const exists = selectedList.includes(stringId)
    const updated = exists
      ? selectedList.filter(item => item !== stringId)
      : [...selectedList, stringId]

    if (typeof updateSelection === 'function') {
      updateSelection(updated)
    }
  }

  // Colunas desktop
  const columns = [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => {
        const idStr = String(row.original.prod_codigo || row.original.id || row.original.codigo)
        const isChecked = selectedList.includes(idStr)
        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => handleToggleProduct(idStr)}
            onClick={e => e.stopPropagation()}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
        )
      }
    },
    { accessorKey: 'prod_codigo', header: 'Código' },
    { accessorKey: 'prod_cod_barras', header: 'EAN' },
    { accessorKey: 'prod_descricao', header: 'Descrição' },
    { accessorKey: 'prod_complemento', header: 'Complemento' },
    {
      accessorKey: 'prod_preco_custo',
      header: 'Custo',
      cell: ({ getValue }) => formatCurrency(getValue())
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl h-[100dvh] sm:h-[88vh] max-h-[100dvh] sm:max-h-[88vh] flex flex-col p-0 gap-0 border-none sm:border sm:border-border sm:rounded-2xl overflow-hidden bg-background">
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-green-600">
              <Search className="h-5 w-5 text-green-600" />
              <span>Pesquisar Produtos</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden p-3 sm:p-6 gap-3">
          <div className="relative shrink-0">
            <InputCustom
              ref={searchInputRef}
              placeholder="Código, descrição ou EAN..."
              icon={Search}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            className="overflow-y-auto rounded-xl bg-card p-1 sm:p-0 flex-1"
            onKeyDown={e => {
              if (e.key === 'Enter' && selectedList.length > 0) {
                handleConfirm()
              }
            }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] gap-2 text-muted-foreground py-12">
                <Loader2 className="h-7 w-7 animate-spin text-green-600" />
                <span className="text-xs sm:text-sm font-medium">
                  Buscando catálogo...
                </span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] p-6 text-center text-muted-foreground gap-2">
                <PackageOpen className="h-10 w-10 stroke-[1.2] opacity-40" />
                <p className="text-sm font-medium text-foreground">
                  Nenhum produto encontrado
                </p>
                <p className="text-xs max-w-xs">
                  Digite ao menos 3 letras ou escaneie o código de barras.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: Toque no Card */}
                <div className="flex flex-col gap-2 p-1 sm:hidden">
                  {products.map(prod => {
                    const idStr = String(prod.prod_codigo || prod.id || prod.codigo)
                    const isSelected = selectedList.includes(idStr)

                    return (
                      <div
                        key={idStr}
                        onClick={() => handleToggleProduct(idStr)}
                        className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99]',
                          isSelected
                            ? 'bg-green-500/10 border-green-600 dark:bg-green-950/20 shadow-xs'
                            : 'bg-background border-border/80 hover:bg-muted/40'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleProduct(idStr)}
                          onClick={e => e.stopPropagation()}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-5 w-5 shrink-0"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2">
                            {prod.prod_descricao}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                              #{prod.prod_codigo || prod.id}
                            </span>
                            {prod.prod_cod_barras && prod.prod_cod_barras !== 'N/A' && (
                              <span className="font-mono">
                                {prod.prod_cod_barras}
                              </span>
                            )}
                            {prod.prod_complemento && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1 font-normal"
                              >
                                {prod.prod_complemento}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground block">
                            Custo
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            {formatCurrency(prod.prod_preco_custo)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop: Linha da tabela clicável */}
                <div className="hidden sm:block [&_tr]:cursor-pointer">
                  <DataTable
                    data={products}
                    columns={columns}
                    showSelectColumn={false}
                    enableRowSelection={false}
                    onRowClick={row => {
                      const raw = row.original || row
                      const idStr = String(raw.prod_codigo || raw.id || raw.codigo)
                      handleToggleProduct(idStr)
                    }}
                    defaultPageSize={30}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t border-border bg-card shrink-0 flex flex-row items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {selectedList.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {selectedList.length}{' '}
                {selectedList.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            ) : (
              <span>Selecione os produtos</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" color="cancel" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              color="green"
              icon={Check}
              disabled={selectedList.length === 0 || isLoading}
              onClick={handleConfirm}
            >
              Inserir na Oferta {selectedList.length > 0 && `(${selectedList.length})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}