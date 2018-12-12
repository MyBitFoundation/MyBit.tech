const app = require('express')(),
      fs = require('fs'),
      path = require('path'),
      { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

async function getVersion() {
  try {
    const filePath = path.join(__dirname, 'version');
    const text = await readFileAsync(
      filePath,
      { encoding: 'utf8' }
    );
    return text;
  }
  catch (err) {
    console.log('Err', err)
    return err;
  }
}

function main(app, version) {
  app.set('port', process.env.PORT || 8080);

  app.get('/', (req, res) => {
    res.send('MyBit General API');
  })

  app.get('/version', (req, res) => {
    res.send(version);
  })

  app.listen(app.get('port'));
}

getVersion()
  .then(version => main(app, version));
