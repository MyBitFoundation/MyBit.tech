const fetch = require('isomorphic-unfetch');

import {
  LIST_TOKENS_PRICES,
} from '../constants';

export let prices = {};
export let loaded = false;
export let errors = false;

// see https://www.coingecko.com/api
const getPriceOfToken =  async ticker => {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
  const jsonResponse = await response.json();
  const info = jsonResponse["market_data"];
  const price = Number(info['current_price']['usd']);
  const priceChangePercentage = Number(info['price_change_percentage_24h']);
  return {
    price,
    priceChangePercentage,
  };
};

const GetPrices = async () => {
  try {
    const [
      ethereum,
      mybit,
    ] = await Promise.all(LIST_TOKENS_PRICES.map(getPriceOfToken))

    prices = {
      ethereum,
      mybit,
    }

    loaded = true;
    errors = false;
  } catch (error) {
    errors = true;
    setTimeout(GetPrices, 5000);
    console.log(error);
  }
};

GetPrices();

//updates every 10 mins
setInterval(GetPrices, 600000);
