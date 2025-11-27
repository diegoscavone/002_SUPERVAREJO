import { toast } from 'react-toastify'

// Funções para cada tipo de toast com configurações padrões
export const toastError = message => {
  toast.error(message, {
    autoClose: 2000,
    closeButton: false,
    hideProgressBar: true,
    bodyClassName: '#E4272A',
    bodyStyle: { background: '#E4272A' },
    style: { background: '#E4272A' },
    position: 'top-center'
  })
}

export const toastSuccess = message => {
  toast.success(message, {
    autoClose: 2000,
    closeButton: false,
    hideProgressBar: true,
    bodyClassName: '#38AB4E',
    bodyStyle: { background: '#38AB4E' },
    style: { background: '#38AB4E' },
    position: 'top-center'
  })
}

export const toastInfo = message => {
  toast.info(message, {
    autoClose: 2000,
    closeButton: false,
    hideProgressBar: true,
    bodyClassName: '#009EE2',
    bodyStyle: { background: '#009EE2' },
    style: { background: '#009EE2' },
    position: 'top-center'
  })
}
