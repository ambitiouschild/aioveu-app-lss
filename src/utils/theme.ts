/**
 * 小程序主题工具类
 * 用于解决小程序环境中CSS变量不能动态设置的问题
 */

// 注入小程序环境的全局样式  延迟执行主题设置
export function applyThemeToMiniProgram(primaryColor: string) {
  // 确保在小程序环境中执行
  if (typeof document !== "undefined") return;

  const pages = getCurrentPages();
  if (!pages.length) return;

  const currentPage = pages[pages.length - 1];
  const route = currentPage.route;

  // TabBar页面列表
  const tabBarPages = [
    "pages/index/index",
    "pages/category/category",
    "pages/cart/cart",
    "pages/user/user",
  ];

  try {

    if (tabBarPages.includes(route)) {
    // 设置TabBar样式
    uni.setTabBarStyle({
      color: "#000000",
      selectedColor: primaryColor,
      backgroundColor: "#ffffff",
      borderStyle: "black",
    });
      console.log("小程序主题色已应用:", primaryColor);
    } else {
      console.log(`当前页面 ${route} 不是TabBar页面，延迟应用主题`);
      // 可以在这里保存主题颜色，等进入TabBar页面时再应用
    }
    console.log("小程序主题色已应用:", primaryColor);
  } catch (error) {
    console.error("应用小程序主题色失败:", error);
  }
}

// 在页面展示时应用主题
export function applyThemeOnPageShow(primaryColor: string) {
  // 各平台小程序可能需要不同处理
  const platform = uni.getSystemInfoSync().platform;
  console.log(`当前平台: ${platform}, 应用主题色: ${primaryColor}`);

  // 某些平台可能需要特定处理
}
