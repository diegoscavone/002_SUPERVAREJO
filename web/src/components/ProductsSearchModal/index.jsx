import { BarcodeScanner } from '@/components/BarcodeScanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Barcode,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Search,
  X
} from 'lucide-react'
import { useRef, useState } from 'react'
import { DataTable } from '../DataTable'
import { InputCustom } from '../InputCustom'

export function ProductSearchModal({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  products = [],
  isLoading,
  selectedProductId,
  onSelectProduct,
  onConfirm,
  formatCurrency
}) {
  const searchInputRef = useRef(null)
  const [showScanner, setShowScanner] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    onSearchChange('')
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)
  }

  const handleScanSuccess = code => {
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
    onSearchChange(code)
    setShowScanner(false)
  }

  // Colunas para visualização Desktop (>= sm)
  const columns = [
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
        {/* Cabeçalho */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-green-600">
              <Search className="h-5 w-5 text-green-600" />
              <span>Pesquisar Produtos</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Container Principal */}
        <div className="flex flex-col flex-1 overflow-hidden p-3 sm:p-6 gap-3">
          {/* Input de Busca + Botão Scanner */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
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

            {/* Leitor de código de barras visível no mobile */}
            {/* <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowScanner(!showScanner)}
              className={cn(
                'h-11 w-11 shrink-0 rounded-xl transition-all sm:hidden',
                showScanner
                  ? 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                  : 'border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30'
              )}
              title="Escanear com a câmera"
            >
              <Barcode className="h-5 w-5" />
            </Button> */}
          </div>

          {/* Scanner Overlay */}
          {/* {showScanner && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in">
              <div className="w-full max-w-sm relative flex flex-col items-center gap-4">
                <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-orange-500 relative">
                  <BarcodeScanner onScanSuccess={handleScanSuccess} />
                </div>
                <p className="text-white/80 text-xs text-center font-medium">
                  Aponte a câmera para o código de barras
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="text-white border-white/20 bg-white/10 hover:bg-white/20 w-full rounded-xl"
                  onClick={() => setShowScanner(false)}
                >
                  Fechar Scanner
                </Button>
              </div>
            </div>
          )} */}

          {/* Área de Listagem (Mobile Cards vs Desktop Table) */}
          <div
            className=" overflow-y-auto rounded-xl border border-border bg-card p-1 sm:p-0"
            onKeyDown={e => {
              if (e.key === 'Enter' && selectedProductId) {
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
                {/* 1. VISUALIZAÇÃO MOBILE (< sm): Touch Cards */}
                <div className="flex flex-col gap-2 p-2 sm:hidden">
                  {products.map(prod => {
                    const isSelected =
                      String(selectedProductId) === String(prod.id)
                    return (
                      <div
                        key={prod.id}
                        onClick={() =>
                          onSelectProduct(isSelected ? null : prod.id)
                        }
                        className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99]',
                          isSelected
                            ? 'bg-green-500/10 border-green-600 dark:bg-green-950/20 shadow-xs'
                            : 'bg-background border-border/80 hover:bg-muted/40'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            onSelectProduct(isSelected ? null : prod.id)
                          }
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-5 w-5 shrink-0"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2">
                            {prod.prod_descricao}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                              #{prod.prod_codigo}
                            </span>
                            {prod.prod_cod_barras &&
                              prod.prod_cod_barras !== 'N/A' && (
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

                {/* 2. VISUALIZAÇÃO DESKTOP (>= sm): DataTable */}
                <div className="hidden sm:block p-4">
                  <DataTable
                    data={products}
                    columns={columns}
                    showSelectColumn={true}
                    onRowSelect={selection => {
                      const selectedIds = Object.keys(selection)
                      const lastId =
                        selectedIds.length > 0
                          ? selectedIds[selectedIds.length - 1]
                          : null
                      onSelectProduct(lastId)
                    }}
                    rowSelection={
                      selectedProductId
                        ? { [String(selectedProductId)]: true }
                        : {}
                    }
                    defaultPageSize={30}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rodapé Fixo */}
        <DialogFooter className="p-3 sm:p-4 border-t border-border bg-card shrink-0 flex flex-row items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {selectedProductId ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> 1 item selecionado
              </span>
            ) : (
              <span>Selecione 1 produto</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 px-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!selectedProductId || isLoading}
              onClick={handleConfirm}
              className="h-10 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
            >
              Inserir na Oferta
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
