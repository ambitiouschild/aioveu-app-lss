<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useThemeStore } from "@/store";

import { useUserStore } from "@/store/modules/user"; // 添加用户store


// 主题初始化
const themeStore = useThemeStore();
const userStore = useUserStore(); // 添加用户store实例

onLaunch(async() => {
  console.log("App Launch");
  // 初始化主题
  themeStore.initTheme();

  // // 2. 加载用户权限数据
  // try {
  //   // 加载用户信息（包含权限数据）
  //   await userStore.getInfo();
  //   console.log("用户信息和权限数据加载成功");
  // } catch (error) {
  //   console.error("加载用户信息失败", error);
  //   uni.showToast({
  //     title: "加载用户信息失败",
  //     icon: "none"
  //   });
  // }

});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">

/* 引入全局样式 */

@import "@/styles/index.scss";

</style>
