<!-- pages/order/detail.vue -->
<template>
  <view class="order-detail-page">
    <!-- 订单状态 -->
    <view class="order-status">
      <view class="status-content">
        <text class="status-icon">✓</text>
        <text class="status-text">支付成功</text>
        <text class="status-desc">商家已收到您的订单</text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info">
      <view class="info-section">
        <view class="section-header">
          <text class="section-title">订单信息</text>
        </view>

        <!-- 商品信息 -->
        <view class="goods-list">
          <view v-for="(item, index) in orderDetail.orderItems" :key="index" class="goods-item">
            <image :src="item.productPic" class="goods-img" mode="aspectFill" />
            <view class="goods-info">
              <view class="goods-name">{{ item.productName }}</view>
              <view class="goods-spec">{{ item.productAttr }}</view>
              <view class="goods-price-row">
                <text class="goods-price">¥{{ formatPrice(item.productPrice) }}</text>
                <text class="goods-quantity">×{{ item.productQuantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 金额明细 -->
        <view class="price-detail">
          <view class="price-item">
            <text>商品金额</text>
            <text>¥{{ formatPrice(orderDetail.productAmount) }}</text>
          </view>
          <view class="price-item discount" v-if="orderDetail.discountAmount > 0">
            <text>优惠</text>
            <text>-¥{{ formatPrice(orderDetail.discountAmount) }}</text>
          </view>
          <view class="price-item total">
            <text>实付金额</text>
            <text class="total-price">¥{{ formatPrice(orderDetail.paymentAmount) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="shipping-address" v-if="orderDetail.shippingAddress">
      <view class="section-header">
        <text class="section-title">收货信息</text>
      </view>
      <view class="address-content">
        <view class="address-user">
          <text class="name">{{ orderDetail.shippingAddress.consigneeName }}</text>
          <text class="mobile">{{ orderDetail.shippingAddress.consigneeMobile }}</text>
        </view>
        <view class="address-detail">
          {{ orderDetail.shippingAddress.province }}
          {{ orderDetail.shippingAddress.city }}
          {{ orderDetail.shippingAddress.district }}
          {{ orderDetail.shippingAddress.detailAddress }}
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-actions">
      <button class="btn primary" @click="goBack">返回首页</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
// import { getOrderDetail } from '@/api/oms/order.ts';

const orderSn = ref('');
const orderDetail = ref({});

onLoad(async (options) => {
  orderSn.value = options.orderSn || '';
  if (orderSn.value) {
    await loadOrderDetail();
  }
});

const loadOrderDetail = async () => {
  try {
    const response = await getOrderDetail(orderSn.value);
    orderDetail.value = response.data || {};
  } catch (error) {
    console.error('加载订单详情失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
};

const formatPrice = (price) => {
  if (isNaN(price) || price === null || price === undefined) {
    return '0.00';
  }
  return (price / 100).toFixed(2);
};

const goBack = () => {
  uni.switchTab({
    url: '/pages/index/index'
  });
};
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.order-status {
  background: linear-gradient(135deg, #07c160, #0a9c4a);
  color: white;
  padding: 60rpx 30rpx;

  .status-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .status-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }

    .status-text {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    .status-desc {
      font-size: 28rpx;
      opacity: 0.9;
    }
  }
}

.order-info, .shipping-address {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.goods-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .goods-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }

  .goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .goods-name {
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .goods-spec {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
    }

    .goods-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20rpx;

      .goods-price {
        font-size: 32rpx;
        color: #fa436a;
        font-weight: 600;
      }

      .goods-quantity {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

.price-detail {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;

  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #666;

    &.discount {
      color: #fa436a;
    }

    &.total {
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx dashed #eee;
      font-size: 32rpx;
      color: #333;
      font-weight: 500;

      .total-price {
        font-size: 40rpx;
        color: #fa436a;
        font-weight: bold;
      }
    }
  }
}

.address-content {
  .address-user {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .name {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
      margin-right: 20rpx;
    }

    .mobile {
      font-size: 28rpx;
      color: #666;
    }
  }

  .address-detail {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
  }
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  border-top: 1rpx solid #f0f0f0;

  .btn {
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 500;
    padding: 0 60rpx;

    &.primary {
      background: linear-gradient(135deg, #fa436a, #ff6b6b);
      color: white;
      border: none;
    }
  }
}
</style>
