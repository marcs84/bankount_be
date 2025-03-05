const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const runApp = async () => {
  await Moralis.start({
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijg5MTI3MmM2LWYyYmUtNDEyZS04MjQxLWVhMWYyOTAzN2ZmOSIsIm9yZ0lkIjoiNDEzNzE2IiwidXNlcklkIjoiNDI1MTY3IiwidHlwZUlkIjoiNTJiMDU5ZjItNzc0My00YmMxLTljNWUtYjgxNTE0ODllZjI5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzAxMzcyNTIsImV4cCI6NDg4NTg5NzI1Mn0._t-STzHSTKabt0HPyXpmlLrf_y7iUEF1pVQx266G-Lw",
    // ...and any other configuration
  });

  const address = "0x613c1514c175c1e7fd2222bf577c8ae221db6753";

  const chain = EvmChain.ETHEREUM;

  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain,
  });

  console.log(response.toJSON());
};

runApp();


