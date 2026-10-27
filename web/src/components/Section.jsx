
export function Section({ title, children }) {
  if (!title && !children) {
    return null
  }
  return (
    <div className="bg-white rounded-xl flex flex-col gap-2 w-full">
      {title && (
        <fieldset>
          <legend className="font-semibold text-md text-green-600">
            {title}
          </legend>
        </fieldset>
      )}
      {children}
    </div>
  )
}
