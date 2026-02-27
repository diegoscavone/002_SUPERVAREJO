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
    onConfirm() // Executa a lógica de adicionar o produto
    onSearchChange('') // Limpa o termo de busca para resetar a tabela
    // Pequeno timeout para garantir que o estado de seleção limpou antes de focar
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 10)
  }

// Função disparada quando o scanner lê um código
  const handleScanSuccess = (code) => {
    onSearchChange(code) // Atualiza o termo de busca no pai
    setShowScanner(false) // Fecha o scanner
    // O useEffect do pai ou a lógica de busca baseada em searchTerm cuidará do resto
  }

  // Definição das colunas para a PostersTable dentro do Modal
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-base bg-muted/20 pb-3 border-b  font-bold flex items-center gap-2 ">
            <Search /> Pesquisar Produtos
          </DialogTitle>
        </DialogHeader>

        {/* Barra de Pesquisa */}
        <div className="p-6 flex flex-col flex-1 overflow-hidden">
{/* Barra de Pesquisa com botão de Scanner */}
          <div className="flex gap-2 relative">
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
            
            {/* Botão de Scanner - Visível em mobile/tablet (hidden em LG) ou conforme sua regra de negócio */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 lg:hidden border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={() => setShowScanner(true)}
            >
              <Barcode size={24} />
            </Button>
          </div>

          {/* Área do Scanner - Aparece como Overlay no Modal */}
          {showScanner && (
            <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-lg relative">
                <div className="flex justify-between items-center mb-4 text-white">
                  <span className="font-bold flex items-center gap-2">
                    <Barcode /> Escanear Produto
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowScanner(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X size={24} />
                  </Button>
                </div>
                
                <BarcodeScanner onScanSuccess={handleScanSuccess} />
                
                <Button 
                  className="w-full mt-4 bg-white text-black hover:bg-gray-200"
                  onClick={() => setShowScanner(false)}
                >
                  Cancelar Leitura
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Container da Tabela com Scroll */}
        <div
          className="flex-1 overflow-auto mt-4 min-h-[300px]"
          onKeyDown={e => {
            if (e.key === 'Enter' && selectedProductId) {
              handleConfirm() // Chama o addSelectedProduct da NewOffer
            }
          }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span>Buscando produtos...</span>
            </div>
          ) : (
            <DataTable
              data={products}
              columns={columns}
              showSelectColumn={true} // Reutiliza sua lógica de checkbox
              onRowSelect={selection => {
                // Pegamos o ID da seleção (TanStack retorna { [id]: true })
                const selectedIds = Object.keys(selection)
                const lastId =
                  selectedIds.length > 0
                    ? selectedIds[selectedIds.length - 1]
                    : null
                onSelectProduct(lastId)
              }}
              // Forçamos a tabela a seguir o estado do pai
              // Se selectedProductId for null, passamos um objeto vazio {}
              rowSelection={
                selectedProductId ? { [String(selectedProductId)]: true } : {}
              }
              defaultPageSize={20}
            />
          )}
        </div>

        <DialogFooter className="bg-muted/20 p-4 border-t gap-4">
          <div className="flex-1 text-sm text-muted-foreground flex items-center">
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
