import VueRouter from 'vue-router'

import friendsList from '../components/friendsList.vue'
import onlineUserList from '../components/onlineUserList.vue'
import chatPage from '../components/chatPage.vue'
import friendInformation from '../components/friendInformation.vue'
import groupList from '../components/groupList.vue'
import groupInformation from '../components/groupInformation.vue'

var router=new VueRouter({
    routes: [
        { path: '/', components: {userInfo: friendsList, chatPage: friendInformation}},
        { path: '/friendsList', components: {userInfo: friendsList, chatPage: friendInformation} },
        { path: '/onlineUserList', components: {userInfo: onlineUserList, chatPage: chatPage}},
        { path: '/chatPage', components: {chatPage: chatPage, userInfo: onlineUserList}},
        { path: '/friendInformation', components: {chatPage: friendInformation, userInfo: friendsList}},
        { path: '/groupList', components: {userInfo: groupList, chatPage: groupInformation}},
        { path: '/groupInformation', components: {userInfo: groupList, chatPage: groupInformation}}
        ],
    linkActiveClass: 'mui-active'
})

export default router