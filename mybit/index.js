const app = require('express')()

app.get('*', (req, res) => {
  res.send('MyBit General API');
})

app.listen();
