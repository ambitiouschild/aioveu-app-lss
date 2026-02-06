<template>
  <view class="container">
    <view class="user-section">
      <image
        class="bg"
        src="https://minio.aioveu.com/aioveu/aioveu-server/pages/user/user-bg2.png"
      ></image>
      <view class="user-info-box">
        <view
          class="portrait-box"
          @click="hasLogin == false && navTo('/packageA/pages/login/login')"
        >
          <image
            class="portrait"
            :src="
              avatar || 'https://minio.aioveu.com/aioveu/aioveu-server/pages/user/missing-face.png'
            "
          ></image>
        </view>
        <view class="info-box">
          <text class="username">{{ nickname || "游客" }}</text>
        </view>
      </view>
      <view class="vip-card-box">
        <image class="card-bg" src="/static/tabbar/cart/vip-card-bg.png" mode=""></image>
        <view class="b-btn">立即开通</view>
        <view class="tit">
          <text class="yticon icon-iLinkapp-"></text>
          可我不敌可爱会员
        </view>
        <text class="e-m">可我不敌可爱 Union</text>
        <text class="e-b">开通会员开发无bug 一测就上线</text>
      </view>
    </view>

    <view
      class="cover-container"
      :style="[
        {
          transform: coverTransform,
          transition: coverTransition,
        },
      ]"
      @touchstart="coverTouchstart"
      @touchmove="coverTouchmove"
      @touchend="coverTouchend"
    >
      <image
        class="arc"
        src="https://minio.aioveu.com/aioveu/aioveu-server/pages/user/arc.png"
      ></image>

      <view class="tj-sction">
        <view class="tj-item">
          <text class="num">{{ balance | moneyFormatter }}</text>
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
          class="order-item"
          @click="navTo('/packageD/pages/order/order?status=0')"
          hover-class="common-hover"
          :hover-stay-time="50"
        >
          <text class="yticon icon-shouye"></text>
          <text>全部订单</text>
        </view>
        <view
          class="order-item"
          @click="navTo('/packageD/pages/order/order?status=1')"
          hover-class="common-hover"
          :hover-stay-time="50"
        >
          <text class="yticon icon-daifukuan"></text>
          <text>待付款</text>
        </view>
        <view
          class="order-item"
          @click="navTo('/packageD/pages/order/order?status=2')"
          hover-class="common-hover"
          :hover-stay-time="50"
        >
          <text class="yticon icon-yishouhuo"></text>
          <text>待发货</text>
        </view>
        <view
          class="order-item"
          @click="navTo('/packageD/pages/order/order?status=4')"
          hover-class="common-hover"
          :hover-stay-time="50"
        >
          <text class="yticon icon-shouhoutuikuan"></text>
          <text>已完成</text>
        </view>
      </view>
      <!-- 浏览历史 -->
      <view class="history-section icon">
        <view class="sec-header">
          <text class="yticon icon-lishijilu"></text>
          <text>浏览历史</text>
        </view>
        <scroll-view scroll-x class="h-list">
          <image
            @click="navTo('/packageC/pages/product/product')"
            src="https://minio.aioveu.com/aioveu/20251128/9dc40c944d044c8d8ae37b14a35b8b83.png"
            mode="aspectFill"
          ></image>
          <image
            @click="navTo('/packageC/pages/product/product')"
            src="https://minio.aioveu.com/aioveu/20251128/9dc40c944d044c8d8ae37b14a35b8b83.png"
            mode="aspectFill"
          ></image>
          <image
            @click="navTo('/packageC/pages/product/product')"
            src="https://minio.aioveu.com/aioveu/20251128/9dc40c944d044c8d8ae37b14a35b8b83.png"
            mode="aspectFill"
          ></image>
          <image
            @click="navTo('/packageC/pages/product/product')"
            src="https://minio.aioveu.com/aioveu/20251128/9dc40c944d044c8d8ae37b14a35b8b83.png"
            mode="aspectFill"
          ></image>

          <image
            @click="navTo('/packageC/pages/product/product')"
            src="https://minio.aioveu.com/aioveu/20251128/9dc40c944d044c8d8ae37b14a35b8b83.png"
            mode="aspectFill"
          ></image>
          <image
            @click="navTo('/packageC/pages/product/product')"
            src="https://minio.aioveu.com/aioveu/20251128/9dc40c944d044c8d8ae37b14a35b8b83.png"
            mode="aspectFill"
          ></image>
        </scroll-view>
        <!--        图标是使用字体图标（font icon）的方式，而不是图片-->
        <list-cell
          icon="icon-iconfontweixin"
          iconColor="#e07472"
          title="我的钱包"
          tips="您的会员还有3天过期"
        ></list-cell>
        <list-cell
          icon="icon-dizhi"
          iconColor="#5fcda2"
          title="地址管理"
          @eventClick="navTo('/packageA/pages/address/address')"
        ></list-cell>
        <list-cell
          icon="icon-share"
          iconColor="#9789f7"
          title="分享"
          tips="邀请好友赢10万大礼"
        ></list-cell>
        <list-cell
          icon="icon-pinglun-copy"
          iconColor="#ee883b"
          title="晒单"
          tips="晒单抢红包"
        ></list-cell>
        <list-cell
          icon="icon-shoucang_xuanzhongzhuangtai"
          iconColor="#54b4ef"
          title="我的收藏"
        ></list-cell>
        <list-cell
          icon="icon-shezhi1"
          iconColor="#e07472"
          title="设置"
          border=""
          @eventClick="navTo('/packageA/pages/mine/settings/set')"
        ></list-cell>
      </view>
    </view>
  </view>
</template>
<script>
import listCell from "@/components/mix-list-cell";
import { useUserStore } from "@/store";
import { onShow, onHide } from "@dcloudio/uni-app";

const userStore = useUserStore();

let startY = 0,
  moveY = 0,
  pageAtTop = true;
export default {
  components: {
    listCell,
  },
  data() {
    return {
      coverTransform: "translateY(0px)",
      coverTransition: "0s",
      moving: false,
      balance: 0, // 余额
      couponCount: 0, // 优惠券数量
      points: 0, // 积分
      isLoading: false,
    };
  },
  onShow() {
    console.log("个人中心页面显示");
    this.loadUserData();
  },

  onLoad() {},
  // #ifndef MP
  onNavigationBarButtonTap(e) {
    const index = e.index;
    if (index === 0) {
      this.navTo("/packageA/pages/set/set");
    } else if (index === 1) {
      // #ifdef APP-PLUS
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      const currentWebview = page.$getAppWebview();
      currentWebview.hideTitleNViewButtonRedDot({
        index,
      });
      // #endif
      uni.navigateTo({
        url: "/pages/notice/notice",
      });
    }
  },
  // #endif
  computed: {
    // 使用 Pinia 获取登录状态  userStore.hasLogin &&
    hasLogin() {
      return userStore.token;
    },

    // 昵称
    nickname() {
      if (userStore.userInfo) {
        return userStore.userInfo.nickName || userStore.userInfo.username || "用户";
      }
      return "游客";
    },

    // nickname(){ return userStore.nickName},

    // 头像
    avatar() {
      if (userStore.userInfo) {
        // 确保头像地址是完整的URL
        console.log("头像地址：{}", userStore.userInfo);
        let avatar = userStore.userInfo.avatarUrl || "";
        if (avatar && !avatar.startsWith("http") && !avatar.startsWith("https")) {
          // 如果是相对路径，添加基础URL
          avatar = "https://你的图片服务器地址" + avatar;
        }
        return avatar;
      }
      return "https://minio.aioveu.com/aioveu/aioveu-server/pages/user/missing-face.png";
    },

    // 用户ID
    userId() {
      return userStore.userInfo?.id || "";
    },

    // 用户名
    username() {
      return userStore.userInfo?.username || "";
    },
  },
  methods: {
    /**
     * 加载用户数据
     */
    async loadUserData() {
      if (this.isLoading) return;

      const userStore = useUserStore();

      // 如果未登录，不加载数据
      if (!this.hasLogin) {
        console.log("用户未登录，不加载数据");
        return;
      }

      this.isLoading = true;

      try {
        console.log("开始加载用户数据");

        // 1. 获取用户详细信息
        if (!userStore.userInfo) {
          console.log("用户信息不存在，重新获取");
          await userStore.getInfo();
        }

        // console.log('当前用户信息:', userStore.userInfo);

        // 2. 获取用户资产信息（余额、积分、优惠券等）
        await this.loadUserAssets();
      } catch (error) {
        console.error("加载用户数据失败:", error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 加载用户资产信息
     */
    async loadUserAssets() {
      try {
        // 这里应该调用你的API接口获取用户资产信息
        // 暂时使用模拟数据
        const userStore = useUserStore();

        // 模拟API调用
        // const assets = await this.$api.getUserAssets();

        // 使用用户信息中的余额字段，或者默认值
        this.balance = userStore.userInfo?.balance || 0;
        this.points = userStore.userInfo?.points || 0;
        this.couponCount = userStore.userInfo?.couponCount || 0;

        // console.log('用户资产加载完成:', {
        //   balance: this.balance,
        //   points: this.points,
        //   couponCount: this.couponCount
        // });
      } catch (error) {
        console.error("加载用户资产失败:", error);
      }
    },

    /**
     * 统一跳转接口,拦截未登录路由
     */
    navTo(url) {
      console.log("跳转路径:", url);

      // 需要登录的页面
      const needLoginPages = [
        "/packageD/pages/order/order",
        // '/pages/vip/vip',
        // '/packageA/pages/address/address',
        // '/packageA/pages/mine/settings/set'
      ];

      const needLogin = needLoginPages.some((page) => url.includes(page));

      if (needLogin && !this.hasLogin) {
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
    },

    /**
     *  会员卡下拉和回弹
     *  1.关闭bounce避免ios端下拉冲突
     *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
     *    transition设置0.1秒延迟，让css来过渡这段空窗期
     *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
     */
    coverTouchstart(e) {
      if (pageAtTop === false) {
        return;
      }
      this.coverTransition = "transform .1s linear";
      startY = e.touches[0].clientY;
    },
    coverTouchmove(e) {
      moveY = e.touches[0].clientY;
      let moveDistance = moveY - startY;
      if (moveDistance < 0) {
        this.moving = false;
        return;
      }
      this.moving = true;
      if (moveDistance >= 80 && moveDistance < 100) {
        moveDistance = 80;
      }

      if (moveDistance > 0 && moveDistance <= 80) {
        this.coverTransform = `translateY(${moveDistance}px)`;
      }
    },
    coverTouchend() {
      if (this.moving === false) {
        return;
      }
      this.moving = false;
      this.coverTransition = "transform 0.3s cubic-bezier(.21,1.93,.53,.64)";
      this.coverTransform = "translateY(0px)";
    },
  },
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
    margin-left: 30upx;

    .yticon {
      font-size: 44upx;
      color: #5eba8f;
      margin-right: 16upx;
      line-height: 40upx;
    }
  }

  .h-list {
    white-space: nowrap;
    padding: 30upx 30upx 0;

    image {
      display: inline-block;
      width: 160upx;
      height: 160upx;
      margin-right: 20upx;
      border-radius: 10upx;
    }
  }
}
</style>
