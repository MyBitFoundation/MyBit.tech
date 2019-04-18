require('dotenv').load();
var cors = require('cors')
const express = require('express');

import {
  LIST_TOKENS_PRICES,
  AssetCollateral,
} from './constants';

import {
  TokenSaleController,
  PricesController,
  VersionController,
  GasController,
} from './controllers';

import packageJson from '../package.json';

const dev = process.env.NODE_ENV === 'development';

const app = express();

app.use(cors())

app.use(express.json())

app.get('/token-sale/contributions/health', (req, res) => {
  res.sendStatus(TokenSaleController.errors ? 500 : 200);
});

app.get('/token-sale/contributions', (req, res) => {
  if(!TokenSaleController.loaded || !PricesController.loaded){
    res.send({
      loaded: false,
    });
  }
  else {
    res.send({
      ...TokenSaleController.getDetails(),
      ethPrice: PricesController.prices.ethereum.price,
    });
  }
});

app.get('/token-sale/home/health', (req, res) => {
  res.sendStatus(TokenSaleController.errors ? 500 : 200);
});

app.get('/token-sale/home', (req, res) => {
  if(!TokenSaleController.loaded || !PricesController.loaded){
    res.send({
      loaded: false,
    });
  } else {
    res.send({
      ...TokenSaleController.getDetailsForMyBitHomePage(),
      ethPrice: PricesController.prices.ethereum.price,
    });
  }
});

app.get('/gasprice/health', (req, res) => {
  res.sendStatus(GasController.errors ? 500 : 200)
})

app.get('/gasprice', (req, res) => {
  res.send(GasController.gasData)
})

app.get('/version', (req, res) => {
  res.send(packageJson.version)
})

app.get('/prices/health', (req, res) => {
  res.sendStatus(PricesController.errors ? 500 : 200)
})

app.get('/prices', (req, res) => {
  res.send(PricesController.prices)
})

app.get('*', (req, res) => {
  res.send('MyBit API endpoint.');
})

app.listen(process.env.PORT || 8082, () => console.log(`app running at http://localhost:${process.env.PORT || 8082}`));
