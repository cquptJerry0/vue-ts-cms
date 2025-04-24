declare module '@cms/utils' {
  // Cache相关类型
  export class Cache {
    storage: Storage
    constructor(type: CacheType)
    setCache(key: string, value: any): void
    getCache(key: string): any
    removeCache(key: string): void
    clear(): void
  }

  export enum CacheType {
    Local,
    Session,
  }

  export const localCache: Cache
  export const sessionCache: Cache

  // 格式化相关类型
  export function formatUTC(
    utcString: string,
    format?: string,
  ): string

  // 菜单相关类型
  export function mapMenusToRoutes(userMenus: any[]): any[]
  export function mapPathToMenu(
    path: string,
    userMenus: any[],
  ): any
  export function mapPathToBreadcrumb(
    path: string,
    userMenus: any[],
  ): any[]
  export const firstMenu: any
}
