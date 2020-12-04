const deploy = require('./app/modules/init.js').deployRoot

const k = process.argv[2] || 12500;
const n = process.argv[3] || 65536;
const l = process.argv[4] || 10;
const m = process.argv[5] || 0;
const p = process.argv[6] || 500;


deploy(k, n, l, m, p)
.then(result => {
  console.log(result)
});
