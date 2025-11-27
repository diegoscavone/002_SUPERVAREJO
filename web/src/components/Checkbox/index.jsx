import { useRef } from "react"
import { Container } from "./styles"
import { useEffect } from "react"

export function Checkbox({label, checked, indeterminate, onchange, ...rest}){
  const handleChange = (event) => {
    onchange(event.target.checked)
  }

  const checkBoxRef = useRef(null)

  useEffect(() => {
    const checkbox = checkBoxRef.current;
    if (checkbox) {
      checkbox.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <Container>
      <input
        type="checkbox"
        checked={checked}
        ref={checkBoxRef}
        onChange={handleChange}
        {...rest} />
      <span className="checkmark"></span>
      {label}
    </Container>
  )
}