const app = require('express')(),
      fs = require('fs'),
      path = require('path'),
      { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

function getVersion() {
  try {
    const filePath = path.join(__dirname, 'version');
    return readFileAsync(
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
  console.log('Loading version', version)

  app.get('*', (req, res) => {
    res.send(version);
  })

  app.listen(process.env.PORT || 9000);
}

getVersion()
  .then(version => main(app, version))
  .catch(err => {
    console.log('Err', err);
    main(app, 'Unable to load version');
  })

