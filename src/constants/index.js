export * from './list_tokens_prices'
export { AssetCollateral } from './contracts/AssetCollateralContract';
export { TokenSale } from './contracts/TokenSaleContract';
export const getNodeSmithProvider = key => `https://ethereum.api.nodesmith.io/v1/mainnet/jsonrpc?apiKey=${key}`;
