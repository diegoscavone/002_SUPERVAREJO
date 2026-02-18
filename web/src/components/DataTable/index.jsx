import React, { useCallback, useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  PiCaretLeft,
  PiCaretRight,
  PiArrowsDownUp,
  PiCaretUpBold,
  PiCaretDownBold
} from 'react-icons/pi'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge' // Importe o Badge do shadcn
import { ArrowDownUp, ArrowUpAZ, ArrowUpDown, ArrowUpZA } from 'lucide-react'

export function DataTable({
  data = [],
  columns = [],
  onRowSelect,
  onRowUpdate,
  rowSelection: externalRowSelection,
  showEditColumn = false,
  showSelectColumn = true,
  enableRowSelection = true,
  handleEdit,
  defaultPageSize = 10
}) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (externalRowSelection !== undefined) {
      setRowSelection(externalRowSelection)
    }
  }, [externalRowSelection])

  const tableColumns = React.useMemo(() => {
    const cols = [...columns].map(col => {
      // Interceptamos a coluna de status para aplicar o Badge automaticamente
      if (col.accessorKey === 'status') {
        return {
          ...col,
          cell: ({ getValue }) => {
            const status = getValue()
            const statusMap = {
              active: { label: 'Ativo', variant: 'success' }, // Verifique se criou a variant no shadcn
              upcoming: { label: 'Futuro', variant: 'outline' },
              expired: { label: 'Encerrado', variant: 'destructive' }
            }
            const config = statusMap[status] || {
              label: 'Desconhecido',
              variant: 'secondary'
            }
            return (
              <Badge
                variant={config.variant}
                className="font-semibold text-[10px] uppercase rounded-xl tracking-wider"
              >
                {config.label}
              </Badge>
            )
          }
        }
      }
      return col
    })

    if (showSelectColumn && enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: DataTable => (
          <div
            className="flex items-center justify-center w-8"
            onClick={e => e.stopPropagation()}
          >
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={value =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Selecionar todos"
              className="border-input data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 shadow-none"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center w-8"
            onClick={e => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              aria-label="Selecionar linha"
              className="border-input data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 shadow-none"
            />
          </div>
        ),
        enableSorting: false
      })
    }

    // Botão Editar Comentado
    /*
    if (showEditColumn) {
      cols.push({
        id: "actions",
        header: () => <div className="text-center">Ações</div>,
        cell: ({ row }) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(row.original.id)}
              className="h-8 w-8 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
      });
    }
    */

    return cols
  }, [columns, showSelectColumn, enableRowSelection]) // showEditColumn e handleEdit removidos das dependências por enquanto

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: row => String(row.id || row.prod_codigo || row.codigo), // Assegura que cada linha tenha um ID único
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: updater => {
      const nextSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(nextSelection)
      if (onRowSelect) onRowSelect(nextSelection)
    },
    meta: {
      // Adicionamos isso para que as células possam chamar o pai
      updateData: (rowIndex, columnId, value) => {
        onRowUpdate?.(rowIndex, columnId, value)
      }
    },
    initialState: {
      pagination: {
        pageSize: defaultPageSize
      }
    },
    state: {
      sorting,
      rowSelection
    }
  })

  const rows = table.getRowModel().rows

  const handleKeyDown = useCallback(
    e => {
      if (rows.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(prev => (prev < rows.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
          break
        case ' ': // ESPAÇO: Seleciona/Desseleciona
          e.preventDefault()
          if (activeIndex !== -1) {
            rows[activeIndex].toggleSelected()
          }
          break
        case 'Enter': // ENTER: Pode ser usado para inserir (o pai decide)
          e.preventDefault()
          // Se houver uma função de "onConfirm" passada por props, execute-a
          // Caso contrário, apenas seleciona (comportamento padrão)
          if (activeIndex !== -1) {
            // rows[activeIndex].toggleSelected() // opcional se quiser que enter selecione também
          }
          break
        default:
          break
      }
    },
    [rows, activeIndex]
  )

  useEffect(() => {
    setActiveIndex(-1)
  }, [table.getState().pagination.pageIndex])

  useEffect(() => {
    // Se a prop externa de seleção for limpa (objeto vazio), resetamos o índice ativo do teclado
    if (Object.keys(rowSelection).length === 0) {
      setActiveIndex(-1)
    }
  }, [rowSelection])

  return (
    <div
      className="w-full flex flex-col gap-3 focus:outline-none ring-0 outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center justify-between px-1">
        {enableRowSelection && (
        <span className="text-sm font-medium text-neutral-600 ">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} selecionados
        </span>
        )}
        <span className="text-[10px] text-muted-foreground uppercase italic">
          Use as setas ↑↓ e Enter para selecionar
        </span>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-none"
              >
                {headerGroup.headers.map(header => {
                  const isSortable = header.column.getCanSort()
                  const sortedState = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className={`h-10 px-4 py-2 bg-slate-50 text-neutral-600 font-semibold text-sm transition-colors ${isSortable ? 'cursor-pointer select-none hover:text-green-500' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {isSortable && (
                          <div className="flex-shrink-0">
                            {sortedState === 'asc' ? (
                              <ArrowUpAZ className="h-3 w-3 text-green-600" />
                            ) : sortedState === 'desc' ? (
                              <ArrowUpZA className="h-3 w-3 text-green-600" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-20" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => {
                    setActiveIndex(index) // Sincroniza o índice ao clicar com mouse
                    if (enableRowSelection) {
                      row.toggleSelected()
                    }
                  }}
                  /* LÓGICA DE DESTAQUE: bg-green-100 para navegação por teclado */
                  className={`
                    group cursor-pointer last:border-0 transition-all relative
                    ${
                      activeIndex === index
                        ? 'bg-green-100'
                        : 'hover:bg-green-50/50'
                    }
                    data-[state=selected]:bg-green-100/70
                  `}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-1.5 text-sm transition-colors ${activeIndex === index ? 'text-green-900 font-medium' : 'text-neutral-600'}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-muted-foreground text-xs italic"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-600">Exibir</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-7 w-16 text-[11px] shadow-none border-input focus:ring-green-600 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 80].map(pageSize => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-xs"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-600 tracking-tighter">
            Página:{' '}
            <span className="text-neutral-600 font-medium">
              {table.getState().pagination.pageIndex + 1} -{' '}
              {table.getPageCount()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shadow-none border-input hover:border-green-600 hover:text-green-600 disabled:opacity-20"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <PiCaretLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shadow-none border-input hover:border-green-600 hover:text-green-600 disabled:opacity-20"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <PiCaretRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
