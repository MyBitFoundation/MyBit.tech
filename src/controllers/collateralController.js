require('dotenv').config();
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
import {
  AssetCollateral,
  GAS_PRICE,
} from '../constants';

const ADDRESS = process.env.ADDRESS;
const ADDRESS_PRIVATE_KEY = Buffer.from(process.env.ADDRESS_PRIVATE_KEY, 'hex');

const web3Collateral = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`));

export const lockEscrow = async (assetId, assetManager, escrow) => {
  return new Promise(async (resolve, reject) => {
    try{
      var txnCount = await web3Collateral.eth.getTransactionCount(ADDRESS);

      const assetCollateral = new web3Collateral.eth.Contract(
        AssetCollateral.ABI,
        AssetCollateral.ADDRESS
      );

      var data = await assetCollateral.methods.lockEscrow(assetId, assetManager, escrow).encodeABI();
      let rawTx = {
        nonce: web3Collateral.utils.toHex(txnCount),
        gasPrice: GAS_PRICE,
        gasLimit: web3Collateral.utils.toHex(140000),
        to: AssetCollateral.ADDRESS,
        data: data,
      }

      const tx = new Tx(rawTx)
      tx.sign(ADDRESS_PRIVATE_KEY)
      let serializedTx = "0x" + tx.serialize().toString('hex');
      web3Collateral.eth.sendSignedTransaction(serializedTx)
      .on('receipt', function (receipt) {
        resolve(200)
      }).on('error', function (error) {
        console.log(error)
        resolve(500)
      });
    }catch(err){
      console.log(err)
      resolve(500);
    }
  })
}
