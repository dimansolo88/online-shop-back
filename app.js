const express = require('express')
const mongoose = require('mongoose')
const config = require('config')

const PORT = config.get('port') || 4444
const url = config.get('urlDB')
const app = express()

app.use('/api/auth', require('./routes/auth.routes'))
// app.use('/api/products')

const startServer =  async() => {
    try {
        await mongoose.connect(url,{
          useNewUrlParser:true,
          useUnifiedTopology:true,
          useCreateIndex:true
        })
            app.listen(PORT, () => {
                console.log(`server has started on port ${PORT}`)
            })

    }catch (e) {
        console.log(`something Error ${e.message}`)
        process.exit(1)
    }
}




startServer()