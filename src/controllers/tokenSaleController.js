require('dotenv').config();
const Web3 = require('web3');
import {
  getStartTimestamp,
  getAllContributionsPerDay,
} from '../api/tokenSaleCore';

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WEBSOCKET_PROVIDER_MAINNET));

export let loaded = false;
export let errors = false;

let contributions = [];
let timestampStartTokenSale = 0;
let currentDay = undefined;
let started = false;
let currentPeriodTotal = undefined;
let exchangeRate = undefined;

export const getDetails = () => ({
  timestampStartTokenSale,
  contributions,
  loaded,
  currentDay,
  currentPeriodTotal,
  exchangeRate,
})

export const getDetailsForMyBitHomePage = () => ({
  timestampStartTokenSale,
  currentPeriodTotal,
  loaded,
  currentDayServer: currentDay,
  exchangeRate,
})

const PullContributions = async () => {
  try{
    console.log(`\n\n$${new Date().toString()} - Going to pull contributions from web3`)
    timestampStartTokenSale = await getStartTimestamp(web3);
    started = timestampStartTokenSale <= Math.floor(Date.now() / 1000);
    console.log('Token distribution start timestamp: ', timestampStartTokenSale)
    console.log('Token distribution started: ', started)
    if(started){
      currentDay = Math.floor(((Math.floor(Date.now() / 1000) - timestampStartTokenSale) / 86400) + 1);
      console.log("Current day: ", currentDay)
    } else {
      setTimeout(PullContributions, timestampStartTokenSale * 1000 - Date.now());
    }
    contributions = await getAllContributionsPerDay(web3, currentDay, timestampStartTokenSale * 1000);

    currentPeriodTotal = contributions[currentDay ? currentDay - 1 : 0].total_eth;
    console.log(`Current period total: ${currentPeriodTotal} ETH`)
    const percentageOwed = currentPeriodTotal > 0 ? (100 / (currentPeriodTotal + 1)) / 100 : 1;
    exchangeRate = 100000 * percentageOwed;
    console.log('Exchange rate: ', exchangeRate);

    loaded = contributions ? true : false;
    errors = false;
    console.log(`${new Date().toString()} - Finished pulling contributions from web3`)
  }catch(err){
    errors = true;
    console.log(`${new Date().toString()} - Error pulling contributions from web3: \n\n${err}`);
  }
}

PullContributions();

//updates every 30 seconds
setInterval(PullContributions, 30000);
