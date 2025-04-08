# Day09 作业布置

## 一. 完成课堂所有的代码

## 二. 后台管理通常页面包括哪些功能？是如何实现增删改查的？

## 三. 页面的功能可以如何抽取和划分组件？如何抽取高阶组件？

- page-search
- page-content
- page-modal

## 四. 动态路由与Store加载机制全流程解析

### 1. 动态路由实现流程

#### 1.1 路由文件组织

首先，我们将路由文件按照模块分散到不同目录中：

```
src/
  router/
    main/           # 主路由目录
      system/       # 系统管理模块
        user.ts     # 用户管理路由
        role.ts     # 角色管理路由
      dashboard/    # 仪表盘模块
        analysis.ts # 数据分析路由
```

每个路由文件导出一个默认的路由配置对象：

```typescript
// src/router/main/system/user.ts
export default {
  path: "/system/user",
  component: () => import("@/views/system/user/index.vue"),
  name: "user",
  meta: {
    title: "用户管理",
  },
};
```

#### 1.2 动态加载路由文件

使用 `import.meta.glob` 动态导入所有路由文件：

```typescript
// src/utils/map-menus.ts
function loadLoaclRoutes() {
  // 1.加载文件内的路由
  const localRoutes: RouteRecordRaw[] = [];
  const files: Record<string, any> = import.meta.glob("@/router/main/**/*.ts", {
    eager: true,
  });
  // 2.将加载的对象放在localRoutes
  for (const key in files) {
    const module = files[key];
    localRoutes.push(module.default);
  }
  return localRoutes;
}
```

#### 1.3 菜单与路由映射

将用户菜单数据转换为路由配置：

```typescript
// src/utils/map-menus.ts
export function mapMenusToRoutes(userMenus: any[]) {
  // 1. 加载本地路由
  const localRoutes = loadLoaclRoutes();

  // 2. 根据菜单去匹配正确的路由
  const routes: RouteRecordRaw[] = [];
  for (const menu of userMenus) {
    for (const submenu of menu.children) {
      const route = localRoutes.find((item) => item.path === submenu.url);
      if (route) {
        // 1.给route的顶层菜单增加重定向功能
        // 因为顶层路由没有匹配组件 所以只能定向于第一个
        if (!routes.find((item) => item.path === menu.url)) {
          routes.push({ path: menu.url, redirect: route.path });
        }

        // 2.将二级菜单对应的路径
        routes.push(route);
      }
      if (!firstMenu && route) firstMenu = submenu;
    }
  }

  return routes;
}
```

#### 1.4 路径与菜单映射

根据当前路径找到对应的菜单项：

```typescript
// src/utils/map-menus.ts
export function mapPathToMenu(path: string, userMenus: any[]) {
  for (const menu of userMenus) {
    for (const submenu of menu.children) {
      if (submenu.url === path) {
        return submenu;
      }
    }
  }
}
```

### 2. Store加载机制

#### 2.1 登录Store

```typescript
// src/store/login/login.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { loginAccount } from "@/service/login/login";
import { getUserInfoById } from "@/service/login/login";
import { getUserMenusByRoleId } from "@/service/login/login";
import { localCache } from "@/utils/cache";
import { mapMenusToRoutes } from "@/utils/map-menus";
import router from "@/router";

const useLoginStore = defineStore("login", () => {
  // 状态
  const token = ref(localCache.getCache("token") ?? "");
  const userInfo = ref({});
  const userMenus = ref([]);

  // 方法
  async function loginAccountAction(account: any) {
    // 1.账号登录, 获取token等信息
    const loginResult = await loginAccount(account);
    const id = loginResult.data.id;
    token.value = loginResult.data.token;
    localCache.setCache("token", token.value);

    // 2.获取登录用户的详细信息(role信息)
    const userInfoResult = await getUserInfoById(id);
    userInfo.value = userInfoResult.data;

    // 3.根据角色请求用户的权限(菜单menus)
    const userMenusResult = await getUserMenusByRoleId(userInfo.value.role.id);
    userMenus.value = userMenusResult.data;

    // 4.进行本地路由与菜单的映射
    const routes = mapMenusToRoutes(userMenus.value);

    // 5.动态添加路由
    for (const route of routes) {
      router.addRoute("main", route);
    }
  }

  // 加载本地缓存
  function loadLocalCacheAction() {
    // 1.用户进行刷新默认加载数据
    const token = localCache.getCache(LOGIN_TOKEN);
    const userInfo = localCache.getCache("userInfo");
    const userMenus = localCache.getCache("userMenus");
    if (token && userInfo && userMenus) {
      this.token = token;
      this.userInfo = userInfo;
      this.userMenus = userMenus;

      // 2.动态添加路由
      const routes = mapMenusToRoutes(userMenus);
      routes.forEach((route) => router.addRoute("main", route));
    }
  }

  return {
    token,
    userInfo,
    userMenus,
    loginAccountAction,
    loadLocalCacheAction,
  };
});

export default useLoginStore;
```

### 3. 完整流程

#### 3.1 应用启动流程

1. 应用初始化
2. 创建路由实例
3. 创建 Pinia Store 实例
4. 调用 `loadLocalCacheAction` 方法，尝试从本地缓存恢复登录状态
5. 挂载应用

#### 3.2 登录流程

1. 用户输入账号密码
2. 调用 `loginAccountAction` 方法
3. 发送登录请求，获取 token
4. 保存 token 到本地缓存
5. 获取用户信息和角色
6. 根据角色获取用户菜单
7. 将菜单映射为路由
8. 动态添加路由到 router
9. 跳转到首页

#### 3.3 页面刷新流程

1. 页面刷新，应用重新初始化
2. 调用 `loadLocalCacheAction` 方法
3. 从本地缓存获取 token、用户信息和菜单
4. 恢复 store 中的状态
5. 重新映射菜单为路由
6. 动态添加路由

### 4. 潜在问题与解决方案

#### 4.1 登录前已有 token 的问题

如果本地缓存中已经有 token，当应用启动时，动态路由会被提前加载，这可能导致以下问题：

- **权限问题**：如果缓存的 token 已过期或无效，但路由已被加载
- **路由冲突**：如果路由配置发生变化，但缓存的是旧版本
- **用户体验**：用户可能看到不应该看到的菜单项

解决方案：

1. **添加路由守卫**：

```javascript
// router/index.ts
router.beforeEach((to, from, next) => {
  const token = localCache.getCache(LOGIN_TOKEN);

  if (to.path === "/login") {
    // 如果已登录，跳转到首页
    if (token) {
      next("/");
    } else {
      next();
    }
  } else {
    // 如果未登录，跳转到登录页
    if (!token) {
      next("/login");
    } else {
      // 检查路由是否已加载
      if (to.matched.length === 0) {
        // 路由不存在，可能是动态路由未加载
        // 重新加载动态路由
        const userMenus = localCache.getCache("userMenus");
        if (userMenus) {
          const routes = mapMenusToRoutes(userMenus);
          routes.forEach((route) => router.addRoute("main", route));
          // 重新导航到目标路由
          next({ ...to, replace: true });
        } else {
          next("/login");
        }
      } else {
        next();
      }
    }
  }
});
```

2. **添加 token 验证**：

```typescript
async loadLocalCacheAction() {
  const token = localCache.getCache(LOGIN_TOKEN);
  const userInfo = localCache.getCache("userInfo");
  const userMenus = localCache.getCache("userMenus");

  if (token && userInfo && userMenus) {
    try {
      // 验证 token 是否有效
      const isValid = await validateToken(token);
      if (isValid) {
        this.token = token;
        this.userInfo = userInfo;
        this.userMenus = userMenus;

        // 动态添加路由
        const routes = mapMenusToRoutes(userMenus);
        routes.forEach((route) => router.addRoute("main", route));
      } else {
        // token 无效，清除缓存
        localCache.removeCache(LOGIN_TOKEN);
        localCache.removeCache("userInfo");
        localCache.removeCache("userMenus");
      }
    } catch (error) {
      // 验证失败，清除缓存
      localCache.removeCache(LOGIN_TOKEN);
      localCache.removeCache("userInfo");
      localCache.removeCache("userMenus");
    }
  }
}
```

3. **添加登出功能**：

```typescript
logoutAction() {
  // 清除 store 中的状态
  this.token = '';
  this.userInfo = {};
  this.userMenus = [];

  // 清除本地缓存
  localCache.removeCache(LOGIN_TOKEN);
  localCache.removeCache("userInfo");
  localCache.removeCache("userMenus");

  // 跳转到登录页
  router.push('/login');
}
```

通过这些方案，您可以更安全地处理登录前已有 token 的情况，避免潜在的安全风险和用户体验问题。

### 5. app.use() 语法说明

`app.use()` 是 Vue 3 中的一个全局方法，用于安装 Vue 插件。它的语法是：

```javascript
app.use(plugin, ...options);
```

其中：

- `app` 是 Vue 应用实例
- `plugin` 是要安装的插件
- `...options` 是传递给插件的选项

这个语法**不是**把 app 传进去，而是告诉 Vue 应用使用这个插件。插件通常会接收 app 作为参数，但这是插件内部的事情。

例如，在您的代码中，可能有类似这样的代码：

```javascript
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);
const pinia = createPinia();

app.use(router); // 安装路由插件
app.use(pinia); // 安装状态管理插件

app.mount("#app");
```

这里的 `app.use(router)` 和 `app.use(pinia)` 是在告诉 Vue 应用使用路由插件和状态管理插件。
