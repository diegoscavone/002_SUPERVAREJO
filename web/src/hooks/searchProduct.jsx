import { createContext, useContext } from 'react'

export const SearchContext = createContext({})
function SearchProvider({ children }) {
  const [data, setData] = useState({ search: '' })

  function searchProduct(search) {
    setData({ search })
    console.log(search)
  }
  return (
    <SearchContext.Provider
      value={{
        searchProduct,
        search: data.search
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

function useSearch() {
  const context = useContext(SearchContext)
  return context
}

export { SearchProvider, useSearch }
