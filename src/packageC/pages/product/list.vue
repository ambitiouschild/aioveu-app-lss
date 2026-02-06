<template>
  <view class="content">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ position: headerPosition, top: headerTop }">
      <!-- 排序选项 -->
      <view class="nav-item" :class="{ current: filterIndex === 0 }" @click="tabClick(0)">
        综合排序
      </view>
      <view class="nav-item" :class="{ current: filterIndex === 1 }" @click="tabClick(1)">
        销量优先
      </view>
      <view class="nav-item" :class="{ current: filterIndex === 2 }" @click="tabClick(2)">
        <text>价格</text>
        <view class="p-box">
          <!-- 价格升序图标 -->
          <text
            :class="{ active: priceOrder === 1 && filterIndex === 2 }"
            class="yticon icon-shang"
          ></text>
          <!-- 价格降序图标 -->
          <text
            :class="{ active: priceOrder === 2 && filterIndex === 2 }"
            class="yticon icon-shang xia"
          ></text>
        </view>
      </view>
      <!-- 分类筛选按钮 -->
      <text class="cate-item yticon icon-fenlei1" @click="toggleCateMask('show')"></text>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list">
      <view
        v-for="(item, index) in goodsList"
        :key="item.id || index"
        class="goods-item"
        @click="navToDetailPage(item)"
      >
        <image :src="item.picUrl" mode="aspectFill" lazy-load class="goods-image"></image>
<!--        <view class="image-wrapper">-->
<!--          &lt;!&ndash;          H5 端对 <image>标签的渲染与小程序端不同。在小程序里 <image>是原生组件，但在 H5 里它会被转换为 <img>标签，可能样式不兼容。使用条件编译（推荐）&ndash;&gt;-->
<!--          <image :src="item.picUrl" mode="aspectFill" lazy-load></image>-->
<!--        </view>-->
        <text class="title clamp">{{ item.name }}</text>
        <view class="price-box">
          <text class="price">{{ formatPrice(item.price) }}</text>
          <text>已售 {{ item.sales || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 加载更多组件 -->
    <uni-load-more :status="loadingType"></uni-load-more>

    <!-- 分类筛选面板 -->
    <view
      class="cate-mask"
      :class="cateMaskState === 0 ? 'none' : cateMaskState === 1 ? 'show' : ''"
      @click="toggleCateMask"
    >
      <view
        class="cate-content"
        @click.stop.prevent="stopPrevent"
        @touchmove.stop.prevent="stopPrevent"
      >
        <scroll-view scroll-y class="cate-list">
          <view v-for="item in cateList" :key="item.id">
            <!-- 二级分类 -->
            <view class="cate-item b-b two">{{ item.name }}</view>
            <!-- 三级分类 -->
            <view
              v-for="tItem in item.children"
              :key="tItem.id"
              class="cate-item b-b"
              :class="{ active: tItem.id == cateId }"
              @click="changeCate(tItem)"
            >
              {{ tItem.name }}
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated } from "vue";
import { onLoad, onPageScroll, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
// import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import { getCategoryList } from "@/api/pms/category";
import { listSpuPages } from "@/api/pms/goods";

// 响应式数据定义
const cateMaskState = ref(0); // 分类面板状态: 0-隐藏, 1-显示, 2-过渡中
const headerPosition = ref("fixed"); // 导航栏定位
const headerTop = ref("0px"); // 导航栏顶部距离
const loadingType = ref("more"); // 加载状态: more-更多, loading-加载中, nomore-无更多
const filterIndex = ref(0); // 当前筛选索引: 0-综合, 1-销量, 2-价格
const cateId = ref(0); // 当前选中的分类ID
const priceOrder = ref(0); // 价格排序: 0-默认, 1-升序, 2-降序
const cateList = ref([]); // 分类列表数据
const goodsList = ref([]); // 商品列表数据

// 查询参数
const queryParams = ref({
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页数量
  categoryId: undefined, // 分类ID
  sort: "desc", // 排序方式
  sortField: null, // 排序字段
});

// 分页信息
const pagination = ref({
  total: 0, // 总条数
  totalPages: 0, // 总页数
});

// 计算属性：格式化价格（分转元）
const formatPrice = (price) => {
  return price ? (price / 100).toFixed(2) : "0.00";
};

// 页面加载
onLoad((options) => {
  // 移除 getCurrentPages() 调用，改用 uni-app 提供的方式获取当前页面信息
  console.log("🚀 进入商品列表页面", "参数:", options);

  // H5端计算顶部安全距离
  // #ifdef H5
  const pageHead = document.querySelector("uni-page-head");
  if (pageHead) {
    headerTop.value = `${pageHead.offsetHeight}px`;
  }
  // #endif

  // 初始化分类ID
  if (options.tid) {
    cateId.value = parseInt(options.tid);
  }

  // 加载分类数据
  loadCateList(options.fid, options.sid);
});

// 页面滚动事件
onPageScroll((e) => {
  // 兼容iOS端下拉时顶部漂移
  headerPosition.value = e.scrollTop >= 0 ? "fixed" : "absolute";
});

// 下拉刷新
onPullDownRefresh(async () => {
  await loadData("refresh");
  uni.stopPullDownRefresh();
});

// 上拉加载更多
onReachBottom(async () => {
  await loadData("add");
});

/**
 * 加载分类数据
 * @param {number} fid - 一级分类ID
 * @param {number} sid - 二级分类ID
 */
const loadCateList = async (fid, sid) => {
  try {
    const response = await getCategoryList(fid);

    console.log("加载分类数据", response);
    cateList.value = response || [];
    // 加载商品数据
    await loadData("refresh");
  } catch (error) {
    console.error("加载分类失败:", error);
    uni.showToast({
      title: "加载分类失败",
      icon: "none",
    });
  }
};

/**
 * 加载商品数据
 * @param {string} type - 加载类型: 'add'-加载更多, 'refresh'-刷新
 * @param {boolean} showLoading - 是否显示加载提示
 */
const loadData = async (type = "add", showLoading = false) => {
  // 检查是否有更多数据
  if (type === "add" && loadingType.value === "nomore") {
    return;
  }

  // 显示加载状态
  if (showLoading) {
    uni.showLoading({ title: "正在加载" });
  }

  // 重置或增加页码
  if (type === "refresh") {
    queryParams.value.pageNum = 1;
    goodsList.value = [];
    loadingType.value = "more";
  } else {
    queryParams.value.pageNum += 1;
    loadingType.value = "loading";
  }

  // 设置排序参数
  setSortParams();

  // 设置分类ID
  queryParams.value.categoryId = cateId.value || undefined;

  console.log("开始获取商品分页列表");

  try {
    const response = await listSpuPages(queryParams.value);

    console.log("获取商品分页列表", response);
    const { total, list, pages } = response || {};

    // 更新分页信息
    pagination.value = { total, totalPages: pages };

    // 更新商品列表
    if (type === "refresh") {
      goodsList.value = list || [];
    } else {
      goodsList.value = [...goodsList.value, ...(list || [])];
    }

    // 更新加载状态
    loadingType.value = goodsList.value.length >= total ? "nomore" : "more";
  } catch (error) {
    console.error("加载商品失败:", error);
    uni.showToast({
      title: "加载商品失败",
      icon: "none",
    });
    // 加载失败时回退页码
    if (type !== "refresh") {
      queryParams.value.pageNum -= 1;
    }
    loadingType.value = "more";
  } finally {
    if (showLoading) {
      uni.hideLoading();
    }
  }
};

/**
 * 设置排序参数
 */
const setSortParams = () => {
  let sortField = null; // 默认不传排序字段
  let sort = "desc";

  switch (filterIndex.value) {
    case 1: // 销量排序
      sortField = "sales";
      break;
    case 2: // 价格排序
      sortField = "price";
      sort = priceOrder.value === 1 ? "asc" : "desc";
      break;
    // case 0 综合排序不传排序字段
  }

  // 更新查询参数
  queryParams.value.sortField = sortField; // 可能为null
  queryParams.value.sort = sort;
};

/**
 * 筛选标签点击事件
 * @param {number} index - 筛选索引
 */
const tabClick = (index) => {
  // 点击相同的非价格标签，不做处理
  if (filterIndex.value === index && index !== 2) {
    return;
  }

  // 更新筛选状态
  filterIndex.value = index;

  // 处理价格排序切换
  if (index === 2) {
    priceOrder.value = priceOrder.value === 1 ? 2 : 1;
  } else {
    priceOrder.value = 0;
  }

  // 滚动到顶部
  uni.pageScrollTo({
    duration: 300,
    scrollTop: 0,
  });

  // 重新加载数据
  loadData("refresh", true);
};

/**
 * 切换分类面板显示状态
 * @param {string} type - 操作类型: 'show'-显示, 其他-隐藏
 */
const toggleCateMask = (type) => {
  const timer = type === "show" ? 10 : 300;
  const state = type === "show" ? 1 : 0;

  // 先设置为过渡状态
  cateMaskState.value = 2;

  // 延迟设置最终状态
  setTimeout(() => {
    cateMaskState.value = state;
  }, timer);
};

/**
 * 切换分类
 * @param {Object} item - 分类对象
 */
const changeCate = (item) => {
  cateId.value = item.id;

  // 关闭分类面板
  toggleCateMask();

  // 滚动到顶部
  uni.pageScrollTo({
    duration: 300,
    scrollTop: 0,
  });

  // 重新加载数据
  loadData("refresh", true);
};

/**
 * 跳转到商品详情页
 * @param {Object} item - 商品对象
 */
const navToDetailPage = (item) => {
  if (!item || !item.id) {
    uni.showToast({
      title: "商品信息错误",
      icon: "none",
    });
    return;
  }

  // 注意：这里需要根据你的实际路由配置修改
  // 如果是在分包中，可能需要使用绝对路径
  uni.navigateTo({
    url: `/packageC/pages/product/product?id=${item.id}`,
    fail: (err) => {
      console.error("跳转失败:", err);
      // 尝试其他路径格式
      uni.navigateTo({
        url: `/packageC/pages/product/product?id=${item.id}`,
        fail: (err2) => {
          console.error("再次跳转失败:", err2);
          uni.showToast({
            title: "页面跳转失败",
            icon: "none",
          });
        },
      });
    },
  });
};

/**
 * 阻止事件冒泡和默认行为
 */
const stopPrevent = () => {};
</script>

<style lang="scss" scoped>
/* 页面基础样式 */
.content {
  background-color: $page-color-base;
  padding-top: 96rpx; /* 导航栏高度 */
  min-height: 100vh;
  box-sizing: border-box;
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  left: 0;
  top: var(--window-top, 0);
  display: flex;
  align-items: center;
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
  z-index: 100;

  .nav-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 30rpx;
    color: $font-color-dark;
    position: relative;
    cursor: pointer;
    user-select: none;

    &.current {
      color: $base-color;
      font-weight: 500;

      /* 底部指示条 */
      &::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: 120rpx;
        height: 4rpx;
        background-color: $base-color;
        border-radius: 2rpx;
      }
    }
  }

  /* 价格排序图标容器 */
  .p-box {
    display: flex;
    flex-direction: column;
    margin-left: 8rpx;

    .yticon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30rpx;
      height: 14rpx;
      font-size: 24rpx;
      color: $font-color-light;
      transition: color 0.3s;

      &.active {
        color: $base-color;
        font-weight: bold;
      }

      /* 降序图标（翻转） */
      &.xia {
        transform: scaleY(-1);
      }
    }
  }

  /* 分类筛选按钮 */
  .cate-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80rpx;
    height: 100%;
    font-size: 40rpx;
    color: $font-color-dark;
    position: relative;

    /* 左侧分隔线 */
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 36rpx;
      background-color: $border-color;
    }
  }
}

/* 分类筛选面板遮罩 */
.cate-mask {
  position: fixed;
  left: 0;
  top: var(--window-top, 0);
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 99;
  transition: background-color 0.3s ease;
  pointer-events: none;

  /* 隐藏状态 */
  &.none {
    display: none;
  }

  /* 显示状态 */
  &.show {
    background-color: rgba(0, 0, 0, 0.4);
    pointer-events: auto;

    .cate-content {
      transform: translateX(0);
    }
  }

  /* 面板内容 */
  .cate-content {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 630rpx;
    background-color: #fff;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow: hidden;
  }
}

/* 分类列表 */
.cate-list {
  height: 100%;

  .cate-item {
    display: flex;
    align-items: center;
    height: 90rpx;
    padding-left: 30rpx;
    font-size: 28rpx;
    color: $font-color-base;
    position: relative;

    /* 底部边框 */
    &.b-b::after {
      content: "";
      position: absolute;
      left: 30rpx;
      right: 0;
      bottom: 0;
      height: 1px;
      background-color: $border-color;
    }

    /* 二级分类样式 */
    &.two {
      height: 64rpx;
      font-size: 30rpx;
      font-weight: 500;
      color: $font-color-dark;
      background-color: $bg-color;
    }

    /* 选中状态 */
    &.active {
      color: $base-color;
      font-weight: 500;
      background-color: rgba($base-color, 0.1);
    }
  }
}

/* 商品列表网格布局 */
.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx 4%;
  padding: 20rpx 30rpx;
  background-color: #fff;

  .goods-item {
    display: flex;
    flex-direction: column;
    border-radius: 12rpx;
    overflow: hidden;
    background-color: #fff;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    /* 直接设置图片样式 */
    .goods-image {
      width: 100%;
      height: 320rpx;
      border-radius: 8rpx;
      overflow: hidden;
      background-color: $bg-color;
      object-fit: cover;
      display: block;

      &:hover {
        transform: scale(1.05);
      }
    }

    /* 商品图片容器 */
    .image-wrapper {
      width: 100%;
      height: 320rpx;
      border-radius: 8rpx;
      overflow: hidden;
      background-color: $bg-color;

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover image {
        transform: scale(1.05);
      }
    }

    /* 商品标题 */
    .title {
      font-size: $font-lg;
      color: $font-color-dark;
      line-height: 1.4;
      margin: 20rpx 0 16rpx;
      font-weight: 500;

      /* 多行文本截断 */
      &.clamp {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    /* 价格和销量 */
    .price-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding: 0 4rpx;

      .price {
        font-size: $font-lg;
        color: $uni-color-primary;
        font-weight: 600;

        /* 价格符号 */
        &::before {
          content: "¥";
          font-size: 24rpx;
          margin-right: 2rpx;
        }
      }

      /* 销量文本 */
      & > text:last-child {
        font-size: 24rpx;
        color: $font-color-light;
      }
    }
  }
}

/* 加载更多组件 */
:deep(.uni-load-more) {
  padding: 30rpx 0;
}
</style>
