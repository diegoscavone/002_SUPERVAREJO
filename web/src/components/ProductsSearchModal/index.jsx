import React, { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Barcode, X } from 'lucide-react'
import { DataTable } from '../../components/DataTable'
import { BarcodeScanner } from '@/components/BarcodeScanner'

export function ProductSearchModal({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  products,
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
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 10)
  }

  // Lógica idêntica ao ProductsValidity para garantir preenchimento e busca
  const handleScanSuccess = (code) => {
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
    onSearchChange(code) // Atualiza o input do modal
    setShowScanner(false) // Fecha o scanner
  }

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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-none p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base bg-muted/20 pb-3 border-b font-bold flex items-center gap-2">
            <Search /> Pesquisar Produtos
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          {/* Layout de busca IGUAL ao ProductsValidity */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar por código, descrição ou barras..."
                className="pl-10 h-11 border-input focus:ring-green-600 shadow-none"
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                autoFocus
              />
            </div>

            {/* Botão idêntico ao da tela de Validades */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScanner(!showScanner)}
              className={
                showScanner
                  ? 'lg:hidden border-red-500 text-red-500 hover:text-white hover:bg-red-500 h-11'
                  : 'lg:hidden border-orange-500 text-orange-500 hover:text-white hover:bg-orange-500 h-11'
              }
            >
              <Barcode size={20} className="mr-2" />
              {showScanner ? 'Parar' : 'Ler'}
            </Button>
          </div>

          {/* Scanner em Overlay Fixo (Z-index superior para cobrir o Dialog) */}
          {showScanner && (
            <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-lg relative">
                <BarcodeScanner onScanSuccess={handleScanSuccess} />
                <Button
                  className="absolute top-2 right-2 bg-white/20 text-white hover:bg-white/40"
                  onClick={() => setShowScanner(false)}
                >
                  Fechar
                </Button>
                <div className="mt-4 text-center text-white/70 text-sm">
                  Aponte para o código de barras do produto
                </div>
              </div>
            </div>
          )}

          {/* Container da Tabela */}
          <div
            className="flex-1 overflow-auto mt-4 min-h-[300px] border rounded-md"
            onKeyDown={e => {
              if (e.key === 'Enter' && selectedProductId) {
                handleConfirm()
              }
            }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span>Buscando produtos...</span>
              </div>
            ) : (
              <DataTable
                data={products}
                columns={columns}
                showSelectColumn={true}
                onRowSelect={selection => {
                  const selectedIds = Object.keys(selection)
                  const lastId = selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null
                  onSelectProduct(lastId)
                }}
                rowSelection={
                  selectedProductId ? { [String(selectedProductId)]: true } : {}
                }
                defaultPageSize={10}
              />
            )}
          </div>
        </div>

        <DialogFooter className="bg-muted/20 p-4 border-t gap-4">
          <div className="flex-1 text-sm text-muted-foreground flex items-center px-2">
            {selectedProductId ? (
              <span className="text-green-600 font-bold">
                ● 1 item selecionado
              </span>
            ) : (
              'Nenhum item selecionado'
            )}
          </div>
          <Button variant="ghost" onClick={onClose} className="shadow-none">
            Cancelar
          </Button>
          <Button
            disabled={!selectedProductId || isLoading}
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-none"
          >
            Inserir na Oferta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}