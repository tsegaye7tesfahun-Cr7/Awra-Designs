import './lib/envValidation'
import app from './app'

const PORT = parseInt(process.env.PORT || '4000', 10)

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
})
