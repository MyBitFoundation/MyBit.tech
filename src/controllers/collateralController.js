require('dotenv').config();
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
import {
  AssetCollateral,
  GAS_PRICE,
} from '../constants';

const ADDRESS = process.env.ADDRESS;
const ADDRESS_PRIVATE_KEY = Buffer.from(process.env.ADDRESS_PRIVATE_KEY, 'hex');

const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`));

export const lockEscrow = async (assetId, assetManager, escrow) => {
  return new Promise(async (resolve, reject) => {
    try{
      const txnCount = await web3.eth.getTransactionCount(ADDRESS);

      const assetCollateral = new web3.eth.Contract(
        AssetCollateral.ABI,
        AssetCollateral.ADDRESS
      );

      const data = await assetCollateral.methods.lockEscrow(assetId, assetManager, escrow).encodeABI();
      const rawTx = {
        nonce: web3.utils.toHex(txnCount),
        gasPrice: GAS_PRICE,
        gasLimit: web3.utils.toHex(140000),
        to: AssetCollateral.ADDRESS,
        data: data,
      }

      const tx = new Tx(rawTx)
      tx.sign(ADDRESS_PRIVATE_KEY)
      let serializedTx = "0x" + tx.serialize().toString('hex');
      web3.eth.sendSignedTransaction(serializedTx)
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
