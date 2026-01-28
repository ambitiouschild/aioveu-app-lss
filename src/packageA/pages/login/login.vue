<template>
  <view class="container">
    <view class="left-bottom-sign"></view>
    <view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
    <view class="right-top-sign"></view>
    <view class="wrapper">
      <!-- 小程序登录授权界面 -->
      <!-- #ifdef MP -->
      <button class="confirm-btn" @click.stop="getUserProfile">小程序登录授权</button>
      <view class="tip">
        温馨提示:未注册可我不敌可爱小店的用户,初次登录时将完成注册
      </view>
      <!-- #endif -->

      <!-- H5、Android、IOS登录授权界面 -->
      <!-- #ifndef MP -->
      <view class="left-top-sign">LOGIN</view>
      <view class="welcome">欢迎回来！</view>
      <view class="input-content">
        <view class="input-item" style="position: relative;">
          <text class="tit">手机号码</text>
          <input :value="mobile" placeholder="请输入手机号码" maxlength="11" data-key="mobile"
                 @input="inputChange" />
          <button :disabled="!isCorretPhoneNumber" class="sms-code-btn"
                  :class="{correct_phone_number:isCorretPhoneNumber}" @click.prevent="getSmsCode">
            {{countdown>0 ? `(${countdown}s)已发送` : '获取验证码'}}
          </button>
        </view>

        <view class="input-item">
          <text class="tit">验证码</text>
          <input :value="verifyCode" placeholder="6位随机数字组合" placeholder-class="input-empty" maxlength="20"
                 data-key="verifyCode" @input="inputChange" @confirm="toLogin" />
        </view>
      </view>
      <button class="confirm-btn" @click="toLogin" :disabled="logining">登录</button>
      <view class="tip">
        默认手机号码/验证码: 18866668888/666666
      </view>
      <!-- #endif -->
    </view>
    <view class="register-section">
      还没有账号?
      <text @click="toRegist">马上注册</text>
    </view>
  </view>
</template>

<script setup>
// 这是使用 <script setup>语法的纯 Vue3 版本，没有使用 export default和 setup()函数。所有的响应式数据、计算属性和方法都在 <script setup>中直接声明，这是 Vue3 最简洁的写法。
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/store';
// import { sendSmsCode } from '@/api/user';

const userStore = useUserStore();

// 响应式数据
const mobile = ref('18866668888');
const verifyCode = ref('666666');
const password = ref(undefined);
const logining = ref(false);
const countdown = ref(0);
const timer = ref(null);
const code = ref(undefined);

// 计算属性
const isCorretPhoneNumber = computed(() => {
  return /^1[3456789]\d{9}$/.test(mobile.value);
});

// 生命周期
onMounted(() => {
  // #ifdef MP
  // this.getCode()    // 页面加载时获取一次 code
  // #endif
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});

// 方法
const inputChange = (e) => {
  const key = e.currentTarget.dataset.key;
  if (key === 'mobile') {
    mobile.value = e.detail.value;
  } else if (key === 'verifyCode') {
    verifyCode.value = e.detail.value;
  }
};

const navBack = () => {
  // 如果有上一页，返回上一页
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 否则跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
};

const toRegist = () => {
  uni.showToast({
    title: '去注册',
    icon: 'none'
  });
};

//方案一：每次登录重新获取 code（推荐）
// 使用 Pinia 的微信登录
const getUserProfile = async () => {
  console.log("=== 开始微信登录 ===");

  // 防止重复点击
  if (logining.value) return;

  uni.showLoading({
    title: "微信授权登录中"
  });
  logining.value = true;

  try {
    // 1. 获取微信code
    console.log("1. 获取微信code...");
    const wxCode = await getWxCode();
    console.log("获取到的code:", wxCode);

    // 调用 Pinia action 登录
    // 2. 调用登录接口
    console.log("2. 调用登录接口...");
    const loginResult = await userStore.loginByWechat(wxCode);
    console.log("登录结果:", loginResult);

    // 3. 获取用户信息
    console.log("3. 获取用户信息...");
    await userStore.getInfo();

    // 4. 验证登录状态
    if (userStore.hasLogin && userStore.userInfo) {
      console.log("用户信息:", userStore.userInfo);
      console.log("用户权限:", userStore.permissions);
    }

    // 4. 登录成功处理
    uni.hideLoading();
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });

    // 5. 延迟跳转，让toast显示完整
    setTimeout(() => {
      navigateAfterLogin();
    }, 1500);

    uni.navigateBack();
  } catch (error) {
    console.error('微信登录失败:', error);
    uni.showToast({
      title: '微信登录失败',
      icon: 'none'
    });
    uni.hideLoading();
    logining.value = false;
  }
};

// 可选：保留 getCode 用于页面加载时预获取（但不是必须的）
const getWxCode = () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('获取微信code失败'));
        }
      },
      fail: err => {
        console.error("微信登录失败:", err);
        reject(new Error('微信登录失败: ' + err.errMsg));
      }
    });
  });
};

// 登录后跳转
const navigateAfterLogin = () => {
  // 获取页面栈
  const pages = getCurrentPages();

  // 如果是从其他页面跳转过来的，返回上一页
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2];
    console.log("上一页路由:", prevPage.route);

    // 返回上一页
    uni.navigateBack();
  } else {
    // 否则跳转到首页
    console.log("跳转到首页");
    uni.switchTab({
      url: '/pages/index/index'
    });
  }

  logining.value = false;
};

//  #ifndef MP
// 非小程序登录（手机验证码登录）
const getSmsCode = () => {
  if (!countdown.value) {
    countdown.value = 60;
    timer.value = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer.value);
      }
    }, 1000);

    sendSmsCode(mobile.value).then(res => {
      uni.showToast({
        title: '短信已发送',
        icon: 'success'
      });
    }).catch(error => {
      uni.showToast({
        title: '发送失败',
        icon: 'none'
      });
    });
  }
};

const toLogin = async () => {
  // 防止重复点击
  if (logining.value) return;

  logining.value = true;

  try {
    // 显示加载中
    uni.showLoading({
      title: '登录中...'
    });

    // 调用 Pinia store 的 login 方法
    await userStore.login({
      code: verifyCode.value,
      mobile: mobile.value
    });

    // 获取用户信息
    await userStore.getUserInfo();

    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
    } else {
      console.log("跳转首页");
      // 跳转首页
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    logining.value = false;
  }
};
// #endif
</script>

<style lang="scss" scoped>
.container {
  padding-top: 115px;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}

.wrapper {
  position: relative;
  z-index: 90;
  background: #fff;
  padding-bottom: 40upx;
}

.back-btn {
  position: absolute;
  left: 40upx;
  z-index: 9999;
  padding-top: var(--status-bar-height);
  top: 40upx;
  font-size: 40upx;
  color: $font-color-dark;
}

.left-top-sign {
  font-size: 120upx;
  color: $page-color-base;
  position: relative;
  left: -16upx;
}

.right-top-sign {
  position: absolute;
  top: 80upx;
  right: -30upx;
  z-index: 95;

  &:before,
  &:after {
    display: block;
    content: '';
    width: 400upx;
    height: 80upx;
    background: #b4f3e2;
  }

  &:before {
    transform: rotate(50deg);
    border-radius: 0 50px 0 0;
  }

  &:after {
    position: absolute;
    right: -198upx;
    top: 0;
    transform: rotate(-50deg);
    border-radius: 50px 0 0 0;
    /* background: pink; */
  }
}

.left-bottom-sign {
  position: absolute;
  left: -270upx;
  bottom: -320upx;
  border: 100upx solid #d0d1fd;
  border-radius: 50%;
  padding: 180upx;
}

.welcome {
  position: relative;
  left: 50upx;
  top: -90upx;
  font-size: 46upx;
  color: #555;
  text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
}

.input-content {
  padding: 0 60upx;
}

.input-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 30upx;
  background: $page-color-light;
  height: 120upx;
  border-radius: 4px;
  margin-bottom: 50upx;

  &:last-child {
    margin-bottom: 0;
  }

  .tit {
    height: 50upx;
    line-height: 56upx;
    font-size: $font-sm + 1px;
    color: $font-color-base;
  }

  input {
    height: 60upx;
    font-size: $font-base + 1px;
    color: $font-color-dark;
    width: 100%;
  }
}

.sms-code-btn {
  position: absolute;
  right: 0;
  border: none;
  color: #ccc;
  background: transparent;
  font-size: 14px;
}

.correct_phone_number {
  color: #000;
}

.confirm-btn {
  width: 630upx;
  height: 76upx;
  line-height: 76upx;
  border-radius: 50px;
  margin-top: 70upx;
  background: $uni-color-primary;
  color: #fff;
  font-size: $font-lg;

  &:after {
    border-radius: 100px;
  }
}

.forget-section {
  font-size: $font-sm + 1px;
  color: $font-color-spec;
  text-align: center;
  margin-top: 40upx;
}

.register-section {
  position: absolute;
  left: 0;
  bottom: 50upx;
  width: 100%;
  font-size: $font-sm + 1px;
  color: $font-color-base;
  text-align: center;

  text {
    color: $font-color-spec;
    margin-left: 10upx;
  }
}

.tip {
  margin-top: 60upx;
  font-size: $font-base - 2px;
  color: $font-color-dark;
  text-align: center;
  font-family: yticon;
  font-weight: bold;
}
</style>
