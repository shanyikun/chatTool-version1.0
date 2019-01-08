<template>
    <div class="groupInformationContainer" ref="groupInformationContainer">
        <div class="groupNameContainer">
            <div class="groupName">
                {{groupName}}
            </div>
        </div>
        <div class="clapContainer">  <!--这里加一层主要是为了使下面的flex容器不设置高度，防止flex内容每次都充满-->
            <div class="groupMembersContainer">
                <div class="memberInformation" v-for="member in groupMembers" @click="getMemberInformation(member)">
                    <img class="memberUrl" :src="member.url" width="50px" height="50px">
                    <div class="memberName" :title="member.name">{{member.name | formatName}}</div>
                </div>
            </div>
        </div>
        <div class="sendButtonContainer">   <!--发送消息按钮，绝对定位-->
            <button class="sendButton" @click="sendMessage">发送消息</button>
        </div>

        <div class="memberInformationPop" :style="styleObject" v-if="isDisplayMemberInfoPop"
             @click.self="closeMemberInformationPop">   <!--用户详细信息弹窗，绝对定位,相对于groupInformationContainer-->
            <div class="popMemberInformation" @click.self="closeMemberInformationPop">
                <div class="popMemberName">{{memberName}}</div>
                <img class="popMemberUrl" :src="memberUrl" width="45px" height="45px" @click="biggerMemberHeadPortrait">
            </div>
            <div class="popButtonContainer" @click.self="closeMemberInformationPop">
                <div class="iconfont icon-xiaoxi" v-if="isFriend" @click="sendMessageToMember(memberName)"></div>
                <div class="iconfont icon-woziji" v-else-if="$store.state.name===memberName"></div>
                <div class="iconfont icon-add-friends_icon" v-else @click="addFriend"></div>
            </div>
            <div class="popPromptMessage" @click.self="closeMemberInformationPop">
                <div v-if="isFriend&&isDisplayPromptMessage">此用户不在线！</div>
                <div v-if="!isFriend&&isDisplayPromptMessage">添加好友请求已发送！</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                temporaryGroupMembers: [],
                memberName: '',
                memberUrl: '',
                isFriend: true,
                isDisplayPromptMessage: false,
                isDisplayMemberInfoPop: false,
                styleObject: {},
                timeoutReturnValue: null
            }
        },
        methods :{
            sendMessage: function(){
                this.$router.push({path: '/onlineUserList', query: {name: this.$store.state.groupInformationName}})
                this.$store.state.userInfoIconFontSwitchFlag=!this.$store.state.userInfoIconFontSwitchFlag
            },
            getMemberInformation: function(member){   // 获取成员详细信息弹出框
                let containerPosition=this.$refs.groupInformationContainer.getBoundingClientRect()
                let left=event.clientX-containerPosition.left
                let top=event.clientY-containerPosition.top
                this.memberName=member.name
                this.memberUrl=member.url
                this.$set(this.styleObject, 'left', left+'px')
                this.$set(this.styleObject, 'top', top+'px')
                this.isFriend=this.$store.state.friendsList.some((item)=>{  // 判断是否是好友
                    return item.name===member.name
                })
                this.isDisplayMemberInfoPop=true
            },
            closeMemberInformationPop: function(){
                if(this.isDisplayMemberInfoPop){
                    this.isDisplayMemberInfoPop=false
                }
            },
            biggerMemberHeadPortrait: function(){   // 群组成员头像放大，以子组件触发父组件函数的形式
                let memberObject={}
                memberObject.name=this.memberName
                memberObject.url=this.memberUrl
                this.$emit('group-member-head-portrait-enlargement', memberObject)
                this.closeMemberInformationPop()   // 触发关闭群粗成员详情弹窗函数
            },
            sendMessageToMember: function(memberName){   // 向成员发送信息
                let isOnline=this.$store.state.onlineUserList.some((item)=>{
                    return item.name===memberName
                })
                if(isOnline){
                    this.$router.push({path: '/onlineUserList', query: { name: memberName}})
                    this.$store.state.userInfoIconFontSwitchFlag=!this.$store.state.userInfoIconFontSwitchFlag
                }
                else {
                    this.isDisplayPromptMessage=true
                    if(this.timeoutReturnValue){
                        clearTimeout(this.timeoutReturnValue)
                    }
                    this.timeoutReturnValue=setTimeout(()=>{
                        this.isDisplayPromptMessage=false
                    }, 2000)
                }
            },
            addFriend: function(){   // 加成员为好友
                this.$store.state.socket.emit('addFriendRequest', {name: this.$store.state.name, url: this.$store.state.url}, {name: this.memberName, url: this.memberUrl})
                this.isDisplayPromptMessage=true
                if(this.timeoutReturnValue){
                    clearTimeout(this.timeoutReturnValue)
                }
                this.timeoutReturnValue=setTimeout(()=>{
                    this.isDisplayPromptMessage=false
                }, 2000)
            }
        },
        computed: {
            groupName: function(){
                if(this.$route.query.name){  // 经过群组列表切换过来
                    if(this.$route.query.name==='messages'){
                        this.$store.state.groupInformationName=this.$route.query.name
                        return 'messages'
                    }
                    else {
                        let groupObject=this.$store.state.groupList.find((item)=>{
                            return item.name===this.$route.query.name
                        })
                        this.$store.state.groupInformationName=this.$route.query.name
                        return `${groupObject.nickname}(${groupObject.numbers})`
                    }
                }
                else if(['/groupList', '/groupInformation'].indexOf(this.$store.state.routePath[0])===-1){   // 经过字体图标从非groupList、groupInformation页面切换过来，显示第一个群组的信息
                    let firstGroup=this.$store.state.groupList[0]
                    this.$store.state.groupInformationName='messages'
                    return 'messages'
                }
                else {   // 从groupList、groupInformation页面切换过来，名字保持不变
                    if(this.$store.state.groupInformationName==='messages'){
                        return 'messages'
                    }
                    else {
                        let groupObject=this.$store.state.groupList.find((item)=>{
                            return item.name===this.$store.state.groupInformationName
                        })
                        return `${groupObject.nickname}(${groupObject.numbers})`
                    }
                }
            },
            groupMembers: function(){   // 计算属性获取群成员信息
                if(this.$store.state.groupInformationName==='messages'){
                    this.temporaryGroupMembers=this.$store.state.allUserList
                }
                else {
                    this.temporaryGroupMembers=this.$store.state.groupList.find((item)=>{
                        return item.name===this.$store.state.groupInformationName
                    }).members
                }
                return this.temporaryGroupMembers
            }
        },
        filters: {
            formatName: function(name){
                let byteLength=0, formatName=''
                let nameLength=name.length
                for(let i=0; i<nameLength; i++){
                    if(name.charCodeAt(i)>=0x4E00&&name.charCodeAt(i)<=0x9FFF){
                        byteLength+=2       // 若是汉字，则长度加2，因为一个汉字为2byte且占据宽度为两倍的英文字母
                        formatName+=name[i]
                    }
                    else {
                        byteLength++
                        formatName+=name[i]
                    }

                    if(byteLength>=8&&i<nameLength-1){
                        return formatName+'...'
                    }
                    else if(i===nameLength-1){
                        return formatName
                    }
                }
            }
        }
    }
</script>

<style scoped>
    @import '../public/stylesheets/message-icon-font/iconfont.css';   /*引入消息按钮字体图标*/
    @import '../public/stylesheets/addfriend-icon-font/iconfont.css';  /*引入添加好友字体图标*/
    @import '../public/stylesheets/self-icon-font/iconfont.css';    /*引入自己字体图标*/

    .groupInformationContainer{
        height: 100%;
        position: relative;
    }
    .groupNameContainer{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 8%;
        border-bottom: solid 1px lightgray;
    }
    .clapContainer{
        height: 70%;
        overflow: auto;
        margin-top: 20px;
    }
    .groupMembersContainer{
        display: flex;
        flex-wrap: wrap;
        justify-content:space-between;
        padding: 10px 35px 30px 35px;
    }
    .memberInformation{
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px;
        width: 15%;
    }

    .memberInformation:hover{
        background-color: lightgray;
        cursor: pointer;
    }
    .memberUrl{
        border-radius: 3px;
    }
    .memberName{
        margin-top: 8px;
        font-size: 12px;
        color: gray;
    }
    .sendButtonContainer{
        position: absolute;
        bottom: 20px;
        text-align: center;
        width: 100%;
    }
    .sendButton{
        height: 35px;
        width: 120px;
        background-color:#1AAD19;
        color: white;
        border: none;
        outline: none;
    }
    .sendButton:hover{
        background-color: #148B14;
        cursor: pointer;
    }
    .memberInformationPop{
        position: absolute;
        width: 200px;
        height: 150px;
        background-color: white;
        box-shadow: 0 0 3px gray;
        border-radius: 3px;
        padding: 20px;
    }
    .memberInformationPop .popMemberInformation{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid lightgray;
    }
    .memberInformationPop .popMemberInformation .popMemberUrl:hover{
        cursor: pointer;
    }
    .memberInformationPop .popButtonContainer{
        display: flex;
        justify-content: flex-end;
    }
    .memberInformationPop .popButtonContainer .icon-add-friends_icon{
        color: gray;
        font-size: 20px;
    }
    .memberInformationPop .popButtonContainer .icon-woziji{
        color: gray;
        font-size: 20px;
    }
    .memberInformationPop .popButtonContainer .icon-xiaoxi{
        font-size: 24px;
        color: gray;
    }
    .memberInformationPop .popButtonContainer .iconfont:hover{
        cursor: pointer;
        color: black;
    }
    .memberInformationPop .popPromptMessage{
        display: flex;
        justify-content: flex-end;
        color: red;
    }
</style>