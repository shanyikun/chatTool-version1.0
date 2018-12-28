<template>
    <div id="onlineUserListContainer">
        <div class="list-title">
            <h4>在线好友</h4>
        </div>
        <div class="user-list-container">
            <ul id="userList-ul">

                <li class="userList" v-for="item in $store.state.onlineUserList" :ref="item.name" :key="item"
                    @mouseover="over(item.name)"
                    @mouseout="out(item.name)"
                    @click="getChatPage(item.name)">
                    <img :src="item.url" width="35px" height="35px">
                    <div class="nameAndTimeAndLastMessageContainer">
                        <div class="nameAndTimeContainer">
                            <div class="userName" :title="item.name">{{item.name | formatName(item.nickname)}}</div>
                            <div class="timeStamp">{{item.timeStamp}}</div>
                        </div>
                        <div class="lastMessageContainer">
                            {{item.lastMessage}}
                        </div>
                    </div>
                    <p class="message-inform-badge">0</p>
                </li>

            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                flag: '',   //选中列表项标识符，用以在选中新选项时让上次的选中项回复原来的样式
                timeStamp:''
            }
        },
        props: ['sendmessageflag', 'friendname'],
        methods: {
            getChatPage: function(name){
                this.$router.push({path: '/chatPage', query: {name: name}})
                this.$refs[this.flag][0].style.backgroundColor='#EAE8E7'   //列表渲染的ref得到的是数组，需要加上[0]
                this.$refs[name][0].style.backgroundColor='#C4C3C3'
                this.flag=name
                //取消消息提醒徽标
                var badgeElement=this.$refs[name][0].getElementsByClassName('message-inform-badge')[0]
                badgeElement.textContent=0
                badgeElement.style.display='none'
            },
            over: function(item){  //先判断是否是选中的列表项，若是，则不改变样式，背景色返回值为rgb()形式的字符串
                if(this.$refs[item][0].style.backgroundColor!=='rgb(196, 195, 195)'){
                    this.$refs[item][0].style.backgroundColor='#DCDDDE'
                }
            },
            out: function(item){   //同样先判断是否是选中的列表项，若是，则不改变样式
                if(this.$refs[item][0].style.backgroundColor!=='rgb(196, 195, 195)'){
                    this.$refs[item][0].style.backgroundColor='#EAE8E7'
                }
            }
        },
        computed: {
            badgeFlag: function(){   //设置计算属性为徽标标志
                return this.$store.state.badgeFlag
            },
            onlineUserList: function(){   //设置在线用户列表为计算属性
                return this.$store.state.onlineUserList
            },
            sendMessageFlag: function(){
                return this.sendmessageflag
            }
        },
        watch: {    //监听badgeFlag属性，改变时设置消息提醒徽标
            badgeFlag: function(){
                var liElement=this.$refs[this.$store.state.badgeFlag.split('#')[0]][0]
                var badgeElement=liElement.getElementsByClassName('message-inform-badge')[0]
                badgeElement.textContent=parseInt(badgeElement.textContent)+1
                badgeElement.style.display='block'
            },
            onlineUserList: function(){    //监听在线用户列表，用于用户进入或离开时
            },
            sendMessageFlag: function(){
                this.getChatPage(this.friendname)
            }
        },
        filters: {
            formatName: function(name, nickname){   // 格式化名字
                let temporaryName
                if(name.indexOf('***group***')!==-1){  // 群组有昵称，用户暂时没有设定
                    temporaryName=nickname
                }
                else {
                    temporaryName=name
                }
                let byteLength=0, formatName=''
                let nameLength=temporaryName.length
                for(let i=0; i<nameLength; i++){
                    if(temporaryName.charCodeAt(i)>=0x4E00&&temporaryName.charCodeAt(i)<=0x9FFF){
                        byteLength+=2       // 若是汉字，则长度加2，因为一个汉字为2byte且占据宽度为两倍的英文字母
                        formatName+=temporaryName[i]
                    }
                    else {
                        byteLength++
                        formatName+=temporaryName[i]
                    }

                    if(byteLength>=8&&i<nameLength-1){
                        return formatName+'...'
                    }
                    else if(i===nameLength-1){
                        return formatName
                    }
                }
            }
        },
        created: function(){
        },
        mounted: function(){
            if(this.$route.query.name===undefined){   //从在线用户图标切换过来时，默认群聊列表项背景色加深
                this.$refs['messages'][0].style.backgroundColor='#C4C3C3'
                this.flag='messages'
            }
            else {    //从用户详情页面点击进来时，对应用户列表项背景色加深
                this.$refs[this.$route.query.name][0].style.backgroundColor='#C4C3C3'
                this.flag=this.$route.query.name
            }
        },
        updated: function(){
        }
    }
</script>

<style scoped>
    #onlineUserListContainer{
        display: flex;
        flex-direction: column;
    }
    .list-title{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #EEEAE8;
        height: 40px;
        font-family: 等线;
    }
    .user-list-container{
        padding: 0px;
    }
    .user-list-container #userList-ul{
        list-style-type: none;
        padding: 0px;
        margin: 0px;
    }
    #userList-ul li{
        display: flex;
        align-items: center;
        position: relative;
        /*margin: 0px;*/
        padding: 8px 8px;
    }
    #userList-ul li:hover{
       /* background-color:#DCDDDE !important;*/   /*也可以用CSS设置悬浮样式，不过不够灵活，且不设置优先级的话默认很低*/
    }
    .nameTimeStampContainer{
        /*display: flex;
        flex-direction: column;*/
    }
    .nameAndTimeAndLastMessageContainer{
        display: flex;
        flex-direction: column;
        padding-left: 8px;
        width: 100%;
        justify-content: space-between;
    }
    .nameAndTimeContainer{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .lastMessageContainer{
        color: gray;
        font-size: 10px;
    }
    .userName{

    }
    .timeStamp{
        color: gray;
        font-size: 10px;
    }
    .message-inform-badge{
        display: none;
        position: absolute;
        right: 0px;
        top: 0px;
        background-color: red;
        color: white;
        width: 18px;
        height: 18px;
        font-size: 12px;
        border-radius: 50%;
        text-align: center;
        padding: 0px;
        margin: 0px;
    }
</style>