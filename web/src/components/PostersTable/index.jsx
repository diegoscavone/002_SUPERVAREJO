import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Checkbox } from '../../components/Checkbox'
import {
  PiCaretCircleDown,
  PiCaretCircleUp,
  PiCaretLeft,
  PiCaretRight,
  PiPencil
} from 'react-icons/pi'
import { Container } from './styles'
import { useNavigate } from 'react-router-dom'

// Memo para o componente Checkbox para evitar re-renderizações desnecessárias
const MemoizedCheckbox = React.memo(Checkbox)

export function PostersTable({
  data = [],
  columns = [],
  selectedPosters = {},
  onRowSelect = () => {},
  showEditColumn = false,
  showSelectColumn = true,
  editType = 'posters'
}) {
  const navigate = useNavigate()

  // Estados controlados para paginação
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50
  })

  // Estado para ordenação
  const [sorting, setSorting] = useState({
    columnId: null,
    direction: null // 'asc' | 'desc' | null
  })

  // Estado para filtros
  const [globalFilter, setGlobalFilter] = useState('')

  // Estado para operações em lote
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)

  // Memoizando o handler de edição
  const handleEdit = useCallback(
    id => {
      const baseUrl = editType === 'users' ? '/users/profile/' : '/details/'
      navigate(`${baseUrl}${id}`)
    },
    [navigate, editType]
  )

  // Handler otimizado para seleção individual
  const handleRowSelect = useCallback(
    (rowId, isSelected) => {
      if (isProcessingBatch) return

      const newSelection = { ...selectedPosters }

      if (isSelected) {
        delete newSelection[rowId]
      } else {
        newSelection[rowId] = true
      }

      onRowSelect(newSelection)
    },
    [selectedPosters, onRowSelect, isProcessingBatch]
  )

  // Handler otimizado para selecionar todos
  const handleSelectAll = useCallback(() => {
    const selectedCount = Object.keys(selectedPosters).length
    const allSelected = selectedCount === data.length && selectedCount > 0

    setIsProcessingBatch(true)

    setTimeout(() => {
      let newSelection = {}

      if (!allSelected) {
        // Selecionar todos usando um loop otimizado
        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          if (row.id) {
            newSelection[row.id] = true
          }
        }
      }

      onRowSelect(newSelection)
      setIsProcessingBatch(false)
    }, 0)
  }, [data, selectedPosters, onRowSelect])

  // Cálculos memoizados para seleção
  const selectionStats = useMemo(() => {
    const selectedIds = Object.keys(selectedPosters)
    const selectedCount = selectedIds.length
    const allSelected = selectedCount === data.length && selectedCount > 0
    const someSelected = selectedCount > 0 && !allSelected

    return { selectedCount, allSelected, someSelected }
  }, [selectedPosters, data.length])

  // Handler para ordenação
  const handleSort = useCallback((columnId, sortable = true) => {
    if (!sortable) return

    setSorting(prev => {
      if (prev.columnId !== columnId) {
        return { columnId, direction: 'asc' }
      }
      
      if (prev.direction === 'asc') {
        return { columnId, direction: 'desc' }
      }
      
      if (prev.direction === 'desc') {
        return { columnId: null, direction: null }
      }
      
      return { columnId, direction: 'asc' }
    })
  }, [])

  // Dados ordenados (sem filtro interno, apenas ordenação)
  const processedData = useMemo(() => {
    let sortedData = [...data]

    // Aplicar ordenação
    if (sorting.columnId && sorting.direction) {
      const column = columns.find(col => col.id === sorting.columnId || col.accessorKey === sorting.columnId)
      if (column) {
        sortedData.sort((a, b) => {
          let aValue = a[column.accessorKey] || ''
          let bValue = b[column.accessorKey] || ''

          // Converter para string para comparação
          aValue = String(aValue).toLowerCase()
          bValue = String(bValue).toLowerCase()

          if (sorting.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
      }
    }

    return sortedData
  }, [data, columns, sorting])

  // Dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return processedData.slice(startIndex, endIndex)
  }, [processedData, pagination])

  // Informações de paginação
  const paginationInfo = useMemo(() => {
    const totalItems = processedData.length
    const totalPages = Math.ceil(totalItems / pagination.pageSize)
    const currentPage = pagination.pageIndex + 1
    const canPreviousPage = pagination.pageIndex > 0
    const canNextPage = pagination.pageIndex < totalPages - 1

    return {
      totalItems,
      totalPages,
      currentPage,
      canPreviousPage,
      canNextPage
    }
  }, [processedData.length, pagination])

  // Handlers de paginação
  const handlePreviousPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: Math.max(0, prev.pageIndex - 1)
    }))
  }, [])

  const handleNextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: Math.min(paginationInfo.totalPages - 1, prev.pageIndex + 1)
    }))
  }, [paginationInfo.totalPages])

  const handlePageSizeChange = useCallback(e => {
    const newSize = Number(e.target.value)
    setPagination(prev => ({
      pageIndex: 0, // Reset para primeira página
      pageSize: newSize
    }))
  }, [])

  // Renderizar célula
  const renderCell = useCallback((row, column) => {
    if (column.cell && typeof column.cell === 'function') {
      return column.cell({ row: { original: row }, getValue: () => row[column.accessorKey] })
    }
    
    if (column.accessorKey) {
      return row[column.accessorKey] || ''
    }
    
    return ''
  }, [])

  // Colunas memoizadas
  const enhancedColumns = useMemo(() => {
    const baseColumns = []

    if (showSelectColumn) {
      baseColumns.push({
        id: 'select',
        header: ({ table }) => (
          <MemoizedCheckbox
            checked={selectionStats.allSelected}
            indeterminate={selectionStats.someSelected}
            onChange={handleSelectAll}
            disabled={isProcessingBatch}
          />
        ),
        cell: ({ row }) => {
          const isSelected = selectedPosters[row.original.id] === true
          return (
            <MemoizedCheckbox
              checked={isSelected}
              onChange={() => handleRowSelect(row.original.id, isSelected)}
              disabled={isProcessingBatch}
            />
          )
        },
        sortable: false,
        width: '50px'
      })
    }

    baseColumns.push(...columns)

    if (showEditColumn) {
      baseColumns.push({
        id: 'edit',
        header: '',
        cell: ({ row }) => (
          <button
            className="edit"
            onClick={() => handleEdit(row.original.id)}
            type="button"
          >
            <PiPencil />
          </button>
        ),
        sortable: false,
        width: '60px'
      })
    }

    return baseColumns
  }, [
    columns,
    showEditColumn,
    showSelectColumn,
    handleEdit,
    selectionStats,
    isProcessingBatch,
    handleSelectAll,
    handleRowSelect,
    selectedPosters
  ])

  return (
    <Container>
      <div className="processing-indicator">
        <div className="table-info">
          {selectionStats.selectedCount > 0 && (
            <span>{selectionStats.selectedCount} item(s) selecionado(s)</span>
          )}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {enhancedColumns.map(column => (
              <th 
                key={column.id || column.accessorKey} 
                className={column.id || column.accessorKey}
                style={{ width: column.width }}
              >
                {column.header && typeof column.header === 'function' ? (
                  column.header({ 
                    table: { getState: () => ({ pagination }) },
                    column: { getCanSort: () => column.sortable !== false }
                  })
                ) : column.id === 'select' || column.id === 'edit' ? (
                  <span>{column.header || ''}</span>
                ) : (
                  <div
                    className={column.sortable !== false ? 'sortable' : ''}
                    onClick={() => handleSort(column.id || column.accessorKey, column.sortable !== false)}
                    style={{
                      cursor: column.sortable !== false ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {column.header}
                    {sorting.columnId === (column.id || column.accessorKey) && (
                      <>
                        {sorting.direction === 'asc' && <PiCaretCircleUp />}
                        {sorting.direction === 'desc' && <PiCaretCircleDown />}
                      </>
                    )}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map(row => {
            return (
              <tr key={row.id}>
                {enhancedColumns.map(column => (
                  <td key={`${row.id}-${column.id || column.accessorKey}`}>
                    {column.cell && typeof column.cell === 'function' ? (
                      column.cell({ 
                        row: { original: row }, 
                        getValue: () => row[column.accessorKey] 
                      })
                    ) : (
                      renderCell(row, column)
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {paginatedData.length === 0 && (
        <div className="empty-state">
          <p>Nenhum item encontrado</p>
        </div>
      )}

      <div className="pagination-controls">
        <div className="pagination-info">
          Mostrando {Math.min(pagination.pageSize, paginatedData.length)} de{' '}
          {paginationInfo.totalItems} itens
        </div>

        <div className="pagination-buttons">
          <button
            onClick={handlePreviousPage}
            disabled={!paginationInfo.canPreviousPage}
            type="button"
          >
            <PiCaretLeft />
          </button>

          <span className="page-info">
            Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!paginationInfo.canNextPage}
            type="button"
          >
            <PiCaretRight />
          </button>
        </div>

        <select value={pagination.pageSize} onChange={handlePageSizeChange}>
          {[10, 20, 30, 40, 50, 100].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
    </Container>
  )
}