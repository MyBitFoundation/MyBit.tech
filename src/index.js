require('dotenv').load();
var cors = require('cors')
const express = require('express');

import {
  GAS_PRICE,
  LIST_TOKENS_PRICES,
  AssetCollateral,
} from './constants';

import {
  TokenSaleController,
  PricesController,
  CollateralController,
  VersionController,
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

app.get('/gasprice', (req, res) => {
  res.send({
    GAS_PRICE,
  })
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

app.post('/collateral', async (req, res) => {
  const escrow = req.body.escrow;
  const assetId = req.body.assetId;
  const assetManager = req.body.address;
  const result = await CollateralController.lockEscrow(assetId, assetManager, escrow);
  res.sendStatus(result);
});

app.get('*', (req, res) => {
  res.send('MyBit API endpoint.');
})

app.listen(process.env.PORT || 8082, () => console.log(`app running at http://localhost:${process.env.PORT || 8082}`));
