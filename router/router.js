var express = require('express')
var router = express.Router()
var users=require('../database/user-db')
var fs=require('fs')
var multer=require('multer')    //上传图片接收模块
var path=require('path')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../src/public/images'))
    },
    filename: function(req, file, cb) {
        cb(null, req.session.user.name+'.jpg')   //以用户名作为头像图片的名字，且会替换掉同名的图片
    }
})
var upload = multer({ storage: storage })

router.get('/',function(request, response){
    return response.render('login.html')
})

router.get('/chat',function(request,response){
    if(request.session.user){
        return response.render('chat.html',{
            user: request.session.user
        })
    }
    else{
        return response.redirect('/')
    }
})

router.get('/register',function(request, response){
    return response.render('register.html')
})

router.post('/register',function(request, response){
    users.findOne({
        $or: [
            {
                name: request.body.name
            },
            {
                email: request.body.email
            }
        ]
    },function(err,data){
        if(err){
            return response.json({
                err_code: 500,
                message: 'find server error'
            })
        }
        else if(data){
            return response.json({
                err_code: 1,
                message: 'user name or email already exists'
            })
        }
        else {
            let userInfoObject=Object.assign(request.body, {url: '/src/public/images/default.jpg'})  //添加默认头像图片
            new users(userInfoObject).save(function(err,data){
                if(err){
                    return response.json({
                        err_code: 500,
                        message: 'save server error'
                    })
                }
                else {
                    fs.mkdir(path.join(__dirname, '../src/public/userFile/'+data.name), function(err){  // 创建用户文件夹，用于存放用户相关信息
                        if(err){
                            return response.json({
                                err_code: 500,
                                message: 'mkdir error'
                            })
                        }
                        else {
                            request.session.user=data
                            return response.json({
                                err_code: 0,
                                message: request.session.user.name   //返回用户名信息以用于重定向进入chat页面时向服务端发送用户信息
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get('/login', function(request, response){
    response.render('login.html')
})

router.post('/login',function(request,response){
    users.findOne({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password
    },function(err,data){
        if(err){
            response.json({
                err_code: 500,
                message: 'server error'
            })
        }
        else if(!data){
            response.json({
                err_code: 1,
                message: 'name or password is wrong'
            })
        }
        else {
            request.session.user=data
            response.json({
                err_code: 0,
                message: 'login success'
            })
        }
    })
})

router.get('/getFriendsList', function(request, response){    //获取用户列表
    users.find(function(err,data){
        if(err){
            return response.json({
                err_code: 500,
                message: 'server error'
            })
        }
        else {
            return response.json({
                err_code: 0,
                message: data
            })
        }
    })
})

router.get('/getUserInformation', function(request, response){   //通过$http.get在生命周期钩子中获取用户信息
    return response.json({
        message: request.session.user
    })
})

router.get('/logout', function(request,response){
    delete request.session.user
    return response.redirect('/chat')
})

router.post('/updateUserHeadPortrait', upload.array('userHeadPortrait', 40), function(request, response){
    let files=request.files        //更新数据库中用户的url
    users.update({name: request.body.name}, {url: '/src/public/images/'+request.body.name+'.jpg'},function(err, result){
        if(err){
            return response.send('upload fail!')
        }
        else {
            if(files[0]){
                return response.send('upload success!')
            }
            else {
                return response.send('upload fail!')
            }
        }
    })
})

router.get('/getEmotionsList', function(request, response){   // 表情包base64格式列表请求
    fs.readFile(path.join(__dirname, '../src/public/images/emotionsBase64.json'), function(err, data){
        if(err){
            return response.json({
                err_code: 500,
                message: 'server eooro'
            })
        }
        else {
            let emotionsList=JSON.parse(data.toString())
            return response.json({
                err_code: 0,
                message: emotionsList
            })
        }
    })
})


/*io.on('connection',function(socket){
    socket.on('name',function(name){
        console.log(name+'connected')
        socket.on('chat message',function(msg){
            console.log(msg)
            io.emit('chat message',{name: name, message: msg})
        })
    })
})*/

router.get('/bundle.js', function(request, response){
    fs.readFile('./dist/bundle.js', function(err, data){
        if(err){
            return response.send('server error')
        }
        else {
            response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
            return response.send(data.toString())
        }
    })
})

router.get('/index' ,function(request, response){
    fs.readFile('./dist/index.html', function(err, data){
        if(err){
            return response.send('server error')
        }
        else {
            return response.send(data.toString())
        }
    })
})

module.exports=router
