import React, { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { DataTable } from '../../components/DataTable'

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
        <div className="relative mt-2">
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
