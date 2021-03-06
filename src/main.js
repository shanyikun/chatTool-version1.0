import Vue from 'vue'
import Vuex from 'vuex'
import app from './components/App.vue'
import VueRouter from 'vue-router'
import router from './router/router.js'
import VueResource from 'vue-resource'
import io from 'socket.io-client'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

/*var tel={        //在基于webpack的打包系统中渲染函数的参数不能用这样命令式的组件模板对象
    data: function(){     //但是在非打包系统中可以直接使用模板对象作为渲染函数的参数
        return {
            msg: 'hello'
        }
    },
    template: '<h1>{{msg}}</h1>'
}*/

var socket=io()   //连接服务器socket.io  默认是连接此文件所在的服务器地址

var store=new Vuex.Store({        //Vuex存储对象
    state:{
        name: 'shan',    //用户名
        email: '33',   //邮箱
        url: '/src/public/images/shanyikun.jpg',
        allUserList: [], //全部用户的列表，包括不是好友的用户
        friendsList: [
            {name:'syk',url:'/src/public/images/syk.jpg'},
            {name:'shan', url: '/src/public/images/shan.jpg'},
            {name: 'xiaowang', url: '/src/public/images/shanyikun.jpg'}
            ],
        ableFriendsList: [],
        onlineUserList: [
            {name: 'messages', timeStamp: new Date().toLocaleTimeString(), url: '/src/public/images/messages.gif'},
            {name: 'xiaowang', timeStamp: new Date().toLocaleTimeString(), url: '/src/public/images/default.jpg'},
            {name: 'shan', timeStamp: new Date().toLocaleTimeString(), url: '/src/public/images/shan.jpg'}
            ],   //在线用户列表
        socket: socket,     //socket全局化
        messageList:[
            {name: 'xiaowang', message: 'hellasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasfdasfdasfo',url: '/src/public/images/default.jpg'},
            {name: 'shan', message: 'nihao', url: '/src/public/images/shan.jpg'}
            ],      //聊天信息列表
        badgeFlag: '',       //消息徽标标志
        badgeFlagNumber: 0,   //消息徽标标志附加位，为了区分同一个对话框下的多条不同的消息
        timeStamp:'',   //存储时间戳的临时变量
        lastMessage: '', // 存储上一条消息的临时变量
        routePath: [],  // 路由路径，有两条记录
        routeQuery: [],  //查询字符串，有两条记录
        nowChatName: '',  //全局存储当前对话人信息，防止chagPage页面刷新时丢失对话人信息，用于对话页面切换时记录对话信息
        friendInformationName: '',  //全局存储当前好友列表详细信息， 防止friendInformation页面刷新时丢失信息，用于好友列表切换时记录好友信息
        friendInformationUrl: '',   //全局存储当前好友列表详细信息
        groupInformationName: '',   //全局存储当前群组名字
        firstOfSearchFriendsList:{},  //不刷新地址情况下搜索框所得好友列表中第一个人的信息
        userInfoIconFontSwitchFlag: true,  //  用户图标切换标志位
        addFriendSuccessFlag: true,   // 添加好友成功标志位，一旦添加好友成功即取反
        groupList: [{name: 'ss&&&ee&&&rr&&&***group***', nickname: '三人行lalalalallalalalalddd',url: '/src/public/images/default.jpg', members: [{name: '你是哪个傻逼啊', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'rr', url: '/src/public/images/default.jpg'}], numbers: 3},
                    {name: 'sss&&&ee&&&rr&&&***group***', nickname: '四人行', url: '/src/public/images/default.jpg', members: [{name: 'ss', url: '/src/public/images/default.jpg'},{name: 'ee', url: '/src/public/images/default.jpg'},{name: 'rr', url: '/src/public/images/default.jpg'}], numbers: 3}
            ],  // 群组列表
        emotionSrcList: [
            '/src/public/images/emotions/picture0.gif',
            '/src/public/images/emotions/picture1.gif',
            '/src/public/images/emotions/picture2.gif',
            '/src/public/images/emotions/picture3.gif',
            '/src/public/images/emotions/picture4.gif',
            '/src/public/images/emotions/picture5.gif',
            '/src/public/images/emotions/picture6.gif',
            '/src/public/images/emotions/picture7.gif',
            '/src/public/images/emotions/picture8.gif',
            '/src/public/images/emotions/picture9.gif',
            '/src/public/images/emotions/picture10.gif',
            '/src/public/images/emotions/picture11.gif',
            '/src/public/images/emotions/picture12.gif',
            '/src/public/images/emotions/picture13.gif',
            '/src/public/images/emotions/picture14.gif',
            '/src/public/images/emotions/picture15.gif',
            '/src/public/images/emotions/picture16.gif',
            '/src/public/images/emotions/picture17.gif',
            '/src/public/images/emotions/picture18.gif',
            '/src/public/images/emotions/picture19.gif',
            '/src/public/images/emotions/picture20.gif',
            '/src/public/images/emotions/picture21.gif',
            '/src/public/images/emotions/picture22.gif',
            '/src/public/images/emotions/picture23.gif',
            '/src/public/images/emotions/picture24.gif',
            '/src/public/images/emotions/picture25.gif',
            '/src/public/images/emotions/picture26.gif',
            '/src/public/images/emotions/picture27.gif',
            '/src/public/images/emotions/picture28.gif',
            '/src/public/images/emotions/picture29.gif',
            '/src/public/images/emotions/picture30.gif',
            '/src/public/images/emotions/picture31.gif',
            '/src/public/images/emotions/picture32.gif',
            '/src/public/images/emotions/picture33.gif',
            '/src/public/images/emotions/picture34.gif',
            ],  // 表情包base64格式数据列表， 在App.vue的created函数中通过get请求获取
        contextMenuFlag: false,  // 右击菜单标志位，用于单击空白处关闭右击菜单，有右击菜单时为true，关闭后为false
        deleteFriendSuccessFlag: false   // 删除好友成功标志位，一旦删除成功即取反
    },
    mutations: {
        getUserInformation: function(state, userObj){   //第一个参数一定是state
            state.name=userObj.name
            state.email=userObj.email
            state.url=userObj.url
        },
        getOnlineUserList: function(state, onlineUserList){
            onlineUserList.splice(onlineUserList.findIndex(function(item){   //去除用户本身
                return item===state.name
            }),1)
            let ableOnlineUserList=[]
            ableOnlineUserList=onlineUserList.filter(function(userName){  //过滤是其好友的在线用户
                return state.friendsList.some(function(item){
                    return item.name===userName
                })||userName==='messages'
            })
            let withGroupOnlineUserList=ableOnlineUserList.concat(state.groupList)
            withGroupOnlineUserList.splice(ableOnlineUserList.length, 1)  // 去除群组列表中的第一个，也就是messages群组
            let withTimeStampOnlineUserList=withGroupOnlineUserList.map((item)=>{  //为每个在线用户添加时间戳
                if((typeof item)==='string'){  // 如果是在线用户，而非群组
                    let url
                    if(item==='messages'){   //群聊不属于用户，所以单独加上群聊头像
                        url='/src/public/images/messages.gif'
                    }
                    else {    //从friendsList中获取用户头像信息
                        url=state.friendsList.find(function(friend){
                            return friend.name===item
                        }).url
                    }
                    let messageList=JSON.parse(window.localStorage.getItem(item))||[]
                    if(messageList.length!==0){ //如果有对话消息
                        let lastMessageObject=messageList[messageList.length-1]
                        let timeStamp=lastMessageObject.timeStamp, objectTimeStamp
                        this.commit('formatLastMessage', lastMessageObject)   // 格式化最后一条消息，以用于添加到onlineUserList中
                        if(timeStamp){  //如果消息中有时间戳
                            objectTimeStamp=new Date(timeStamp)  //时间字符串转换成时间对象， 时间对象经JSON.stringify()转换后再经JSON.parse()解析得到的是字符串
                            if(objectTimeStamp.toLocaleDateString()!==new Date().toLocaleDateString()){ //如果时间不是今天，则只显示日期
                                return {name: item, timeStamp: objectTimeStamp.toLocaleDateString(), url: url, lastMessage: state.lastMessage}
                            }
                            else {     //如果时间是今天则只显示时间
                                this.commit('formatTimeStamp', objectTimeStamp)
                                return {name: item, timeStamp: state.timeStamp, url: url, lastMessage: state.lastMessage}
                            }
                        }
                        else {  //消息中没有时间戳
                            return {name: item, timeStamp: '', url: url, lastMessage: state.lastMessage}
                        }
                    }
                    else {  //没有对话消息
                        return {name: item, timeStamp: '', url: url, lastMessage: '[没有消息]'}
                    }
                }
                else {   // 如果是群组,加上昵称这一属性
                    let messageList=JSON.parse(window.localStorage.getItem(item.name))||[]
                    if(messageList.length!==0){
                        let lastMessageObject=messageList[messageList.length-1]
                        let timeStamp=lastMessageObject.timeStamp, objectTimeStamp
                        this.commit('formatLastMessage', lastMessageObject)   // 格式化最后一条消息，以用于添加到onlineUserList中
                        if(timeStamp){  //如果消息中有时间戳
                            objectTimeStamp=new Date(timeStamp)  //时间字符串转换成时间对象， 时间对象经JSON.stringify()转换后再经JSON.parse()解析得到的是字符串
                            if(objectTimeStamp.toLocaleDateString()!==new Date().toLocaleDateString()){ //如果时间不是今天，则只显示日期
                                return {name: item.name, timeStamp: objectTimeStamp.toLocaleDateString(), url: item.url, lastMessage: state.lastMessage, nickname: item.nickname}
                            }
                            else {     //如果时间是今天则只显示时间
                                this.commit('formatTimeStamp', objectTimeStamp)
                                return {name: item.name, timeStamp: state.timeStamp, url: item.url, lastMessage: state.lastMessage, nickname: item.nickname}
                            }
                        }
                        else {  //消息中没有时间戳
                            return {name: item.name, timeStamp: '', url: item.url, lastMessage: state.lastMessage, nickname: item.nickname}
                        }
                    }
                    else {
                        return {name: item.name, timeStamp: '', url: item.url, lastMessage: '[没有消息]', nickname: item.nickname}
                    }
                }
            })

            state.onlineUserList=withTimeStampOnlineUserList
        },
        getFriendsList: function(state, friendsList){
            let ableFriendsList=[]
            ableFriendsList=friendsList.filter((item)=>{
                return state.ableFriendsList.indexOf(item.name)!==-1
            })
            state.friendsList=ableFriendsList
        },
        getGroupList: function(state, groupList){
            state.groupList=groupList
        },
        formatTimeStamp: function(state, timeStamp){     //把时间对象转换成时分秒格式，有的浏览器的toLocaleTimeString()就有此作用
            let hours=timeStamp.getHours().toString(),formatHours
            let minute=timeStamp.getMinutes().toString(),formatMinute
            let second=timeStamp.getSeconds().toString(), formatSecond
            formatHours=hours.length===2?hours:('0'+hours)
            formatMinute=minute.length===2?minute:('0'+minute)
            formatSecond=second.length===2?second:('0'+second)
            state.timeStamp=formatHours+':'+formatMinute+':'+formatSecond
        },
        formatLastMessage: function(state, lastMessageObject){  // 格式化最后一条信息, 也可以用VUE过滤器处理
            if(lastMessageObject.type==='image'){
                state.lastMessage='[图片]'
            }
            else if(lastMessageObject.type==='video'){
                state.lastMessage='[视频]'
            }
            else {
                let byteLength=0, lastMessage=''
                let messageLength=lastMessageObject.message.length
                for(let i=0; i<messageLength; i++){
                    if(lastMessageObject.message.charCodeAt(i)>=0x4E00&&lastMessageObject.message.charCodeAt(i)<=0x9FFF){
                        byteLength+=2       // 若是汉字，则长度加2，因为一个汉字为2byte且占据宽度为两倍的英文字母
                        lastMessage+=lastMessageObject.message[i]
                    }
                    else {
                        byteLength++
                        lastMessage+=lastMessageObject.message[i]
                    }

                    if(byteLength>=15&&i<messageLength-1){
                        state.lastMessage=lastMessage+'...'
                        break
                    }
                    else if(i===messageLength-1){
                        state.lastMessage=lastMessage
                    }
                }
            }
        }
    },
    getters: {
    }
})

var vm=new Vue({
    el:'#index',
    data: {
    },
    render: function(createElement){
        return createElement(app)
    },
    created: function(){
        this.$http.get('/getUserInformation').then((data)=>{  //获取用户信息并存储在Vuex中,利用session
            var name=data.body.message.name
            var email=data.body.message.email
            var url=data.body.message.url
            var userObj={name: name, email: email, url: url}
            this.$store.commit('getUserInformation', userObj)  //传参时只能传一个参数，可以是对象或数组或字符串或数字
        }).then(()=>{
            this.$http.get('/getAbleFriendsList').then((data)=>{
                if(data.body.err_code===500){
                    return alert('server error')
                }
                else {
                    this.$store.state.ableFriendsList=data.body.message
                }
                this.$http.get('/getFriendsList').then((data)=>{  //回调函数中的this仍然是外部的this，无需使用箭头函数
                    this.$store.commit('getFriendsList', data.body.message)                 //若回调函数中还有函数，则内层函数需要使用箭头函数
                }).then(()=>{
                    this.$http.get('/getGroupList').then((data)=>{  // 获取群组列表
                        this.$store.commit('getGroupList', data.body.message)
                    }).then(()=>{
                        socket.on('login', (data)=>{    //先监听后广播   用箭头函数表示上层this  获取在线用户列表
                            this.$store.commit('getOnlineUserList', data)
                        })
                        socket.emit('login', this.$store.state.name)    //向服务器广播用户登陆事件，并传递用户名
                    })
                })
            })
         })

        socket.on('chat message', (data, to)=>{    //监听发送消息事件，监听客户端消息,必须在进入页面时监听，不能在聊天组件中监听
            var objectTimeStamp
            if(to==='messages'){                   //因为每次聊天组件重启生命周期就会重新监听，会导致多次监听
                if(this.$store.state.nowChatName==='messages'){  //判断监听所得消息是否在当前对话框
                    let messages=JSON.parse(window.localStorage.getItem('messages'))||[]
                    messages.push(data)
                    try{   // 防止localStorage空间不足出现错误
                        window.localStorage.setItem('messages', JSON.stringify(messages))
                    }
                    catch(e){
                        window.alert('空间不足，请先清理缓存！')
                    }
                    this.$store.state.messageList=messages
                    objectTimeStamp=new Date(data.timeStamp)
                    this.$store.commit('formatTimeStamp', objectTimeStamp)   // 格式化时间戳，用于更新在线用户列表中的timeStamp
                    this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name==='messages'    //改变时间戳
                    })].timeStamp=this.$store.state.timeStamp
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name==='messages'    //改变最后一条消息
                    })].lastMessage=this.$store.state.lastMessage
                }
                else {
                    this.$store.state.badgeFlag='messages'+'#'+this.$store.state.badgeFlagNumber++  //更改消息提醒徽标标志
                    let messages=JSON.parse(window.localStorage.getItem('messages'))||[]
                    messages.push(data)
                    try{
                        window.localStorage.setItem('messages', JSON.stringify(messages))
                    }
                    catch(e){
                        window.alert('空间不足，请先清理缓存！')
                    }
                    /*this.$store.state.messageList=messages*/
                    objectTimeStamp=new Date(data.timeStamp)
                    this.$store.commit('formatTimeStamp', objectTimeStamp)
                    this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name==='messages'
                    })].timeStamp=this.$store.state.timeStamp
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name==='messages'
                    })].lastMessage=this.$store.state.lastMessage
                }
            }
            else if(to.indexOf('***group***')!==-1){   // 如果是群组消息
                if(this.$store.state.nowChatName===to){
                    let groupMessage=JSON.parse(window.localStorage.getItem(to))||[]
                    groupMessage.push(data)
                    try{
                        window.localStorage.setItem(to, JSON.stringify(groupMessage))
                    }
                    catch(e){
                        window.alert('空间不足，请先清理缓存！')
                    }
                    this.$store.state.messageList=groupMessage
                    objectTimeStamp=new Date(data.timeStamp)
                    this.$store.commit('formatTimeStamp', objectTimeStamp)
                    this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===to
                    })].timeStamp=this.$store.state.timeStamp
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===to
                    })].lastMessage=this.$store.state.lastMessage
                }
                else {
                    this.$store.state.badgeFlag=to+'#'+this.$store.state.badgeFlagNumber++  //更改消息提醒徽标标志
                    let groupMessage=JSON.parse(window.localStorage.getItem(to))||[]
                    groupMessage.push(data)
                    try{
                        window.localStorage.setItem(to, JSON.stringify(groupMessage))
                    }
                    catch(e){
                        window.alert('空间不足，请先清理缓存！')
                    }
                   /* this.$store.state.messageList=groupMessage*/
                    objectTimeStamp=new Date(data.timeStamp)
                    this.$store.commit('formatTimeStamp', objectTimeStamp)
                    this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===to
                    })].timeStamp=this.$store.state.timeStamp
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===to
                    })].lastMessage=this.$store.state.lastMessage
                }
            }
            else if(to===this.$store.state.name){   //别人向自己发送
                if(this.$store.state.nowChatName===data.name){
                    let otherMessage=JSON.parse(window.localStorage.getItem(data.name))||[]
                    otherMessage.push(data)
                    try{
                        window.localStorage.setItem(data.name, JSON.stringify(otherMessage))
                    }
                    catch(e){
                        window.alert('空间不足，请先清理缓存！')
                    }
                    this.$store.state.messageList=otherMessage
                    objectTimeStamp=new Date(data.timeStamp)
                    this.$store.commit('formatTimeStamp', objectTimeStamp)
                    this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===data.name
                    })].timeStamp=this.$store.state.timeStamp
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===data.name
                    })].lastMessage=this.$store.state.lastMessage
                }
                else {
                    this.$store.state.badgeFlag=data.name+'#'+this.$store.state.badgeFlagNumber++
                    let otherMessage=JSON.parse(window.localStorage.getItem(data.name))||[]
                    otherMessage.push(data)
                    try{
                        window.localStorage.setItem(data.name, JSON.stringify(otherMessage))
                    }
                    catch(e){
                        window.alert('空间不足，请先清理缓存！')
                    }
                    /*this.$store.state.messageList=otherMessage*/
                    objectTimeStamp=new Date(data.timeStamp)
                    this.$store.commit('formatTimeStamp', objectTimeStamp)
                    this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===data.name
                    })].timeStamp=this.$store.state.timeStamp
                    this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                        return item.name===data.name
                    })].lastMessage=this.$store.state.lastMessage
                }
            }
            else {
                let selfMessage=JSON.parse(window.localStorage.getItem(to))||[]
                selfMessage.push(data)
                try{
                    window.localStorage.setItem(to, JSON.stringify(selfMessage))
                }
                catch(e){
                    window.alert('空间不足，请先清理缓存！')
                }
                this.$store.state.messageList=selfMessage
                objectTimeStamp=new Date(data.timeStamp)
                this.$store.commit('formatTimeStamp', objectTimeStamp)
                this.$store.commit('formatLastMessage', data)    // 格式化消息，用于更新在线用户列表中的lastMessage
                this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                    return item.name===to
                })].timeStamp=this.$store.state.timeStamp
                this.$store.state.onlineUserList[this.$store.state.onlineUserList.findIndex(function(item){
                    return item.name===to
                })].lastMessage=this.$store.state.lastMessage
            }
        })
    },
    computed: {
        route: function(){
            return this.$route
        }
    },
    beforeCreate: function(){
        this.$store.state.routePath.push(this.$route.path)  //存入第一条路径
        this.$store.state.routeQuery.push(this.$route.query)  //存入第一个查询字符串，没有则为{}
    },
    watch: {
        route: function(){   //监听路由变化
            if(this.$store.state.routePath.length===2){  //两条记录时，则删除第一条记录
                this.$store.state.routePath.shift()
                this.$store.state.routeQuery.shift()
                this.$store.state.routePath.push(this.$route.path)  //增加新纪录
                this.$store.state.routeQuery.push(this.$route.query)
            }
            else {
                this.$store.state.routePath.push(this.$route.path)
                this.$store.state.routeQuery.push(this.$route.query)
            }
        }
    },
    beforeMount: function(){
    },
    router: router,
    store: store        //挂载Vuex对象
})

/*var vm2=new Vue({     //在基于webpack的打包系统中必须使用渲染函数来渲染指定模板，这样直接渲染没有效果
    el: '#index2',
    data: {
        msg: 'hello world'
    }
})*/       //注意： 在main.js中注册的全局组件或者局部组件在其他引入的vue文件中都不可用，vue鼓励使用以vue文件引入组件

/*关于组件加载顺序的问题： 一般来说越内层的组件加载的越晚，此项目中钩子函数执行顺序如下： main created, main beforemount
  , app created, app beforemount, userinfo created, userinfo beforemount ,一般来说，编译到某个组件时就会开辟一块
   内存用于其生命周期，并不是在完全挂载完某个组件后才开始其内部组件的生命周期，组件生命周期时间会有部分重叠，但整体仍遵循
   以上规则*/

/*关于 生命周期函数以及计算属性中的函数执行顺序问题：
  -计算属性中的函数执行在beforeCreate之后，created之前，其中data对象中的属性在此函数中已经可以使用
  -vue实例自带的一些属性或方法，例如$route或者挂载在vue实例上的$store在beforeCreate中就已经可以使用*/
