<template>
    <div id="page">
        <div id="container">
            <div id="userInfo">
                <userinfo
                        @user-head-portrait-pop="userHeadPortraitPop"
                        @user-setting-pop="userSettingPop">  <!--监听用户头像弹出框事件,监听用户设置弹出框-->
                </userinfo>   <!--用户详情页  不需要通过路由-->
            </div>
            <div id="userList">
                <router-view name="userInfo" :sendmessageflag="sendMessageFlag" :friendname="friendName"></router-view>
            </div>
            <div id="messageContainer">
                <router-view name="chatPage" :key="flag()"
                             @friend-information-pop="friendInformationPop"
                             @picture-message-enlargement="pictureMessagePop"> <!--监听好友信息弹窗自定义事件, 监听图片信息点击放大事件-->
                </router-view>    <!--渲染同一个组件时禁止复用-->
            </div>
        </div>

        <div class="friendInformationPop" v-if="isDisplayFriendInformation"><!--好友信息弹出框，绝对定位，相对于页面，放在这里是为了使其位置可以相对于界面-->
            <div class="popButton">
                <div @click="closeFriendInformationPop" class="closeButton iconfont icon-tubiaoguifan"></div>
            </div>
            <div class="friendInformationContainer">
                <div class="friendName">{{friendName}} </div>
                <img :src="friendUrl" class="friendHeadPortrait" width="45px" height="45px"
                     @click="biggerFriendHeadPortrait">
            </div>
            <div class="messageButtonContainer">
                <div class="messageButton iconfont icon-xiaoxi" title="发送消息" v-if="isFriend()" @click="sendMessage"></div>
                <div class="messageButton iconfont icon-add-friends_icon" title="添加好友" v-else @click="sendAddFriendRequest"></div>
            </div>
            <div class="promptMessage" v-if="isFriend()&&isDisplayPromptMessage">此用户不在线！</div>  <!--同时满足是朋友和提示消息-->
            <div class="promptMessage" v-else-if="(!isFriend())&&isDisplayPromptMessage">请求已发送！</div>  <!--同时满足不是朋友和提示消息-->
        </div>

        <div class="biggerFriendHeadPortraitPop" v-if="isDisplayFriendHeadPortrait"> <!--好友头像放大弹出框，绝对定位-->
            <div class="popButton">
                <div @click="closeFriendHeadPortraitPop" class="closeButton iconfont icon-tubiaoguifan"></div>
            </div>
            <div class="popPictureContainer">
                <img class="picture" :src="friendUrl" :width="pictureWidth" :style="popPictureStyle"
                     @mousewheel="mouseWheelUpdatePictureSize"
                     @mousedown.prevent="popPictureMouseDown">  <!--鼠标滚轮缩放图片， mousedown事件拖放图像-->
            </div>                            <!--不同于键盘的keypress事件一直按下会多次触发，mousedown只会触发一次-->
        </div>

        <div class="biggerUserHeadPortraitPop" v-if="isDisplayUserHeadPortrait">  <!--用户头像放大框，绝对定位-->
            <div class="popButton">
                <div @click="closeUserHeadPortraitPop" class="closeButton iconfont icon-tubiaoguifan"></div>
            </div>
            <div class="popPictureContainer">
                <img class="picture" :src="$store.state.url" :width="pictureWidth" :style="popPictureStyle"
                     @mousewheel="mouseWheelUpdatePictureSize"
                     @mousedown.prevent="popPictureMouseDown"> <!--鼠标滚轮缩放图片， mousedown事件拖放图像-->
            </div>
        </div>

        <div class="userSettingPop" v-if="isDisplayUserSettingPop">    <!--用户设置弹出框，绝对定位-->
            <div class="popButton">
                <div class="popName">设置</div>
                <div @click="closeUserSettingPop" class="closeButton iconfont icon-tubiaoguifan"></div>
            </div>
            <div class="settingListContainer">
                <div class="settingList">
                    <ul class="settingListUl">
                        <li class="accountSettings" :style="settingsStyleList[0]"
                            @click="accountSettings" >
                            账号设置
                        </li>
                        <li class="uploadUserHeadPortrait" :style="settingsStyleList[1]"
                            @click="uploadUserHeadPortrait" >
                            上传头像
                        </li>
                        <li class="clearCache" :style="settingsStyleList[2]"
                            @click="clearCache">
                            清理缓存
                        </li>
                        <li class="addFriend" :style="settingsStyleList[3]"
                            @click="addFriend">
                            添加好友
                        </li>
                    </ul>
                </div>

                <div class="settingContainer" v-if="isDisplayUploadUserHeadPortrait">  <!--只能显示一个-->
                    <div class="iconfont icon-shangchuantupian">
                        <input type="file" name="userHeadPortrait" multiple ref="fileInput" @change="getFileName">
                    </div>
                    <div class="uploadFileName">{{imageName}}</div>
                    <div class="iconfont icon-shangchuan" @click="updateUserHeadPortrait" title="上传"></div>
                </div>
                <div class="settingContainer" v-if="isDisplayAccountSettings">   <!--只能显示一个-->
                    <div class="accountSettings">
                        <img :src="$store.state.url" width="60px" height="60px" class="userHeadPortrait">
                        <div class="userName">{{$store.state.name}}</div>
                        <a href="/logout">退出账号</a>
                    </div>
                </div>
                <div class="settingContainer" v-if="isDisplayClearLocalStorageCache">  <!--只能显示一个-->
                    <div class="clearCacheSettings">
                        <button class="clearCacheButton" @click="clearLocalStorageCache">清理缓存({{computeLocalStorageCacheSize()}})</button>
                    </div>
                </div>
                <div class="settingContainer" v-if="isDisplayAddFriend">    <!--只能显示一个-->
                    <div class="searchContainer">
                        <input type="text" class="searchInput" v-model="searchContent">
                        <button class="searchButton" @click="searchInformation">搜索</button>
                        <button class="addHistoryButton" @click="addHistoryInformation">添加历史</button>
                    </div>
                </div>
                <div class="settingContainer" v-if="isDisplaySearchInformation">  <!--这是searchContainer的二级页面，搜索详情页，显示时覆盖搜索页面-->
                    <template v-if="isSearchResultNull">
                        <div class="searchInformationContainer">
                            <div class="returnButtonContainer">
                                <div class="iconfont icon-fanhui" @click="returnSearchContainer"></div>
                            </div>
                            <div class="friendInformationContainer">
                                <div class="noUserPrompt">
                                    用户不存在！
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="searchInformationContainer">
                            <div class="returnButtonContainer">
                                <div class="iconfont icon-fanhui" @click="returnSearchContainer"></div>
                            </div>
                            <div class="friendInformationContainer">
                                <div class="friendName"> {{friendName}} </div>
                                <img :src="friendUrl" class="friendHeadPortrait" width="45px" height="45px">
                            </div>
                            <div class="addFriendButtonContainer">
                                <template v-if="isAddFriendButton">
                                    <button class="addFriendButton" @click="sendAddFriendRequest">添加好友</button>
                                    <div class="addFriendPromptMessage" v-if="isDisplayPromptMessage">好友请求已发送！</div>
                                </template>
                                <template v-else>
                                    <button class="addFriendButton" @click="sendMessage">发送消息</button>
                                    <div class="addFriendPromptMessage" v-if="isDisplayPromptMessage">此用户不在线！</div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="settingContainer" v-if="isDisplayAddHistoryInformation">  <!--这是searchContainer的二级页面，添加好友历史，显示时覆盖搜索页面-->
                    <div class="addHistoryContainer">
                        <div class="returnButtonContainer">
                            <div class="iconfont icon-fanhui" @click="returnSearchContainer"></div>
                        </div>
                        <div class="historyFriendContainer">
                            <div class="requestFriendsList">
                                <div class="title">自己发起的请求</div>
                                <ul>
                                    <template v-if="requestFriendsList.length!==0">
                                        <li v-for="item in requestFriendsList" :key="flag()">
                                            <img width="45px" height="45px" :src="item.url">
                                            <div :title="item.name">{{item.name | formatName}}</div>
                                            <div v-if="item.isAccept" class="isAccept">已接受</div>
                                            <div v-else class="isAccept">未接受</div>
                                        </li>
                                    </template>
                                    <template v-else>
                                        <li class="noRequest">暂无请求数据！</li>
                                    </template>
                                </ul>
                            </div>
                            <div class="acceptFriendsList">
                                <div class="title">对方发起的请求</div>
                                <ul>
                                    <template v-if="acceptFriendsList.length!==0">
                                        <li v-for="item in acceptFriendsList" :key="flag()">
                                            <img width="45px" height="45px" :src="item.url">
                                            <div :title="item.name">{{item.name | formatName}}</div>
                                            <div v-if="item.isAccept" class="isAccept">已接受</div>
                                            <div v-else><button @click="acceptFriendRequest(item)">接受</button></div>
                                        </li>
                                    </template>
                                    <template v-else>
                                        <li class="noRequest">暂无请求数据!</li>
                                    </template>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="promptMessage" ref="updatePromptMessage"></div>
        </div>

        <div class="pictureMessagePop" v-if="isDisplayPictureMessagePop">  <!--图片消息放大弹出框,绝对定位-->
            <div class="popButton">
                <div @click="closePictureMessagePop" class="closeButton iconfont icon-tubiaoguifan"></div>
            </div>
            <div class="popPictureContainer">
                <img class="picture" :src="pictureMessageURL" :width="pictureWidth" :style="popPictureStyle"
                     @mousewheel="mouseWheelUpdatePictureSize"
                     @mousedown.prevent="popPictureMouseDown">  <!--鼠标滚轮缩放图片， mousedown事件拖放图像-->
            </div>
        </div>

    </div>
</template>

<script>
import userInfo from './userInfo.vue'     //引入用户详情组件   绝对路径引入会出错

/*var userInfo={    //在vue文件中使用组件模板对象也无效
    template: '<h1>asdasd</h1>'
}*/

 export default {
     data: function(){
         return {
             isDisplayFriendInformation: false,  //是否显示好友信息弹窗
             isDisplayFriendHeadPortrait: false,  //是否显示好友头像弹出框
             isDisplayUserHeadPortrait: false,    //是否显示用户头像弹出框
             isDisplayPromptMessage: false,     //是否显示用户不在线提示消息
             isDisplayUserSettingPop: false,   // 是否显示用户设置弹窗
             isDisplayPictureMessagePop: false,  // 是否像是图片消息放大弹窗
             timeOutReturnValue: null,      //消息提示定时器返回值
             friendName: '',   //好友名
             friendUrl: '',     //好友头像链接
             sendMessageFlag: false,    //好友信息弹出框发送信息标志位，用于向onlineUserList子组件传递发送信息标志以触发子组件内的getChatPage函数
             imageName: '',   //上传图片名字
             searchContent: '',  // 搜索内容
             isDisplayUploadUserHeadPortrait: false,   // 用户设置框内选项切换显示标志
             isDisplayAccountSettings: true,     // 用户设置框内选项切换显示标志
             isDisplayClearLocalStorageCache: false,  // 用户设置框内清理缓存选项显示标志
             isDisplayAddFriend: false,   // 用户设置添加好友切换显示标志
             isDisplaySearchInformation: false,   // 用户设置添加好友搜索详情页标志
             isDisplayAddHistoryInformation: false, // 用户设置添加历史详情页标志
             isSearchResultNull: '',    // 搜索好友结果是否为空
             isAddFriendButton: '',
             settingsStyleList: [
                 {color: '#09BB07', borderRight: 'solid 2px #09BB07' },
                 {color: '', borderRight: ''},
                 {color: '', borderRight: ''},
                 {color: '', borderRight: ''}
                 ],   //设置弹出框动态列表样式
             pictureMessageURL: '',   // 图片消息base64格式
             pictureWidth: '250px',   // 图片弹出框图片尺寸
             popPictureStyle: {left: 0,top: 0},  // 图片弹出框图片定位样式
             requestFriendsList: [],   // 发起请求列表
             acceptFriendsList: []    // 接受请求列表
         }
     },
     methods: {
         flag: function(){  // 为每一个聊天框加上一个唯一标识，防止组件复用
             return Date.now()
         },
         friendInformationPop : function(friend){  //第一个参数默认是子组件传递过来的参数
             this.friendName=friend.name
             this.friendUrl=friend.url
             this.isDisplayFriendInformation=true
         },
         biggerFriendHeadPortrait: function(){    //显示放大版好友头像
             this.isDisplayFriendInformation=false
             this.isDisplayFriendHeadPortrait=true
         },
         userHeadPortraitPop: function(){    //显示放大版用户头像
             this.isDisplayUserHeadPortrait=true
         },
         pictureMessagePop: function(pictureMessageURL){   // 显示图片消息放大版
             this.isDisplayPictureMessagePop=true
             this.pictureMessageURL=pictureMessageURL
         },
         closeFriendInformationPop: function(){   //关闭好友信息弹窗
             this.isDisplayFriendInformation=false
         },
         closeFriendHeadPortraitPop: function(){   //关闭好友头像弹窗
             this.isDisplayFriendHeadPortrait=false
             this.pictureWidth='250px'
             this.popPictureStyle={left: 0, top: 0}
         },
         closeUserHeadPortraitPop: function(){    //关闭用户头像弹窗
             this.isDisplayUserHeadPortrait=false
             this.pictureWidth='250px'
             this.popPictureStyle={left: 0, top: 0}
         },
         closePictureMessagePop: function(){   // 关闭图片消息放大弹窗
             this.isDisplayPictureMessagePop=false
             this.pictureWidth='250px'
             this.popPictureStyle={left: 0, top: 0}
         },
         userSettingPop: function(){   // 打开用户设置弹窗
             this.isDisplayUserSettingPop=true
         },
         closeUserSettingPop: function(){
             this.isDisplayUserSettingPop=false
             this.imageName=''    //清空图片名
             this.isDisplayAccountSettings=true  //设置账户设置模块在下次设置弹窗弹出时默认显示
             this.isDisplayUploadUserHeadPortrait=false  //其他模块不显示
             this.isDisplayClearLocalStorageCache=false   //其他模块不显示
             this.isDisplayAddFriend=false    //其他模块不显示
             this.isDisplaySearchInformation=false  //其他模块不显示
             this.isDisplayAddHistoryInformation=false //其他模块不显示
             this.settingsStyleList.forEach(function(item, index){
                 if(index===0){  //保证账户设置列表项颜色为选中颜色, 保证账户设置列表项存在右边框
                     item.color='#09BB07'
                     item.borderRight='solid 2px #09BB07'
                 }
                 else {    // 同时使别的列表项无选中颜色且无右侧边框
                     item.color='black'
                     item.borderRight='none'
                 }
             })
             this.$store.state.userInfoIconFontSwitchFlag=!this.$store.state.userInfoIconFontSwitchFlag  //用户详情页切换字体图标标志，用以保证在关闭弹窗时能切换到正确的字体图标
         },
         accountSettings: function(){
             this.isDisplayAccountSettings=true
             this.isDisplayUploadUserHeadPortrait=false
             this.isDisplayClearLocalStorageCache=false
             this.isDisplayAddFriend=false
             this.isDisplaySearchInformation=false
             this.isDisplayAddHistoryInformation=false
             this.settingsStyleList.forEach(function(item, index){  // 设置列表项选中颜色和边框并设置未选中列表项无颜色无边框
                 if(index===0){
                     item.color='#09BB07'
                     item.borderRight='solid 2px #09BB07'
                 }
                 else {
                     item.color='black'
                     item.borderRight='none'
                 }
             })
         },
         uploadUserHeadPortrait: function(){  // 通上个函数理由
             this.isDisplayUploadUserHeadPortrait=true
             this.isDisplayAccountSettings=false
             this.isDisplayClearLocalStorageCache=false
             this.isDisplayAddFriend=false
             this.isDisplaySearchInformation=false
             this.isDisplayAddHistoryInformation=false
             this.settingsStyleList.forEach(function(item, index){
                 if(index===1){
                     item.color='#09BB07'
                     item.borderRight='solid 2px #09BB07'
                 }
                 else {
                     item.color='black'
                     item.borderRight='none'
                 }
             })
         },
         clearCache: function(){
             this.isDisplayClearLocalStorageCache=true
             this.isDisplayAccountSettings=false
             this.isDisplayUploadUserHeadPortrait=false
             this.isDisplayAddFriend=false
             this.isDisplaySearchInformation=false
             this.isDisplayAddHistoryInformation=false
             this.settingsStyleList.forEach(function(item, index){
                 if(index===2){
                     item.color='#09BB07'
                     item.borderRight='solid 2px #09BB07'
                 }
                 else {
                     item.color='black'
                     item.borderRight='none'
                 }
             })
         },
         addFriend: function(){
             this.isDisplayAddFriend=true
             this.isDisplayClearLocalStorageCache=false
             this.isDisplayAccountSettings=false
             this.isDisplayUploadUserHeadPortrait=false
             this.isDisplaySearchInformation=false
             this.isDisplayAddHistoryInformation=false
             this.settingsStyleList.forEach(function(item, index){
                 if(index===3){
                     item.color='#09BB07'
                     item.borderRight='solid 2px #09BB07'
                 }
                 else {
                     item.color='black'
                     item.borderRight='none'
                 }
             })
         },
         searchInformation: function(){
             if(this.searchContent===''){
                 this.$refs.updatePromptMessage.textContent='请输入好友名称！'
                 if(this.timeOutReturnValue){
                     clearTimeout(this.timeOutReturnValue)
                 }
                 this.timeOutReturnValue=setTimeout(()=>{
                     this.$refs.updatePromptMessage.textContent=''
                 }, 2000)
                 return undefined
             }
             else {
                 this.$http.post('/searchFriend', {name: this.searchContent}).then((data)=>{
                     if(data.body.err_code===500){
                         this.$refs.updatePromptMessage.textContent=data.body.message
                         if(this.timeOutReturnValue){
                             clearTimeout(this.timeOutReturnValue)
                         }
                         this.timeOutReturnValue=setTimeout(()=>{
                             this.$refs.updatePromptMessage.textContent=''
                         }, 2000)
                         this.searchContent=''
                         return undefined
                     }
                     else if(data.body.err_code===1){
                         this.searchContent=''
                         this.isSearchResultNull=true
                         this.isDisplayAddFriend=false
                         this.isDisplaySearchInformation = true
                     }
                     else {
                         let isFriendFlag
                         isFriendFlag=this.$store.state.friendsList.some(function(item){
                             return item.name===data.body.message.name
                         })    //  判断搜索结果是否已是好友
                         this.isAddFriendButton=!isFriendFlag
                         this.searchContent=''
                         this.isSearchResultNull=false
                         this.friendName=data.body.message.name
                         this.friendUrl=data.body.message.url
                         this.isDisplayAddFriend=false
                         this.isDisplaySearchInformation = true
                     }
                 })
             }
         },
         addHistoryInformation: function(){
             this.isDisplayAddFriend=false
             this.isDisplayAddHistoryInformation=true
         },
         sendAddFriendRequest: function(){   // 添加好友请求， 通过socket触发添加事件， 上传发起者信息与被请求者信息
             this.$store.state.socket.emit('addFriendRequest', {name: this.$store.state.name, url: this.$store.state.url}, {name: this.friendName, url: this.friendUrl})
             this.isDisplayPromptMessage=true
             if(this.timeOutReturnValue){
                 clearTimeout(this.timeOutReturnValue)
             }
             this.timeOutReturnValue=setTimeout(()=>{
                 this.isDisplayPromptMessage=false
             }, 2000)
            /* this.$http.post('/addFriendRequest', {name:this.friendName}).then((data)=>{
                 if(data.body.err_code!==0){
                     this.$refs.updatePromptMessage.textContent=data.body.message
                     if(this.timeOutReturnValue){
                         clearTimeout(this.timeOutReturnValue)
                     }
                     this.timeOutReturnValue=setTimeout(()=>{
                         this.$refs.updatePromptMessage.textContent=''
                     }, 2000)
                     this.searchContent=''
                     return undefined
                 }
                 else {
                     let flag=window.confirm('好友添加成功，是否刷新页面？')
                     if(flag){
                         window.location.href='/chat'
                     }
                 }
             })*/
         },
         acceptFriendRequest: function(item){    // 接受好友请求事件，上传接受者信息与请求者信息
             this.$store.state.socket.emit('acceptFriendRequest', {name: this.$store.state.name, url: this.$store.state.url}, {name: item.name, url: item.url})
         },
         returnSearchContainer: function(){
             this.isDisplayAddFriend=true
             this.isDisplaySearchInformation=false
             this.isDisplayAddHistoryInformation=false
         },
         computeLocalStorageCacheSize: function(){  // 计算localStorage已用缓存大小
             let cacheString=''
             let localStorageLength=window.localStorage.length
             for(let i=0; i<localStorageLength; i++){
                 let key=window.localStorage.key(i)
                 cacheString+=window.localStorage.getItem(key)
             }
             let byteSize=cacheString.length
             if(byteSize<1000){
                 return byteSize+'B'
             }
             else if(byteSize>=1000&&byteSize<1000000){
                 return (byteSize/1000).toFixed(2)+'KB'
             }
             else {
                 return (byteSize/(1000*1000)).toFixed(2)+'MB'
             }
         },
         clearLocalStorageCache: function(){  // 清空localStorage中的聊天记录
             let promptResult=window.confirm('确定要清空所有聊天记录？')
             if(promptResult){
                 window.localStorage.clear()
                 window.location.replace('/chat')  // 刷新浏览器
             }
         },
         updateUserHeadPortrait: function(){
             let request=new XMLHttpRequest()
             let formData=new FormData()    /*格式化数据，是key/value对*/
             let files=this.$refs.fileInput.files
             if(!files[0]){
                 this.$refs.updatePromptMessage.textContent='请先上传文件！'
                 if(this.timeOutReturnValue){
                     clearTimeout(this.timeOutReturnValue)
                 }
                 this.timeOutReturnValue=setTimeout(()=>{
                     this.$refs.updatePromptMessage.textContent=''
                 }, 2000)
                 return undefined
             }
             formData.append('userHeadPortrait', files[0])
             formData.append('name', this.$store.state.name)
             request.open('post', '/updateUserHeadPortrait', true)
             request.onreadystatechange=()=>{
                 if(request.readyState===4){
                     this.$refs.updatePromptMessage.textContent=request.responseText
                     if(this.timeOutReturnValue){
                         clearTimeout(this.timeOutReturnValue)
                     }
                     this.timeOutReturnValue=setTimeout(()=>{
                         this.$refs.updatePromptMessage.textContent=''
                     }, 2000)
                 }
             }
             request.send(formData)
         },
         getFileName: function(){
             let pathArray=event.target.value.split('\\')   //获取路径
             this.imageName=pathArray[pathArray.length-1]   //获取图片名
         },
         isFriend: function(){   // 判断弹出框中的用户信息是否是好友，主要用于群中的好友详情查看
             if(this.$store.state.ableFriendsList.indexOf(this.friendName)!==-1){
                 return true
             }
             else {
                 return false
             }
         },
         sendMessage: function(){
             if(this.$store.state.onlineUserList.find((item)=>{
                 return item.name===this.friendName
             })!==undefined){   //判断好友是否在线，若在线则发送跳转至发送消息界面
                 if(this.$route.path==='/onlineUserList'||this.$route.path==='/chatPage'){ //判断是在聊天界面还是在好友详情界面触发
                     this.sendMessageFlag=!this.sendMessageFlag  //改变好友信息弹出框发送信息标志位，用于向onlineUserList子组件传递发送信息标志以触发子组件内的getChatPage函数
                     this.isDisplayFriendInformation=false  // 关闭用户信息弹窗
                     this.closeUserSettingPop()  // 关闭用户设置弹窗
                 }
                 else {  //若是在好友详情界面触发
                     this.$router.push({path: '/onlineUserList', query: {name: this.friendName}})
                     this.isDisplayFriendInformation=false
                     this.closeUserSettingPop()  // 关闭用户设置弹窗
                     this.$store.state.userInfoIconFontSwitchFlag=!this.$store.state.userInfoIconFontSwitchFlag  //用户详情页切换字体图标标志，用以保证在发送消息按钮点击时时能切换到在线用户字体图标
                 }
             }
             else {  //若好友不在线则显示消息提示，并定时2s消失
                 this.isDisplayPromptMessage=true
                 if(this.timeOutReturnValue){
                     clearTimeout(this.timeOutReturnValue)
                 }
                 this.timeOutReturnValue=setTimeout(()=>{
                     this.isDisplayPromptMessage=false
                 }, 2000)
             }
         },
         sendMessageAtAddFriend: function(){
         },
         mouseWheelUpdatePictureSize: function(){   // 鼠标滚轮缩放图片
             if(event.wheelDelta>0){
                 this.pictureWidth=parseFloat(this.pictureWidth)+10
             }
             else {
                 this.pictureWidth=parseFloat(this.pictureWidth)-10
             }
         },
         popPictureMouseDown: function(e){    // 拖放图片
             let mouseDownEvent=e
             let clientX=mouseDownEvent.clientX   // 鼠标的视窗坐标
             let clientY=mouseDownEvent.clientY
             let initialLeft=parseFloat(this.popPictureStyle.left)  //初始图片绝对定位左侧距离
             let initialTop=parseFloat(this.popPictureStyle.top)
             mouseDownEvent.target.onmousemove=(e)=>{
                 let mouseMoveEvent=e
                 let nowClientX=mouseMoveEvent.clientX
                 let nowClientY=mouseMoveEvent.clientY
                 this.popPictureStyle.left=initialLeft+nowClientX-clientX+'px'
                 this.popPictureStyle.top=initialTop+nowClientY-clientY+'px'
                 mouseMoveEvent.preventDefault()    // 一定要阻止默认事件
             }
             mouseDownEvent.target.onmouseup=(e)=>{
                 let mouseUpEvent=e
                 mouseDownEvent.target.onmousemove=null
                 mouseDownEvent.target.onmouseup=null
                 mouseUpEvent.preventDefault()   // 一定要阻止默认事件
             }
         }
     },
     filters: {
         formatName: function(name){   // 格式化名字
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

                 if(byteLength>=4&&i<nameLength-1){
                     return formatName+'...'
                 }
                 else if(i===nameLength-1){
                     return formatName
                 }
             }
         }
     },
     components: {
         userinfo: userInfo
     },
     created: function(){
         /*let emotionsList=JSON.parse(window.localStorage.getItem('emotionsList of '+this.$store.state.name))||[]
         if(emotionsList.length===0){
             this.$http.get('/getEmotionsList').then((data)=>{
                 if(data.body.err_code===500){
                     alert(data.body.message)
                 }
                 else {
                      window.localStorage.setItem('emotionsList of '+this.$store.state.name, JSON.stringify(data.body.message)) // localStorage存储空间不够
                     this.$store.state.emotionSrcList=data.body.message
                 }
             })
         }
         else {
             this.$store.state.emotionSrcList=emotionsList
         }*/  // 由于localStorage存储空间不够，所以不能把表情包存储在本地
         this.$http.get('/getEmotionsList').then((data)=>{   // 获取表情包base64格式列表，并存储于$store中
             if(data.body.err_code===500){
                 alert(data.body.message)
             }
             else {
                 this.$store.state.emotionSrcList=data.body.message
             }
         })

         this.$http.get('/getRequestFriendsList').then((data)=>{  // 获取请求好友列表
             if(data.body.err_code!==0){
                 alert(data.body.message)
             }
             else {
                 this.requestFriendsList=data.body.message
             }
         })

         this.$http.get('/getAcceptFriendsList').then((data)=>{  // 获取接受好友列表
             if(data.body.err_code!==0){
                 alert(data.body.message)
             }
             else {
                 this.acceptFriendsList=data.body.message
             }
         })

         this.$store.state.socket.on('addFriendRequest', ()=>{    // 监听添加好友事件
             this.$http.get('/getRequestFriendsList').then((data)=>{
                 if(data.body.err_code!==0){
                     alert(data.body.message)
                 }
                 else {
                     this.requestFriendsList=data.body.message
                 }
             })

             this.$http.get('/getAcceptFriendsList').then((data)=>{
                 if(data.body.err_code!==0){
                     alert(data.body.message)
                 }
                 else {
                     this.acceptFriendsList=data.body.message
                 }
             })
         })

         this.$store.state.socket.on('acceptFriendRequest', (userList)=>{    // 监听接受好友事件
             this.$store.state.addFriendSuccessFlag=!this.$store.state.addFriendSuccessFlag  // 取反添加好友成功标志位
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
                     this.$store.commit('getOnlineUserList', userList)
                     this.$http.get('/getRequestFriendsList').then((data)=>{
                         if(data.body.err_code!==0){
                             alert(data.body.message)
                         }
                         else {
                             this.requestFriendsList=data.body.message
                         }
                     })

                     this.$http.get('/getAcceptFriendsList').then((data)=>{
                         if(data.body.err_code!==0){
                             alert(data.body.message)
                         }
                         else {
                             this.acceptFriendsList=data.body.message
                         }
                     })
                 })
             })
         })
     },
     beforeMount: function(){
     }
 }
</script>

<style scoped>
    @import '../public/stylesheets/closeButton-icon-font/iconfont.css';  /*引入关闭按钮字体图标*/
    @import '../public/stylesheets/message-icon-font/iconfont.css';   /*引入消息按钮字体图标*/
    @import '../public/stylesheets/uploadimage-icon-font/iconfont.css';  /*引入上传图片字体图标*/
    @import '../public/stylesheets/uploadbutton-icon-font/iconfont.css';  /*引入上传按钮字体图标*/
    @import '../public/stylesheets/return-icon-font/iconfont.css';   /*引入返回按钮字体图标*/
    @import '../public/stylesheets/addfriend-icon-font/iconfont.css';  /*引入添加好友字体图标*/

    #page{                           /*页面*/
        display: flex;
        justify-content: space-around;
        position: relative;
    }
    #container{                     /*内容容器*/
        width: 55%;
        min-width: 675px;
        display: flex;
        justify-content: space-around;
        height: 500px;
    }
    #userInfo{                     /*用户详情模块*/
        width: 6%;
        background-color: #27292C;
        text-align: center;
    }
    #userList{                     /*用户列表模块*/
        width: 28%;
        background-color: #EAE8E7;
    }
    #messageContainer{           /*聊天内容模块*/
        width: 66%;
        background-color: #F5F5F5;
    }
    .friendInformationPop{    /*好友信息弹窗模块*/
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);   /*使元素位于页面中间*/
        width: 250px;
        height: 200px;
        box-shadow: 0px 0px 3px gray;
        border-radius: 3px;
        background-color: white;
    }
    .friendInformationPop .friendInformationContainer{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 30px 0 30px;
        padding-bottom: 20px;
        border-bottom: solid 1px lightgray;
    }
    .friendInformationPop .friendInformationContainer .friendHeadPortrait:hover{
        cursor: pointer;
    }
    .friendInformationPop .popButton{
        display: flex;
        justify-content: flex-end;
    }
    .friendInformationPop .popButton .closeButton{
        padding: 4px;
    }
    .friendInformationPop .popButton .closeButton:hover{
        background-color: red;
        color: white;
    }
    .friendInformationPop .messageButtonContainer{
        display: flex;
        justify-content: flex-end;
        margin: 30px 30px 0 30px;
    }
    .friendInformationPop .messageButtonContainer .messageButton{
        font-size: 30px;
        color: gray;
    }
    .friendInformationPop .messageButtonContainer .messageButton:hover{
        color: black;
        cursor: pointer;
    }
    .friendInformationPop .promptMessage{
        margin: 0 30px;
        text-align: right;
        color: red;
        font-size: 14px;
    }
    .biggerFriendHeadPortraitPop, .biggerUserHeadPortraitPop, .pictureMessagePop{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);   /*使元素位于页面中间*/
        width: 250px;
        height: 275px;
        box-shadow: 0px 0px 3px gray;
        border-radius: 3px;
        background-color: white;
        overflow: hidden;   /*因为元素图片容器高度设置为100%，所以会有部分溢出，所以此部分要设置为溢出隐藏*/
    }
    .biggerFriendHeadPortraitPop .popButton, .biggerUserHeadPortraitPop .popButton, .pictureMessagePop .popButton{
        display: flex;
        justify-content: flex-end;
    }
    .biggerFriendHeadPortraitPop .popButton .closeButton, .biggerUserHeadPortraitPop .popButton .closeButton, .pictureMessagePop .popButton .closeButton{
        padding: 4px;
    }
    .biggerFriendHeadPortraitPop .popButton .closeButton:hover, .biggerUserHeadPortraitPop .popButton .closeButton:hover, .pictureMessagePop .popButton .closeButton:hover{
        background-color: red;
        color: white;
    }
    .biggerFriendHeadPortraitPop .popPictureContainer, .biggerUserHeadPortraitPop .popPictureContainer, .pictureMessagePop .popPictureContainer{
        position: relative;  /*绝对定位， 保证图片在图片容器中移动*/
        overflow: hidden;    /*防止图片溢出*/
        height: 100%;     /*在子元素图片为绝对定位且为溢出隐藏时，一定要设置高度，否则内部图片元素高度降为零*/
    }                    /*此容器高度会溢出父元素，所以其父元素也要设置溢出隐藏*/
    .biggerFriendHeadPortraitPop .popPictureContainer .picture, .biggerUserHeadPortraitPop .popPictureContainer .picture, .pictureMessagePop .popPictureContainer .picture{
        position: absolute;
    }
    .biggerFriendHeadPortraitPop .popPictureContainer .picture:hover, .biggerUserHeadPortraitPop .popPictureContainer .picture:hover, .pictureMessagePop .popPictureContainer .picture:hover{
        cursor: all-scroll;
    }
    .userSettingPop{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        width: 500px;
        height: 400px;
        box-shadow: 0px 0px 3px gray;
        border-radius: 3px;
        background-color: white;
    }
    .userSettingPop .popButton{
        display: flex;
        justify-content: space-between;
    }
    .userSettingPop .popButton .popName{
        color: gray;
        padding: 4px;
        font-size: 14px;
    }
    .userSettingPop .popButton .closeButton{
        padding: 4px;
    }
    .userSettingPop .popButton .closeButton:hover{
        background-color: red;
        color: white;
    }
    .userSettingPop .settingListContainer{
        margin: 20px 30px 20px 30px;
        display: flex;
        justify-content: space-between;
    }
    .userSettingPop .settingListContainer .settingList{
        width: 22%;
        border-right: solid gray 1px;
    }
    .userSettingPop .settingListContainer .settingList .settingListUl{
        list-style-type: none;
        padding-left: 0;
        margin: 0;
    }
    .userSettingPop .settingListContainer .settingList .settingListUl li{
        margin-top: 20px;
    }
    .userSettingPop .settingListContainer .settingList .settingListUl li:hover{
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingList .settingListUl .accountSettings{
        margin-top: 0;
    }
    .userSettingPop .settingListContainer .settingContainer{
        width: 78%;
        margin-left: 7%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .userSettingPop .settingListContainer .settingContainer .accountSettings{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    .userSettingPop .settingListContainer .settingContainer .accountSettings .userName{
        margin: 20px 0;
    }
    .userSettingPop .settingListContainer .settingContainer .accountSettings a{
        text-decoration: none;
        border: lightgray solid 1px;
        background-color: lightgray;
        color: black;
        padding: 3px 20px;
        font-size: 14px;
    }
    .userSettingPop .settingListContainer .settingContainer .accountSettings a:hover{
        background-color: darkgray;
    }
    .userSettingPop .settingListContainer .settingContainer .icon-shangchuantupian{
        font-size: 40px;
        position: relative;
    }
    .userSettingPop .settingListContainer .settingContainer .icon-shangchuantupian:hover{
        color:limegreen;
    }
    .userSettingPop .settingListContainer .settingContainer .icon-shangchuantupian input{
        position: absolute;
        display: inline-block;
        left: 0px;
        top: 0px;
        width: 40px;
        height: 40px;
        opacity: 0;
    }
    .userSettingPop .settingListContainer .settingContainer .uploadFileName{
    }
    .userSettingPop .settingListContainer .settingContainer .icon-shangchuan{
        font-size: 30px;
        font-weight: lighter;
        color: gray;
    }
    .userSettingPop .settingListContainer .settingContainer .icon-shangchuan:hover{
        color: black;
    }
    .userSettingPop .settingListContainer .settingContainer .clearCacheSettings{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    .userSettingPop .settingListContainer .settingContainer .clearCacheSettings .clearCacheButton{
        border: lightgray solid 1px;
        background-color: lightgray;
        color: black;
        padding: 3px 20px;
        font-size: 14px;
        outline: none;
    }
    .userSettingPop .settingListContainer .settingContainer .clearCacheSettings .clearCacheButton:hover{
        background-color: darkgray;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .searchContainer{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    .userSettingPop .settingListContainer .settingContainer .searchContainer .searchInput{
        width: 120px;
    }
    .userSettingPop .settingListContainer .settingContainer .searchContainer .searchButton{
        margin: 20px 0;
        width: 120px;
        border: lightgray solid 1px;
        background-color: lightgray;
        color: black;
        padding: 3px 20px;
        font-size: 14px;
        outline: none;
    }
    .userSettingPop .settingListContainer .settingContainer .searchContainer .searchButton:hover{
        background-color: darkgray;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .searchContainer .addHistoryButton{
        width: 120px;
        border: lightgray solid 1px;
        background-color: lightgray;
        color: black;
        padding: 3px 20px;
        font-size: 14px;
        outline: none;
    }
    .userSettingPop .settingListContainer .settingContainer .searchContainer .addHistoryButton:hover{
        background-color: darkgray;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .returnButtonContainer{
        width: 100%;
        display: flex;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .returnButtonContainer .icon-fanhui{
        font-size: 18px;
        color: darkgray;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .returnButtonContainer .icon-fanhui:hover{
        color: black;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .friendInformationContainer{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 20px 0;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .friendInformationContainer .noUserPrompt{
        width: 100%;
        text-align: center;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .addFriendButtonContainer{
        width: 100%;
        text-align: center;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .addFriendButtonContainer .addFriendButton{
        width: 120px;
        border: lightgray solid 1px;
        background-color: lightgray;
        color: black;
        padding: 3px 20px;
        font-size: 14px;
        outline: none;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .addFriendButtonContainer .addFriendButton:hover{
        background-color: darkgray;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .searchInformationContainer .addFriendButtonContainer .addFriendPromptMessage{
        color: red;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer{
        width: 100%;
        height: 100%;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .returnButtonContainer{
        display: flex;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .returnButtonContainer .icon-fanhui{
        font-size: 18px;
        color: darkgray;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .returnButtonContainer .icon-fanhui:hover{
        color: black;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer{
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList{
        width: 100%;
        margin-right: 20px;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList .title{
        font-weight: bold;
        margin-bottom: 20px;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList ul{
        list-style-type: none;
        padding-left: 0;
        margin: 0;
        overflow: auto;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList ul li{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-top: solid 1px lightgray;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList ul li.noRequest{
        justify-content: center;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList ul li:first-child{
        border-top: none;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .requestFriendsList ul li .isAccept{
        color: darkgray;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList{
        width: 100%;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList .title{
        font-weight: bold;
        margin-bottom: 20px;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul{
        list-style-type: none;
        padding-left: 0;
        margin: 0;
        overflow: auto;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul li{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-top: solid 1px lightgray;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul li:first-child{
        border-top: none;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul li .isAccept{
        color: darkgray;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul li button{
        /*border: 1px solid #d5d5d5;*/
        background-color: #1AAD19;
        color: white;
        outline: none;
        border: none;
        height: 30px;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul li button:hover{
        background-color: #148B14;
        cursor: pointer;
    }
    .userSettingPop .settingListContainer .settingContainer .addHistoryContainer .historyFriendContainer .acceptFriendsList ul li.noRequest{
        justify-content: center;
    }
    .userSettingPop .promptMessage{
        margin: 20px 30px 0 30px;
        color: red;
    }
</style>
<!--
 +++关于div p li ul标签嵌套的问题， div嵌套div时，内层div没有margin, div嵌套p时，p有margin
    p不能嵌套div, p也不可以嵌套p, li可以嵌套div且div没有margin, li也可以嵌套p且p没有margin(display: flex时有margin)
    ul嵌套li时，li也没有margin, 只是此时ul有padding-left*,div嵌套ul时，ul有margin 默认都是没有
    padding的,ul嵌套li时ul的padding-left除外
 +++关于内联元素的一些特性， 内联元素即使在同一行，之间也会有间隔，这个间隔既不是margin也不是
    padding,若本身不是内联元素，而是设置display为内联，则之间的间隔属于padding的作用范畴，
    比如背景色会显示出来,若设置为inline-block则背景色不会显示出来，本身是内联元素的一律不会
    显示背景色,但是并不能通过设置padding为零来消除，可以通过float来消除内联元素之间的间隔
-->

<!--关于视窗坐标，和文档坐标：
   element.getBoundingClient()得到的是元素的视窗坐标， 鼠标事件对象的属性event.clientX，得到的是鼠标的视窗坐标
   element.offsetLeft, element.offsetTop得到的是非固定定位和静态定位元素相对于文档或其最近的非固定定位和静态定位元素的坐标，
   也即是element.style.left和element.style.top,区别是坐标不带单位，且在没有用style属性设置的情况下也能读取，而左侧距离和
   右侧距离只有在用style属性设置的情况下才能读取，也可以用window.getComputedStyle(element).left来获取
   所有坐标都不带单位，

   另外： element.offsetWidth和element.offsetHeight可以获取元素的高度和宽度,且没有单位， window没有此属性
   -->

<!--关于滚动条的一些问题
   window.pageXOffset和window.scrollX是一样的， 是滑动条从左侧划过的距离，与element.getBoundingClient()相加即可得到
   文档坐标， element.scrollHeight和element.scrollWidth分别是元素中滑动条能展示的最大元素高度和宽度，也即是不设置隐藏情况下
   元素的实际高度和宽度， window没有这两个属性,只有文档元素有，document也没有，从最祖先的body有 element.scrollTop和element.scrollLeft分别是
   滑动条划过的距离， 和window.scrollX对于窗口的功能是一样的，window也没有这两个属性
-->

<!--关于元素宽度-->

<!--关于flex盒模型：
   flex-direction控制伸缩方向， 默认为横向伸缩，此时flex容器就是盒的最大宽度，例如容器width: 500px;则内部元素不允许超出500px，
   即是内部盒的总宽度(即width+padding+margin+border)超出500px，超出的部分会被截断，且先缩小的是内容区的宽度，纵向默认是充满容器
   的，除非设定高度。 若flex-direction: column,则与上述情况相反，此时纵向可伸缩，横向不可伸缩， 详细例子见chagPage.vue中的文
   本框(<textarea></textarea>>)的详细布局
-->