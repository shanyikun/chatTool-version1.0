<template>
    <div id="chatPageContainer">
        <div id="chat-name-container">
            <h4>
                当前对话人:
                <span>{{currentInterlocutor}}</span>
            </h4>
        </div>
        <div id="message-container" ref="messageContainer">
            <ul>
                <template v-for="message in $store.state.messageList">
                    <li class="selfmsg" v-if="message.name===$store.state.name">
                        <div class="nameAndMsgContainer">
                            <p class="msg">{{message.message}}</p>
                        </div>
                        <img class="img" v-if="message.url" :src="message.url"  width="35px" height="35px"
                             @click="getFriendInformation(message)">
                    </li>
                    <li class="othermsg" v-else>
                        <img class="img" v-if="message.url" :src="message.url" width="35px" height="35px"
                             @click="getFriendInformation(message)">
                        <div class="nameAndMsgContainer">
                            <p class="username" v-if="currentInterlocutor==='messages'">{{message.name}}</p>
                            <p class="msg">{{message.message}}</p>
                        </div>
                    </li>
                </template>
            </ul>
        </div>
        <div id="form-container" ref="formContainer">
            <form action="" id="send" @submit.prevent="sendMessage">
                <textarea v-model="message" ref="textarea" :style="styleObject"
                          @focus="focus" @blur="blur" ></textarea>
                <input type="submit" value="send">
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                message:'',
                styleObject: {
                    height: '100px'
                }
            }
        },
        methods: {
            sendMessage: function(){
                var name=this.$store.state.name
                var url=this.$store.state.url
                var to

                if(this.$route.query.name===undefined){
                    to='messages'
                }
                else {
                    to=this.$route.query.name
                }

                if(this.message!==''){  //向服务器发送消息广播
                    let timeStamp=new Date()
                    let sendObject={name: name, to: to, message: this.message, timeStamp: timeStamp, url: url}
                    this.$store.state.socket.emit('chat message', sendObject)
                }
                else {
                    alert('输入内容不能为空！')
                }
                this.message=''
            },
            focus: function(){
                this.$refs.textarea.style.backgroundColor='white'
            },
            blur: function(){
                this.$refs.textarea.style.backgroundColor='#F5F5F5'
            },
            getFriendInformation: function(friend){
                this.$emit('friend-information-pop', friend)
            }
        },
        computed: {
            messageList: function(){
                return this.$store.state.messageList
            },
            currentInterlocutor: function(){
                if(this.$route.query.name){    //经由在线用户列表项切换过来，或者经由用户详情页面发送消息按钮切换过来
                    this.$store.state.nowChatName=this.$route.query.name
                    return this.$route.query.name
                }
                else if(this.$store.state.routePath[0]==='/friendsList'||this.$store.state.routePath[0]==='/friendInformation'){
                    this.$store.state.nowChatName='messages'
                    return 'messages'    //经由在线用户列表图标切换过来， 前页面是用户列表或者是用户详情
                }
                else {    //经由在线用户列表图标切换， 前页面是在线用户列表或者是chatPage，此时对话人信息不变
                    return this.$store.state.nowChatName
                }
            }
        },
        created: function(){
            if(this.$route.query.name){  //经由在线用户列表项切换过来，或者经由用户详情页面发送消息按钮切换过来
                this.$store.state.messageList=JSON.parse(window.localStorage.getItem(this.$route.query.name))||[]
            }
            else if(['/friendsList','/friendInformation','/'].indexOf(this.$store.state.routePath[0])!==-1){     //经由在线用户列表图标切换过来， 前页面是用户列表或者是用户详情
                this.$store.state.messageList=JSON.parse(window.localStorage.getItem('messages'))||[]
            }
        },
        mounted: function(){
            this.$refs.messageContainer.scrollTop=this.$refs.messageContainer.scrollHeight //保证对话框滑动条位于最底部
            let formContainerElement=this.$refs.formContainer
            this.styleObject.height=window.getComputedStyle(formContainerElement).height
        },
        updated: function(){  //数据更新时执行此函数，重新执行生命周期时不执行此函数
            this.$refs.messageContainer.scrollTop=this.$refs.messageContainer.scrollHeight //保证对话框滑动条位于最底部
        }
    }
</script>

<style scoped>
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
    #form-container{
        height: 30%;
        position: relative;
        display: flex;
        flex-direction: column;
        border-right: solid 1px #F5F5F5;
        border-bottom: solid 1px #F5F5F5;
        border-top: solid 1px #E5E5E5;
    }
    #message-container{
        height: 62%;
        overflow: auto;
    }
    #send{
        display: flex;
        flex-direction: column;
    }
    textarea{
        border-color: #F5F5F5;
        width: 99%;
        background-color: #F5F5F5;
        outline: none;
        resize: none;
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
    .othermsg .img{
        margin-top: 4px;
        border-radius: 2px;
    }
    .othermsg .img:hover{
        cursor: pointer;
    }
</style>