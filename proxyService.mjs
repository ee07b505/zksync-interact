import express from 'express';
import axios from 'axios';
import https from 'https';
import cluster from 'cluster';
import fs from 'fs';
const proxies = fs.readFileSync('proxies.txt', 'utf-8').split('\n').filter(Boolean);

if (cluster.isPrimary) {
  let cpus=3

  for (let i = 0; i < cpus; i++) {
      cluster.fork()// 根据cpu个数fork子进程
  }
  cluster.on('exit', function(worker, code, signal) {
      //监听哪个worker挂掉了？
      console.log('worker ' + worker.process.pid + ' died');
      cluster.fork();//新建一个worker
});
}
else if (cluster.isWorker) {

  /**
   * Create HTTP server.
   */

  const server = express();
  const port = 3030;
  /**
   * Listen on provided port, on all network interfaces.
   */

  server.use(express.json());

  server.use(async (req, res) => {
    const targetUrl = 'https://rpc.ankr.com/zksync_era'; // Replace this with the target URL
    //https://zksync2-mainnet.zksync.io
    //https://zksync-era.rpc.thirdweb.com/
    const randomIndex = Math.floor(Math.random() * proxies.length);
    const proxy = proxies[randomIndex];
    const [host, port, username, password] = proxy.split(':');
    req.headers.host = new URL(targetUrl).host;
    console.log(`Proxying request to ${targetUrl}${req.url}`);
    console.log(req.body);
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });
    try {
      const response = await axios({
        method: req.method,
        // httpsAgent: agent,
      //   proxy: {
      //     host: 'proxy.scrapingbee.com',
      //     port: 8887,
      //     auth: {username: 'VJYRIGU1L9Z8F1UBSV8R5WJOLEA7O86ZQ7ONOLZ643I0DTI8J7OCMGGTMUHSTDPCJCHHYM2SNS440OI9', password: 'render_js=False&premium_proxy=True'}
      // },
      proxy: {
        host,
        port,
        auth: {
          username,
          password
        }
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


  server.listen(port, () => {
    console.log(`Reverse proxy listening at https://localhost:${port}`);
  });

}




