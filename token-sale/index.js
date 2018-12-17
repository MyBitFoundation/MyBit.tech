require('dotenv').load();
const app = require('express')()
const fetch = require('isomorphic-unfetch');
const Web3 = require('web3');
const cors = require('cors')
const core = require('./core');

const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`));

let contributions = [];
let timestampStartTokenSale = 0;
let loaded = false;
let currentDay = undefined;
let ethPrice = 0;
let gasPrice = 0;
let started = false;
let currentPeriodTotal = undefined;
let exchangeRate = undefined;

app.use(cors());

app.get('/contributions', (req, res) => {
  if(!loaded){
    res.send({
      loaded: false,
    });
  }
  else {
    res.send({
      timestampStartTokenSale,
      contributions,
      loaded,
      currentDay,
      ethPrice,
      currentPeriodTotal,
      exchangeRate,
    });
  }
});

app.get('/home', (req, res) => {
  if(!loaded){
    res.send({
      loaded: false,
    });
  } else {
    res.send({
      timestampStartTokenSale,
      currentPeriodTotal,
      loaded,
      currentDayServer: currentDay,
      ethPrice,
      exchangeRate,
    });
  }
});

app.get('/gasprice', (req, res) => {
  res.send({
    gasPrice,
  })
})

app.get('*', (req, res) => {
  res.send('Token Distribution Endpoint');
})

app.listen(process.env.PORT || 8082);

async function PullContributions(){
  try{
    timestampStartTokenSale = await core.getStartTimestamp(web3);
    started = timestampStartTokenSale <= Math.floor(Date.now() / 1000);
    if(started){
      currentDay = Math.floor(((Math.floor(Date.now() / 1000) - timestampStartTokenSale) / 86400) + 1);

    } else {
      setTimeout(PullContributions, timestampStartTokenSale * 1000 - Date.now());
    }
    contributions = await core.getAllContributionsPerDay(web3, currentDay, timestampStartTokenSale * 1000);

    currentPeriodTotal = contributions[currentDay ? currentDay - 1 : 0].total_eth;
    const percentageOwed = currentPeriodTotal > 0 ? (100 / (currentPeriodTotal + 1)) / 100 : 1;
    exchangeRate = 100000 * percentageOwed;

    loaded = contributions ? true : false;
  }catch(err){
    console.log(err);
  }
}

async function GetPrice(){
  try {
    const response = await fetch('https://api.coinmarketcap.com/v2/ticker/1027/');
    const jsonResponse = await response.json();
    const { price } = jsonResponse.data.quotes.USD;
    ethPrice = price; 
  } catch (error) {
    console.log(error);
  }
}

async function GetGasPrice(){
  try {
    const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
    const jsonResponse = await response.json();
    const { average } = jsonResponse;
    gasPrice = Number((average / 10).toFixed(2));
  } catch (error) {
      console.log(error);
  }
}

GetGasPrice();
GetPrice();
PullContributions();

//updates every 30 seconds
setInterval(() => {
  PullContributions();
}, 30000);

//updates every 10 mins
setInterval(() => {
  GetGasPrice();
  GetPrice();
}, 600000)
