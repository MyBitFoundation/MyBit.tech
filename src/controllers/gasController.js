const fetch = require('isomorphic-unfetch');

export let gasData;
export let loaded = false;
export let errors = false;

// see https://docs.ethgasstation.info/
const getGasPrice =  async ticker => {
  try{
    const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
    gasData = await response.json();
    loaded = true;
    errors = false;
  } catch(err){
    errors = true;
  }
};

getGasPrice();

//updates every 10 mins
setInterval(getGasPrice, 600000);
