const app = require('express')()

app.get('*', (req, res) => {
  res.send('MyBit API Endpoint');
})

app.listen(process.env.PORT || 8080);
