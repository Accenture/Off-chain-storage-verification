const request = require('request');
const fs = require('fs');

const port = process.argv[2] || "3018";
const host = process.argv[3] || "10.0.0.21";
let path = process.argv[4]
if (!path){
  path = 'app/modules/libpdp/data/testfile.txt'
  fs.appendFileSync(path, Buffer.allocUnsafe(53680));
}
request.post({
  url:     'http://'+ host + ':' + port +'/API/StorageFactory/StoreFile',
  form:    {"path": path}
},function(error, response, body){
  if (error){
    console.log(error);
  }
  else{
    console.log(body);
  }
});
