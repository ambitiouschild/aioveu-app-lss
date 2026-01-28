<template>
  <!-- 支付页面主容器 -->
  <!-- 简洁的支付页面 -->
  <view class="app">


<!--    完全可以不设计倒计时。在很多电商场景中，支付页面确实不需要倒计时，这完全取决于业务需求。
    1. 实际业务场景
    很多电商平台（如淘宝、京东）的支付页面没有倒计时显示
    用户支付是主动行为，不需要时间压力
    超时订单可以由后台系统自动处理
    2. 用户体验
    倒计时会给用户带来不必要的压力
    简单明了的支付页面体验更好
    用户关注点在支付本身，不在时间
    3. 技术简化
    减少复杂度
    避免定时器管理问题
    减少服务器压力（不需要频繁查询订单状态）-->

<!--    4. 实际案例分析
    淘宝/天猫：支付页面无倒计时
    京东：部分场景有倒计时（如秒杀），普通订单无
    拼多多：支付页面简洁，无倒计时
    美团外卖：有倒计时（外卖业务特殊）
    普通电商：大部分无倒计时

    如果您的业务不是秒杀、抢购、外卖等对时间敏感的领域，完全可以不设计倒计时。
    这样可以让：
    1.页面更简洁
    2.代码更简单
    3.用户体验更友好
    4.维护更容易
    支付页面应该专注于核心功能：让用户快速、顺利地完成支付，而不是增加不必要的复杂性。
    -->

    <!-- 1. 支付状态和倒计时（核心） -->
    <view class="payment-header">
      <view class="header-content">
        <view class="status-box">
          <text class="status-title">等待支付</text>
          <view v-if="countdown > 0" class="countdown-box">
            <text class="countdown-text">剩余支付时间</text>
            <view class="countdown-time">{{ formatTime(countdown) }}</view>
          </view>
          <view v-else class="expired-tip">订单待支付</view>
        </view>
      </view>
    </view>

    <!-- 支付金额显示区域 -->

    <!-- 2. 关键信息摘要（不是完整信息） -->
    <view class="info-summary">
      <view class="summary-item">
        <text class="label">订单号</text>
        <text class="value">{{ orderSn }}</text>
      </view>
      <view class="summary-item">
        <text class="label">支付金额</text>
        <text class="value amount">¥{{ formatPrice(paymentAmount) }}</text>
      </view>
    </view>


    <view class="price-box">
      <text>支付金额</text>
      <text class="price">{{ formatPrice(paymentAmount) }}</text>
    </view>

    <!-- 支付方式选择列表 -->
    <view class="pay-type-list">
      <!-- 预存款支付选项 -->
      <view class="type-item" @click="changePayType('BALANCE')">
        <text class="icon yticon icon-erjiye-yucunkuan"></text>
        <view class="con">
          <text class="tit">预存款支付</text>
          <text>可用余额 ¥{{ formatPrice(balance) }}</text>
        </view>
        <label class="radio">
          <radio value="" color="#fa436a" :checked="payType === 'BALANCE'" />
        </label>
      </view>

      <!-- 微信支付选项 -->
      <view class="type-item b-b" @click="changePayType('WX_JSAPI')">
        <text class="icon yticon icon-weixinzhifu"></text>
        <view class="con">
          <text class="tit">微信支付</text>
          <text>推荐使用微信支付</text>
        </view>
        <label class="radio">
          <radio value="" color="#fa436a" :checked="payType === 'WX_JSAPI'" />
        </label>
      </view>

      <!-- 支付宝支付选项 -->
      <view class="type-item b-b" @click="changePayType('ALIPAY')">
        <text class="icon yticon icon-alipay"></text>
        <view class="con">
          <text class="tit">支付宝支付</text>
        </view>
        <label class="radio">
          <radio value="" color="#fa436a" :checked="payType === 'ALIPAY'" />
        </label>
      </view>
    </view>

    <!-- 确认支付按钮 -->
    <text class="mix-btn" @click="handlePay">确认支付</text>
  </view>
</template>

<script setup>

/*没有必要在支付页面再完整显示一遍订单信息
1. 用户体验角度
用户刚刚在订单确认页面已经仔细核对过商品、地址、金额等信息
支付页面应该专注于支付功能，减少信息干扰
重复信息会造成页面冗余，分散用户注意力
2. 页面职责分离
订单确认页面：用于核对订单详细信息
支付页面：专注于选择支付方式和完成支付
每个页面应该有明确的单一职责
3. 实际业务场景
用户已经确认订单 → 进入支付 → 选择支付方式 → 完成支付
中间不需要再次确认所有订单细节*/
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { pay } from '@/api/oms/order.ts';
import { useUserStore } from '@/store';

// 获取 Vuex store 实例
const userStore = useUserStore();

// 响应式数据定义
const orderSn = ref('');         // 订单编号
// const appId = ref('');         // appid
const payType = ref('BALANCE'); // 当前选中的支付方式
const paymentAmount = ref(0);    // 支付金额

const paying = ref(false);       // 支付中状态，防止重复点击


const imgalist = ref(['@/static/wxpay.png']); // 图片预览列表

// 计算属性：从 Vuex 获取用户余额
const balance = computed(() => userStore.userInfo.balance /100);

// 页面加载时执行
onLoad((options) => {
  console.log('========>> 进入支付页面, 参数：', options);

  // 从页面参数中获取订单信息
  orderSn.value = options.orderSn || '';
// options.paymentAmount 是分（字符串 "13200"）
  const amountInFen = parseFloat(options.paymentAmount) || 0;  // 13200
  paymentAmount.value = amountInFen / 100;  // 转换为元：132.00

  // 从配置或 store 获取 appId
  // appId.value = uni.getStorageSync('appId') || '';
  // 或者从用户信息获取
  // appId.value = userStore.userInfo.appId || '';

  console.log('支付页面加载完成:', {
    orderSn: orderSn.value,
    paymentAmount: paymentAmount.value,
    balance: balance.value
  });

});

/**
 * 切换支付方式
 * @param {string} type - 支付方式类型
 */
const changePayType = (type) => {
  payType.value = type;
  console.log(`切换支付方式为: ${type}`);
};

/**
 * 格式化金额显示
 * @param {number} amount - 金额数值
 * @returns {string} 格式化后的金额字符串
 */
const formatPrice = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00';
  }
  return Number(amount).toFixed(2);
};

/**
 * 处理支付操作
 */
const handlePay = async () => {


  // 防止重复点击
  if (paying.value) {
    return;
  }

  paying.value = true;


  console.info('======== 开始支付流程 ========');
  console.log('页面显示金额（元）:', paymentAmount.value);

  console.log('支付参数:', {
    orderSn: orderSn.value,
    payType: payType.value,
    paymentAmount: paymentAmount.value,
    balance: balance.value
  });

  // 参数校验
  if (!orderSn.value) {
    uni.showToast({
      title: '订单号不能为空',
      icon: 'none',
      duration: 2000
    });
    paying.value = false;
    return;
  }

  if (paymentAmount.value <= 0) {
    uni.showToast({
      title: '支付金额无效',
      icon: 'none',
      duration: 2000
    });
    paying.value = false;
    return;
  }

  // 检查 appId
  // if (!appId.value && payType.value === 'WX_JSAPI') {
  //   uni.showToast({
  //     title: '请重新登录获取支付信息',
  //     icon: 'none',
  //     duration: 2000
  //   });
  //   return;
  // }



  // 检查余额支付是否足够
  if (payType.value === 'BALANCE' && paymentAmount.value > balance.value) {
    uni.showToast({
      title: '余额不足，请选择其他支付方式',
      icon: 'none',
      duration: 2000
    });
    paying.value = false;
    return;
  }

  // 显示加载
  uni.showLoading({
    title: '支付中...',
    mask: true
  });


  try {

    // 将页面显示的元转换为分
    const amountInFen = Math.round(paymentAmount.value * 100);
    console.log('金额转换：页面显示=', paymentAmount.value, '元，后端需要=', amountInFen, '分');

    // 调用支付接口
    const response = await pay({
      orderSn: orderSn.value,
      // appId: appId.value,
      paymentMethod: payType.value,
      paymentAmount: amountInFen, // 保持单位为分进行比较（推荐）
    });

    // 确保隐藏加载
    uni.hideLoading();

    console.log('订单付款结果:', response);

    // 支付成功提示
    uni.showToast({
      title: '订单支付成功',
      icon: 'success',
      duration: 2000
    });

    // 跳转到支付成功页面
    setTimeout(() => {
      uni.redirectTo({
        //应该使用反引号 `而不是单引号 '来创建模板字符串
        url: `/packageD/pages/money/paySuccess?orderSn=${orderSn.value}&amount=${paymentAmount.value}`
      });
    }, 1500);

  } catch (error) {
    console.error('支付失败:', error);

    // 隐藏加载状态
    uni.hideLoading();

// 提取错误信息
    const errorDetail = error?.message || error?.msg || error?.toString() || '支付失败，请重试';
    console.error('【支付】错误详情:', errorDetail);

    // 根据错误类型确定提示内容
    let userMessage = '支付失败，请重试';
    let needRetry = false;
    let needGoBack = false;

    // 错误分类处理
    if (errorDetail.includes('configMap') || errorDetail.includes('配置') || errorDetail.includes('config')) {
      userMessage = '支付配置异常，请联系客服';
    } else if (errorDetail.includes('NullPointerException') || errorDetail.includes('空指针')) {
      userMessage = '系统异常，请稍后重试';
      needRetry = true;
    } else if (errorDetail.includes('微信支付') || errorDetail.includes('wxpay') || errorDetail.includes('WxPay')) {
      userMessage = '微信支付服务异常，请稍后重试';
      needRetry = true;
    } else if (errorDetail.includes('库存不足') || errorDetail.includes('stock')) {
      userMessage = '商品库存不足，请返回购物车重新选择';
      needGoBack = true;
    } else if (errorDetail.includes('重复支付') || errorDetail.includes('重复提交')) {
      userMessage = '订单已支付，请勿重复操作';
    } else if (errorDetail.includes('未登录') || errorDetail.includes('token') || errorDetail.includes('登录')) {
      userMessage = '登录已过期，请重新登录';
    } else if (errorDetail.length < 30) {
      // 短错误信息直接显示
      userMessage = errorDetail;
    }


// 显示错误提示
    uni.showModal({
      title: '支付失败',
      content: userMessage,
      showCancel: needRetry, // 如果是可重试的错误，显示取消按钮
      confirmText: needGoBack ? '返回购物车' : '确定',
      cancelText: '重试支付',
      confirmColor: '#fa436a',
      success: (res) => {
        if (res.confirm) {
          if (needGoBack) {
            setTimeout(() => {
              uni.navigateBack();
            }, 300);
          }
        } else if (res.cancel && needRetry) {
          // 用户点击重试
          setTimeout(() => {
            handlePay(); // 重新调用支付方法
          }, 500);
        }
      }
    });
  }
};

/**
 * 预览图片（功能已注释，保留代码结构）
 */
const previewImage = (e) => {
  const current = e.target.dataset.src;
  uni.previewImage({
    current: current,
    urls: imgalist.value
  });
};
</script>

<style lang="scss">
/* 页面主容器 */
.app {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}


/* 支付状态栏 */
.payment-header {
  background: linear-gradient(135deg, #fa436a, #ff6b6b);
  color: white;
  padding: 40rpx 30rpx;

  .status-box {
    .status-title {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
    }

    .countdown-box {
      .countdown-text {
        font-size: 24rpx;
        opacity: 0.9;
        margin-bottom: 5rpx;
        display: block;
      }

      .countdown-time {
        font-size: 36rpx;
        font-weight: bold;
        font-family: monospace;
      }
    }
  }
}


/* 信息摘要 */
.info-summary {
  background: white;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      color: #666;
    }

    .value {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;

      &.amount {
        font-size: 40rpx;
        color: #fa436a;
        font-weight: bold;
      }
    }
  }
}

/* 支付金额展示区域 */
.price-box {
  background-color: #fff;
  height: 265rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  color: #909399;
  margin-bottom: 20rpx;

  .price {
    font-size: 50rpx;
    color: #303133;
    margin-top: 12rpx;
    font-weight: bold;

    /* 价格前面的货币符号 */
    &:before {
      content: '￥';
      font-size: 40rpx;
    }
  }
}

/* 支付方式列表 */
.pay-type-list {
  margin-top: 20rpx;
  background-color: #fff;
  padding-left: 60rpx;

  /* 每个支付选项的样式 */
  .type-item {
    height: 120rpx;
    padding: 20rpx 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 60rpx;
    font-size: 30rpx;
    position: relative;

    /* 底部边框分隔线 */
    &.b-b:after {
      content: '';
      position: absolute;
      left: 60rpx;
      right: 0;
      bottom: 0;
      height: 1px;
      background-color: #e5e5e5;
    }
  }

  /* 图标样式 */
  .icon {
    width: 100rpx;
    font-size: 52rpx;
    text-align: center;
  }

  /* 不同支付方式的图标颜色 */
  .icon-erjiye-yucunkuan {
    color: #fe8e2e; /* 预存款图标颜色 */
  }

  .icon-weixinzhifu {
    color: #36cb59; /* 微信图标颜色 */
  }

  .icon-alipay {
    color: #01aaef; /* 支付宝图标颜色 */
  }

  /* 支付方式标题 */
  .tit {
    font-size: 36rpx; /* 对应 $font-lg */
    color: #303133;   /* 对应 $font-color-dark */
    margin-bottom: 4rpx;
    font-weight: 500;
  }

  /* 支付方式描述区域 */
  .con {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 20rpx;
    font-size: 24rpx; /* 对应 $font-sm */
    color: #909399;   /* 对应 $font-color-light */
  }

  /* 单选按钮容器 */
  .radio {
    margin-left: auto;
  }
}

/* 确认支付按钮 */
.mix-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 630rpx;
  height: 80rpx;
  margin: 80rpx auto 30rpx;
  font-size: 36rpx; /* 对应 $font-lg */
  color: #fff;
  background-color: #fa436a; /* 对应 $base-color */
  border-radius: 10rpx;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  font-weight: 500;
  transition: all 0.3s ease;

  /* 按钮点击效果 */
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
    box-shadow: 1px 1px 3px rgba(219, 63, 96, 0.4);
  }
}
</style>
