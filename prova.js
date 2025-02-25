const axios = require('axios');

const url = "https://stylish-magical-water.btc-testnet.quiknode.pro/f1445c4cf5b9fe69206db7f8834b12ab0e75436c/";
const headers = {
  "Content-Type": "application/json"
};
//tb1q583p6dyl62ch9rcp8tl9wja0c87suqjhk7fnsy - ha mandato 671a2c8a1517244a4f2b6cece6897a3ed5540614a83bfbbc23fe26d465b3b514
//DEST: tb1q52ktr2677ns7cwjse5ulu9uq3kthffa4ep9074
const data = JSON.stringify({
  "method": "getSignaturesForAddress",
  "params": [
    "CEVHiLySVcAzGyBw8ekUyZ8Jvx25f49b76Q6DyQd9wqi"
  ]
});

const requestOptions = {
  method: 'post',
  url: url,
  headers: headers,
  data: data
};

axios(requestOptions)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
