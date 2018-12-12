const app = require('express')()

app.set('port', process.env.PORT || 8080);

app.get('*', (req, res) => {
  res.send('MyBit General API');
})

app.listen(app.get('port'));
