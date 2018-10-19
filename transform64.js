
const fs = require('fs');
const path = require('path');
const mimeType = require('mime-types');
let baseArray=[]
for(let i=0;i<244; i++){
    let data = fs.readFileSync(path.join(__dirname, './src/public/images/emotions/picture'+i+'.gif'));
    data = new Buffer(data).toString('base64');

    let base64 = 'data:' + mimeType.lookup(path.join(__dirname, './src/public/images/emotions/picture'+i+'.gif')) + ';base64,' + data;
    baseArray.push(base64)
}
console.log(typeof baseArray)
fs.writeFileSync(path.join(__dirname, './src/public/images/emotionsBase64.json'), JSON.stringify(baseArray))




