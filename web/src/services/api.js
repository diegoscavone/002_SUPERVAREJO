import axios from 'axios'

const getApiBaseUrl = () => {
  const currentHost = window.location.hostname

  return currentHost === 'localhost'
    ? 'http://localhost:3333'
    : `http://${currentHost}:3333`
}

const getApiErpBaseUrl = () => {
  const currentHost = window.location.hostname

  return currentHost === 'localhost'
    ? 'http://localhost:3334'
    : `http://${currentHost}:3334`
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  // baseURL: 'http://192.168.0.198:3333',
  withCredentials: true
})

export const apiERP = axios.create({
  baseURL: getApiErpBaseUrl()
  // baseURL: 'http://192.168.0.198:3334',
  // withCredentials: true
})
