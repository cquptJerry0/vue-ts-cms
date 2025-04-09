# Vue Router 相关概念辨析

## router 与 route 的区别

### router

- 是从 `@/router` 导入的路由实例对象
- 用于编程式导航和路由管理
- 主要方法包括：
  - `router.push("/main")` - 导航到指定页面
  - `router.addRoute("main", route)` - 动态添加路由

### route

- 指具体的路由配置对象，包含路径、组件等信息
- 例如：`const routes = mapMenusToRoutes(userMenus)` 获取的就是路由配置对象的数组
- 这些路由配置会被添加到路由系统中

## Composition API 中的路由钩子

### useRouter

- Vue 3 Composition API 中用于获取 router 实例的方法
- 在 setup() 中使用：`const router = useRouter()`

### useRoute

- 用于获取当前路由信息的方法
- 在 setup() 中使用：`const route = useRoute()`
- 可访问当前路由的参数、查询字符串等

# BUG: main无法收集到子路由

## 问题描述

在动态添加路由时，使用 `router.addRoute("main", route)` 方法添加的子路由没有正确地嵌套在 main 路由下，而是与 main 路由平级显示。这导致路由结构混乱，无法形成正确的层级关系。

## 原因分析

问题出在路由配置中缺少对父路由的正确标识。当使用 `router.addRoute("main", route)` 添加子路由时，Vue Router 需要通过名称找到对应的父路由，如果父路由没有设置 `name` 属性，Vue Router 将无法找到正确的父路由。

## 解决方案

在主路由配置中添加 `name: "main"` 属性：

```javascript
{
  path: '/main',
  name: "main",  // 关键是添加这个name属性
  component: MainLayout,
  children: []
}
```

添加 `name` 属性后，Vue Router 可以正确识别父路由，从而将动态添加的子路由正确地嵌套在 main 路由下，形成层级结构。

## 原理说明

`router.addRoute("main", childRoute)` 方法中的第一个参数 "main" 指的是父路由的名称。Vue Router 通过这个名称查找对应的路由，然后将子路由添加到它的 children 数组中。如果找不到名称为 "main" 的路由，子路由就会被添加到顶层路由配置中。

# BUG: 重定向到第一个菜单时，无法重定向

## 问题描述

访问 `/main` 路由时，期望自动重定向到第一个有权限的子菜单页面（如 `/main/analysis/dashboard`），但实际上用户停留在了 `/main` 页面，没有发生预期的重定向。

## 原因分析

1. 路由守卫中虽然添加了重定向逻辑，但重定向依赖于 `firstMenu` 变量
2. `firstMenu` 可能在路由守卫执行时尚未完成初始化，导致重定向条件不满足
3. 路由守卫的执行顺序问题：可能先执行了路由守卫，后加载了用户菜单数据

## 解决方案

### 方案一：在路由守卫中优化重定向逻辑

```javascript
// router/index.ts
import { firstMenu } from "@/utils/map-menus";

router.beforeEach((to, from, next) => {
  // ... 现有代码 ...

  // 处理 /main 路径的重定向
  if (to.path === "/main") {
    // 确保 firstMenu 存在且有 url 属性
    if (firstMenu && firstMenu.url) {
      console.log("重定向到第一个菜单:", firstMenu.url);
      next(firstMenu.url);
    } else {
      // 如果 firstMenu 不存在，先放行，可在组件内再处理
      console.log("firstMenu 未初始化，放行");
      next();
    }
  } else {
    next();
  }
});
```

### 方案二：在 Main.vue 组件中添加导航守卫

```javascript
// src/views/main/main.vue
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { firstMenu } from "@/utils/map-menus";

// 在 setup 中
const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (route.path === "/main" && firstMenu) {
    console.log("组件内重定向到:", firstMenu.url);
    router.replace(firstMenu.url);
  }
});
```

### 方案三：在加载动态路由时处理 /main 的重定向

```javascript
// src/store/login/login.ts
// 在添加动态路由后
routes.forEach((route) => router.addRoute("main", route));

// 手动覆盖 /main 路由，添加重定向
if (firstMenu) {
  router.addRoute({
    path: "/main",
    redirect: firstMenu.url,
    // 设置高优先级
    meta: { priority: 100 },
  });
}
```

## 最终实施方案

综合考虑各种实现方式，我们选择方案二作为最终解决方案，因为：

1. 不需要修改现有路由逻辑
2. 在组件渲染时确保 firstMenu 已加载
3. 只在实际访问 /main 路径时进行重定向处理
4. 代码侵入性最小，易于维护
