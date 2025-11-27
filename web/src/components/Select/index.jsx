import { Container } from './styles'
export function Select({ children, onChangeType,onChangeId, onChangeImage, ...rest }) {
  function handleSelectChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const selectedValue = event.target.value;
    const selectedImage = selectedOption.getAttribute('data-image');
    const selectedId = selectedOption.getAttribute('id');

   if(onChangeType){
    onChangeType(selectedValue)
   }
   if(onChangeImage){
    onChangeImage(selectedImage)
   }
   if(onChangeId){
    onChangeId(selectedId)
   }
  }
  return (
    <Container onChange={handleSelectChange} {...rest}>
      {children}
    </Container>
  )
}
