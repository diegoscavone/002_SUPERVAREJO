import axios from 'axios'

const getBaseUrl = (port) => {
  const { hostname, protocol} = window.location

const host = hostname === 'localhost' ? 'localhost' : hostname;
  
  return `${protocol}//${host}:${port}`;
}

// const getApiErpBaseUrl = () => {
//   const currentHost = window.location.hostname

//   return currentHost === 'localhost'
//     ? 'http://localhost:3334'
//     : `http://${currentHost}:3334`
// }

export const api = axios.create({
  baseURL: getBaseUrl('3333'),
  // baseURL: 'http://192.168.0.198:3333',
  withCredentials: true,
  timeout: 10000
})

export const apiERP = axios.create({
  baseURL: getBaseUrl('3334')
  // baseURL: 'http://192.168.0.198:3334',
  // withCredentials: true
})
