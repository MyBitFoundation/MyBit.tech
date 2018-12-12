const app = require('express')()

app.get('*', (req, res) => {
  res.send('[MyBit] Welcome to our API');
})

app.listen(process.env.PORT || 8080);
