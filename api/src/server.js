require('express-async-errors')
const AppError = require('./utils/AppError')
const path = require('path')

const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes')
const cookieParser = require('cookie-parser')

const cron = require('node-cron')
const knex = require('./database/knex')

require('dotenv').config()

const app = express()

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    // origin: [
    //   'http://localhost:5173',
    //   'http://127.0.0.1:5173',
    // ],

    origin: 'http://192.168.0.198',
    // origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true, // OBRIGATÓRIO para o navegador aceitar o cookie do SessionsController
    optionsSuccessStatus: 200
  })
)

const uploadsPath = path.resolve(__dirname, 'tmp', 'uploads')
console.log('Pasta de uploads detectada em:', uploadsPath)
app.use('/tmp/uploads', express.static(uploadsPath))
app.use(routes)

app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }

  console.error(error)

  return response.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  })
})

const PORT = 3333
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () =>
  console.log(`Server Posters is running on Port ${PORT}`)
)

cron.schedule(
  '00 21 * * *',
  async () => {
    console.log('Executando a limpeza de cartazes antigos...')
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const deletedCount = await knex('posters')
        .where('created_at', '<', thirtyDaysAgo)
        .delete()

      console.log(
        `${deletedCount} cartaz(es) com mais de 30 dias foram deletados.`
      )
    } catch (error) {
      console.error('Erro ao deletar cartazes antigos:', error)
    }
  },
  {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
  }
)
