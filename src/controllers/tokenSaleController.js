require('dotenv').config();
const Web3 = require('web3');
import {
  getStartTimestamp,
  getAllContributionsPerDay,
} from '../api/tokenSaleCore';

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`));

export let loaded = false;
export let errors = false;

//Block number at which the contract was deployed
let fromBlockNumber = 6910971;
let contributions = undefined;
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
    const toBlockNumber = await web3.eth.getBlockNumber();
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
    console.log("Getting contributions from block number: ", fromBlockNumber + " to block number: ", toBlockNumber)
    contributions = await getAllContributionsPerDay(web3, currentDay, timestampStartTokenSale * 1000, fromBlockNumber, toBlockNumber, contributions);

    currentPeriodTotal = contributions[currentDay ? currentDay - 1 : 0].total_eth;
    console.log(`Current period total: ${currentPeriodTotal} ETH`)
    const percentageOwed = currentPeriodTotal > 0 ? (100 / (currentPeriodTotal + 1)) / 100 : 1;
    exchangeRate = 100000 * percentageOwed;
    console.log('Exchange rate: ', exchangeRate);

    loaded = contributions ? true : false;
    errors = false;
    //So that we don't have to keep fetching data we already have
    fromBlockNumber = toBlockNumber + 1;
    console.log(`${new Date().toString()} - Finished pulling contributions from web3`)
  }catch(err){
    errors = true;
    console.log(`${new Date().toString()} - Error pulling contributions from web3: \n\n${err}`);
  }
}

PullContributions();

//updates every 5 minutes (every ~30 blocks)
setInterval(PullContributions, 300000);
