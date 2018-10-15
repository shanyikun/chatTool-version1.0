<template>
    <div class="friendInformationContainer">
        <div class="friendNameContainer">
            <p>{{friendName}}</p>
            <img :src="friendUrl" width="45px" height="45px" @click="bigger">
        </div>
        <div class="sendButtonContainer">
            <button class="sendButton" @click="send(friendName)">发送消息</button>
        </div>
        <div class="promptContainer" v-if="isShow">
            <p>此用户不在线！</p>
        </div>
    </div>
</template>

<script>
export default {
    data: function(){
        return {
            friendName: '',
            friendUrl: '',
            isShow: false,    //提醒消息是否显示标识符
            timeOutFlag: null   //定时器返回结果的引用
        }
    },
    methods: {
        send: function(friendName){
            if(this.$store.state.onlineUserList.find(function(item){
                return item.name===friendName
            })!==undefined){  //若此用户在线则切换至其对话框
                this.$router.push({path: '/onlineUserList', query: {name: friendName}})
            }
            else {   //若不在线则提示不在线
                if(this.timeOutFlag){   //清除定时器
                    clearTimeout(this.timeOutFlag)
                }
                this.isShow=true
                this.timeOutFlag=setTimeout(()=>{   //设置定时器，两秒后提示消失
                    this.isShow=false
                }, 2000)
            }
        },
        bigger: function(){
            /*window.open(this.friendUrl)*/
            let friendInformationObject={name: this.friendName, url: this.friendUrl}
            this.$emit('friend-information-pop', friendInformationObject) //向父组件传值，并向父组件广播friend-information-pop事件
        }
    },
    computed: {
        friendsList: function(){
            return this.$store.state.friendsList
        },
        firstOfSearchFriendsList: function(){    // 好友列表第一个人的信息
            return this.$store.state.firstOfSearchFriendsList
        }
    },
    watch: {
        friendsList: function(){
            if(this.$route.path==='/'){   //friendsList改变时时触发，且为整个页面进入时触发
                this.friendName=this.$store.state.friendsList[0].name
                this.friendUrl=this.$store.state.friendsList[0].url
                this.$store.state.friendInformationName=this.$store.state.friendsList[0].name //存储好友信息
                this.$store.state.friendInformationUrl=this.$store.state.friendsList[0].url
            }
        },
        firstOfSearchFriendsList: function(){    // 监听好友列表第一个人的信息，若改变则更新
            this.friendName=this.$store.state.firstOfSearchFriendsList.name
            this.friendUrl=this.$store.state.firstOfSearchFriendsList.url
            this.$store.state.friendInformationName=this.$store.state.firstOfSearchFriendsList.name
            this.$store.state.friendInformationUrl=this.$store.state.firstOfSearchFriendsList.url
        }
    },
    created: function(){
        if(this.$route.query.name){   //若是经过点击好友列表切换
            this.friendName=this.$route.query.name
            this.friendUrl=this.$route.query.url
            this.$store.state.friendInformationName=this.$route.query.name  //存储好友信息
            this.$store.state.friendInformationUrl=this.$route.query.url
        }
        else if(this.$store.state.routePath[0]==='onlineUserList'||this.$store.state.routePath[0]==='chatPage'){    //若是经过点击好友列表图标切换，且由在线用户页面切换过来时默认显示第一个用户的数据
            this.friendName=this.$store.state.friendsList[0].name
            this.friendUrl=this.$store.state.friendsList[0].url
            this.$store.state.friendInformationName=this.$store.state.friendsList[0].name  //存储好友信息
            this.$store.state.friendInformationUrl=this.$store.state.friendsList[0].url
        }
        else {   //若是经过点击好友列表图标切换， 且由好友列表页面切换过来时
            this.friendName=this.$store.state.friendInformationName
            this.friendUrl=this.$store.state.friendInformationUrl
        }
    }
}
</script>

<style scoped>
    .friendInformationContainer{
        margin: 0px 15%;
    }
    .friendNameContainer{
        margin-top: 100px;
        padding-bottom: 35px;
        border-bottom: solid 1px lightgray;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .friendNameContainer img:hover{
        cursor: pointer;
    }
    .sendButtonContainer{
        margin-top: 30px;
        text-align: center;
    }
    .sendButton{
        background-color: #1AAD19;
        color: white;
        width: 100px;
        height: 30px;
        border: none;
        outline: none;
    }
    .sendButton:hover{
        background-color: #148B14;
    }
    .promptContainer{
        margin-top: 30px;
        text-align: center;
        color: red;
    }
</style>