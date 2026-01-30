<!-- pages/order/refund-detail.vue -->
<template>
  <view class="container">
    <!-- 退款详情页面内容 -->
    <view class="refund-detail">
      <!-- 退款状态 -->
      <view class="status-section">
        <view class="status-text">{{ refundStatusText }}</view>
        <view class="status-desc">{{ refundStatusDesc }}</view>
      </view>

      <!-- 退款信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="label">退款金额</text>
          <text class="value">¥{{ formatMoney(refundDetail.refundAmount) }}</text>
        </view>
        <view class="info-item">
          <text class="label">申请时间</text>
          <text class="value">{{ formatTime(refundDetail.createTime) }}</text>
        </view>
        <view class="info-item">
          <text class="label">退款原因</text>
          <text class="value">{{ refundDetail.refundReason }}</text>
        </view>
        <!-- 其他退款信息... -->
      </view>
    </view>
  </view>
</template>

<script>
// 退款详情页面的逻辑
</script>
