var express=require('express')
var app=express()
var http=require('http').Server(app)
var io=require('socket.io')(http)
var path=require('path')
var fs=require('fs')
var gm=require('gm')   // 获取图片拼接模块
var router=require('./router/router.js')
var bodyParser=require('body-parser')
var session=require('express-session')
var _=require('underscore')    //js工具包
var userList=['messages']   //用户列表
var hashName=[]      //用户名与socket.id 映射表

app.engine('html',require('express-art-template'))

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/node_modules/',express.static(path.join(__dirname,'node_modules')))
app.use('/src/public/',express.static(path.join(__dirname,'src/public')))

app.set('views', path.join(__dirname, 'src/views'))  //默认渲染目录路径设置

app.use(router)

io.on('connection',function(socket){   /*服务端socket只能在服务器启动时监听连接*/
    console.log('a user connected')

    socket.on('disconnect', function(){    //用户断开连接时删除相关用户列表，并重新渲染
        console.log('a user disconnect')
        let index=userList.findIndex(function(item){  //考虑到服务器重启，假数据需要判断是否存在，若存在数据库中则不用判断
            return item===socket.name
        })
        if(index!==-1){
            userList.splice(index,1)
        }
        io.emit('login',userList)
    })

    socket.on('login',function(data){   //监听用户登陆事件并广播在线用户信息
        if(userList.indexOf(data)===-1){
            userList.push(data)
        }
        hashName[data]=socket.id    //关联ID与用户名
        socket.name=data         //可以不用设置name属性
        io.emit('login',userList)
    })

    socket.on('chat message',function(data){
        if(data.type==='video'){   // 若消息是视频类型
            fs.stat(path.join(__dirname, './src/public/userFile/'+data.name+'/video'), function(err, stats){
                if(err){  // 检测是否有video文件夹，若没有，则创建文件夹
                    fs.mkdir(path.join(__dirname, './src/public/userFile/'+data.name+'/video'), function(err){
                        if(err){
                            console.log('mkdir error')
                        }
                        else {  // 写入视频二进制数据并以视频名字命名此视频文件
                            fs.writeFile(path.join(__dirname, './src/public/userFile/'+data.name+'/video/'+data.messageName), data.message, function(err){
                                if(err){
                                    console.log('write error')
                                }
                                else {
                                    let message='/src/public/userFile/'+data.name+'/video/'+data.messageName
                                    if(data.to==='messages'){     //向所有客户端广播消息信息
                                        io.emit('chat message',{name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, 'messages')
                                    }
                                    else if(data.to.indexOf('***group***')===-1){
                                        var toName=data.to
                                        var fromName=data.name
                                        var toSocket = _.findWhere(io.sockets.sockets, { id: hashName[toName] })   //利用socket.id寻找特定的socket对象
                                        var fromSocket=_.findWhere(io.sockets.sockets, { id: hashName[fromName] })
                                        /*var toSocket = _.findWhere(io.sockets.sockets, { name: toName })   //也可以用自定义的name属性寻找特定的socket对象
                                        var fromSocket=_.findWhere(io.sockets.sockets, { name: fromName })  */
                                        toSocket.emit('chat message', {name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)  //向特定的socket用户推送消息
                                        fromSocket.emit('chat message', {name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)
                                    }
                                    else {  // 如果是群组消息，则向每个在线的群组成员广播消息
                                        let sendSocket
                                        data.groupMembers.forEach((item, index)=>{
                                            sendSocket= _.findWhere(io.sockets.sockets, { id: hashName[item.name] })
                                            if(sendSocket){  // 判断是否在线
                                                sendSocket.emit('chat message', {name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
                else {  // 若已有video文件夹则直接写入视频二进制文件
                    fs.writeFile(path.join(__dirname, './src/public/userFile/'+data.name+'/video/'+data.messageName), data.message, function(err){
                        if(err){
                            console.log('write error')
                        }
                        else {
                            let message='/src/public/userFile/'+data.name+'/video/'+data.messageName
                            if(data.to==='messages'){     //向所有客户端广播消息信息
                                io.emit('chat message',{name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, 'messages')
                            }
                            else if(data.to.indexOf('***group***')===-1) {
                                var toName=data.to
                                var fromName=data.name
                                var toSocket = _.findWhere(io.sockets.sockets, { id: hashName[toName] })   //利用socket.id寻找特定的socket对象
                                var fromSocket=_.findWhere(io.sockets.sockets, { id: hashName[fromName] })
                                /*var toSocket = _.findWhere(io.sockets.sockets, { name: toName })   //也可以用自定义的name属性寻找特定的socket对象
                                var fromSocket=_.findWhere(io.sockets.sockets, { name: fromName })  */
                                toSocket.emit('chat message', {name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)  //向特定的socket用户推送消息
                                fromSocket.emit('chat message', {name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)
                            }
                            else{
                                let sendSocket
                                data.groupMembers.forEach((item)=>{
                                    sendSocket= _.findWhere(io.sockets.sockets, { id: hashName[item.name] })
                                    if(sendSocket){
                                        sendSocket.emit('chat message', {name: data.name, message: message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
        else {  // 若不是视频文件
            if(data.to==='messages'){     //向所有客户端广播消息信息
                io.emit('chat message',{name: data.name, message: data.message, timeStamp: data.timeStamp, url: data.url, type: data.type}, 'messages')
            }
            else if(data.to.indexOf('***group***')===-1){
                var toName=data.to
                var fromName=data.name
                var toSocket = _.findWhere(io.sockets.sockets, { id: hashName[toName] })   //利用socket.id寻找特定的socket对象
                var fromSocket=_.findWhere(io.sockets.sockets, { id: hashName[fromName] })
                /*var toSocket = _.findWhere(io.sockets.sockets, { name: toName })   //也可以用自定义的name属性寻找特定的socket对象
                var fromSocket=_.findWhere(io.sockets.sockets, { name: fromName })  */
                toSocket.emit('chat message', {name: data.name, message: data.message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)  //向特定的socket用户推送消息
                fromSocket.emit('chat message', {name: data.name, message: data.message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)
            }
            else {
                let sendSocket
                data.groupMembers.forEach((item)=>{
                    sendSocket= _.findWhere(io.sockets.sockets, { id: hashName[item.name] })
                    if(sendSocket){
                        sendSocket.emit('chat message', {name: data.name, message: data.message, timeStamp: data.timeStamp, url: data.url, type: data.type}, data.to)
                    }
                })
            }
        }
    })

    socket.on('addFriendRequest', function(selfData, otherData){    // 监听添加好友请求， 包括请求者的信息，发起者的信息
        let requestListData, acceptListData, requestFriendsList, acceptFriendsList, isRequestExist, isAcceptExist
        // 同步读取并重新写入请求列表信息， 发起者文件夹
        requestListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/requestFriendsList.json'))
        requestFriendsList=JSON.parse(requestListData.toString())
        isRequestExist=requestFriendsList.findIndex((item)=>{  // 判断请求是否已存在，可能是暂未通过的重复请求，也可能是删除后重新添加
            return item.name===otherData.name
        })
        if(isRequestExist===-1){   // 若不存在，则加入
            requestFriendsList.push({name: otherData.name, url: otherData.url, isAccept: false})
        }
        else {    // 若存在则替换
            requestFriendsList.splice(isRequestExist, 1, {name: otherData.name, url: otherData.url, isAccept: false})
        }
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/requestFriendsList.json'), JSON.stringify(requestFriendsList))
        // 同步读取并重新写入接受列表信息， 被请求者文件夹
        acceptListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/acceptFriendsList.json'))
        acceptFriendsList=JSON.parse(acceptListData.toString())
        isAcceptExist=acceptFriendsList.findIndex((item)=>{   // 判断请求是否已存在，可能是暂未通过的重复请求，也可能是删除后重新添加
            return item.name===selfData.name
        })
        if(isAcceptExist===-1){     // 若不存在，则加入
            acceptFriendsList.push({name: selfData.name, url: selfData.url, isAccept: false})
        }
        else {   // 若存在则替换
            acceptFriendsList.splice(isAcceptExist, 1, {name: selfData.name, url: selfData.url, isAccept: false})
        }
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/acceptFriendsList.json'),JSON.stringify(acceptFriendsList))
       // 向发起者和被请求者广播请求事件，以用于更新请求列表
        let selfSocket = _.findWhere(io.sockets.sockets, { id: hashName[selfData.name] })   //利用socket.id寻找特定的socket对象
        let otherSocket=_.findWhere(io.sockets.sockets, { id: hashName[otherData.name] })
        selfSocket.emit('addFriendRequest')
        if(otherSocket){
            otherSocket.emit('addFriendRequest')
        }

        /*fs.readFile(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/requestFriendsList.json'), function(err, data){
            if(err){
                console.log('read error')
            }
            else {
                let requestFriendsList=[]
                requestFriendsList=JSON.parse(data.toString())
                requestFriendsList.push({name: otherData.name, url: otherData.url, isAccept: false})
                fs.writeFile(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/requestFriendsList.json'),JSON.stringify(requestFriendsList), function(err){
                    if(err){
                        console.log('write error')
                    }
                    else {
                    }
                })
            }
        })
        fs.readFile(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/acceptFriendsList.json'),function(err, data){
            if(err){
                console.log('read error')
            }
            else {
                let acceptFriendsList=[]
                acceptFriendsList=JSON.parse(data.toString())
                acceptFriendsList.push({name: selfData.name, url: selfData.url, isAccept: false})
                fs.writeFile(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/acceptFriendsList.json'), JSON.stringify(acceptFriendsList), function(err){
                    if(err){
                        console.log('write error')
                    }
                    else {
                        let selfSocket = _.findWhere(io.sockets.sockets, { id: hashName[selfData.name] })   //利用socket.id寻找特定的socket对象
                        let otherSocket=_.findWhere(io.sockets.sockets, { id: hashName[otherData.name] })
                        selfSocket.emit('addFriendRequest')
                        if(otherSocket){
                            otherSocket.emit('addFriendRequest')
                        }
                    }
                })
            }
        })*/   // 异步方式
    })

    socket.on('acceptFriendRequest', function(selfData, otherData){   // 监听接受好友请求， 包括请求者的信息，发起者的信息
        let ableFriendsListData, ableFriendsList   // 同步读取并重新写入已添加好友列表， 接受者文件夹
        ableFriendsListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/ableFriendsList.json'))
        ableFriendsList=JSON.parse(ableFriendsListData.toString())
        ableFriendsList.push(otherData.name)
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/ableFriendsList.json'), JSON.stringify(ableFriendsList))
        // 同步读取并重新写入接受好友列表， 接受者文件夹
        let acceptFriendsListData, acceptFriendsList, index
        acceptFriendsListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/acceptFriendsList.json'))
        acceptFriendsList=JSON.parse(acceptFriendsListData.toString())
        index=acceptFriendsList.findIndex(function(item){
            return item.name===otherData.name
        })
        acceptFriendsList.splice(index, 1, {name: otherData.name, url: otherData.url, isAccept: true})
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/acceptFriendsList.json'), JSON.stringify(acceptFriendsList))
        // 同步读取并重新写入已添加好友列表， 请求者文件夹
        ableFriendsListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/ableFriendsList.json'))
        ableFriendsList=JSON.parse(ableFriendsListData.toString())
        ableFriendsList.push(selfData.name)
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/ableFriendsList.json'), JSON.stringify(ableFriendsList))
        // 同步读取并重新写入请求好友列表， 接受者文件夹
        let requestFriendsListData, requestFriendsList
        requestFriendsListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/requestFriendsList.json'))
        requestFriendsList=JSON.parse(requestFriendsListData.toString())
        index=requestFriendsList.findIndex(function(item){
            return item.name===selfData.name
        })
        requestFriendsList.splice(index, 1, {name: selfData.name, url: selfData.url, isAccept: true})
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/requestFriendsList.json'), JSON.stringify(requestFriendsList))
        let selfSocket = _.findWhere(io.sockets.sockets, { id: hashName[selfData.name] })   //利用socket.id寻找特定的socket对象
        let otherSocket=_.findWhere(io.sockets.sockets, { id: hashName[otherData.name] })
        selfSocket.emit('acceptFriendRequest', userList)   // 向请求者和接受者广播接受事件，以更新请求列表
        if(otherSocket){
            otherSocket.emit('acceptFriendRequest', userList)
        }

       /* fs.readFile(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/ableFriendsList.json'), function(err, data){
            if(err){
                console.log('read error')
            }
            else {
                let ableFriendsList=[]
                ableFriendsList=JSON.parse(data.toString())
                ableFriendsList.push(otherData.name)
                fs.writeFile(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/ableFriendsList.json'), JSON.stringify(ableFriendsList), function(err){
                    if(err){
                        console.log('write error')
                    }
                    else {

                    }
                })
            }
        })*/    // 异步方式

        /*fs.readFile(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/acceptFriendsList.json'), function(err, data){
            if(err){
                console.log('read error')
            }
            else {
                let acceptFriendsList=[], index
                acceptFriendsList=JSON.parse(data.toString())
                index=acceptFriendsList.findIndex(function(item){
                    return item.name===otherData.name
                })
                acceptFriendsList.splice(index, 1, {name: otherData.name, url: otherData.url, isAccept: true})
                fs.writeFile(path.join(__dirname, './src/public/userFile/'+selfData.name+'/friendsList/acceptFriendsList.json'), JSON.stringify(acceptFriendsList), function(err){
                    if(err){
                        console.log('write error')
                    }
                    else {

                    }
                })
            }
        })*/

       /* fs.readFile(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/ableFriendsList.json'), function(err, data){
            if(err){
                console.log('read error')
            }
            else {
                let ableFriendsList=[]
                ableFriendsList=JSON.parse(data.toString())
                ableFriendsList.push(selfData.name)
                fs.writeFile(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/ableFriendsList.json'), JSON.stringify(ableFriendsList), function(err){
                    if(err){
                        console.log('write error')
                    }
                    else {

                    }
                })
            }
        })*/

        /*fs.readFile(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/requestFriendsList.json'), function(err, data){
            if(err){
                console.log('read error')
            }
            else {
                let requestFriendsList=[], index
                requestFriendsList=JSON.parse(data.toString())
                index=requestFriendsList.findIndex(function(item){
                    return item.name===selfData.name
                })
                requestFriendsList.splice(index, 1, {name: selfData.name, url: selfData.url, isAccept: true})
                fs.writeFile(path.join(__dirname, './src/public/userFile/'+otherData.name+'/friendsList/requestFriendsList.json'), JSON.stringify(requestFriendsList), function(err){
                    if(err){
                        console.log('write error')
                    }
                    else {
                        let selfSocket = _.findWhere(io.sockets.sockets, { id: hashName[selfData.name] })   //利用socket.id寻找特定的socket对象
                        let otherSocket=_.findWhere(io.sockets.sockets, { id: hashName[otherData.name] })
                        selfSocket.emit('acceptFriendRequest')
                        if(otherSocket){
                            otherSocket.emit('acceptFriendRequest', userList)
                        }
                    }
                })
            }
        })*/
    })

    socket.on('deleteFriend', function(bothNameObject){
        let selfAbleFriendsData, selfAbleFriendsList, selfIndex, otherAbleFriendsData, otherAbleFriendsList, otherIndex
        // 读取并改变删除发起者好友文件
        selfAbleFriendsData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+bothNameObject.selfName+'/friendsList/ableFriendsList.json'))
        selfAbleFriendsList=JSON.parse(selfAbleFriendsData.toString())
        selfIndex=selfAbleFriendsList.findIndex((item)=>{
            return item===bothNameObject.otherName
        })
        selfAbleFriendsList.splice(selfIndex, 1)
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+bothNameObject.selfName+'/friendsList/ableFriendsList.json'), JSON.stringify(selfAbleFriendsList))
        // 读取并改变被删除者好友文件
        otherAbleFriendsData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+bothNameObject.otherName+'/friendsList/ableFriendsList.json'))
        otherAbleFriendsList=JSON.parse(otherAbleFriendsData.toString())
        otherIndex=otherAbleFriendsList.findIndex((item)=>{
            return item===bothNameObject.selfName
        })
        otherAbleFriendsList.splice(otherIndex, 1)
        fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+bothNameObject.otherName+'/friendsList/ableFriendsList.json'), JSON.stringify(otherAbleFriendsList))
        // 向删除发起者以及被删除者广播删除完成事件， 用于更新好友列表以及在线好友列表
        let selfSocket = _.findWhere(io.sockets.sockets, { id: hashName[bothNameObject.selfName] })   //利用socket.id寻找特定的socket对象
        let otherSocket=_.findWhere(io.sockets.sockets, { id: hashName[bothNameObject.otherName] })
        selfSocket.emit('finishDeleteFriend', userList)
        if(otherSocket){
            otherSocket.emit('finishDeleteFriend', userList)
        }
    })

    socket.on('createGroup', function(groupObject){   // 监听创建群组事件
        new Promise((resolve, reject)=>{    // promise对象代替异步回调，创建组合图片的过程是异步的
            let argumentsList=[]
            argumentsList.push(groupObject.numbers)
            if(groupObject.numbers<9){
                groupObject.members.forEach((item)=>{
                    argumentsList.push('./src/public/images/'+item.name+'.jpg')
                })
            }
            else {
                for(let i=0;i<9;i++){
                    argumentsList.push('./src/public/images/'+groupObject.members[i].name+'.jpg')
                }
            }
            argumentsList.push(groupObject.name.slice(0, groupObject.name.length-11)+'.jpg')  // 图片名称中不能含有*
            argumentsList.push(resolve)
            merge.apply(null, argumentsList)   // 此函数中的创建组合图片是异步的，resolve函数在此函数中被调用
        }).then(()=>{
            groupObject.members.forEach(function(item, index){   // 遍历群组中的每一个成员，并在其相应群组列表文件中增加群组信息
                let groupListData, groupList, socket
                groupListData=fs.readFileSync(path.join(__dirname, './src/public/userFile/'+item.name+'/friendsList/groupList.json'))
                groupList=JSON.parse(groupListData.toString())
                groupList.push(groupObject)
                fs.writeFileSync(path.join(__dirname, './src/public/userFile/'+item.name+'/friendsList/groupList.json'), JSON.stringify(groupList))
                socket=_.findWhere(io.sockets.sockets, { id: hashName[item.name] })
                if(socket){    // 向每个在线的群组用户广播创建群组成功事件
                    socket.emit('createGroupSuccess', userList)
                }
            })
        })
    })
})

http.listen(5000,function(){
    console.log('server is runing')
})




function merge(){     // 群组头像拼接函数
    let argumentsList=arguments
    switch(argumentsList[0]){
        case 3: {
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg').write('./src/public/images/groups/result#1.jpg', function(){
                            gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg', true).write('./src/public/images/groups/'+argumentsList[4], function(){
                                console.log('done')
                                console.log(argumentsList[4])
                                argumentsList[5]()
                            })
                        })
                    })
                })
            })
            break
        }
        case 4:{
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg').write('./src/public/images/groups/result#1.jpg', function(){
                                gm('./src/public/images/groups/small#3.jpg').append('./src/public/images/groups/small#4.jpg').write('./src/public/images/groups/result#2.jpg', function(){
                                    gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/result#2.jpg', true).write('./src/public/images/groups/'+argumentsList[5], function(){
                                        argumentsList[6]()
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
        case 5:{
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm(argumentsList[5]).resize('15','15','!').write('./src/public/images/groups/small#5.jpg',function(){
                                gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg',true).write('./src/public/images/groups/result#1.jpg', function(){
                                    gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg',true).write('./src/public/images/groups/result#2.jpg', function(){
                                        gm('./src/public/images/groups/small#4.jpg').append('./src/public/images/groups/small#5.jpg',true).write('./src/public/images/groups/result#3.jpg', function(){
                                            gm('./src/public/images/groups/result#2.jpg').append('./src/public/images/groups/result#3.jpg').write('./src/public/images/groups/'+argumentsList[6], function(){
                                                argumentsList[7]()
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
        case 6:{
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm(argumentsList[5]).resize('15','15','!').write('./src/public/images/groups/small#5.jpg',function(){
                                gm(argumentsList[6]).resize('15','15','!').write('./src/public/images/groups/small#6.jpg',function(){
                                    gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg',true).write('./src/public/images/groups/result#1.jpg', function(){
                                        gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg',true).write('./src/public/images/groups/result#2.jpg', function(){
                                            gm('./src/public/images/groups/small#4.jpg').append('./src/public/images/groups/small#5.jpg',true).write('./src/public/images/groups/result#3.jpg', function(){
                                                gm('./src/public/images/groups/result#3.jpg').append('./src/public/images/groups/small#6.jpg',true).write('./src/public/images/groups/result#4.jpg', function(){
                                                    gm('./src/public/images/groups/result#2.jpg').append('./src/public/images/groups/result#4.jpg').write('./src/public/images/groups/'+argumentsList[7], function(){
                                                        argumentsList[8]()
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
        case 7:{
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm(argumentsList[5]).resize('15','15','!').write('./src/public/images/groups/small#5.jpg',function(){
                                gm(argumentsList[6]).resize('15','15','!').write('./src/public/images/groups/small#6.jpg',function(){
                                    gm(argumentsList[7]).resize('15','15','!').write('./src/public/images/groups/small#7.jpg',function(){
                                        gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg',true).write('./src/public/images/groups/result#1.jpg', function(){
                                            gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg',true).write('./src/public/images/groups/result#2.jpg', function(){
                                                gm('./src/public/images/groups/small#4.jpg').append('./src/public/images/groups/small#5.jpg',true).write('./src/public/images/groups/result#3.jpg', function(){
                                                    gm('./src/public/images/groups/result#3.jpg').append('./src/public/images/groups/small#6.jpg',true).write('./src/public/images/groups/result#4.jpg', function(){
                                                        gm('./src/public/images/groups/result#2.jpg').append('./src/public/images/groups/result#4.jpg').write('./src/public/images/groups/result#5.jpg', function(){
                                                            gm('./src/public/images/groups/result#5.jpg').append('./src/public/images/groups/small#7.jpg').write('./src/public/images/groups/'+argumentsList[8], function(){
                                                                argumentsList[9]()
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
        case 8:{
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm(argumentsList[5]).resize('15','15','!').write('./src/public/images/groups/small#5.jpg',function(){
                                gm(argumentsList[6]).resize('15','15','!').write('./src/public/images/groups/small#6.jpg',function(){
                                    gm(argumentsList[7]).resize('15','15','!').write('./src/public/images/groups/small#7.jpg',function(){
                                        gm(argumentsList[8]).resize('15','15','!').write('./src/public/images/groups/small#8.jpg',function(){
                                            gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg',true).write('./src/public/images/groups/result#1.jpg', function(){
                                                gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg',true).write('./src/public/images/groups/result#2.jpg', function(){
                                                    gm('./src/public/images/groups/small#4.jpg').append('./src/public/images/groups/small#5.jpg',true).write('./src/public/images/groups/result#3.jpg', function(){
                                                        gm('./src/public/images/groups/result#3.jpg').append('./src/public/images/groups/small#6.jpg',true).write('./src/public/images/groups/result#4.jpg', function(){
                                                            gm('./src/public/images/groups/result#2.jpg').append('./src/public/images/groups/result#4.jpg').write('./src/public/images/groups/result#5.jpg', function(){
                                                                gm('./src/public/images/groups/small#7.jpg').append('./src/public/images/groups/small#8.jpg',true).write('./src/public/images/groups/result#6.jpg', function(){
                                                                    gm('./src/public/images/groups/result#5.jpg').append('./src/public/images/groups/result#6.jpg').write('./src/public/images/groups/'+argumentsList[9], function(){
                                                                        argumentsList[10]()
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
        case 9:{
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm(argumentsList[5]).resize('15','15','!').write('./src/public/images/groups/small#5.jpg',function(){
                                gm(argumentsList[6]).resize('15','15','!').write('./src/public/images/groups/small#6.jpg',function(){
                                    gm(argumentsList[7]).resize('15','15','!').write('./src/public/images/groups/small#7.jpg',function(){
                                        gm(argumentsList[8]).resize('15','15','!').write('./src/public/images/groups/small#8.jpg',function(){
                                            gm(argumentsList[9]).resize('15','15','!').write('./src/public/images/groups/small#9.jpg',function(){
                                                gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg',true).write('./src/public/images/groups/result#1.jpg', function(){
                                                    gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg',true).write('./src/public/images/groups/result#2.jpg', function(){
                                                        gm('./src/public/images/groups/small#4.jpg').append('./src/public/images/groups/small#5.jpg',true).write('./src/public/images/groups/result#3.jpg', function(){
                                                            gm('./src/public/images/groups/result#3.jpg').append('./src/public/images/groups/small#6.jpg',true).write('./src/public/images/groups/result#4.jpg', function(){
                                                                gm('./src/public/images/groups/result#2.jpg').append('./src/public/images/groups/result#4.jpg').write('./src/public/images/groups/result#5.jpg', function(){
                                                                    gm('./src/public/images/groups/small#7.jpg').append('./src/public/images/groups/small#8.jpg',true).write('./src/public/images/groups/result#6.jpg', function(){
                                                                        gm('./src/public/images/groups/result#6.jpg').append('./src/public/images/groups/small#9.jpg',true).write('./src/public/images/groups/result#7.jpg', function(){
                                                                            gm('./src/public/images/groups/result#5.jpg').append('./src/public/images/groups/result#7.jpg').write('./src/public/images/groups/'+argumentsList[10], function(){
                                                                                argumentsList[11]()
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
        default: {
            gm(argumentsList[1]).resize('15','15','!').write('./src/public/images/groups/small#1.jpg', function(){
                gm(argumentsList[2]).resize('15','15','!').write('./src/public/images/groups/small#2.jpg', function(){
                    gm(argumentsList[3]).resize('15','15','!').write('./src/public/images/groups/small#3.jpg', function(){
                        gm(argumentsList[4]).resize('15','15','!').write('./src/public/images/groups/small#4.jpg', function(){
                            gm(argumentsList[5]).resize('15','15','!').write('./src/public/images/groups/small#5.jpg',function(){
                                gm(argumentsList[6]).resize('15','15','!').write('./src/public/images/groups/small#6.jpg',function(){
                                    gm(argumentsList[7]).resize('15','15','!').write('./src/public/images/groups/small#7.jpg',function(){
                                        gm(argumentsList[8]).resize('15','15','!').write('./src/public/images/groups/small#8.jpg',function(){
                                            gm(argumentsList[9]).resize('15','15','!').write('./src/public/images/groups/small#9.jpg',function(){
                                                gm('./src/public/images/groups/small#1.jpg').append('./src/public/images/groups/small#2.jpg',true).write('./src/public/images/groups/result#1.jpg', function(){
                                                    gm('./src/public/images/groups/result#1.jpg').append('./src/public/images/groups/small#3.jpg',true).write('./src/public/images/groups/result#2.jpg', function(){
                                                        gm('./src/public/images/groups/small#4.jpg').append('./src/public/images/groups/small#5.jpg',true).write('./src/public/images/groups/result#3.jpg', function(){
                                                            gm('./src/public/images/groups/result#3.jpg').append('./src/public/images/groups/small#6.jpg',true).write('./src/public/images/groups/result#4.jpg', function(){
                                                                gm('./src/public/images/groups/result#2.jpg').append('./src/public/images/groups/result#4.jpg').write('./src/public/images/groups/result#5.jpg', function(){
                                                                    gm('./src/public/images/groups/small#7.jpg').append('./src/public/images/groups/small#8.jpg',true).write('./src/public/images/groups/result#6.jpg', function(){
                                                                        gm('./src/public/images/groups/result#6.jpg').append('./src/public/images/groups/small#9.jpg',true).write('./src/public/images/groups/result#7.jpg', function(){
                                                                            gm('./src/public/images/groups/result#5.jpg').append('./src/public/images/groups/result#7.jpg').write('./src/public/images/groups/'+argumentsList[10], function(){
                                                                                argumentsList[11]()
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
            break
        }
    }
}