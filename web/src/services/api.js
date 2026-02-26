import axios from 'axios'

const getBaseUrl = (port, path) => {
  const { hostname, protocol} = window.location

// Se for localhost, mantém o comportamento de portas para desenvolvimento
  if (hostname === 'localhost') {
    return `${protocol}//localhost:${port}`;
  }

  // Em produção (no seu domínio), removemos a porta e usamos o path configurado no Nginx
  return `${protocol}//${hostname}${path}`;
}

export const api = axios.create({
  baseURL: getBaseUrl('3333', '/api'),
  // baseURL: 'http://192.168.0.198:3333',
  withCredentials: true,
  timeout: 10000
})

export const apiERP = axios.create({
  baseURL: getBaseUrl('3334', '/erp')
  // baseURL: 'http://192.168.0.198:3334',
  // withCredentials: true
})
