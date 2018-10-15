<template>
    <div>
        <div class="userHeadPortraitContainer">
            <img :src="$store.state.url" width="35px" height="35px" title="账号信息" @click="openUserPop" ref="userInfo">
        </div>
        <!--<div class="iconfont icon-account" title="账号信息" @click="openUserPop" ref="userInfo"></div>-->   <!--字体图标-->
        <!--<div class="iconfont icon-zaixianyonghu" title="在线用户" @click="getOnlineUserList"></div>-->
        <div class="iconfont icon-xiaoxi" title="在线用户" :style="iconFontStyleList[0]"
             @click="getOnlineUserList" @mouseover="over(0)" @mouseout="out(0)"></div>
        <div class="iconfont icon-tongxunlu" title="好友列表" :style="iconFontStyleList[1]"
             @click="getFriendsList" @mouseover="over(1)" @mouseout="out(1)"></div>
        <div class="iconfont icon-shezhi" title="设置" :style="iconFontStyleList[2]"
             @click="getSetPage" @mouseover="over(2)" @mouseout="out(2)"></div>
        <div class="logout-link">
            <a href="/logout">退出</a>
        </div>

        <div id="userPop" ref="userInfoPop" v-show="isDisplayUserPop" @click="closeUserPop">      <!--用户信息弹出框，绝对定位，不影响正文-->
            <div>
                <div>用户名： <i class="username">{{$store.state.name}}</i></div>
                <div>邮箱： <i class="email">{{$store.state.email}}</i></div>
            </div>
            <img class="userHeadPortrait" :src="$store.state.url" width="45px" height="45px"
                 @click="userHeadPortraitPop">
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                isDisplayUserPop: false,
                iconFontStyleList: [{color: ''}, {color: '#09BB07'}, {color: ''}]
            }
        },
        computed: {
            userInfoIconFontSwitchFlag: function(){
                return this.$store.state.userInfoIconFontSwitchFlag
            }
        },
        watch: {
            userInfoIconFontSwitchFlag: function(){   // 监听用户详情字体图标切换标志位， 使图标颜色跟随页面正确变化， 主要监听三处
                if(this.$route.path==='/onlineUserList'||this.$route.path==='/chatPage'){
                    this.iconFontStyleList.forEach(function(item, index){
                        if(index===0){
                            item.color='#09BB07'
                        }
                        else {
                            item.color='darkgray'
                        }
                    })
                }
                else {
                    this.iconFontStyleList.forEach(function(item, index){
                        if(index===1){
                            item.color='#09BB07'
                        }
                        else {
                            item.color='darkgray'
                        }
                    })
                }
            }
        },
        methods: {
            getOnlineUserList: function(){
                this.$router.push('/onlineUserList')
                this.iconFontStyleList.forEach(function(item, index){
                    if(index===0){
                        item.color='#09BB07'
                    }
                    else {
                        item.color='darkgray'
                    }
                })
            },
            getFriendsList: function(){
                this.$router.push('/friendsList')
                this.iconFontStyleList.forEach(function(item, index){
                    if(index===1){
                        item.color='#09BB07'
                    }
                    else {
                        item.color='darkgray'
                    }
                })
            },
            getSetPage: function(){
                this.$emit('user-setting-pop')
                this.iconFontStyleList.forEach(function(item, index){
                    if(index===2){
                        item.color='#09BB07'
                    }
                    else {
                        item.color='darkgray'
                    }
                })
            },
            openUserPop: function(){    //打开或关闭用户信息弹窗
                var userInfoElement=this.$refs.userInfoPop
                if(this.isDisplayUserPop){
                    this.isDisplayUserPop=false
                }
                else {
                    var position=this.$refs.userInfo.getBoundingClientRect()  //获取单击对象位置信息
                    userInfoElement.style.left=parseFloat(position.left)+15+'px'
                    userInfoElement.style.top=parseFloat(position.top)+15+'px'
                    this.isDisplayUserPop=true     //设置弹窗样式
                }
            },
            closeUserPop: function(){    //关闭用户信息弹窗
                this.isDisplayUserPop=false
            },
            userHeadPortraitPop: function(){  //用户头像弹出框，在父组件上显示
                this.$emit('user-head-portrait-pop')
            },
            over: function(index){
                if(this.iconFontStyleList[index].color!=='#09BB07'){
                    this.iconFontStyleList[index].color='white'
                }
            },
            out: function(index){
                if(this.iconFontStyleList[index].color!=='#09BB07'){
                    this.iconFontStyleList[index].color='darkgray'
                }
            }
        },
        created: function(){
        },
        beforeMount: function(){
        }
    }
</script>

<style scoped>
    @import '../public/stylesheets/friends-icon-font/iconfont.css';    /*局部引入字体图标CSS文件  或者可以在main.js中全局引入*/
    @import '../public/stylesheets/onlineuser-icon-font/iconfont.css'; /*如果以绝对路径引入，则不会再打包时引入，而会在运行时以get请求的方式引入*/
    @import '../public/stylesheets/userinfo-icon-font/iconfont.css';
    @import '../public/stylesheets/setting-icon-font/iconfont.css';
    @import '../public/stylesheets/message-icon-font/iconfont.css';

    .userHeadPortraitContainer{
        margin-top: 30px;
    }
    .userHeadPortraitContainer:hover{
        cursor: pointer;
    }
    .iconfont{                /*字体图标样式*/
        font-size: 25px;
        color: darkgray;
        font-weight: lighter;
        margin-top: 30px;
    }
    .logout-link a{          /*退出链接样式*/
        text-decoration: none;
        border: solid 1px darkgray;
        border-radius: 3px;
        color: darkgray;
        font-size: 14px;
    }
    div.iconfont:hover{
        /*color: #9EEA6A;*/
        /*color: white !important;*/   /*像这种样式会经过JS改变的，除非设置important,否则内联样式的优先级高，经过JS改变样式后，外部样式无效*/
    }
    div.logout-link{
        margin-top: 30px;
    }
    div.logout-link a:hover{
        /*color: #9EEA6A;*/
        color: white;
        border: solid 1px white;
    }
    #userPop{       /*用户信息弹出框*/
        display: flex;
        justify-content: space-between;
        /*align-items: center;*/
        position: absolute;
        background-color: white;
        z-index: 5;
        height: 150px;
        width: 250px;
        box-shadow: 0px 0px 3px gray;
        border-radius: 5px;
        padding: 25px;
    }
    #userPop .userHeadPortrait:hover{
        cursor: pointer;
    }
</style>