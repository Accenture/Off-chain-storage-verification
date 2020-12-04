const fs = require('fs');
const Web3 = require('web3');
const fsHandler = require('./app/utils/fsHandler');

const env = process.argv[2] || "test"
const linux_host = process.argv[3] || "10.0.0.133";
const nbSN = process.argv[4] || 100;
const nbTD = process.argv[5] || 1;
const nbValid = process.argv[6] || 2;
const nbOfQuorumNodes = process.argv[7] || 7;


var cstStruct= {"WEB3_CONFS": []};
var ymlStruct= {"version": "3.2", "services": {}}
let counter = 1;
let count1 = 0;
let count2 = 0;
fsHandler.saveObjectToJsonFile('./app/constantsData.json', cstStruct)
.then(() => {
  fsHandler.saveObjectToJsonFile('./docker-compose.json', ymlStruct)
  .then(async ()=>{
    let options = `http://${linux_host}:${22100}`;
    console.log(options);
    let web3 = new Web3(new Web3.providers.HttpProvider(options));
    let ethAdds = await web3.eth.personal.newAccount('');
    console.log(ethAdds);
    await web3.eth.personal.unlockAccount(ethAdds,'',0)
    let roles = "Oracle";
    fsHandler.readObjectFromJsonFile('./app/constantsData.json')
    .then(object =>{
      let container_Port=3000;
      let temp = object;
      let consData_elmnt= {"HOST_LINUX":linux_host,"PORT":22105,"HOST_APP_LINUX": roles,"ETH_KEY": ethAdds,"CONTAINER_PORT": container_Port};
      temp["WEB3_CONFS"].push(consData_elmnt);
      fsHandler.saveObjectToJsonFile('./app/constantsData.json', temp)
      .then(async () => {
        console.log("Done creating the oracle");
        fsHandler.readObjectFromJsonFile('./docker-compose.json')
        .then(object =>{
          let containerPort=3000
          let temp = object;
          let newService= {
            "container_name": roles,
            "image": "node:8-jessie",
            "working_dir": "/home/node/app",
            "environment": [
              "NODE_ENV=" + env,
              "NODE=0"
            ],
            "volumes": [
              {
                "type": "bind",
                "source": "./",
                "target": "/home/node/app"
              },
              "/home/node/app/node_modules/",
              "/home/node/app/app/modules/libpdp/storage/",
              "/home/node/app/app/modules/libpdp/validation/"
            ],
            "ports": [
              containerPort+":3000"
            ],
            "command": "bash -c \"git config --global url.https://github.com/.insteadOf git://github.com/ &&\n         npm install &&\n         cp modified_web3_formatters.js node_modules/web3-core-helpers/src/formatters.js &&\n         npm start\"\n"
          };
          temp["services"][roles] = newService;
          fsHandler.saveObjectToJsonFile('./docker-compose.json', temp)
          .then(data => {
            console.log("Done");
          })
        })
        for(var i=0;i<nbSN;i++){
          let port;
          let port_ws;
          if (counter < nbOfQuorumNodes){
            port = 22000 + counter*100;
            port_ws = 22005 + counter*100;
            counter++;
          }
          else{
            counter = 1
            port = 22000 + counter*100;
            port_ws = 22005 + counter*100;
            counter++;
          }
          console.log(port);
          try{
            let option = `http://${linux_host}:${port}`;
            let web3 = new Web3(new Web3.providers.HttpProvider(option));
            let ethAdd = await web3.eth.personal.newAccount('');
            console.log(ethAdd);
            await web3.eth.personal.unlockAccount(ethAdd,'',0)
            //Gen the JSON to be added to the constantData
            let role="StorageNode" + (i+1);
            fsHandler.readObjectFromJsonFile('./app/constantsData.json')
            .then(object =>{
              count2++;
              let container_Port=3000+count2
              let temp = object;
              let consData_elmnt= {"HOST_LINUX":linux_host,"PORT":port_ws,"HOST_APP_LINUX": role,"ETH_KEY": ethAdd,"CONTAINER_PORT": container_Port};
              temp["WEB3_CONFS"].push(consData_elmnt);
              fsHandler.saveObjectToJsonFile('./app/constantsData.json', temp)
              .then(data => {
                console.log("Done");
              })
            })
            fsHandler.readObjectFromJsonFile('./docker-compose.json')
            .then(object =>{
              count1++;
              let containerPort=3000+count1
              let temp = object;
              let newService= {
                "container_name": role,
                "image": "node:8-jessie",
                "working_dir": "/home/node/app",
                "environment": [
                  "NODE_ENV=" + env,
                  "NODE=" + count1
                ],
                "volumes": [
                  {
                    "type": "bind",
                    "source": "./",
                    "target": "/home/node/app"
                  },
                  "/home/node/app/node_modules/",
                  "/home/node/app/app/modules/libpdp/storage/",
                  "/home/node/app/app/modules/libpdp/validation/"
                ],
                "ports": [
                  containerPort+":3000"
                ],
                "command": "bash -c \"git config --global url.https://github.com/.insteadOf git://github.com/ &&\n         npm install &&\n         cp modified_web3_formatters.js node_modules/web3-core-helpers/src/formatters.js &&\n         npm start\"\n"
              };
              temp["services"][role] = newService;
              fsHandler.saveObjectToJsonFile('./docker-compose.json', temp)
              .then(data => {
                console.log("Done");
              })
            })
          }
          catch(error){
            console.log(error);
          }
        }
        counter = 1;
        for(var i=0;i<nbValid;i++){
          //handle eth address generation
          let port;
          let port_ws;
          if (counter < nbOfQuorumNodes){
            port = 22000 + counter*100;
            port_ws = 22005 + counter*100;
            counter++;
          }
          else{
            counter = 1
            port = 22000 + counter*100;
            port_ws = 22005 + counter*100;
            counter++;
          }
          console.log(port);
          try{
            let option = `http://${linux_host}:${port}`;
            let web3 = new Web3(new Web3.providers.HttpProvider(option));
            let ethAdd = await web3.eth.personal.newAccount('');
            console.log(ethAdd);
            await web3.eth.personal.unlockAccount(ethAdd,'',0)
            //Gen the JSON to be added to the constantData
            let role="Validator" + (i+1);
            fsHandler.readObjectFromJsonFile('./app/constantsData.json')
            .then(object =>{
              count2++;
              let container_Port=3000+count2
              let temp = object;
              let consData_elmnt= {"HOST_LINUX":linux_host,"PORT":port_ws,"HOST_APP_LINUX": role,"ETH_KEY": ethAdd, "CONTAINER_PORT": container_Port};
              temp["WEB3_CONFS"].push(consData_elmnt);
              fsHandler.saveObjectToJsonFile('./app/constantsData.json', temp)
              .then(data => {
                console.log("Done");
              })
            })
            fsHandler.readObjectFromJsonFile('./docker-compose.json')
            .then(object =>{
              count1++;
              let containerPort=3000+count1
              let temp = object;
              let newService= {
                "container_name": role,
                "image": "node:8-jessie",
                "working_dir": "/home/node/app",
                "environment": [
                  "NODE_ENV=" + env,
                  "NODE=" + count1
                ],
                "volumes": [
                  {
                    "type": "bind",
                    "source": "./",
                    "target": "/home/node/app"
                  },
                  "/home/node/app/node_modules/",
                  "/home/node/app/app/modules/libpdp/storage/",
                  "/home/node/app/app/modules/libpdp/validation/"
                ],
                "ports": [
                  containerPort+":3000"
                ],
                "command": "bash -c \"git config --global url.https://github.com/.insteadOf git://github.com/ &&\n         npm install &&\n         cp modified_web3_formatters.js node_modules/web3-core-helpers/src/formatters.js &&\n         npm start\"\n"
              };
              temp["services"][role] = newService;
              fsHandler.saveObjectToJsonFile('./docker-compose.json', temp)
              .then(data => {
                console.log("Done");
              })
            })
          }
          catch(error){
            console.log(error);
          }
        }
        counter = 1;
        for(var i=0;i<nbTD;i++){
          //handle eth address generation
          let port;
          let port_ws;
          if (counter < nbOfQuorumNodes){
            port = 22000 + counter*100;
            port_ws = 22005 + counter*100;
            counter++;
          }
          else{
            counter = 1
            port = 22000 + counter*100;
            port_ws = 22005 + counter*100;
            counter++;
          }
          console.log(port);
          try{
            let option = `http://${linux_host}:${port}`;
            let web3 = new Web3(new Web3.providers.HttpProvider(option));
            let ethAdd = await web3.eth.personal.newAccount('');
            console.log(ethAdd);
            await web3.eth.personal.unlockAccount(ethAdd,'',0)
            //Gen the JSON to be added to the constantData
            let role="TrustedDealer" +(i+1);
            fsHandler.readObjectFromJsonFile('./app/constantsData.json')
            .then(object =>{
              count2++;
              let container_Port=3000+count2
              let temp = object;
              let consData_elmnt= {"HOST_LINUX":linux_host,"PORT":port_ws,"HOST_APP_LINUX": role,"ETH_KEY": ethAdd, "CONTAINER_PORT": container_Port};
              temp["WEB3_CONFS"].push(consData_elmnt);
              fsHandler.saveObjectToJsonFile('./app/constantsData.json', temp)
              .then(data => {
                console.log("Done");
              })
            })
            fsHandler.readObjectFromJsonFile('./docker-compose.json')
            .then(object =>{
              count1++;
              let temp = object;
              let containerPort=3000+count1
              let newService= {
                "container_name": role,
                "image": "node:8-jessie",
                "working_dir": "/home/node/app",
                "environment": [
                  "NODE_ENV=" + env,
                  "NODE=" + count1
                ],
                "volumes": [
                  {
                    "type": "bind",
                    "source": "./",
                    "target": "/home/node/app"
                  },
                  "/home/node/app/node_modules/",
                  "/home/node/app/app/modules/libpdp/storage/",
                  "/home/node/app/app/modules/libpdp/validation/"
                ],
                "ports": [
                  containerPort+":3000"
                ],
                "command": "bash -c \"git config --global url.https://github.com/.insteadOf git://github.com/ &&\n         npm install &&\n         cp modified_web3_formatters.js node_modules/web3-core-helpers/src/formatters.js &&\n         npm start\"\n"
              };
              temp["services"][role] = newService;
              fsHandler.saveObjectToJsonFile('./docker-compose.json', temp)
              .then(data => {
                console.log("Done");
              })
            })
          }
          catch(error){
            console.log(error);
          }
        }
      })
    })
  })
})
