<template>
  <view class="container">
    <!-- 小程序头部兼容 -->
    <!-- #ifdef MP -->
    <view class="mp-search-box">
      <input class="ser-input" type="text" value="输入关键字搜索" disabled />
    </view>
    <!-- #endif -->

    <!-- 头部轮播 -->
    <view class="carousel-section">
      <!-- 标题栏和状态栏占位符 -->
      <!--      脚本/内联加载，或设置了 no-referrer-->
      <view class="titleNview-placing"></view>
      <swiper class="carousel" circular @change="handleSwiperChange">
        <swiper-item
          v-for="(item, index) in carouselList"
          :key="index"
          class="carousel-item"
          @click="navToDetailPage({ title: item.title })"
        >
          <image :src="item.imageUrl" />
          <!-- 这里用 imageUrl，不是 picUrl -->
        </swiper-item>
      </swiper>
      <!-- 自定义swiper指示器 -->
      <view class="swiper-dots">
        <text class="num">{{ swiperCurrent + 1 }}</text>
        <text class="sign">/</text>
        <text class="num">{{ swiperLength }}</text>
      </view>
    </view>

    <!-- ✅ 欢迎横幅放在轮播图下面 -->
    <!--    <view class="welcome-banner">欢迎光临可我不敌心动商城</view>-->

    <!-- 分类区域 - 改为动态数据 -->
    <!--    iPhone 的 Safari 浏览器（以及大多数现代浏览器）在加载页面内嵌的图片时，会严格带上当前页面的 URL-->
    <!--    作为 Referer，即 https://mall.aioveu.com。-->
    <!--    电脑浏览器：可能在直接打开图片链接时，默认不发送 Referer（或者因为网络代理等原因 Referer 为空）。-->
    <view v-if="categories.length > 0" class="cate-section">
      <view
        v-for="(item, index) in categories"
        :key="index"
        class="cate-item"
        @click="handleCategoryClick(item)"
      >
        <image :src="item.homeIcon || defaultCateIcon" mode="aspectFill" />
        <text>{{ item.homeName }}</text>
      </view>
    </view>

    <!-- 分类 -->
    <!--    <image src="/static/temp/c3.png"></image>-->
    <!-- 如果后端没数据，显示默认分类 -->

    <!-- 默认分类 -->
    <view v-else class="cate-section">
      <view
        v-for="(item, index) in defaultCategories"
        :key="index"
        class="cate-item"
        @click="navToCategory(item.id, item.name)"
      >
        <image :src="item.icon" mode="aspectFill" />
        <text class="cate-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- ✅ 简约版欢迎语 -->
    <view v-for="(advert, index) in adverts" :key="index" class="simple-welcome">
      <text>🎉 {{ advert.homeAdvertName }}🎉</text>
    </view>

    <!-- 推荐：带图标的欢迎横幅 -->
    <!--    <view class="welcome-card">-->
    <!--      <view class="welcome-icon">🎁</view>-->
    <!--      <view class="welcome-text">-->
    <!--        <view class="main-text">欢迎光临 可我不敌心动商城</view>-->
    <!--        <view class="sub-text">新人专享福利 · 全场心动</view>-->
    <!--      </view>-->
    <!--      <view class="welcome-tag">New</view>-->
    <!--    </view>-->

    <view class="welcome-card">
      <view class="welcome-icon">🎁</view>
      <view class="welcome-text">
        <view v-for="(advert, index) in adverts" :key="index" class="main-text">
          {{ advert.homeAdvertName }}
        </view>
        <view class="sub-text">新人专享福利 · 全场心动</view>
      </view>
      <view class="welcome-tag">New</view>
    </view>

    <!-- ✅ 新增：欢迎横幅 -->
    <!--    <view class="welcome-banner">-->
    <!--      <view class="welcome-content">-->
    <!--        <text class="welcome-text">欢迎光临</text>-->
    <!--        <text class="shop-name">可我不敌心动商城</text>-->
    <!--        <view class="welcome-subtitle">精选好物 · 品质生活</view>-->
    <!--      </view>-->
    <!--      &lt;!&ndash; 装饰元素 &ndash;&gt;-->
    <!--      <view class="decoration-left"></view>-->
    <!--      <view class="decoration-right"></view>-->
    <!--    </view>-->

    <!-- 广告区域 - 改为动态数据 -->
    <view v-if="adverts.length > 0" class="ad-1">
      <view
        v-for="(advert, index) in adverts"
        :key="index"
        class="ad-item"
        @click="handleAdvertClick(advert)"
      >
        <image
          :src="advert.homeAdvertIcon"
          :mode="advert.imageMode || 'scaleToFill'"
          :style="{ height: (advert.height || 210) + 'rpx' }"
        />
      </view>
    </view>

    <!-- 如果后端没数据，显示默认广告 -->
    <!--    <view v-else class="ad-1">-->
    <!--      <image src="" mode="scaleToFill"></image>-->
    <!--    </view>-->
    <view v-else class="ad-1">
      <view
        v-for="(advert, index) in defaultAdvert"
        :key="index"
        class="ad-item"
        @click="handleAdvertClick(advert)"
      >
        <image
          :src="advert.homeAdvertIcon"
          :mode="advert.imageMode || 'scaleToFill'"
          :style="{ height: (advert.height || 210) + 'rpx' }"
        />
      </view>
    </view>

    <!-- 秒杀楼层 -->
    <view class="seckill-section m-t">
      <view class="s-header">
        <image class="s-img" src="/static/temp/secskill-img.jpg" mode="widthFix"></image>
        <text class="tip">8点场</text>
        <text class="hour timer">07</text>
        <text class="minute timer">13</text>
        <text class="second timer">55</text>
        <text class="yticon icon-you"></text>
      </view>
      <scroll-view class="floor-list" scroll-x>
        <view class="scoll-wrapper">
          <view
            v-for="(item, index) in goodsList"
            :key="index"
            class="floor-item"
            @click="navToDetailPage(item.id)"
          >
            <image :src="item.picUrl" mode="aspectFill"></image>
            <text class="title clamp">{{ item.name }}</text>
            <text class="price">￥{{ item.price / 100 }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 团购楼层 -->
    <view class="f-header m-t">
      <image src="/static/temp/h1.png"></image>
      <view class="tit-box">
        <text class="tit">精品团购</text>
        <text class="tit2">Boutique Group Buying</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>
    <view class="group-section"></view>
    <!-- 分类推荐楼层 -->
    <view class="f-header m-t">
      <image src="/static/temp/h1.png"></image>
      <view class="tit-box">
        <text class="tit">分类精选</text>
        <text class="tit2">Competitive Products For You</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>

    <!-- 猜你喜欢 -->
    <view class="f-header m-t">
      <image src="/static/temp/h1.png"></image>
      <view class="tit-box">
        <text class="tit">猜你喜欢</text>
        <text class="tit2">Guess You Like It</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>
  </view>
</template>

<script setup>
// 这是使用 <script setup>语法的纯 Vue3 版本，没有使用 export default和 setup()函数。所有的响应式数据、计算属性和方法都在 <script setup>中直接声明，这是 Vue3 最简洁的写法。
import { ref, onMounted } from "vue";
import {
  onShareAppMessage,
  onShareTimeline,
  onNavigationBarSearchInputClicked,
  onNavigationBarButtonTap,
} from "@dcloudio/uni-app";
import { getAdvertList } from "@/api/sms/advert";
import { listSeckillingSpus } from "@/api/pms/goods";
import SmsHomeAdvertAPI, { SmsHomeAdvertPageVO } from "@/api/sms/sms-home-advert";
import SmsHomeCategoryAPI, { SmsHomeCategoryPageVO } from "@/api/sms/sms-home-category";

// 响应式数据
//在 Vue 3 中，当你用 ref()或 reactive()包装数据时，Vue 会创建一个 Proxy 代理对象 来跟踪数据变化。
// console.log("获取广告列表carouselList：{}",that.carouselList);

const swiperCurrent = ref(0);
const carouselList = ref([]);
const swiperLength = ref([]);
const goodsList = ref([]);
const categories = ref([]);
const adverts = ref([]);
const loading = ref(false);

const defaultCateIcon = "https://cdn.aioveu.com/aioveu/aioveu-server/avatar/avatar.png";

// 默认分类数据
const defaultCategories = ref([
  { id: 1, name: "ClaudeCode", icon: defaultCateIcon },
  { id: 2, name: "ChatGPT", icon: defaultCateIcon },
  { id: 3, name: "Gemini", icon: defaultCateIcon },
  { id: 4, name: "x", icon: defaultCateIcon },
  { id: 5, name: "DeepSeek", icon: defaultCateIcon },
]);

// 默认广告数据
const defaultAdvert = ref({
  id: 1,
  imageUrl:
    "https://cdn.aioveu.com/aioveu/1001/image/20260304/2a8febb7ea0a43b7a865f708b65ae23f.png",
  jumpPath: "/pages/product/list",
  jumpType: "navigateTo",
  height: 210,
  imageMode: "scaleToFill",
});

// 生命周期
// 页面显示时触发
onMounted(() => {
  console.log("首页页面加载");
  loadData();
});

//在 uni-app 中，onPullDownRefresh是全局函数，直接从 uni-app框架中导入，不需要手动导入。
// 下拉刷新 - 这是全局函数
onPullDownRefresh(async () => {
  console.log("下拉刷新触发");
  await loadData(true);
});

// 分享功能
onShareAppMessage(() => ({
  title: "买东西~可我不敌心动",
  path: "/pages/index/index",
  imageUrl: "********************",
  success: (res) => {
    console.log("分享成功", res);
  },
  fail: (err) => {
    console.log("分享失败", err);
  },
}));

onShareTimeline(() => ({
  title: "买东西~可我不敌心动",
  query: "key=value",
  imageUrl: "https://cdn.aioveu.com/aioveu-server/avatar/avatar.png",
  success: (res) => {
    console.log("分享到朋友圈成功", res);
  },
  fail: (err) => {
    console.log("分享到朋友圈失败", err);
  },
}));

// 标题栏搜索点击
onNavigationBarSearchInputClicked(async () => {
  uni.$emit("showToast", { title: "点击了搜索框" });
});

// 标题栏按钮点击
onNavigationBarButtonTap((e) => {
  const index = e.index;
  if (index === 0) {
    uni.$emit("showToast", { title: "点击了扫描" });
  } else if (index === 1) {
    // #ifdef APP-PLUS
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    const currentWebview = page.$getAppWebview();
    currentWebview.hideTitleNViewButtonRedDot({ index });
    // #endif
    uni.navigateTo({ url: "/pages/notice/notice" });
  }
});

//轮播图切换修改背景色
const handleSwiperChange = (e) => {
  swiperCurrent.value = e.detail.current;
};

//导航至详情页面     //详情页
const navToDetailPage = (id) => {
  uni.navigateTo({
    //测试数据没有写id，用title代替
    url: `/pages/product/product?id=${id}`,
  });
};

//导航至首页分类页面，产品分类的跳转
const navToCategory = (id, name) => {
  uni.navigateTo({
    url: `/pages/category/category?id=${id}&name=${name}`,
  });
};

//点击首页分类图标，产品分类外的展示，处理小程序内部跳转
const handleCategoryClick = (item) => {
  if (item.jumpPath) {
    handleNavigation(item.jumpPath, item.jumpType, item.jumpParams);
  } else {
    navToCategory(item.id, item.name);
  }
};

//点击首页广告图片，广告内容的展示，处理小程序内部跳转
const handleAdvertClick = (advert) => {
  if (advert.jumpPath) {
    handleNavigation(advert.jumpPath, advert.jumpType, advert.jumpParams);
  }
};

//处理小程序内部跳转
const handleNavigation = (path, type = "navigateTo", params = {}) => {
  if (!path) return;

  if (path.startsWith("/")) {
    const query = buildQueryString(params);
    const url = query ? `${path}?${query}` : path;

    const navigationMethods = {
      navigateTo: uni.navigateTo,
      redirectTo: uni.redirectTo,
      switchTab: uni.switchTab,
      reLaunch: uni.reLaunch,
    };

    const method = navigationMethods[type] || uni.navigateTo;
    method({ url });
  } else if (path.startsWith("http")) {
    // #ifdef H5
    window.location.href = path;
    // #endif
    // #ifndef H5
    uni.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(path)}`,
    });
    // #endif
  }
};

// 数据加载
const loadData = async (isRefresh = false) => {
  try {
    loading.value = true;

    await Promise.all([
      loadCarouselData(),
      loadCategoriesData(),
      loadAdvertsData(),
      loadGoodsData(),
    ]);
  } catch (error) {
    console.error("加载首页数据失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
    if (isRefresh) {
      uni.stopPullDownRefresh();
    }
  }
};

//获取轮播图广告列表
const loadCarouselData = async () => {
  try {
    const response = await getAdvertList();
    console.log("获取轮播图广告列表:", response);

    if (response && Array.isArray(response)) {
      carouselList.value = response;
      swiperLength.value = response.length;
    }
  } catch (error) {
    console.error("加载轮播图数据失败:", error);
    carouselList.value = getDefaultCarouselData();
  }
};

const loadCategoriesData = async () => {
  try {
    const response = await SmsHomeCategoryAPI.getPage();
    console.log("获取分类列表:", response);

    if (response) {
      categories.value = response;
      console.log("================");
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error("加载分类数据失败:", error);
    categories.value = [];
  }
};

const loadAdvertsData = async () => {
  try {
    const response = await SmsHomeAdvertAPI.getPage();
    console.log("获取广告列表:", response);

    if (response) {
      adverts.value = response;
    } else {
      adverts.value = [];
    }
  } catch (error) {
    console.error("加载广告数据失败:", error);
    adverts.value = [];
  }
};

const loadGoodsData = async () => {
  try {
    const response = await listSeckillingSpus();
    console.log("获取秒杀商品列表:", response);
    goodsList.value = response || [];
  } catch (error) {
    console.error("加载商品数据失败:", error);
    goodsList.value = [];
  }
};

// 默认数据
const getDefaultCarouselData = () => [
  { imageUrl: "/static/temp/b1.jpg", title: "广告1" },
  { imageUrl: "/static/temp/b2.jpg", title: "广告2" },
  { imageUrl: "/static/temp/b3.jpg", title: "广告3" },
];
</script>

<style lang="scss">
/* #ifdef MP */
.mp-search-box {
  position: absolute;
  left: 0;
  top: 30upx;
  z-index: 9999;
  width: 100%;
  padding: 0 80upx;

  .ser-input {
    flex: 1;
    height: 56upx;
    line-height: 56upx;
    text-align: center;
    font-size: 28upx;
    color: $font-color-base;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.6);
  }
}

page {
  .cate-section {
    position: relative;
    z-index: 5;
    border-radius: 16upx 16upx 0 0;
    margin-top: -20upx;
  }

  .carousel-section {
    padding: 0;

    .titleNview-placing {
      padding-top: 0;
      height: 0;
    }

    .carousel {
      .carousel-item {
        padding: 0;
      }
    }

    .swiper-dots {
      left: 45upx;
      bottom: 40upx;
    }
  }
}

/* #endif */

page {
  background: #f5f5f5;
}

.m-t {
  margin-top: 16upx;
}

/* 头部 轮播图 */
.carousel-section {
  position: relative;
  padding-top: 10px;

  .titleNview-placing {
    height: var(--status-bar-height);
    padding-top: 44px;
    box-sizing: content-box;
  }

  .titleNview-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 426upx;
    transition: 0.4s;
  }
}

.carousel {
  width: 100%;
  height: 500upx; /* 修改这个值 */

  .carousel-item {
    width: 100%;
    height: 100%;
    padding: 0 28upx;
    overflow: hidden;
  }

  image {
    width: 100%;
    height: 100%;
    border-radius: 10upx;
  }
}

.swiper-dots {
  display: flex;
  position: absolute;
  left: 60upx;
  bottom: 15upx;
  width: 72upx;
  height: 36upx;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk4MzlBNjE0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk4MzlBNjA0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0E3RUNERkE0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0E3RUNERkI0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Gh5BPAAACTUlEQVR42uzcQW7jQAwFUdN306l1uWwNww5kqdsmm6/2MwtVCp8CosQtP9vg/2+/gY+DRAMBgqnjIp2PaCxCLLldpPARRIiFj1yBbMV+cHZh9PURRLQNhY8kgWyL/WDtwujjI8hoE8rKLqb5CDJaRMJHokC6yKgSCR9JAukmokIknCQJpLOIrJFwMsBJELFcKHwM9BFkLBMKFxNcBCHlQ+FhoocgpVwwnv0Xn30QBJGMC0QcaBVJiAMiec/dcwKuL4j1QMsVCXFAJE4s4NQA3K/8Y6DzO4g40P7UcmIBJxbEesCKWBDg8wWxHrAiFgT4fEGsB/CwIhYE+AeBAAdPLOcV8HRmWRDAiQVcO7GcV8CLM8uCAE4sQCDAlHcQ7x+ABQEEAggEEAggEEAggEAAgQACASAQQCCAQACBAAIBBAIIBBAIIBBAIABe4e9iAe/xd7EAJxYgEGDeO4j3EODp/cOCAE4sYMyJ5cwCHs4rCwI4sYBxJ5YzC84rCwKcXxArAuthQYDzC2JF0H49LAhwYUGsCFqvx5EF2T07dMaJBetx4cRyaqFtHJ8EIhK0i8OJBQxcECuCVutxJhCRoE0cZwMRyRcFefa/ffZBVPogePihhyCnbBhcfMFFEFM+DD4m+ghSlgmDkwlOgpAl4+BkkJMgZdk4+EgaSCcpVX7bmY9kgXQQU+1TgE0c+QJZUUz1b2T4SBbIKmJW+3iMj2SBVBWz+leVfCQLpIqYbp8b85EskIxyfIOfK5Sf+wiCRJEsllQ+oqEkQfBxmD8BBgA5hVjXyrBNUQAAAABJRU5ErkJggg==);
  background-size: 100% 100%;

  .num {
    width: 36upx;
    height: 36upx;
    border-radius: 50px;
    font-size: 24upx;
    color: #fff;
    text-align: center;
    line-height: 36upx;
  }

  .sign {
    position: absolute;
    top: 0;
    left: 50%;
    line-height: 36upx;
    font-size: 12upx;
    color: #fff;
    transform: translateX(-50%);
  }
}

/* 分类 */
/* 分类 - 增强版 */
.cate-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 30upx 22upx;
  background: #fff;
  /*新增*/
  border-bottom: 1rpx solid #f0f0f0;

  .cate-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%; /* 平均分布5个 */ /*新增*/

    font-size: $font-sm + 1px;
    color: $font-color-dark;

    /* 点击效果 */
    &:active {
      opacity: 0.8;
      transform: scale(0.95);
      transition: all 0.2s;
    }

    .cate-name {
      font-size: 24rpx;
      color: #333333;
      margin-top: 8rpx;
      text-align: center;
      line-height: 1.4;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  /* 原图标颜色太深,不想改图了,所以加了透明度 */
  image {
    width: 88upx;
    height: 88upx;
    margin-bottom: 14upx;
    border-radius: 50%;
    box-shadow: 4rpx 4rpx 20rpx rgba(250, 67, 106, 0.3);
    border: 2rpx solid #fff; /* 白色边框，让图标更清晰 */ /*新增*/

    /* 确保图片完全显示 */
    object-fit: cover;

    opacity: 1; /* ✅ 改为不透明 1 ,加了透明度0.7 */
    /*方案2：完全移除透明度设置*/
    /* 移除 opacity 属性 */

    /* 使用 filter 替代 opacity，效果更好 */
    /* filter: brightness(1.1) contrast(1.1); */ /* 稍微提亮和增强对比度 */

    /* 悬停效果 */
    &:hover {
      box-shadow: 0rpx 8rpx 25rpx rgba(250, 67, 106, 0.4);
    }
  }
}

/* 简约版  位置4：简约版本*/
.simple-welcome {
  background: #fff;
  padding: 30rpx 0;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
  margin: 20rpx 0;
}

/* 卡片式欢迎横幅 🎨 推荐版本（带图标） */
.welcome-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 8rpx;
    height: 100%;
    background: linear-gradient(to bottom, #667eea, #764ba2);
  }

  .welcome-icon {
    font-size: 48rpx;
    margin-right: 24rpx;
  }

  .welcome-text {
    flex: 1;

    .main-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .sub-text {
      font-size: 24rpx;
      color: #666;
    }
  }

  .welcome-tag {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 20rpx;
    font-weight: bold;
  }
}

/* 欢迎横幅  渐变背景的欢迎横幅） 符合现代电商设计趋势 */
.welcome-banner {
  position: relative;
  width: 100%;
  height: 180rpx;
  margin: 20rpx 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);

  .welcome-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;

    .welcome-text {
      display: block;
      font-size: 32rpx;
      font-weight: 300;
      margin-bottom: 8rpx;
      opacity: 0.9;
    }

    .shop-name {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
      letter-spacing: 2rpx;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
    }

    .welcome-subtitle {
      font-size: 24rpx;
      opacity: 0.8;
      letter-spacing: 4rpx;
    }
  }

  /* 装饰元素 */
  .decoration-left,
  .decoration-right {
    position: absolute;
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  .decoration-left {
    top: -40rpx;
    left: -40rpx;
  }

  .decoration-right {
    bottom: -40rpx;
    right: -40rpx;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .welcome-banner {
    height: 160rpx;
    margin: 15rpx 0;

    .welcome-content {
      .welcome-text {
        font-size: 28rpx;
      }

      .shop-name {
        font-size: 40rpx;
      }

      .welcome-subtitle {
        font-size: 20rpx;
        letter-spacing: 2rpx;
      }
    }
  }
}

/*你的广告图比例：

比例：约 3.57:1 (750:210)

分辨率建议：750×210 像素

*/
.ad-1 {
  width: 100%;
  height: 210upx;
  padding: 10upx 0;
  background: #fff;

  image {
    width: 100%;
    height: 100%;
  }
}

/* 秒杀专区 */
.seckill-section {
  padding: 4upx 30upx 24upx;
  background: #fff;

  .s-header {
    display: flex;
    align-items: center;
    height: 92upx;
    line-height: 1;

    .s-img {
      width: 140upx;
      height: 30upx;
    }

    .tip {
      font-size: $font-base;
      color: $font-color-light;
      margin: 0 20upx 0 40upx;
    }

    .timer {
      display: inline-block;
      width: 40upx;
      height: 36upx;
      text-align: center;
      line-height: 36upx;
      margin-right: 14upx;
      font-size: $font-sm + 1px;
      color: #fff;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.8);
    }

    .icon-you {
      font-size: $font-lg;
      color: $font-color-light;
      flex: 1;
      text-align: right;
    }
  }

  .floor-list {
    white-space: nowrap;
  }

  .scoll-wrapper {
    display: flex;
    align-items: flex-start;
  }

  .floor-item {
    width: 150upx;
    margin-right: 20upx;
    font-size: $font-sm + 1px;
    color: $font-color-dark;
    line-height: 1.8;

    image {
      width: 150upx;
      height: 150upx;
      border-radius: 6upx;
    }

    .price {
      color: $uni-color-primary;
    }
  }
}

.f-header {
  display: flex;
  align-items: center;
  height: 140upx;
  padding: 6upx 30upx 8upx;
  background: #fff;

  image {
    flex-shrink: 0;
    width: 80upx;
    height: 80upx;
    margin-right: 20upx;
  }

  .tit-box {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .tit {
    // 在 + 和 2 之间加空格
    font-size: $font-lg + 1px;
    color: $font-color-dark;
    line-height: 1.3;
  }

  .tit2 {
    font-size: $font-sm;
    color: $font-color-light;
  }

  .icon-you {
    font-size: $font-lg + 1px;
    color: $font-color-light;
  }
}

/* 团购楼层 */
.group-section {
  background: #fff;

  .g-swiper {
    height: 650upx;
    padding-bottom: 30upx;
  }

  .g-swiper-item {
    width: 100%;
    padding: 0 30upx;
    display: flex;
  }

  image {
    width: 100%;
    height: 460upx;
    border-radius: 4px;
  }

  .g-item {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .left {
    flex: 1.2;
    margin-right: 24upx;

    .t-box {
      padding-top: 20upx;
    }
  }

  .right {
    flex: 0.8;
    flex-direction: column-reverse;

    .t-box {
      padding-bottom: 20upx;
    }
  }

  .t-box {
    height: 160upx;
    font-size: $font-base + 1px;
    color: $font-color-dark;
    line-height: 1.6;
  }

  .price {
    color: $uni-color-primary;
  }

  .m-price {
    font-size: $font-sm + 1px;
    text-decoration: line-through;
    color: $font-color-light;
    margin-left: 8upx;
  }

  .pro-box {
    display: flex;
    align-items: center;
    margin-top: 10upx;
    font-size: $font-sm;
    color: $font-base;
    padding-right: 10upx;
  }

  .progress-box {
    flex: 1;
    border-radius: 10px;
    overflow: hidden;
    margin-right: 8upx;
  }
}

/* 分类推荐楼层 */
.hot-floor {
  width: 100%;
  overflow: hidden;
  margin-bottom: 20upx;

  .floor-img-box {
    width: 100%;
    height: 320upx;
    position: relative;

    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(255, 255, 255, 0.06) 30%, #f8f8f8);
    }
  }

  .floor-img {
    width: 100%;
    height: 100%;
  }

  .floor-list {
    white-space: nowrap;
    padding: 20upx;
    padding-right: 50upx;
    border-radius: 6upx;
    margin-top: -140upx;
    margin-left: 30upx;
    background: #fff;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;
  }

  .scoll-wrapper {
    display: flex;
    align-items: flex-start;
  }

  .floor-item {
    width: 180upx;
    margin-right: 20upx;
    font-size: $font-sm + 1px;
    color: $font-color-dark;
    line-height: 1.8;

    image {
      width: 180upx;
      height: 180upx;
      border-radius: 6upx;
    }

    .price {
      color: $uni-color-primary;
    }
  }

  .more {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex-shrink: 0;
    width: 180upx;
    height: 180upx;
    border-radius: 6upx;
    background: #f3f3f3;
    font-size: $font-base;
    color: $font-color-light;

    text:first-child {
      margin-bottom: 4upx;
    }
  }
}

/* 猜你喜欢 */
.guess-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30upx;
  background: #fff;

  .guess-item {
    display: flex;
    flex-direction: column;
    width: 48%;
    padding-bottom: 40upx;

    &:nth-child(2n + 1) {
      margin-right: 4%;
    }
  }

  .image-wrapper {
    width: 100%;
    height: 330upx;
    border-radius: 3px;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    font-size: $font-lg;
    color: $font-color-dark;
    line-height: 80upx;
  }

  .price {
    font-size: $font-lg;
    color: $uni-color-primary;
    line-height: 1;
  }
}
</style>
