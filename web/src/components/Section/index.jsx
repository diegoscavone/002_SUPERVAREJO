import { Container } from './styles'

export function Section({ title, children }) {
  if (!title && !children) {
    return null
  }
  return (
    <div className="bg-white p-4 rounded-xl flex flex-col gap-2 w-full">
      {title && (
        <fieldset>
          <legend className="font-semibold text-sm text-muted-foreground tracking-wider mb-2">
            {title}
          </legend>
        </fieldset>
      )}
      {children}
    </div>
  )
}
