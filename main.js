const EthereumTx = require('ethereumjs-tx');
const keythereum = require('keythereum');
const WebSocket = require('isomorphic-ws');
const args = require('args-parser')(process.argv);
const DATADIR = process.env.datadir || args.datadir || './'; // '/Users/colin/Projects/tutorial/eth-networks/priv-testnet'
const ADDRESS = process.env.address || args.address || 'af8302a3786a35abeddf19758067adc9a23597e5';
const PASSWORD = process.env.password || args.password || 'password';
const enc_key = keythereum.importFromFile(ADDRESS, DATADIR);
const key = keythereum.recover(PASSWORD, enc_key);

let ws = new WebSocket(process.env.POLYSWARMD_NETWORK ? process.env.POLYSWARMD_NETWORK : args.polyswarmd || 'ws://localhost:31337/transactions');
let tryCount = 0;

run(ws);

function run(ws) {
  ws.onopen = msg => {
    // reset the count if we can't connect
    tryCount = 0;
    console.log('Connected to transactions soccket!');
  };

  ws.onmessage = msg => {
    // Should do verification of parameters / user confirmation?
    console.log('\n');
    console.log(msg.data);
    const {id, data} = JSON.parse(msg.data);
    const {chainId} = data;
    console.log(data);
    const tx = new EthereumTx(data);
    tx.sign(key);
    console.log({'id': id, 'chainId': chainId, 'data': tx.serialize().toString('hex')});

    ws.send(JSON.stringify({'id': id, 'chainId': chainId, 'data': tx.serialize().toString('hex')}));
  };

  ws.onerror = err => {
    console.log(err.message)

    if (tryCount < 1000) {
      console.log(`Attemping to connect...`);

      // try again in 5 seconds
      setTimeout(() => {      
        tryCount++;
        ws = new WebSocket(process.env.POLYSWARMD_NETWORK ? process.env.POLYSWARMD_NETWORK : args.polyswarmd || 'ws://localhost:31337/transactions');
        run(ws)
      }, 5000)
    } else {
      console.log('Couldn\'t connect! Make sure polyswarmd is up!');
    }

  };
}
