const axios = require("axios");

const apiUrl = "https://api.cheems.pet/api/claim";
const walletAddress = "0x63DA7BBf9d2AB539d61FD4e5D49B2DB05e713F43";

async function makeRequest() {
  try {

const apiUrl = "https://api.cheems.pet/api/claim";
const walletAddress = "0x63DA7BBf9d2AB539d61FD4e5D49B2DB05e713F43";
    const response = await axios({
      method: "POST",
      url: apiUrl,
      headers: {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        addr: walletAddress,
      },
      referrer: "https://cheems.pet/",
      referrerPolicy: "strict-origin-when-cross-origin",
    });

    if (response.data.data === null) {
      // 如果 data 返回为 null，则输出 "has claimed"
      console.log("has claimed");
    } else {
      // 如果 data 返回有值，则分别输出 signature 和 timestamp
      let signature = response.data.data.signature;
      let timestamp = response.data.data.timestamp;
      console.log("signature:", signature);
      console.log("timestamp:", timestamp);
    }
  } catch (error) {
    console.error("Error in making request:", error);
  }
}

makeRequest();
