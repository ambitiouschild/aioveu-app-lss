<template>
  <view>
    <!-- 状态栏占位 -->
    <view style="width: 100%; height: var(--status-bar-height)" />

    <!-- 自定义导航栏 -->
    <uni-nav-bar title="通知公告" left-icon="left" @clickLeft="handleNavigateback" fixed />

    <!-- 添加搜索栏 -->
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
                v-model="queryParams.title"
                placeholder="请输入关键字"
                trim
              />
            </view>

            <view class="form-buttons">
              <button class="btn-reset" @click="handleReset">重置</button>
              <button class="btn-query" @click="handleQuery">查询</button>
            </view>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 列表内容 -->
    <view class="data-container">
      <uni-card
        v-for="(item, index) in dataList"
        :key="index"
        class="notice-card"
        :is-shadow="true"
        :margin="20"
      >
        <view class="card-header">
          <view class="title-section">
            <text class="notice-title">{{ item.title }}</text>
            <uni-tag
              :text="getStatusText(item.publishStatus)"
              :type="getStatusType(item.publishStatus)"
              size="small"
            />
          </view>
        </view>

        <view class="card-content">
          <view class="info-item">
            <uni-icons type="person" size="16" color="#666"></uni-icons>
            <text class="info-label">通告目标类型：</text>
            <text class="info-value">{{ item.targetType === 1 ? '指定' : '全体' }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="flag" size="16" color="#666"></uni-icons>
            <text class="info-label">紧急程度：</text>
            <text class="info-value">
              <cu-dict-label code="notice_level" :model-value="item.level" />
            </text>
          </view>

          <view class="info-item">
            <uni-icons type="staff" size="16" color="#666"></uni-icons>
            <text class="info-label">发布人：</text>
            <text class="info-value">{{ item.publisherName || '-' }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text v-if="item.publishStatus === 1" class="time-text">
              <text class="time-label">发布时间：</text>
              <text class="time-value">{{ formatDate(item.publishTime) }}</text>
            </text>
            <text v-else class="time-text">
              <text class="time-label">撤回时间：</text>
              <text class="time-value">{{ formatDate(item.revokeTime) }}</text>
            </text>
          </view>
          <view class="action-buttons">
            <button class="btn-action" @click="handleAction(item)">操作</button>
          </view>
        </view>
      </uni-card>

      <!-- 加载更多 -->
      <uni-load-more
        v-if="dataList.length > 0"
        :status="loadMoreStatus"
        @clickLoadMore="loadMore"
      />

      <!-- 空状态 -->

      <view v-else-if="total == 0 && !loading" class="empty-tip">暂无数据</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { ref, reactive, computed } from 'vue';

import NoticeAPI, { NoticePageQuery, NoticePageVO } from "@/packageB/api/system/notice";

// 状态管理
const loading = ref(false);
const showFilterPopup = ref(false);
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more');

// 数据列表
const dataList = ref<NoticePageVO[]>([]);
const total = ref(0);

// 查询参数
const queryParams = ref<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
  title: "",
});

// 弹窗引用
const filterPopup = ref();

/**
 * 查询处理
 */
const handleQuery = () => {
  showFilterPopup.value = false;
  queryParams.value.pageNum = 1;
  dataList.value = [];
  loadMore();
};

/**
 * 重置
 */
const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    title: ""
  };
  showFilterPopup.value = false;
  dataList.value = [];
  loadMore();
};

/**
 * 获取状态样式
 */
const getStatusType = (status: number | undefined): "default" | "primary" | "success" | "warning" | "error" => {
  if (!status) return "default";
  const statusMap: Record<number, "default" | "primary" | "success" | "warning" | "error"> = {
    0: "primary",
    1: "success",
    [-1]: "warning",
  };
  return statusMap[status] || "default";
};

/**
 * 获取状态文本
 */
const getStatusText = (status: number | undefined): string => {
  if (status !== 0 && !status) return "-";
  const statusMap: Record<number, string> = {
    0: "未发布",
    1: "已发布",
    [-1]: "已撤回",
  };
  return statusMap[status] || "未知";
};

/**
 * 格式化日期
 */
const formatDate = (date: Date | undefined): string => {
  if (!date) return "-";
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "-";
  }
};

/**
 * 加载更多
 */
const loadMore = async () => {
  if (loading.value || loadMoreStatus.value === 'noMore') return;

  loading.value = true;
  loadMoreStatus.value = 'loading';

  try {
    const { list, total: totalCount } = await NoticeAPI.getPage(queryParams.value);

    if (queryParams.value.pageNum === 1) {
      dataList.value = list || [];
    } else {
      dataList.value = [...dataList.value, ...(list || [])];
    }

    total.value = totalCount || 0;
    queryParams.value.pageNum++;

    // 更新加载状态
    loadMoreStatus.value = dataList.value.length >= total.value ? 'noMore' : 'more';
  } catch (error) {
    console.error('加载数据失败:', error);
    uni.showToast({ title: "加载失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

/**
 * 查看详情
 */
const handleView = (notice: NoticePageVO) => {
  uni.navigateTo({
    url: `packageB/pages/work/notice/detail?id=${notice.id}`,
  });
};

/**
 * 操作按钮
 */
const handleAction = (notice: NoticePageVO) => {
  const actions = notice.publishStatus !== 1 ? ["查看", "删除", "发布"] : ["查看", "撤回"];
  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      switch (actions[tapIndex]) {
        case "查看":
          handleView(notice);
          break;
        case "删除":
          handleDelete(notice);
          break;
        case "发布":
          handlePublish(notice);
          break;
        case "撤回":
          handleRevoke(notice);
          break;
      }
    },
  });
};

/**
 * 删除
 */
const handleDelete = (notice: NoticePageVO) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该通知吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await NoticeAPI.deleteByIds(notice.id);
          uni.showToast({ title: "删除成功", icon: "success" });
          // 重新加载第一页
          queryParams.value.pageNum = 1;
          loadMore();
        } catch (error) {
          uni.showToast({ title: "删除失败", icon: "none" });
        }
      }
    },
  });
};

/**
 * 发布
 */
const handlePublish = (notice: NoticePageVO) => {
  uni.showModal({
    title: "提示",
    content: "确定要发布该通知吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await NoticeAPI.publish(Number(notice.id));
          uni.showToast({ title: "发布成功", icon: "success" });
          // 重新加载第一页
          queryParams.value.pageNum = 1;
          loadMore();
        } catch (error) {
          uni.showToast({ title: "发布失败", icon: "none" });
        }
      }
    },
  });
};

/**
 * 撤回
 */
const handleRevoke = (notice: NoticePageVO) => {
  uni.showModal({
    title: "提示",
    content: "确定要撤回该通知吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await NoticeAPI.revoke(Number(notice.id));
          uni.showToast({ title: "撤回成功", icon: "success" });
          // 刷新列表
          queryParams.value.pageNum = 1;
          loadMore();
        } catch (error) {
          uni.showToast({ title: "撤回失败", icon: "none" });
        }
      }
    },
  });
};

/**
 * 返回
 */
const handleNavigateback = () => {
  uni.navigateBack();
};

// 触底事件
onReachBottom(() => {
  if (loadMoreStatus.value === 'more' && !loading.value) {
    loadMore();
  }
});

onLoad(() => {
  loadMore();
});
</script>

<style lang="scss" scoped>
// 主容器
page {
  background-color: #f8f8f8;
}

// 筛选区域
.filter-container {
  background: #fff;
  padding: 20rpx;
  margin-top: calc(var(--status-bar-height) + 90rpx);
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

// 数据列表容器
.data-container {
  padding: 20rpx;
  min-height: calc(100vh - 200rpx);
}

.notice-card {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.card-header {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.notice-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content {
  padding: 20rpx 0;
}

.info-item {
  display: flex;
  align-items: center;
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
  min-width: 200rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.time-info {
  flex: 1;
}

.time-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
}

.time-label {
  color: #666;
  font-weight: bold;
}

.time-value {
  color: #333;
}

.action-buttons {
  .btn-action {
    padding: 12rpx 24rpx;
    background: #007AFF;
    color: white;
    border-radius: 6rpx;
    font-size: 24rpx;
    border: none;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .filter-container {
    margin-top: calc(var(--status-bar-height) + 80rpx);
    padding: 16rpx;
  }

  .data-container {
    padding: 16rpx;
  }

  .card-footer {
    flex-direction: column;
    gap: 16rpx;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }
}
</style>
