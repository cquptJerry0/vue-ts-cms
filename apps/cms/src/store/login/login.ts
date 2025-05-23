import { defineStore } from 'pinia'
import {
  accountLoginRequest,
  getUserInfoById,
  getUserMenusByRoleId,
} from '@/service/login/login'
import type { IAccount } from '@/types'
import { localCache } from '@cms/utils'
import router from '@/router'
import { LOGIN_TOKEN } from '@/global/constants'
import { mapMenusToRoutes } from '@cms/utils'
import useMainStore from '../main/main'

interface ILoginState {
  token: string
  userInfo: any
  userMenus: any
}

const useLoginStore = defineStore('login', {
  // 如何制定state的类型
  state: (): ILoginState => ({
    token: localCache.getCache(LOGIN_TOKEN) ?? '',
    userInfo: localCache.getCache('userInfo') ?? {},
    userMenus: localCache.getCache('userMenus') ?? [],
  }),
  actions: {
    async loginAccountAction(account: IAccount) {
      // 1.账号登录, 获取token等信息
      const loginResult = await accountLoginRequest(account)
      console.log(loginResult.data.id)
      const id = loginResult.data.id
      this.token = loginResult.data.token
      localCache.setCache(LOGIN_TOKEN, this.token)

      // 2.获取登录用户的详细信息(role信息)
      const userInfoResult = await getUserInfoById(id)
      console.log(userInfoResult.data)
      const userInfo = userInfoResult.data
      this.userInfo = userInfo
      console.log(userInfo)
      localCache.setCache('userInfo', userInfo)

      // 3.根据角色请求用户的权限(菜单menus)
      const userMenusResult = await getUserMenusByRoleId(
        this.userInfo.role.id,
      )
      const userMenus = userMenusResult.data
      this.userMenus = userMenus

      // 4.进行本地缓存
      localCache.setCache('userMenus', userMenus)

      // 5.请求所有roles/departments数据
      const mainStore = useMainStore()
      mainStore.fetchEntireDataAction()

      // 4.动态添加路由
      const routes = mapMenusToRoutes(userMenus)
      routes.forEach((route) =>
        router.addRoute('main', route),
      )

      // 5.页面跳转(main页面)
      router.push('/main')
    },

    loadLocalCacheAction() {
      // 1.用户进行刷新默认加载数据
      const token = localCache.getCache(LOGIN_TOKEN)
      const userInfo = localCache.getCache('userInfo')
      const userMenus = localCache.getCache('userMenus')
      if (token && userInfo && userMenus) {
        this.token = token
        this.userInfo = userInfo
        this.userMenus = userMenus

        // 1..请求所有roles/departments数据
        const mainStore = useMainStore()
        mainStore.fetchEntireDataAction()

        // 2.动态添加路由
        const routes = mapMenusToRoutes(userMenus)
        routes.forEach((route) =>
          router.addRoute('main', route),
        )
      }
    },
  },
})

export default useLoginStore
