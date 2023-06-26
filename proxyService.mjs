import express from 'express';
import axios from 'axios';
import https from 'https';

const app = express();
const port = 3030;

app.use(express.json());

app.use(async (req, res) => {
  const targetUrl = 'https://zksync-era.rpc.thirdweb.com/'; // Replace this with the target URL
  //https://zksync2-mainnet.zksync.io
  //https://zksync-era.rpc.thirdweb.com/
  req.headers.host = new URL(targetUrl).host;
  console.log(`Proxying request to ${targetUrl}${req.url}`);
  console.log(req.body);
  const agent = new https.Agent({  
    rejectUnauthorized: false
  });
  try {
    const response = await axios({
      method: req.method,
      httpsAgent: agent,
      proxy: {
        host: 'proxy.scrapingbee.com',
        port: 8887,
        auth: {username: 'VJYRIGU1L9Z8F1UBSV8R5WJOLEA7O86ZQ7ONOLZ643I0DTI8J7OCMGGTMUHSTDPCJCHHYM2SNS440OI9', password: 'render_js=False&premium_proxy=True'}
    },
      url: `${targetUrl}${req.url}`,
      headers: { 
        'Content-Type': 'application/json', 
      },
      data: JSON.stringify(req.body),
    });
    console.log(response.headers);
    console.log(response.data);
    res.status(response.status).set(response.headers).send(response.data);
  } catch (error ) {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).set(error.response.headers).send(error.response.data);
    } else {
      res.status(500).send('An error occurred while processing the request.');
    }
  }
});

app.listen(port, () => {
  console.log(`Reverse proxy listening at https://localhost:${port}`);
});