const app = require('express')()

app.set('port', process.env.PORT || 8081);

app.get('*', (req, res) => {
  res.send('MyBit Go API');
})

app.listen(app.get('port'));
