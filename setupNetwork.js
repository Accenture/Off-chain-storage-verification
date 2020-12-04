const fsHandler = require('./app/utils/fsHandler');
const contracts = require('./app/utils/contracts');
const setID = require('./app/modules/init.js').setID
const spawn = require('child_process').spawn;

const host = process.argv[2] || "10.0.0.21";


fsHandler.readObjectFromJsonFile('./app/constantsData.json')
.then(async object=>{
  let count = 0;
  for(var i=0;i<object.WEB3_CONFS.length; i++){
    const identityContract = contracts.getContract('Identity');
    let participant = object.WEB3_CONFS[i];
    let role = participant.HOST_APP_LINUX.replace(/\d+/g, '');
    let endpoint = host + ":" + participant.CONTAINER_PORT;
    let address = participant.ETH_KEY;
    let res = await setID(endpoint, address, role)
    console.log(res);
    count++;
    if (count == object.WEB3_CONFS.length){
      count=0;
      //Deployer le docker
      const docker = spawn('docker-compose',['-f', 'docker-compose.json', 'up'])

      docker.on('error', err => {
        console.log(err);
      });
      docker.stdout.on('data', chunk => {
        console.log(chunk.toString());
      });

      docker.stderr.on('data', chunk => {
        console.log(chunk.toString());
      });

      docker.on('close', () => {
        console.log("Closed");

      });
    }
  }
})
