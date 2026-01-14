<template>
  <view class="log">
    <!-- 状态栏占位 -->
    <view style="width: 100%; height: var(--status-bar-height)" />

    <!-- 自定义导航栏 -->
    <uni-nav-bar title="操作日志" left-icon="left" @clickLeft="handleNavigateback" fixed />

    <!-- 筛选区域 -->
    <view class="filter-container">
      <view class="filter-bar">
        <view class="filter-item" @click="showFilterPopup = true">
          <text>筛选</text>
          <uni-icons type="filter" size="14" color="#666"></uni-icons>
        </view>
      </view>

      <!-- 筛选弹出层 -->
      <uni-popup ref="filterPopup" type="bottom" background-color="#fff">
        <view class="popup-content">
          <view class="popup-header">
            <text class="popup-title">筛选条件</text>
            <uni-icons type="close" size="20" @click="showFilterPopup = false"></uni-icons>
          </view>

          <view class="filter-form">
            <view class="form-item">
              <text class="form-label">关键字</text>
              <uni-easyinput
                v-model="queryParams.keywords"
                placeholder="请输入关键字"
                trim
              />
            </view>

            <view class="form-item">
              <text class="form-label">日期选择</text>
              <cu-date-query v-model="queryParams.createTime" />
            </view>

            <view class="form-buttons">
              <button class="btn-reset" @click="handleResetQuery">重置</button>
              <button class="btn-query" @click="handleQuery">查询</button>
            </view>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 日志列表 -->
    <view class="log-list">
      <uni-card
        v-for="item in pageData"
        :key="item.id"
        class="log-card"
        :is-shadow="true"
        :margin="20"
      >
        <view class="card-header">
          <view class="log-title">
            <text class="operator">{{ item.operator }}</text>
            <view class="time-badge">
              <text class="time-text">{{ formatTime(item.createTime) }}</text>
            </view>
          </view>
        </view>

        <view class="card-content">
          <view class="info-row">
            <uni-icons type="folder" size="16" color="#666"></uni-icons>
            <text class="info-label">模块：</text>
            <text class="info-value">{{ item.module || '-' }}</text>
          </view>

          <view class="info-row">
            <uni-icons type="file" size="16" color="#666"></uni-icons>
            <text class="info-label">内容：</text>
            <text class="info-value content-text">{{ item.content || '-' }}</text>
          </view>

          <view class="info-row">
            <uni-icons type="location" size="16" color="#666"></uni-icons>
            <text class="info-label">IP/地区：</text>
            <text class="info-value">{{ item.ip || '-' }} {{ item.region ? `(${item.region})` : '' }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="footer-left">
            <text class="time-label">创建时间：</text>
            <text class="time-value">{{ formatFullTime(item.createTime) }}</text>
          </view>
          <view class="footer-right">
            <button class="btn-detail" @click="handleViewDetail(item)">查看详情</button>
          </view>
        </view>
      </uni-card>

      <!-- 加载更多 -->
      <uni-load-more
        v-if="total > 0"
        :status="loadMoreStatus"
        @clickLoadMore="loadmore"
      />

      <!-- 空状态 -->
      <view v-else-if="total === 0 && !loading" text="暂无日志数据" />
    </view>

    <!-- 详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom" background-color="#fff">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">操作日志详情</text>
          <uni-icons type="close" size="20" @click="detailDialogVisible = false"></uni-icons>
        </view>

        <scroll-view class="detail-content" scroll-y>
          <view class="detail-item">
            <text class="detail-label">操作人：</text>
            <text class="detail-value">{{ logDetail.operator || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">操作时间：</text>
            <text class="detail-value">{{ formatFullTime(logDetail.createTime) }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">模块：</text>
            <text class="detail-value">{{ logDetail.module || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">操作内容：</text>
            <text class="detail-value content-detail">{{ logDetail.content || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">IP地址：</text>
            <text class="detail-value">{{ logDetail.ip || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">地区：</text>
            <text class="detail-value">{{ logDetail.region || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">浏览器：</text>
            <text class="detail-value">{{ logDetail.browser || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">终端系统：</text>
            <text class="detail-value">{{ logDetail.os || '-' }}</text>
          </view>

          <view class="detail-item">
            <text class="detail-label">执行耗时：</text>
            <text class="detail-value">{{ logDetail.executionTime ? `${logDetail.executionTime} 毫秒` : '-' }}</text>
          </view>
        </scroll-view>

        <view class="detail-footer">
          <button class="btn-close" @click="detailDialogVisible = false">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { ref, reactive } from 'vue';

import LogAPI, { LogVO, LogPageQuery } from "@/api/system/log";

// 状态管理
const loading = ref(false);
const showFilterPopup = ref(false);
const detailDialogVisible = ref(false);
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more');

// 数据列表
const pageData = ref<LogVO[]>([]);
const total = ref(0);

// 查询参数
const queryParams = reactive<LogPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  createTime: ""
});

// 日志详情
const logDetail = ref<LogVO>({});

// 弹窗引用
const filterPopup = ref();
const detailPopup = ref();

/**
 * 查询
 */
function handleQuery() {
  showFilterPopup.value = false;
  queryParams.pageNum = 1;
  pageData.value = [];
  loadmore();
}

/**
 * 重置查询
 */
function handleResetQuery() {
  queryParams.keywords = "";
  queryParams.createTime = undefined;
  handleQuery();
}

/**
 * 加载更多
 */
function loadmore() {
  if (loading.value || loadMoreStatus.value === 'noMore') return;

  loading.value = true;
  loadMoreStatus.value = 'loading';

  LogAPI.getPage(queryParams)
    .then((data) => {
      if (queryParams.pageNum === 1) {
        pageData.value = data.list || [];
      } else {
        pageData.value = [...pageData.value, ...(data.list || [])];
      }
      total.value = data.total || 0;
      // total.value = data.total ;
      queryParams.pageNum++;

      // 更新加载状态
      loadMoreStatus.value = pageData.value.length >= total.value ? 'noMore' : 'more';
    })
    .catch((error) => {
      console.error('加载日志数据失败:', error);
      uni.showToast({ title: "加载失败", icon: "none" });
      pageData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 查看详情
 */
function handleViewDetail(item: LogVO) {
  logDetail.value = { ...item };
  detailDialogVisible.value = true;
  detailPopup.value.open();
}

/**
 * 格式化时间（简略）
 */
function formatTime(date: Date | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
}

/**
 * 格式化完整时间
 */
function formatFullTime(date: Date | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString();
  } catch (error) {
    return '-';
  }
}

/**
 * 返回
 */
function handleNavigateback() {
  uni.navigateBack();
}

// 触底事件
onReachBottom(() => {
  if (loadMoreStatus.value === 'more' && !loading.value) {
    loadmore();
  }
});

onLoad(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.log {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-top: calc(var(--status-bar-height) + 90rpx);
}

// 筛选区域
.filter-container {
  background: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

// 弹出层样式
.popup-content {
  padding: 40rpx;
  max-height: 70vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.filter-form {
  .form-item {
    margin-bottom: 40rpx;
  }

  .form-label {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }
}

.form-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;

  button {
    flex: 1;
    padding: 20rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }

  .btn-reset {
    background: #f5f5f5;
    color: #666;
  }

  .btn-query {
    background: #007AFF;
    color: white;
  }
}

// 日志列表
.log-list {
  padding: 20rpx;
  min-height: calc(100vh - 200rpx);
}

.log-card {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.card-header {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.log-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operator {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.time-badge {
  background: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.time-text {
  font-size: 24rpx;
  color: #666;
}

.card-content {
  padding: 20rpx 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
  min-width: 140rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.footer-left {
  flex: 1;
}

.time-label {
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
  margin-right: 8rpx;
}

.time-value {
  font-size: 24rpx;
  color: #333;
}

.footer-right {
  .btn-detail {
    padding: 12rpx 24rpx;
    background: #007AFF;
    color: white;
    border-radius: 6rpx;
    font-size: 24rpx;
    border: none;
  }
}

// 详情弹窗
.detail-popup {
  background: #fff;
  width: 100%;
  max-height: 80vh;
  border-radius: 20rpx 20rpx 0 0;
}

.detail-content {
  max-height: 60vh;
  padding: 0 40rpx;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
  min-width: 160rpx;
  flex-shrink: 0;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.content-detail {
  line-height: 1.6;
  background: #f8f8f8;
  padding: 16rpx;
  border-radius: 8rpx;
  border-left: 4rpx solid #007AFF;
}

.detail-footer {
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #eee;

  .btn-close {
    width: 100%;
    padding: 24rpx;
    background: #007AFF;
    color: white;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .log {
    padding-top: calc(var(--status-bar-height) + 80rpx);
  }

  .filter-container {
    padding: 16rpx;
  }

  .log-list {
    padding: 16rpx;
  }

  .card-footer {
    flex-direction: column;
    gap: 16rpx;
    align-items: flex-start;
  }

  .footer-right {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .log-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }

  .time-badge {
    align-self: flex-start;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }

  .info-label {
    min-width: auto;
  }

  .detail-item {
    flex-direction: column;
    gap: 8rpx;
  }

  .detail-label {
    min-width: auto;
  }
}
</style>
