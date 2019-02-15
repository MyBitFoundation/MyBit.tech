require('dotenv').config();
const Web3 = require('web3');
import {
  getStartTimestamp,
  getAllContributionsPerDay,
} from '../api/tokenSaleCore';

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`));

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
    timestampStartTokenSale = await getStartTimestamp(web3);
    started = timestampStartTokenSale <= Math.floor(Date.now() / 1000);
    if(started){
      currentDay = Math.floor(((Math.floor(Date.now() / 1000) - timestampStartTokenSale) / 86400) + 1);

    } else {
      setTimeout(PullContributions, timestampStartTokenSale * 1000 - Date.now());
    }
    contributions = await getAllContributionsPerDay(web3, currentDay, timestampStartTokenSale * 1000);

    currentPeriodTotal = contributions[currentDay ? currentDay - 1 : 0].total_eth;
    const percentageOwed = currentPeriodTotal > 0 ? (100 / (currentPeriodTotal + 1)) / 100 : 1;
    exchangeRate = 100000 * percentageOwed;

    loaded = contributions ? true : false;
    errors = false;
  }catch(err){
    errors = true;
    console.log(err);
  }
}

PullContributions();

//updates every 30 seconds
setInterval(() => PullContributions, 30000);
