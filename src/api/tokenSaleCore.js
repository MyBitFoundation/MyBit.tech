import {
  TokenSale,
} from '../constants';

const dayjs = require('dayjs');

export const getStartTimestamp = async (web3) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tokenSaleContract = new web3.eth.Contract(
        TokenSale.ABI,
        TokenSale.ADDRESS,
      );

      const start = await tokenSaleContract.methods
        .start()
        .call();

      resolve(Number(start));
    } catch (err) {
      console.log(err)
      resolve(false);
    }
  });
}

export const getAllContributionsPerDay = (web3, currentDay, timestampStartTokenSale, fromBlockNumber, toBlockNumer, contributions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tokenSaleContract = new web3.eth.Contract(
        TokenSale.ABI,
        TokenSale.ADDRESS,
      );

      let logContributions = await tokenSaleContract.getPastEvents(
        'LogTokensPurchased',
        { fromBlock: fromBlockNumber, toBlock: toBlockNumer },
      );

      contributions = processContributions(web3, logContributions, currentDay, timestampStartTokenSale, contributions);
      contributions = createDataForInactiveDays(contributions, currentDay, timestampStartTokenSale);

      resolve(contributions);
    } catch (err) {
      console.log(err)
      resolve(false);
    }
  })
}

const createDataForInactiveDays = async (contributions, currentDay, timestampStartTokenSale) => {
  contributions = contributions.map((contribution, index) => {
    if(contribution) {
      return contribution;
    }

    getDateForPeriod(index, timestampStartTokenSale)

    const date = getDateForPeriod(index, timestampStartTokenSale);

    return {
      key: index,
      period: index + 1,
      total_eth: 0,
      myb_received: 0,
      your_contribution: 0,
      closed: currentDay ? index + 1 < currentDay : false,
      phaseActive: currentDay ? index + 1 === currentDay : false,
      owed: 0,
      date,
    };
  })

  return contributions;
}

const getDateForPeriod = (day, timestampStartTokenSale) => {
  return(dayjs(timestampStartTokenSale).add(day + 1, 'day').format('MMM, DD YYYY'))
}

const processContributions = (web3, log, currentDay, timestampStartTokenSale, contributions) => {
  contributions = !contributions ? Array(365).fill() : contributions;
  for (const contribution of log) {
    const contributor = contribution.returnValues._contributor;
    const contributed = Number(web3.utils.fromWei(contribution.returnValues._amount.toString(), 'ether'))
    const day = Number(contribution.returnValues._day);
    if(day >= 0 && day < 365){
      // check if day has been initialized
      if (contributions[day]) {
        const thisDay = contributions[day];
        thisDay.total_eth = thisDay.total_eth + contributed;
        thisDay.owned = 0;
        thisDay.your_contribution = 0;
        thisDay.myb_received = 0;
      } else {
          const date = getDateForPeriod(day, timestampStartTokenSale);

          contributions[day] = {
            key: day,
            period: day + 1,
            total_eth: contributed,
            myb_received: 0,
            your_contribution: 0,
            closed: currentDay ? day + 1 < currentDay : false,
            phaseActive: currentDay ? day + 1 === currentDay : false,
            date,
            owed: 0,
          };
        };
    }
  }
  return contributions;
}
