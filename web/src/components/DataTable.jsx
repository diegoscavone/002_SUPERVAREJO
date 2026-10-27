import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function DataTable({
  data = [],
  columns = [],
  onRowSelect,
  onRowUpdate,
  rowSelection: externalRowSelection,
  showSelectColumn = true,
  enableRowSelection = true,
  defaultPageSize = 30
}) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [activeIndex, setActiveIndex] = useState(-1)
  const activeRowRef = useRef(null)

  // Sincroniza com seleção externa
  useEffect(() => {
    if (externalRowSelection !== undefined) {
      setRowSelection(externalRowSelection)
    }
  }, [externalRowSelection])

  // Centralização e Renderização das Colunas
  const tableColumns = useMemo(() => {
    const cols = columns.map(col => {
      if (col.accessorKey === 'status') {
        return {
          ...col,
          cell: ({ getValue }) => {
            const status = getValue()
            const statusMap = {
              active: {
                label: 'Ativo',
                className:
                  'bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-500/30'
              },
              upcoming: {
                label: 'Futuro',
                className:
                  'bg-amber-500 border-amber-600 shadow-sm shadow-amber-500/30'
              },
              expired: {
                label: 'Encerrado',
                className:
                  'bg-rose-500 border-rose-600 shadow-sm shadow-rose-500/30'
              }
            }

            const config = statusMap[status] || {
              label: 'Desconhecido',
              className: 'bg-zinc-400 border-zinc-500'
            }

            return (
              <div className="flex items-center">
                <span
                  role="status"
                  aria-label={config.label}
                  title={config.label}
                  className={`inline-block h-3 w-3 rounded-full border transition-transform duration-150 hover:scale-125 ${config.className}`}
                />
              </div>
            )
          }
        }
      }
      return col
    })

    // Coluna de Checkbox no início com green-600
    if (showSelectColumn && enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <div
            className="flex items-center justify-center w-6"
            onClick={e => e.stopPropagation()}
          >
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={value =>
                table.toggleAllPageRowsSelected(!!value)
              }
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
              aria-label="Selecionar todas as linhas da página"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center w-6"
            onClick={e => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
              aria-label="Selecionar linha"
            />
          </div>
        ),
        enableSorting: false
      })
    }

    return cols
  }, [columns, showSelectColumn, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: row => String(row.id || row.prod_codigo || row.codigo),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: updater => {
      const nextSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(nextSelection)
      onRowSelect?.(nextSelection)
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        onRowUpdate?.(rowIndex, columnId, value)
      },
      setActiveRowIndex: index => {
        setActiveIndex(index)
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

  // Auto-scroll da linha ativa no teclado
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [activeIndex])

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
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (activeIndex !== -1 && enableRowSelection) {
            rows[activeIndex].toggleSelected()
          }
          break
        default:
          break
      }
    },
    [rows, activeIndex, enableRowSelection]
  )

  useEffect(() => {
    setActiveIndex(-1)
  }, [table.getState().pagination.pageIndex])

  useEffect(() => {
    if (Object.keys(rowSelection).length === 0) {
      setActiveIndex(-1)
    }
  }, [rowSelection])

  return (
    <div
      className="flex flex-col w-full gap-3 outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Tabela interativa de dados"
    >
      {/* Barra de Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          {enableRowSelection ? (
            <span>
              <strong className="text-zinc-800 dark:text-zinc-200">
                {table.getFilteredSelectedRowModel().rows.length}
              </strong>{' '}
              de{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">
                {table.getFilteredRowModel().rows.length}
              </strong>{' '}
              selecionados
            </span>
          ) : (
            <span>
              Total de itens:{' '}
              <Badge
                variant="secondary"
                className="ml-1 text-xs font-semibold text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {data.length}
              </Badge>
            </span>
          )}
        </div>

        <span className="hidden sm:inline-block text-xs text-zinc-500 italic">
          Use as setas{' '}
          <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            ↑
          </kbd>{' '}
          <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            ↓
          </kbd>{' '}
          e{' '}
          <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            Enter/Espaço
          </kbd>{' '}
          para selecionar
        </span>
      </div>

      {/* Container com Altura Fixada / Scroll Vertical e Horizontal */}
      <div className="w-full max-h-[500px] overflow-auto rounded-xl border border-border bg-card scrollbar-thin">
        <Table className="relative">
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-border sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => {
                  const isSortable = header.column.getCanSort()
                  const sortedState = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-10 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300 transition-colors whitespace-nowrap bg-zinc-50 dark:bg-zinc-900',
                        isSortable &&
                          'cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100'
                      )}
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
                          <span className="shrink-0 text-zinc-500">
                            {sortedState === 'asc' ? (
                              <ArrowUpAZ className="h-3.5 w-3.5 text-green-600" />
                            ) : sortedState === 'desc' ? (
                              <ArrowDownAZ className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                            )}
                          </span>
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
              rows.map((row, index) => {
                const isActive = activeIndex === index
                const isSelected = row.getIsSelected()

                return (
                  <TableRow
                    key={row.id}
                    ref={isActive ? activeRowRef : null}
                    data-state={isSelected && 'selected'}
                    onClick={() => {
                      setActiveIndex(index)
                      if (enableRowSelection) {
                        row.toggleSelected()
                      }
                    }}
                    className={cn(
                      'cursor-pointer transition-colors border-b border-border/50 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300',
                      'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40',
                      isActive &&
                        'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100',
                      isSelected &&
                        'bg-green-50/60 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30'
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-2.5 whitespace-nowrap text-zinc-600 dark:text-zinc-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-28 text-center text-xs text-zinc-500 italic"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Exibir
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-16 text-sm bg-background text-zinc-600 border-zinc-200 dark:border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 80].map(pageSize => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-sm text-zinc-600"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Página{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {table.getState().pagination.pageIndex + 1}
            </strong>{' '}
            de{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {table.getPageCount() || 1}
            </strong>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              icon={ChevronLeft}
              className="h-8 w-8 border-zinc-200 dark:border-zinc-700 text-zinc-600"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-200 dark:border-zinc-700 text-zinc-600"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
