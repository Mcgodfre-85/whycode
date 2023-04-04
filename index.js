import express from 'express'
import config from 'config'
import { engine } from 'express-handlebars'
import { Configuration, OpenAIApi } from 'openai'
import path from 'path'
import favicon from 'serve-favicon'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const configuration = new Configuration({
  apiKey: config.get('OPEN_AI_KEY')
})
const openai = new OpenAIApi(configuration)

app.get('/', (_, res) => {
  res.render('index')
})

app.get('/about', (_, res) => {
  res.render('about')
})

app.post('/', async (req, res) => {
  const code = req.body.content
  const content = `
    Explain what this code does? 
    ${code}
  `

  const messages = [{ role: 'user', content }]

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    })

    res.render('index', {
      code,
      message: completion.data.choices[0].message,
      
    })
  } catch (e) {
    console.error(e.response)
    res.render('index', {
      code,
      errorMessage: `Error: ${e.response.status} / ${e.response.statusText} / ${e.response.data.error.message}`,
    })
  }
})

app.listen(4400)