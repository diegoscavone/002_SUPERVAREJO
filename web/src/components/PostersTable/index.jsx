import React, { useState } from 'react'
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
// import { Pencil } from 'lucide-react' // Comentado conforme solicitado

export function PostersTable({
  data = [],
  columns = [],
  onRowSelect,
  showEditColumn = false,
  showSelectColumn = true,
  handleEdit
}) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})

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

    if (showSelectColumn) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
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
  }, [columns, showSelectColumn]) // showEditColumn e handleEdit removidos das dependências por enquanto

  const table = useReactTable({
    data,
    columns: tableColumns,
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
    state: {
      sorting,
      rowSelection
    },
    getRowId: row => row.id
  })

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center px-1">
        <span className="text-sm font-medium text-neutral-600 ">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} selecionados
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
                              <ArrowUpZA className="h-4 w-4 text-green-600" />
                            ) : sortedState === 'desc' ? (
                              <ArrowUpAZ className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownUp className="h-4 w-4 text-green-600" />
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => row.toggleSelected()}
                  className={`
          group cursor-pointer border-b last:border-0 transition-colors 
          /* Efeito de Hover: Verde muito claro */
          hover:bg-green-50 
          /* Quando Selecionada: Verde claro persistente */
          data-[state=selected]:bg-green-100/70 
          /* Hover sobre uma linha já selecionada */
          data-[state=selected]:hover:bg-green-100
        `}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-1.5 text-sm text-neutral-600"
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
              {[10, 20, 30, 40, 50].map(pageSize => (
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
