<template>
    <div id="friendsListContainer">
        <div class="list-title">
            <!--<h4>我的好友</h4>-->
            <!--<input type="search" class="searchInput" v-model="searchInputValue">-->
            <div class="iconfont icon-sousuo-copy" @click="searchFriend(searchInputValue)">
                <input type="search" class="searchInput"  v-model="searchInputValue"
                       @focus="focusUpdateSearchInputBackgroundColor"
                       @blur="blurUpdateSearchInputBackgroundColor">
            </div>
        </div>
        <div class="friends-list-container">
            <ul id="friends-list" v-if="isDisplayAllFriendsList">  <!--若搜索框无值则显示此框-->

                <li class="friends-list" v-for="friend in $store.state.friendsList" :ref="friend.name" :key="test()"
                    @mouseover="over(friend)"
                    @mouseout="out(friend)"
                    @click="getFriendInformation(friend)">    <!--用返回当前时间作为key值确保唯一性，避免复用-->
                    <img :src="friend.url" width="35px" height="35px">
                    <p class="friendName">{{friend.name}}</p>
                </li>

            </ul>
            <ul id="friends-list" v-else>   <!--若搜索框有值则显示此框-->
                <li class="friends-list" v-for="friend in searchFriendsList" :ref="friend.name" :key="test()"
                    @mouseover="over(friend)"
                    @mouseout="out(friend)"
                    @click="getFriendInformation(friend)">
                    <img :src="friend.url" width="35px" height="35px">
                    <p class="friendName">{{friend.name}}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                flag: '',   //选定好友列表项标志位
                searchInputValue: ''  , //搜索框输入值
                /*searchInputContainerStyle: {backgroundColor: '#DBD9D8'},  //这里不能用内联的动态样式，因为会触发updated
                searchInputStyle: {backgroundColor: '#DBD9D8'},*/           //钩子函数
                searchFriendsList: [],   //搜索框搜索结果
                isDisplayAllFriendsList: true,    //是否显示全部好友
                isDisplaySearchFriendsList: false,   //是否显示搜索好友列表
                isAddFriendSuccess: false   // 添加好友是否成功，若成功则为true，否则为false，这里用于判断friendsList的改变是否是由于添加好友所致
            }
        },
        methods: {
            getFriendInformation: function (friend) {  //进入用户详情页
                this.$router.push({path: '/friendInformation', query: {name: friend.name, url: friend.url}})
                this.$refs[this.flag][0].style.backgroundColor = '#EAE8E7'
                this.$refs[friend.name][0].style.backgroundColor = '#C4C3C3'
                this.flag = friend.name
            },
            over: function (friend) {
                if (this.$refs[friend.name][0].style.backgroundColor !== 'rgb(196, 195, 195)') {
                    this.$refs[friend.name][0].style.backgroundColor = '#DCDDDE'
                }
            },
            out: function (friend) {
                if (this.$refs[friend.name][0].style.backgroundColor !== 'rgb(196, 195, 195)') {
                    this.$refs[friend.name][0].style.backgroundColor = '#EAE8E7'
                }
            },
            searchFriend: function(searchInputValue){
            },
            test: function(){
                return new Date()
            },
            focusUpdateSearchInputBackgroundColor: function(){   // onfocus改变输入框背景色
                let searchInputContainerElement=document.getElementsByClassName('icon-sousuo-copy')[0]
                let searchInputElement=document.getElementsByClassName('searchInput')[0]
                searchInputContainerElement.style.backgroundColor='white'
                searchInputElement.style.backgroundColor='white'
               /* this.searchInputContainerStyle.backgroundColor='white'   //对象可以直接更改，如果是数组中的值则不可以直接更改，需要用到this.$set()
               不能用下面的内联数据驱动更新样式，这样会触发updated钩子函数，也不能用ref获取元素，会导致好友列表ref混乱
                this.searchInputStyle.backgroundColor='white'*/
                /*this.$set(this.searchInputContainerStyle, 'backgroundColor', 'white')*/  //也可以用这种方法
            },
            blurUpdateSearchInputBackgroundColor: function(){
                if(this.searchInputValue===''){
                    let searchInputContainerElement=document.getElementsByClassName('icon-sousuo-copy')[0]
                    let searchInputElement=document.getElementsByClassName('searchInput')[0]
                    searchInputContainerElement.style.backgroundColor='#DBD9D8'
                    searchInputElement.style.backgroundColor='#DBD9D8'
                   /* this.searchInputContainerStyle.backgroundColor='#DBD9D8'
                    this.searchInputStyle.backgroundColor='#DBD9D8'*/
                }
            }
        },
        computed: {
            friendsList: function(){
                return this.$store.state.friendsList
            },
            addFriendSuccessFlag: function(){
                return this.$store.state.addFriendSuccessFlag
            }
        },
        watch: {
            friendsList: function(){
                /*实际的friendsList是异步获取的，所以要监听改变,清空$refs对象， 如果不是重启生命周期，只是改变列表数据的话，
                之前的ref并不会被丢弃，而是仍在$refs对象中，同名的ref会被后者替代，但是顺序仍然是之前的顺序，
                不存在的列表项所在ref对应一个空的对象，渲染所得的ref是一个空数组*/
               /* if(this.$route.path==='/'){ */
                if(!this.isAddFriendSuccess){   // 判断是否是添加好友引起的改变，若不是，则执行，若是则不执行
                    this.$refs={}
                }
                /*}  */
            },
            addFriendSuccessFlag: function(){
                this.isAddFriendSuccess=true
            },
            searchInputValue: function(){   //监听搜索框输入
                if(this.searchInputValue===''){   // 若为空，则显示全部好友列表，清空refs
                    this.$refs={}
                    this.isDisplayAllFriendsList=true
                }
                else {     //若不为空，则显示匹配好友列表，清空refs
                    this.$refs={}
                    this.isDisplayAllFriendsList=false
                    this.searchFriendsList=this.$store.state.friendsList.filter((item)=>{
                        return item.name.indexOf(this.searchInputValue)!==-1
                    })
                }
            }
        },
        created: function(){
        },
        beforeMount: function(){
        },
        mounted: function(){   //获取实际列表元素最早要在此钩子函数中
            if(this.$route.path!=='/'){   //通过点击用户列表图标才会进入，设置第一个列表项背景色加深
                var liListObject=this.$refs
                liListObject[Object.keys(liListObject)[0]][0].style.backgroundColor='#C4C3C3'
                this.flag=Object.keys(liListObject)[0]
            }
        },
        updated: function(){              //进入整个页面时用户列表第二次渲染完成时，或者搜索框工作时，点击列表项不会触发，设置第一个列表项颜色加深
            if(!this.isAddFriendSuccess){  //判断是否是由于添加好友成功引起的
                var liListObject=this.$refs
                if(Object.keys(liListObject).length!==0){   //确保列表不为空
                    liListObject[Object.keys(liListObject)[0]][0].style.backgroundColor='#C4C3C3'
                    this.flag=Object.keys(liListObject)[0]
                    if(this.searchInputValue!==''){     //使匹配的字体颜色改变
                        let keysList=Object.keys(liListObject)
                        keysList.forEach((item)=>{
                            let nameElement=liListObject[item][0].getElementsByClassName('friendName')[0]
                            let name=nameElement.innerHTML
                            nameElement.innerHTML=name.replace(this.searchInputValue, `<span style="color: #19AD19">${this.searchInputValue}</span>`)
                        })
                    }

                    if(this.searchInputValue===''){  //更新好友列表第一个好友的信息， 以便于触发friendInformation页面的更新
                        let obj={name: this.$store.state.friendsList[0].name, url: this.$store.state.friendsList[0].url}
                        this.$store.state.firstOfSearchFriendsList=obj
                    }
                    else {
                        let obj={name: this.searchFriendsList[0].name, url: this.searchFriendsList[0].url}
                        this.$store.state.firstOfSearchFriendsList=obj
                    }
                }
            }
            else {
                this.isAddFriendSuccess=false  // 回到默认状态
            }
        }
    }
</script>

<style scoped>
    @import '../public/stylesheets/search-icon-font/iconfont.css';
    #friendsListContainer{
        display: flex;
        flex-direction: column;
    }
    .list-title{
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #EEEAE8;
        height: 40px;
        font-family: 等线;
    }
    .list-title .searchInput{
        background-color: #DBD9D8;
        border-radius: 3px;
        border: none;
        outline: none;
        height: 20px;
        padding-left: 3px;
    }
    .list-title .icon-sousuo-copy{
        background-color: #DBD9D8;
        border-radius: 3px;
        padding: 1px 0 1px 1px;
    }
    .friends-list-container{
        padding: 0px;
    }
    #friends-list{
        list-style-type: none;
        padding: 0px;
        margin: 0px;
    }
    #friends-list li{
        /*margin: 0px;*/
        /*padding: 4px 10px;*/
        display: flex;
        align-items: center;
        padding: 0 8px;
    }
    .friendName{
        /*display: inline-block;*/
        padding-left: 8px;
    }
</style>
