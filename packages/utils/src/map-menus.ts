import type { RouteRecordRaw } from "vue-router";

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

export let firstMenu: any = null;
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

/**
 * 根据路径去匹配需要显示的菜单
 * @param path 需要匹配的路径
 * @param userMenus 所有的菜单
 */

export function mapPathToMenu(path: string, userMenus: any[]) {
  for (const menu of userMenus) {
    for (const submenu of menu.children) {
      if (submenu.url === path) {
        return submenu;
      }
    }
  }
}

interface IBreadcrumb {
  name: string;
  path: string;
}

export function mapPathToBreadcrumb(path: string, userMenus: any[]) {
  // 1.定义面包屑
  const breadcrumbs: IBreadcrumb[] = [];
  // 2.遍历获取面包屑
  for (const menu of userMenus) {
    for (const submenu of menu.children) {
      if (submenu.url === path) {
        breadcrumbs.push({ name: menu.name, path: menu.url });
        breadcrumbs.push({ name: submenu.name, path: submenu.url });
      }
    }
  }
  return breadcrumbs;
}
