const app = require('express')()

app.get('*', (req, res) => {
  res.send('MyBit Go API');
})

app.listen();
