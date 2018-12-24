<template>
    <div id="groupListContainer">
        <div class="list-title">
            <div class="iconfont icon-sousuo-copy" @click="searchFriend(searchInputValue)">
                <input type="search" class="searchInput"  v-model="searchInputValue"
                       @focus="focusUpdateSearchInputBackgroundColor"
                       @blur="blurUpdateSearchInputBackgroundColor">
            </div>
            <div class="iconfont icon-faqiqunliao" @click="createGroup"></div>
        </div>
        <div class="group-list-container">
            <ul id="group-list" v-if="isDisplayAllGroupList">  <!--若搜索框无值则显示此框-->

                <li class="group-list" v-for="group in $store.state.groupList" :ref="group.name" :key="test()"
                    @mouseover="over(group)"
                    @mouseout="out(group)"
                    @click="getFriendInformation(group)">    <!--用返回当前时间作为key值确保唯一性，避免复用-->
                    <img :src="group.url" width="35px" height="35px">
                    <p class="groupName">{{group.name}}</p>
                </li>

            </ul>
            <ul id="group-list" v-else>   <!--若搜索框有值则显示此框-->
                <li class="group-list" v-for="group in searchGroupList" :ref="group.name" :key="test()"
                    @mouseover="over(group)"
                    @mouseout="out(group)"
                    @click="getFriendInformation(group)">
                    <img :src="group.url" width="35px" height="35px">
                    <p class="groupName">{{group.name}}</p>
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
                searchGroupList: []
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

            },
            blurUpdateSearchInputBackgroundColor: function(){

            },
            over: function(group){

            },
            out: function(group){

            },
            getFriendInformation: function(group){

            },
            searchFriend: function(searchInputValue){

            }
        }
    }
</script>

<style scoped>
    @import '../public/stylesheets/search-icon-font/iconfont.css';
    @import '../public/stylesheets/creategroup-icon-font/iconfont.css';

    #groupListContainer{
        display: flex;
        flex-direction: column;
    }
    .list-title{
        display: flex;
        justify-content: space-around;
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
    .groupName{
        /*display: inline-block;*/
        padding-left: 8px;
    }
</style>