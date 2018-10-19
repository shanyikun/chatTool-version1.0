let express=require('express')
let app=express()
let bodyParser=require('body-parser')
let fs=require('fs')
let multer=require('multer')
let path=require('path')
let n=0

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, './src/public/images/emotions'))
    },
    filename: function(req, file, cb) {
        cb(null, 'picture'+n+'.gif')   //以用户名作为头像图片的名字，且会替换掉同名的图片
        n++
    }
})
var upload = multer({ storage: storage })

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/test', upload.array('userHeadPortrait', 300), function(request, response){
    response.send('success')
})
app.get('/', function(request, response){
    fs.readFile('./getPicture.html', function(err, data){
        response.send(data.toString())
    })
})
app.get('/jquery.min.js', function(request, response){
    fs.readFile('./jquery.min.js', function(err, data){
        response.send(data.toString())
    })
})
app.listen(8888, function(){
    console.log('server is running')
})