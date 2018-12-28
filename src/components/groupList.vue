<template>
    <div id="groupListContainer">
        <div class="list-title">
            <div class="iconfont icon-sousuo-copy" @click="searchFriend(searchInputValue)" :style="searchIconStyle">
                <input type="search" class="searchInput"  :style="searchInputStyle" v-model="searchInputValue"
                       @focus="focusUpdateSearchInputBackgroundColor"
                       @blur="blurUpdateSearchInputBackgroundColor">
            </div>
            <div class="iconfont icon-faqiqunliao" @click="createGroup"></div>
        </div>
        <div class="group-list-container">
            <ul id="group-list" v-if="isDisplayAllGroupList">  <!--若搜索框无值则显示此框-->

                <li class="group-list" v-for="group in $store.state.groupList" :style="styleList[group.name]" :ref="group.name" :key="test()"
                    @click="getFriendInformation(group)">    <!--用返回当前时间作为key值确保唯一性，避免复用-->
                    <img :src="group.url" width="35px" height="35px">
                    <p class="groupName" :title="group.nickname">{{group.nickname | formatName}}</p>
                </li>

            </ul>
            <ul id="group-list" v-else>   <!--若搜索框有值则显示此框-->
                <li class="group-list" v-for="group in searchGroupList" :style="styleList[group.name]" :ref="group.name" :key="test()"
                    @click="getFriendInformation(group)">
                    <img :src="group.url" width="35px" height="35px">
                    <p class="groupName" :title="group.nickname" v-html="computedNickname(group.nickname)"></p>  <!--此处主要是考虑到要改变颜色-->
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                searchInputValue: '',
                isDisplayAllGroupList: true,
                searchGroupList: [],
                selectedGroupFlag: 'messages',  // 选中群组标志位，是群组的名字，为了确定使被选中的标签背景色加深
                searchIconStyle: {},
                searchInputStyle: {}
            }
        },
        methods: {
            test: function(){
                return new Date()
            },
            createGroup: function(){
                this.$emit('create-group')
            },
            focusUpdateSearchInputBackgroundColor: function(){
                /*this.searchIconStyle.backgroundColor='white'   注意了：在VUE中，这里添加对象属性的时候不能直接这样添加
                this.searchInputStyle.backgroundColor='white'*/
                this.$set(this.searchIconStyle, 'backgroundColor', 'white')
                this.$set(this.searchInputStyle, 'backgroundColor', 'white')
            },
            blurUpdateSearchInputBackgroundColor: function(){
                if(this.searchInputValue===''){     // 更改对象属性的时候可以直接用.属性的方法
                    this.searchIconStyle.backgroundColor='#DBD9D8'
                    this.searchInputStyle.backgroundColor='#DBD9D8'
                }
            },
            getFriendInformation: function(group){
                this.$router.push({path: '/groupInformation', query: {name: group.name}})
                this.selectedGroupFlag=group.name
            },
            computedNickname: function(nickname){
                return nickname.replace(this.searchInputValue, `<span style="color: #19AD19">${this.searchInputValue}</span>`)
            },
            searchFriend: function(searchInputValue){

            }
        },
        computed: {
            /* 这个样式属性主要是针对选中后的背景色加深,这里的选中样式设定与onlineUserList或者是friendsList的有所不同
            这里的样式直接使用数据绑定而不是确定选中元素然后更改其style属性，不需要使用ref属性，这个方法更方便一些，用这种
             方法没选中的就不设定其背景色，这样就可以通过直接设定:hover伪类来设定鼠标悬停背景色，而不是通过mouseover事件来
             用JS设定，JS设定样式属于内联样式，其优先级要高于通过样式表来设定*/
            styleList: function(){
                let styleObject={}
                if(this.selectedGroupFlag){  // 判断一下主要是考虑到这个函数执行的时候this.selectedGroupFlag还未初始化，防止出错
                    this.$store.state.groupList.forEach((item)=>{
                        if(this.selectedGroupFlag===item.name){
                            styleObject[this.selectedGroupFlag]={backgroundColor: '#C4C3C3'}
                        }
                        else {
                            styleObject[item.name]={}
                        }
                    })
                }
                else {
                    this.$store.state.groupList.forEach((item)=>{
                        if(item.name==='messages'){
                            styleObject[item.name]={backgroundColor: '#C4C3C3'}
                        }
                        else {
                            styleObject[item.name]={}
                        }
                    })
                }
                return styleObject
            }
        },
        watch: {
            searchInputValue: function(){
                if(this.searchInputValue!==''){
                    this.searchGroupList=this.$store.state.groupList.filter((item)=>{
                        return item.nickname.indexOf(this.searchInputValue)!==-1
                    })
                    if(this.searchGroupList.length!==0){
                        this.selectedGroupFlag=this.searchGroupList[0].name
                    }
                    this.isDisplayAllGroupList=false
                }
                else {
                    this.selectedGroupFlag='messages'
                    this.isDisplayAllGroupList=true
                }
            }
        },
        filters: {
            formatName: function(nickname, searchInputValue){
                let byteLength=0, formatName=''
                let nameLength=nickname.length
                for(let i=0; i<nameLength; i++){
                    if(nickname.charCodeAt(i)>=0x4E00&&nickname.charCodeAt(i)<=0x9FFF){
                        byteLength+=2       // 若是汉字，则长度加2，因为一个汉字为2byte且占据宽度为两倍的英文字母
                        formatName+=nickname[i]
                    }
                    else {
                        byteLength++
                        formatName+=nickname[i]
                    }

                    if(byteLength>=12&&i<nameLength-1){
                        return formatName+'...'
                    }
                    else if(i===nameLength-1){
                        return formatName
                    }
                }
            }
        },
        mounted: function(){
        }
    }
</script>

<style scoped>
    @import '../public/stylesheets/search-icon-font/iconfont.css';
    @import '../public/stylesheets/creategroup-icon-font/iconfont.css';

    #groupListContainer{
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .list-title{
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #EEEAE8;
        height: 8%;
        font-family: 等线;
    }
    .list-title .searchInput{
        background-color: #DBD9D8;
        border-radius: 3px;
        border: none;
        outline: none;
        height: 20px;
        padding-left: 3px;
        width: 80%;
    }
    .list-title .icon-sousuo-copy{
        background-color: #DBD9D8;
        border-radius: 3px;
        padding: 1px 0 1px 1px;
        width: 75%;
    }
    .list-title .icon-faqiqunliao{
        background-color:#DBD9D8;
        color: black;
        font-size: 12px;
        padding: 4px;
        border-radius:3px;
    }
    .list-title .icon-faqiqunliao:hover{
        background-color: #CCCCCC;
        cursor: pointer;
    }
    .group-list-container{
        padding: 0px;
        height: 92%;
    }
    #group-list{
        list-style-type: none;
        padding: 0px;
        margin: 0px;
    }
    #group-list li{
        /*margin: 0px;*/
        /*padding: 4px 10px;*/
        display: flex;
        align-items: center;
        padding: 0 8px;
    }
    #group-list li:hover{
        background-color: #DCDDDE;
    }
    .groupName{
        /*display: inline-block;*/
        padding-left: 8px;
    }
</style>