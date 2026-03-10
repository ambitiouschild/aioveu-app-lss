<template>
  <view class="container">
    <view class="user-section">
      <image
        class="bg"
        src="https://cdn.aioveu.com/aioveu/aioveu-server/pages/user/user-bg2.png"
      ></image>
      <view class="user-info-box">
        <view
          class="portrait-box"
          @click="hasLogin == false && navTo('/packageA/pages/login/login')"
        >
          <image class="portrait" :src="avatarUrl" />
        </view>
        <view class="info-box">
          <text class="username">{{ nickname }}</text>
        </view>
      </view>
      <view class="vip-card-box">
        <image class="card-bg" src="/static/tabbar/cart/vip-card-bg.png" mode=""></image>
        <view class="b-btn">立即开通</view>
        <view class="tit">
          <text class="yticon icon-iLinkapp-"></text>
          可我不敌可心动会员
        </view>
        <text class="e-m">可我不敌心动 Union</text>
        <text class="e-b">开通会员开发无bug 一测就上线</text>
      </view>
    </view>

    <view
      class="cover-container"
      :style="coverStyle"
      @touchstart="onCoverTouchStart"
      @touchmove="onCoverTouchMove"
      @touchend="onCoverTouchEnd"
    >
      <image
        class="arc"
        src="https://cdn.aioveu.com/aioveu/aioveu-server/pages/user/arc.png"
      ></image>

      <view class="tj-sction">
        <view class="tj-item">
          <text class="num">{{ formatMoney(balance) }}</text>
          <text>余额</text>
        </view>
        <view class="tj-item">
          <text class="num">0</text>
          <text>优惠券</text>
        </view>
        <view class="tj-item">
          <text class="num">0</text>
          <text>积分</text>
        </view>
      </view>

      <!-- 订单 -->
      <view class="order-section">
        <view
          v-for="item in orderItems"
          :key="item.status"
          class="order-item"
          hover-class="common-hover"
          hover-stay-time="50"
          @click="onOrderItemClick(item.status)"
        >
          <text :class="`yticon ${item.icon}`" />
          <text>{{ item.text }}</text>
        </view>
      </view>

      <!-- 浏览历史 -->
      <view class="history-section icon">
        <view class="sec-header">
          <text class="yticon icon-lishijilu"></text>
          <text>浏览历史</text>
          <text v-if="historyList.length > 0" class="clear-btn" @click="clearHistory">清空</text>
        </view>

        <!-- 有历史记录时 -->
        <scroll-view v-if="historyList.length > 0" scroll-x class="h-list">
          <view
            v-for="(item, index) in historyList"
            :key="item.id || index"
            class="history-item"
            @click="viewProduct(item)"
          >
            <image :src="item.image" :mode="item.mode || 'aspectFill'" class="product-image" />
            <view class="product-info">
              <text class="product-title" v-if="item.title">{{ item.title }}</text>
              <text class="product-price" v-if="item.price">¥{{ formatMoney(item.price) }}</text>
            </view>
            <view v-if="item.tag" class="product-tag">{{ item.tag }}</view>
          </view>

          <!-- 查看更多占位 -->
          <view class="more-placeholder" @click="viewAllHistory">
            <text class="yticon icon-gengduo"></text>
            <text>查看更多</text>
          </view>
        </scroll-view>

        <!-- 无历史记录时 -->
        <view v-else class="empty-history">
          <text class="yticon icon-wuliu"></text>
          <text>暂无浏览记录</text>
          <view class="goto-shop" @click="goToShop">去逛逛</view>
        </view>

        <!-- 功能列表 -->
        <!--        图标是使用字体图标（font icon）的方式，而不是图片-->
        <list-cell
          v-for="item in functionList"
          :key="item.title"
          :icon="item.icon"
          :icon-color="item.iconColor"
          :title="item.title"
          :tips="item.tips"
          :border="item.border"
          @event-click="item.event && item.event()"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onShow, onHide } from "@dcloudio/uni-app";
import listCell from "@/components/mix-list-cell";
import { useUserStore } from "@/store";
import { formatMoney } from "@/utils/format";

const userStore = useUserStore();

// 触摸相关变量
let startY = 0;
let moveY = 0;
let pageAtTop = true;

// 响应式数据
const coverTransform = ref("translateY(0px)");
const coverTransition = ref("0s");
const isMoving = ref(false);
const balance = ref(0); // 余额
const couponCount = ref(0); // 优惠券数量
const points = ref(0); // 积分
const isLoading = ref(false);

// 历史记录数据
const historyList = ref([]);

// 订单项配置
const orderItems = [
  { status: 0, icon: "icon-shouye", text: "全部订单" },
  { status: 1, icon: "icon-daifukuan", text: "待付款" },
  { status: 2, icon: "icon-yishouhuo", text: "待发货" },
  { status: 4, icon: "icon-shouhoutuikuan", text: "已完成" },
];

// 功能列表配置
const functionList = [
  {
    icon: "icon-iconfontweixin",
    iconColor: "#e07472",
    title: "我的钱包",
    tips: "您的会员还有3天过期",
  },
  {
    icon: "icon-dizhi",
    iconColor: "#5fcda2",
    title: "地址管理",
    event: () => navTo("/packageA/pages/address/address"),
  },
  { icon: "icon-share", iconColor: "#9789f7", title: "分享", tips: "邀请好友赢10万大礼" },
  { icon: "icon-pinglun-copy", iconColor: "#ee883b", title: "晒单", tips: "晒单抢红包" },
  { icon: "icon-shoucang_xuanzhongzhuangtai", iconColor: "#54b4ef", title: "我的收藏" },
  {
    icon: "icon-shezhi1",
    iconColor: "#e07472",
    title: "设置",
    border: "",
    event: () => navTo("/packageA/pages/mine/settings/set"),
  },
];

// 计算属性  // 使用 Pinia 获取登录状态  userStore.hasLogin &&
const hasLogin = computed(() => !!userStore.token);

// 昵称
const nickname = computed(() => {
  if (!userStore.userInfo) return "游客 请点击头像登录";
  return userStore.userInfo.nickName || userStore.userInfo.username || "用户";
});

const avatarUrl = computed(() => {
  if (!userStore.userInfo) {
    return "https://cdn.aioveu.com/aioveu/aioveu-server/pages/user/missing-face.png";
  }

  let avatar = userStore.userInfo.avatarUrl || "";
  if (avatar && !avatar.startsWith("http") && !avatar.startsWith("https")) {
    // 如果是相对路径，添加基础URL
    avatar = "https://你的图片服务器地址" + avatar;
  }
  return avatar || "https://cdn.aioveu.com/aioveu/aioveu-server/pages/user/missing-face.png";
});

// 用户ID
const userId = computed(() => {

  return userStore.userInfo?.id || "";
});

// 用户名
const username = computed(() => {
  return userStore.userInfo?.username || "";
});

const coverStyle = computed(() => ({
  transform: coverTransform.value,
  transition: coverTransition.value,
}));

// 生命周期
onMounted(() => {
  console.log("个人中心页面挂载");
});

onShow(() => {
  console.log("个人中心页面显示");
  loadUserData();
  // 这里应该调用API获取真实的浏览历史
  loadHistoryData();
});

const loadHistoryData = async () => {
  try {
    // 模拟API调用
    // const res = await uni.request({ url: '/api/user/history' });
    // historyList.value = res.data;

    // 暂时使用模拟数据
    historyList.value = mockHistoryData;
  } catch (error) {
    console.error("加载浏览历史失败:", error);
  }
};

const viewProduct = (item) => {
  console.log("查看商品:", item);
  uni.navigateTo({
    url: `/packageC/pages/product/product?id=${item.productId}`,
    animationType: "slide-in-right",
  });
};

const viewAllHistory = () => {
  uni.navigateTo({
    url: "/packageD/pages/history/history",
    animationType: "slide-in-right",
  });
};

const clearHistory = () => {
  uni.showModal({
    title: "提示",
    content: "确定要清空浏览历史吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用API清空历史记录
          // await uni.request({ url: '/api/user/history/clear', method: 'POST' });

          historyList.value = [];
          uni.showToast({
            title: "已清空",
            icon: "success",
          });
        } catch (error) {
          uni.showToast({
            title: "清空失败",
            icon: "error",
          });
        }
      }
    },
  });
};

const goToShop = () => {
  uni.switchTab({
    url: "/pages/index/index",
  });
};

// 方法
const loadUserData = async () => {
  if (isLoading.value || !hasLogin.value) {
    console.log("用户未登录或正在加载，不加载数据");
    return;
  }

  isLoading.value = true;

  try {
    console.log("开始加载用户数据");

    // 1. 获取用户详细信息
    if (!userStore.userInfo) {
      console.log("用户信息不存在，重新获取");
      await userStore.getInfo();
    }

    // 2. 获取用户资产信息
    await loadUserAssets();
  } catch (error) {
    console.error("加载用户数据失败:", error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 加载用户数据
 */
const loadUserAssets = async () => {
  try {
    // 这里应该调用API接口获取用户资产信息
    // 暂时使用模拟数据
    balance.value = userStore.userInfo?.balance || 0;
    points.value = userStore.userInfo?.points || 0;
    couponCount.value = userStore.userInfo?.couponCount || 0;
  } catch (error) {
    console.error("加载用户资产失败:", error);
  }
};

/**
 * 统一跳转接口,拦截未登录路由
 */
const navTo = (url) => {
  console.log("跳转路径:", url);

  // 需要登录的页面
  const needLoginPages = ["/packageD/pages/order/order"];

  const needLogin = needLoginPages.some((page) => url.includes(page));

  if (needLogin && !hasLogin.value) {
    console.log("需要登录，跳转到登录页");
    uni.showModal({
      title: "提示",
      content: "请先登录",
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: "/packageA/pages/login/login",
            animationType: "slide-in-right",
          });
        }
      },
    });
    return;
  }

  // 普通跳转
  uni.navigateTo({
    url,
    animationType: "slide-in-right",
  });
};

const onOrderItemClick = (status) => {
  navTo(`/packageD/pages/order/order?status=${status}`);
};

// 触摸事件处理
/**
 *  会员卡下拉和回弹
 *  1.关闭bounce避免ios端下拉冲突
 *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
 *    transition设置0.1秒延迟，让css来过渡这段空窗期
 *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
 */
const onCoverTouchStart = (e) => {
  if (!pageAtTop) return;
  coverTransition.value = "transform .1s linear";
  startY = e.touches[0].clientY;
};

const onCoverTouchMove = (e) => {
  moveY = e.touches[0].clientY;
  let moveDistance = moveY - startY;

  if (moveDistance < 0) {
    isMoving.value = false;
    return;
  }

  isMoving.value = true;
  if (moveDistance >= 80 && moveDistance < 100) {
    moveDistance = 80;
  }

  if (moveDistance > 0 && moveDistance <= 80) {
    coverTransform.value = `translateY(${moveDistance}px)`;
  }
};

const onCoverTouchEnd = () => {
  if (!isMoving.value) return;
  isMoving.value = false;
  coverTransition.value = "transform 0.3s cubic-bezier(.21,1.93,.53,.64)";
  coverTransform.value = "translateY(0px)";
};
</script>

<style lang="scss">
%flex-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

%section {
  display: flex;
  justify-content: space-around;
  align-content: center;
  background: #fff;
  border-radius: 10upx;
}

.user-section {
  height: 520upx;
  padding: 100upx 30upx 0;
  position: relative;

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    filter: blur(1px);
    opacity: 0.7;
  }
}

.user-info-box {
  height: 180upx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;

  .portrait {
    width: 130upx;
    height: 130upx;
    border: 5upx solid #fff;
    border-radius: 50%;
  }

  .username {
    font-size: $font-lg + 1px;
    color: $font-color-dark;
    margin-left: 20upx;
  }
}

.vip-card-box {
  display: flex;
  flex-direction: column;
  color: #f7d680;
  height: 240upx;

  //旧版的线性渐变语法 	//background: linear-gradient(left, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8));

  //新版的线性渐变语法
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8));
  border-radius: 16upx 16upx 0 0;
  overflow: hidden;
  position: relative;
  padding: 20upx 24upx;

  .card-bg {
    position: absolute;
    top: 20upx;
    right: 0;
    width: 380upx;
    height: 260upx;
  }

  .b-btn {
    position: absolute;
    right: 20upx;
    top: 16upx;
    width: 132upx;
    height: 40upx;
    text-align: center;
    line-height: 40upx;
    font-size: 22upx;
    color: #36343c;
    border-radius: 20px;
    /* 修改前 */ /*background: linear-gradient(left, #f9e6af, #ffd465);*/

    /* 修改后 */
    background: linear-gradient(to right, #f9e6af, #ffd465);
    z-index: 1;
  }

  .tit {
    font-size: $font-base + 1px;
    color: #f7d680;
    margin-bottom: 28upx;

    .yticon {
      color: #f6e5a3;
      margin-right: 16upx;
    }
  }

  .e-b {
    font-size: $font-sm;
    color: #d8cba9;
    margin-top: 10upx;
  }
}

.cover-container {
  background: $page-color-base;
  margin-top: -150upx;
  padding: 0 30upx;
  position: relative;
  background: #f5f5f5;
  padding-bottom: 20upx;

  .arc {
    position: absolute;
    left: 0;
    top: -34upx;
    width: 100%;
    height: 36upx;
  }
}

.tj-sction {
  @extend %section;

  .tj-item {
    @extend %flex-center;
    flex-direction: column;
    height: 140upx;
    font-size: $font-sm;
    color: #75787d;
  }

  .num {
    font-size: $font-lg;
    color: $font-color-dark;
    margin-bottom: 8upx;
  }
}

.order-section {
  @extend %section;
  padding: 28upx 0;
  margin-top: 20upx;

  .order-item {
    @extend %flex-center;
    width: 120upx;
    height: 120upx;
    border-radius: 10upx;
    font-size: $font-sm;
    color: $font-color-dark;
  }

  .yticon {
    font-size: 48upx;
    margin-bottom: 18upx;
    color: #fa436a;
  }

  .icon-shouhoutuikuan {
    font-size: 44upx;
  }
}

.history-section {
  padding: 30upx 0 0;
  margin-top: 20upx;
  background: #fff;
  border-radius: 10upx;

  .sec-header {
    display: flex;
    align-items: center;
    font-size: $font-base;
    color: $font-color-dark;
    line-height: 40upx;
    margin: 0 30upx 20upx;
    padding-bottom: 20upx;
    border-bottom: 1px solid #f5f5f5;

    .yticon {
      font-size: 44upx;
      color: #5eba8f;
      margin-right: 16upx;
      line-height: 40upx;
    }

    .clear-btn {
      margin-left: auto;
      font-size: $font-sm;
      color: $font-color-light;
      padding: 6upx 20upx;
      border: 1px solid #eee;
      border-radius: 20upx;
    }
  }

  .h-list {
    white-space: nowrap;
    padding: 0 20upx 30upx;

    .history-item {
      display: inline-block;
      width: 200upx;
      margin-right: 20upx;
      position: relative;

      &:last-child {
        margin-right: 0;
      }

      .product-image {
        width: 200upx;
        height: 200upx;
        border-radius: 10upx;
        display: block;
      }

      .product-info {
        margin-top: 10upx;
        white-space: normal;

        .product-title {
          display: block;
          font-size: $font-sm;
          color: $font-color-dark;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-price {
          display: block;
          font-size: $font-base;
          color: $uni-color-error;
          font-weight: bold;
          margin-top: 5upx;
        }
      }

      .product-tag {
        position: absolute;
        top: 10upx;
        left: 10upx;
        background: $uni-color-error;
        color: #fff;
        font-size: 20upx;
        padding: 4upx 10upx;
        border-radius: 4upx;
      }
    }

    .more-placeholder {
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 200upx;
      height: 200upx;
      border: 2upx dashed #ddd;
      border-radius: 10upx;
      color: $font-color-light;

      .yticon {
        font-size: 60upx;
        margin-bottom: 10upx;
      }
    }
  }

  .empty-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60upx 0;

    .yticon {
      font-size: 120upx;
      color: #ddd;
      margin-bottom: 20upx;
    }

    .goto-shop {
      margin-top: 30upx;
      padding: 15upx 40upx;
      background: $uni-color-primary;
      color: #fff;
      border-radius: 30upx;
      font-size: $font-base;
    }
  }
}
</style>
