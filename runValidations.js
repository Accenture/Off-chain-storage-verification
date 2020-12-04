const request = require('request');

const host = process.argv[2] || "10.0.0.21";
const timeout = process.argv[3] || 300000

function initValidation(){
  var seed = Math.random().toString(36).substring(2,15);
  request.post({
    url:     'http://'+ host +':3000/API/ValidationFactory/Init',
    form:    {"seed": seed}
  },function(error, response, body){
    if (error){
      console.log(error);
    }
    else{
      console.log(body);
    }
  });
}
initValidation();
//Validation loop
requestLoop = setInterval(function(){
  initValidation()
}, timeout);
