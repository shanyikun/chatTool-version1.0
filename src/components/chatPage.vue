<template>
    <div id="chatPageContainer">
        <div id="chat-name-container">
            <h4>
                当前对话人:
                <span>{{currentInterlocutor}}</span>
            </h4>
        </div>
        <div id="message-container" ref="messagecontainer">
            <ul>
                <template v-for="message in $store.state.messageList">
                    <li class="selfmsg" v-if="message.name===$store.state.name">
                        <div class="nameAndMsgContainer">
                            <p class="msg" v-if="message.type==='image'">
                                <img :src="message.message" width="60px" class="messagePicture" @click="enlargePictureMessage(message.message)">
                            </p>    <!--判断消息是否是图片-->
                            <video class="msg" width="150px" controls v-else-if="message.type==='video'">
                                <source :src="message.message">
                            </video>   <!--判断消息是否是视频-->
                            <p class="msg" v-else>{{message.message}}</p>
                        </div>
                        <img class="img" v-if="message.url" :src="message.url"  width="35px" height="35px"
                             @click="getFriendInformation(message)">
                    </li>
                    <li class="othermsg" v-else>
                        <img class="img" v-if="message.url" :src="message.url" width="35px" height="35px"
                             @click="getFriendInformation(message)">
                        <div class="nameAndMsgContainer">
                            <p class="username" v-if="(currentInterlocutor==='messages')||(currentInterlocutor!==$store.state.nowChatName)">{{message.name}}</p>  <!--判断是群消息还是个人消息，若是群消息则显示名字，否则不显示名字-->
                            <p class="msg" v-if="message.type==='image'">
                                <img :src="message.message" width="60px" class="messagePicture" @click="enlargePictureMessage(message.message)">
                            </p> <!--判断消息是否是图片-->
                            <video class="msg" width="150px" controls v-else-if="message.type==='video'">
                                <source :src="message.message">
                            </video>  <!--判断消息是否是视频， 视频的message存储的是视频的url，通过<source>get请求得到-->
                            <p class="msg" v-else>{{message.message}}</p>
                        </div>
                    </li>
                </template>
            </ul>
        </div>
        <div id="form-container" ref="formContainer">
            <form action="" id="send" @submit.prevent="sendMessage">
                <textarea v-model="message" ref="textarea" :style="styleObject"
                          @focus="focus"
                          @blur="blur"
                          @keypress.prevent.enter="sendMessage"
                          @keydown.backspace="deleteImage"
                          @paste.stop="pasteEvent"></textarea>  <!--回车发送消息， 退格键删除图片, 粘贴事件-->
                <input type="submit" value="send">
            </form>

            <input type="file" id="sendImageInput" @change="uploadImageComplete" @focus="uploadImageFocus">  <!--发送图片,隐藏z-index=-99-->
            <label for="sendImageInput">   <!--发送图片字体图标， 绝对定位-->
                <span class="iconfont icon-tupian"></span>
            </label>
            <div class="iconfont icon-biaoqing" @click="openEmotionsPop"></div>   <!--发送表情图标， 绝对定位-->

            <div class="emotionsPop" v-if="isDisplayEmotionsPop">   <!--表情弹窗， 绝对定位，不影响正文-->
                <div class="closeButtonContainer">
                    <div class="iconfont icon-tubiaoguifan" @click="closeEmotionsPop"></div>
                </div>
                <div class="emotionsContainer">
                    <img v-for="src in $store.state.emotionSrcList" class="emotionImage" :src="src" width="50px" height="50px"
                         @click="selectEmotion(src)">
                </div>
            </div>

            <img :src="sendImageDataURL" width="60px" class="sendImage">  <!--发送消息框中的图片, 绝对定位-->
            <video width="80px" height="80px" class="sendVideo" v-if="isDisplayPreviewVideo">  <!--发送消息框中的视频，绝对定位，开始要设置不显示，和图片不同-->
                <source :src="sendVideoDataURL">
            </video>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                message:'',
                styleObject: {
                    paddingTop: '30px',
                },
                sendImageDataURL: '',
                sendVideoDataURL: '',
                sendVideoBinaryData: '',  // 二进制格式的视频文件
                sendVideoBinaryDataName: '', // 二进制格式视频文件的名字
                isDisplayEmotionsPop: false,
                emotionSrcList: [],
                isDisplayPreviewVideo: false   // 是否预览视频消息
            }
        },
        methods: {
            sendMessage: function(){
                var name=this.$store.state.name
                var url=this.$store.state.url
                var to
                to=this.$store.state.nowChatName
                if(to.indexOf('***group***')===-1){   // 如果不是群组
                    if(this.message!==''){  //向服务器发送消息广播
                        let timeStamp=new Date()
                        let sendObject={name: name, to: to, message: this.message, timeStamp: timeStamp, url: url, type: 'plainText'}
                        this.$store.state.socket.emit('chat message', sendObject)
                    }
                    else if(this.sendImageDataURL!==''){
                        let timeStamp=new Date()
                        let sendObject={name: name, to: to, message: this.sendImageDataURL, timeStamp: timeStamp, url: url, type: 'image'}
                        this.$store.state.socket.emit('chat message', sendObject)
                    }
                    else if(this.sendVideoBinaryData!==''){
                        let timeStamp=new Date()
                        let sendObject={name: name, to: to, message: this.sendVideoBinaryData, messageName: this.sendVideoBinaryDataName,timeStamp: timeStamp, url: url, type: 'video'}
                        this.$store.state.socket.emit('chat message', sendObject)
                    }
                    else {
                        alert('输入内容不能为空！')
                    }
                }
                else {  // 如果是群组，则为这条消息添加上群组成员信息，以便于服务器向群组成员广播消息事件
                    let groupMembers=this.$store.state.groupList.find((item, index)=>{
                        return item.name===to
                    }).members
                    if(this.message!==''){  //向服务器发送消息广播
                        let timeStamp=new Date()
                        let sendObject={name: name, to: to, message: this.message, timeStamp: timeStamp, url: url, type: 'plainText', groupMembers: groupMembers}
                        this.$store.state.socket.emit('chat message', sendObject)
                    }
                    else if(this.sendImageDataURL!==''){
                        let timeStamp=new Date()
                        let sendObject={name: name, to: to, message: this.sendImageDataURL, timeStamp: timeStamp, url: url, type: 'image', groupMembers: groupMembers}
                        this.$store.state.socket.emit('chat message', sendObject)
                    }
                    else if(this.sendVideoBinaryData!==''){
                        let timeStamp=new Date()
                        let sendObject={name: name, to: to, message: this.sendVideoBinaryData, messageName: this.sendVideoBinaryDataName,timeStamp: timeStamp, url: url, type: 'video', groupMembers: groupMembers}
                        this.$store.state.socket.emit('chat message', sendObject)
                    }
                    else {
                        alert('输入内容不能为空！')
                    }
                }
                this.message=''   //清空消息框
                this.sendImageDataURL=''  //清空消息框
                this.sendVideoDataURL=''  //清空消息框
                this.sendVideoBinaryData=''  // 清空二进制视频数据
                this.isDisplayPreviewVideo=false   // 视频预览设置为不可见
                this.$refs.textarea.focus()  // 输入框获得焦点
            },
            focus: function(){
                this.$refs.textarea.style.backgroundColor='white'
            },
            blur: function(){
                this.$refs.textarea.style.backgroundColor='#F5F5F5'
            },
            getFriendInformation: function(friend){
                this.$emit('friend-information-pop', friend)
            },
            uploadImageComplete: function(){  //获取base64格式的图片数据
                let files=event.target.files
                if(files[0].type.indexOf('image')!==-1){  // 判断是否是图片
                    let fileReader=new FileReader()
                    fileReader.readAsDataURL(files[0])
                    fileReader.onloadend=()=>{   //图片上传完成时触发
                        this.sendImageDataURL=fileReader.result
                    }
                    event.target.value=''  // 清空file上传控件的内容， 若不清空,下次上传同样路径的图片时，change事件不会触发
                }
                else if(files[0].type.indexOf('video')!==-1){   // 判断是否是视频
                    let eventObject=event
                    this.sendVideoBinaryDataName=files[0].name
                    let fileReader=new FileReader()
                    fileReader.readAsDataURL(files[0])
                    fileReader.onloadend=()=>{
                        this.sendVideoDataURL=fileReader.result
                        this.isDisplayPreviewVideo=true
                        if(true){   // 防止与外层fileReader产生冲突， 加一层块级作用域隔离
                            let fileReader=new FileReader()
                            fileReader.readAsArrayBuffer(files[0])   // 以二进制格式读取视频文件用于上传到服务器
                            fileReader.onloadend=()=>{
                                this.sendVideoBinaryData=fileReader.result
                            }
                            eventObject.target.value=''
                        }
                    }
                }
            },
            uploadImageFocus: function(){   // 点击上传图片时， 文本框获得焦点
                this.$refs.textarea.focus()
            },
            openEmotionsPop: function(){  //打开表情包弹窗， 并使文本框获得焦点
                this.isDisplayEmotionsPop=true
                this.$refs.textarea.focus()
            },
            closeEmotionsPop: function(){  // 关闭表情包弹窗， 并使文本框获得焦点
                this.isDisplayEmotionsPop=false
                this.$refs.textarea.focus()
            },
            selectEmotion: function(src){  // 选择表情，并关闭表情包弹窗，使文本框获得焦点
                this.sendImageDataURL=src
                this.isDisplayEmotionsPop=false
                this.$refs.textarea.focus()
            },
            deleteImage: function(){   // 删除选中图片
                if(this.message===''){
                    this.sendImageDataURL=''
                    this.sendVideoBinaryData=''
                    this.sendVideoDataURL=''
                    this.sendVideoBinaryDataName=''
                    this.isDisplayPreviewVideo=false
                }
            },
            pasteEvent: function(){  // 暂时只支持图片的复制，且需要打开复制
                let clipboardData=event.clipboardData||window.clipboardData
                if(clipboardData.files.length!==0){
                    let fileReader=new FileReader()
                    fileReader.readAsDataURL(clipboardData.files[0])
                    fileReader.onloadend=()=>{
                        this.sendImageDataURL=fileReader.result
                    }
                }
            },
            enlargePictureMessage: function(pictureURL){
                this.$emit('picture-message-enlargement', pictureURL)
            }
        },
        computed: {
            messageList: function(){
                return this.$store.state.messageList
            },
            currentInterlocutor: function(){
                if(this.$route.query.name){    //经由在线用户列表项切换过来，或者经由用户详情页面发送消息按钮切换过来
                    if(this.$route.query.name.indexOf('***group***')===-1){
                        this.$store.state.nowChatName=this.$route.query.name
                        return this.$route.query.name
                    }
                    else {
                        this.$store.state.nowChatName=this.$route.query.name
                        let groupObject=this.$store.state.groupList.find((item)=>{
                            return item.name===this.$route.query.name
                        })
                        return groupObject.nickname
                    }
                }
                else if(['/chatPage', '/onlineUserList'].indexOf(this.$store.state.routePath[0])===-1){
                    this.$store.state.nowChatName='messages'
                    return 'messages'    //经由在线用户列表图标切换过来， 前页面是用户列表或者是用户详情等非chatPage或者onlineUserList页面
                }
                else {    //经由在线用户列表图标切换， 前页面是在线用户列表或者是chatPage，此时对话人信息不变
                    if(this.$store.state.nowChatName.indexOf('***group***')===-1){
                        return this.$store.state.nowChatName
                    }
                    else {
                        let groupObject=this.$store.state.groupList.find((item)=>{
                            return item.name===this.$store.state.nowChatName
                        })
                        return groupObject.nickname
                    }
                }
            }
        },
        created: function(){
            if(this.$route.query.name){  //经由在线用户列表项切换过来，或者经由用户详情页面发送消息按钮切换过来
                this.$store.state.messageList=JSON.parse(window.localStorage.getItem(this.$route.query.name))||[]
            }
            else if(['/chatPage', '/onlineUserList'].indexOf(this.$store.state.routePath[0])===-1){  //经由在线用户列表图标切换过来， 前页面是用户列表或者是用户详情等非chatPage或者onlineUserList页面
                this.$store.state.messageList=JSON.parse(window.localStorage.getItem('messages'))||[]
            }
        },
        mounted: function(){
            this.$refs.messagecontainer.scrollTop=this.$refs.messagecontainer.scrollHeight //保证对话框滑动条位于最底部
        },
        updated: function(){  //数据更新时执行此函数，重新执行生命周期时不执行此函数
            this.$refs.messagecontainer.scrollTop=this.$refs.messagecontainer.scrollHeight //保证对话框滑动条位于最底部
        }
    }
</script>

<style scoped>
    @import '../public/stylesheets/tupian-icon-font/iconfont.css';
    @import '../public/stylesheets/emotion-icon-font/iconfont.css';
    @import '../public/stylesheets/closeButton-icon-font/iconfont.css';

    #chatPageContainer{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }
    #chat-name-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 8%;
        font-family: 等线;
        text-align:center;
        border-bottom: solid 1px #E5E5E5;
    }
    #message-container{
        height: 62%;
        overflow: auto;
    }
    #form-container{
        height: 30%;
        position: relative;
        display: flex;
        border-right: solid 1px #F5F5F5;
        border-bottom: solid 1px #F5F5F5;
        border-top: solid 1px #E5E5E5;
    }
    #send{
        display: flex;
        width: 100%;
    }
    textarea{
        border-color: #F5F5F5;
        width: 100%;
        padding-left: 10px;
        background-color: #F5F5F5;
        outline: none;
        resize: none;
        font-size: 16px;
        font-family: sans-serif;
    }
    input[type=submit]{
        position: absolute;
        border: 1px solid #d5d5d5;
        right: 3px;
        bottom: 3px;
        background-color: #F5F5F5;
        width: 60px;
        height: 25px;
        outline: none;
    }
    input[type=submit]:hover{
        background-color: #09BB07;
    }
    #form-container #sendImageInput{
        position: absolute;
        z-index:-99;
    }
    #form-container .icon-tupian{
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 20px;
        color: darkgray;
    }
    #form-container .icon-tupian:hover{
        color: black;
        cursor: pointer;
    }
    #form-container .icon-biaoqing{
        position: absolute;
        top: 10px;
        left: 40px;
        font-size: 20px;
        color: darkgray;
    }
    #form-container .icon-biaoqing:hover{
        color: black;
        cursor: pointer;
    }
    #form-container .emotionsPop{
        position: absolute;
        left: -20%;
        bottom: 100%;
        width: 400px;
        height: 300px;
        background-color: white;
        border-radius: 3px;
        box-shadow: 0 0 3px gray;
    }
    #form-container .emotionsPop .closeButtonContainer{
        display: flex;
        justify-content: flex-end;
    }
    #form-container .emotionsPop .closeButtonContainer .icon-tubiaoguifan{
        padding: 4px;
    }
    #form-container .emotionsPop .closeButtonContainer .icon-tubiaoguifan:hover{
        background-color: red;
        color: white;
    }
    #form-container .emotionsPop .emotionsContainer{
        margin: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        height: 200px;
        overflow: auto;
    }
    .emotionsPop .emotionsContainer .emotionImage:hover{
        box-shadow: 0 0 3px gray;
    }
    #form-container .sendImage{
        position: absolute;
        top: 35px;
        left: 10px;
    }
    #form-container .sendVideo{
        position: absolute;
        top: 35px;
        left: 10px;
    }
    #message-container ul{
        list-style-type: none;
        padding-left: 0px;
    }
    .selfmsg{
        margin: 30px 10px 30px 0;
        display: flex;
        justify-content: flex-end;
    }
    .othermsg{
        margin: 30px 0 30px 10px;
        display: flex;
        justify-content:left;
    }
    .selfmsg .nameAndMsgContainer{
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        padding-right: 10px;
    }
    .othermsg .nameAndMsgContainer{
        display: flex;
        flex-direction: column;
        padding-left: 10px;
    }
    .selfmsg .nameAndMsgContainer .username{
        margin: 2px;
        color: #999;
        font-size: 14px;
    }
    .selfmsg .nameAndMsgContainer .msg{
        background-color: #9EEA6A;
        max-width: 250px;
        padding: 8px;
        margin: 2px;
        border-radius: 6px;
        word-break: break-all;
    }
    .selfmsg .nameAndMsgContainer .msg .messagePicture:hover{
        cursor: pointer;
    }
    .selfmsg .img{
        margin-top: 4px;
        border-radius: 2px;
    }
    .selfmsg .img:hover{
        cursor: pointer;
    }
    .othermsg .nameAndMsgContainer .username{
        margin: 2px;
        color: #999;
        font-size: 14px;
    }
    .othermsg .nameAndMsgContainer .msg{
        background-color: #FFFFFF;
        border: 1px solid #eee;
        max-width: 250px;
        padding: 8px;
        margin: 2px;
        border-radius: 6px;
        word-break: break-all;
    }
    .othermsg .nameAndMsgContainer .msg .messagePicture:hover{
        cursor: pointer;
    }
    .othermsg .img{
        margin-top: 4px;
        border-radius: 2px;
    }
    .othermsg .img:hover{
        cursor: pointer;
    }
</style>