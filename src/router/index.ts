import { createRouter, createWebHashHistory } from "vue-router";
import { localCache } from "@/utils/cache";
import { LOGIN_TOKEN } from "@/global/constants";

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
      component: () => import("@/views/main/Main.vue"),
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
      next();
    }
  } else {
    // 5. 非认证路由直接放行（如登录页、公开页面）
    next();
  }
});

export default router;
