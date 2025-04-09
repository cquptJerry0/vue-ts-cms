import { createRouter, createWebHashHistory } from "vue-router";
import { localCache } from "@/utils/cache";
import { LOGIN_TOKEN } from "@/global/constants";
import { firstMenu } from "@/utils/map-menus";
const router = createRouter({
  history: createWebHashHistory(),
  // 映射关系: path => component
  routes: [
    {
      path: "/",
      redirect: "/main",
    },
    {
      path: "/login",
      component: () => import("@/views/login/Login.vue"),
    },
    {
      path: "/main",
      name: "main",
      component: () => import("@/views/main/main.vue"),
      children: [],
    },
    {
      path: "/:pathMatch(.*)",
      component: () => import("@/views/not-found/NotFound.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  // 1. 获取 token（确保 LOGIN_TOKEN 是已定义的常量）
  const token = localCache.getCache(LOGIN_TOKEN);

  // 2. 判断是否需要认证的路由（如 /main 开头）
  if (to.matched.some((record) => record.path.startsWith("/main"))) {
    // 3. 无 token 时重定向到登录页
    if (!token) {
      next({
        path: "/login",
        query: { redirect: to.fullPath }, // 可选：记录来源路径，登录后跳转
      });
    } else {
      // 4. 有 token 且已登录，正常放行
      // 新增: 如果访问的是/main, 重定向第一个菜单
      // 确保 firstMenu 存在且有 url 属性
      if (to.path === "/main" && firstMenu && firstMenu.url) {
        // 输出日志，便于调试
        console.log("重定向到:", firstMenu.url);
        next({ path: firstMenu.url });
      } else {
        // 如果条件不满足，仍然要放行
        next();
      }
    }
  } else {
    // 5. 非认证路由直接放行（如登录页、公开页面）
    next();
  }
});

export default router;
