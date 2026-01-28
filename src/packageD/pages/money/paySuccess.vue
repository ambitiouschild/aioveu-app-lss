<template>
  <!-- 支付成功页面容器 -->
  <view class="pay-success-page">

    <!-- 成功图标 -->
    <text class="success-icon yticon icon-xuanzhong2"></text>

    <!-- 成功标题 -->
    <text class="title">支付成功</text>

    <!-- 成功信息 -->
    <view v-if="orderInfo.orderSn" class="success-info">
      <view class="info-item">
        <text class="label">订单号：</text>
        <text class="value">{{ orderInfo.orderSn }}</text>
      </view>
      <view class="info-item">
        <text class="label">支付金额：</text>
        <text class="value amount">¥{{ formatPrice(orderInfo.amount) }}</text>
      </view>
    </view>

    <!-- 按钮区域 -->
    <view class="button-group">
      <!-- 查看订单详情按钮 -->
<!--      要跳转到订单详情页面，而不是订单列表页面。-->
      <navigator
        url="/packageD/pages/order/detail?orderSn=${orderInfo.orderSn}"
        open-type="redirect"
        class="action-button"
      >
        查看订单详情
      </navigator>

      <!-- 返回首页按钮 -->
      <navigator
        url="/pages/index/index"
        open-type="switchTab"
        class="action-button hollow"
      >
        返回首页
      </navigator>
    </view>

  </view>
</template>

<script setup>
// 这里使用 Vue 3 的 Composition API
// 不再需要 export default，直接使用 setup
// 页面数据和方法可以在这里定义

// 可以添加响应式数据
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 如果需要，可以定义响应式数据
// const someData = ref('');
// 响应式数据定义
// 使用 ref 定义单个响应式对象
const orderInfo = ref({
  orderSn: '',
  amount: 0
});

// 页面加载钩子
onLoad((options) => {
  console.log('支付成功页面加载，参数:', options);
  // 这里可以处理页面参数，比如订单号、金额等

  // 从URL参数获取订单信息
  if (options.orderSn) {
    // 使用 ref定义单个响应式对象（推荐）注意：需要修改 .value
    // 使用 reactive定义响应式对象 注意：reactive 对象直接修改属性
    orderInfo.value.orderSn = options.orderSn;
  }

  if (options.amount) {
    orderInfo.value.amount = parseFloat(options.amount) || 0;
  }

  console.log('订单信息:', orderInfo.value);

  // 如果需要，可以在这里调用API获取完整的订单详情
  // 但通常支付页面已经传递了必要信息

});

/**
 * 格式化金额
 */
const formatPrice = (price) => {
  if (isNaN(price) || price === null || price === undefined) {
    return '0.00';
  }
  return Number(price).toFixed(2);
};



// 可以定义方法
// const someMethod = () => {
//   // 方法逻辑
// };
</script>

<style lang="scss" scoped>
// 支付成功页面样式
.pay-success-page {
  // 使用 flex 布局居中显示所有内容
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; // 确保页面占满整个视口高度
  padding: 20rpx; // 添加内边距防止内容贴边
  background-color: #ffffff; // 白色背景
}

// 成功图标样式
.success-icon {
  font-size: 160rpx; // 图标大小
  color: #fa436a; // 主题色
  margin-top: 100rpx; // 顶部间距
  margin-bottom: 40rpx; // 底部间距
}

// 标题样式
.title {
  font-size: 38rpx; // 标题字体大小
  color: #303133; // 深色文字
  font-weight: 600; // 加粗显示
  margin-bottom: 100rpx; // 底部间距
  letter-spacing: 2rpx; // 字母间距
}


// 成功信息区域
.success-info {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 40rpx 0;
  width: 85%;
  animation: fadeInUp 0.5s ease-out 0.4s both;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #e8e8e8;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
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
        font-size: 36rpx;
        color: #fa436a; // 金额用主题色突出显示
        font-weight: bold;
      }
    }
  }
}

// 按钮组容器
.button-group {
  width: 100%; // 占满父容器宽度
  padding-top: 100rpx; // 顶部间距
  display: flex;
  flex-direction: column;
  align-items: center;
}

// 通用按钮样式
.action-button {
  // 布局属性
  display: flex;
  align-items: center;
  justify-content: center;

  // 尺寸属性
  width: 600rpx; // 固定宽度
  height: 80rpx; // 固定高度
  margin-top: 30rpx; // 按钮间距

  // 文字属性
  font-size: 32rpx; // 字体大小
  font-weight: 500; // 字体粗细

  // 外观属性
  border-radius: 10rpx; // 圆角
  transition: all 0.3s ease; // 过渡效果

  // 点击效果
  &:active {
    opacity: 0.8; // 点击时变暗
    transform: scale(0.98); // 轻微缩小效果
  }

  // 实心按钮（默认样式）
  &.hollow {
    // 空心按钮样式
    background: #ffffff; // 白色背景
    color: #303133; // 深色文字
    border: 1rpx solid #cccccc; // 灰色边框
  }

  // 移除空心类名即为实心按钮
  &:not(.hollow) {
    background-color: #fa436a; // 主题色背景
    color: #ffffff; // 白色文字
  }
}
</style>
