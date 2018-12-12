const app = require('express')()

app.get('*', (req, res) => {
  res.send('MyBit Go API Endpoint');
})

app.listen(process.env.PORT || 8081);
