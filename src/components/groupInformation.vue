<template>
    <div class="groupInformationContainer">
        <div class="groupNameContainer">
            <div class="groupName">
                {{groupName}}
            </div>
        </div>
        <div class="clapContainer">  <!--这里加一层主要是为了使下面的flex容器不设置高度，防止flex内容每次都充满-->
            <div class="groupMembersContainer">
                <div class="memberInformation" v-for="member in groupMembers">
                    <img class="memberUrl" :src="member.url" width="50px" height="50px">
                    <div class="memberName">{{member.name}}</div>
                </div>
            </div>
        </div>
        <div class="sendButtonContainer">
            <button class="sendButton">发送消息</button>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                temporaryGroupMembers: []
            }
        },
        methods :{

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
                        return `群组(${groupObject.numbers})`
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
                        return `群组(${groupObject.numbers})`
                    }
                }
            },
            groupMembers: function(){
                if(this.$store.state.groupInformationName==='messages'){
                    this.$http.get('/getFriendsList').then((data)=>{
                        this.temporaryGroupMembers=data.body.message
                    })
                }
                else {
                    this.temporaryGroupMembers=this.$store.state.groupList.find((item)=>{
                        return item.name===this.$store.state.groupInformationName
                    }).members
                }
                return this.temporaryGroupMembers
            }
        }
    }
</script>

<style scoped>
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
        padding: 10px 40px 30px 40px;
    }
    .memberInformation{
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px;
    }

    .memberInformation:hover{
        background-color: lightgray;
        cursor: pointer;
    }
    .memberUrl{
        border-radius: 3px;
    }
    .memberName{
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
</style>