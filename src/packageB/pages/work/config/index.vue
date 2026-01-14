<template>
  <view class="work">
    <!-- 状态栏占位 -->
    <view style="width: 100%; height: var(--status-bar-height)" />

    <!-- 自定义导航栏 -->
    <uni-nav-bar title="系统配置" left-icon="left" @clickLeft="handleNavigateback" fixed />

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

            <view class="form-buttons">
              <button class="btn-reset" @click="handleReset">重置</button>
              <button class="btn-query" @click="handleQuery">查询</button>
            </view>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 数据列表 -->
    <view class="data-container">
      <uni-card
          v-for="(item, index) in pageData"
          :key="index"
          class="config-card"
          :is-shadow="true"
          :margin="20"
      >
        <view class="card-header">
          <view class="title-section">
            <text class="config-title">{{ item.configName }}</text>
          </view>
        </view>

        <view class="card-content">
          <view class="info-item">
            <uni-icons type="key" size="16" color="#666"></uni-icons>
            <text class="info-label">配置键：</text>
            <text class="info-value">{{ item.configKey }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="value" size="16" color="#666"></uni-icons>
            <text class="info-label">配置值：</text>
            <text class="info-value config-value">{{ item.configValue }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="info" size="16" color="#666"></uni-icons>
            <text class="info-label">备注：</text>
            <text class="info-value">{{ item.remark || '-' }}</text>
          </view>
        </view>

        <view class="card-footer">
          <button class="btn-action" @click="handleAction(item)">操作</button>
        </view>
      </uni-card>

      <!-- 加载更多 -->
      <uni-load-more
          v-if="pageData.length > 0"
          :status="loadMoreStatus"
          @clickLoadMore="loadmore"
      />

      <!-- 空状态 -->
      <view v-else-if="!loading" text="暂无配置数据" />
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="btn-add" @click="handleOpenDialog">添加配置</button>
      <button class="btn-refresh" @click="refreshCache">刷新缓存</button>
    </view>

    <!-- 编辑弹窗 -->
    <uni-popup ref="formPopup" type="bottom" background-color="#fff">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ form.id ? '编辑配置' : '添加配置' }}</text>
          <uni-icons type="close" size="20" @click="showEditPopup = false"></uni-icons>
        </view>

        <scroll-view class="form-content" scroll-y>
          <uni-forms ref="formRef" :model="form" :rules="rules">
            <uni-forms-item label="配置名称" required name="configName">
              <uni-easyinput
                  v-model="form.configName"
                  placeholder="请输入配置名称"
              />
            </uni-forms-item>

            <uni-forms-item label="配置键名" required name="configKey">
              <uni-easyinput
                  v-model="form.configKey"
                  placeholder="请输入配置键名"
              />
            </uni-forms-item>

            <uni-forms-item label="配置键值" required name="configValue">
              <uni-easyinput
                  v-model="form.configValue"
                  placeholder="请输入配置键值"
              />
            </uni-forms-item>

            <uni-forms-item label="配置描述" name="remark">
              <textarea
                  v-model="form.remark"
                  placeholder="请输入配置描述"
                  class="form-textarea"
                  maxlength="100"
              />
              <view class="word-count">{{ form.remark ? form.remark.length : 0 }}/100</view>
            </uni-forms-item>
          </uni-forms>
        </scroll-view>

        <view class="form-footer">
          <button class="btn-cancel" @click="showEditPopup = false">取消</button>
          <button class="btn-submit" :loading="loading" @click="submitForm">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { ref, reactive } from 'vue';

import ConfigAPI, { ConfigPageVO, ConfigForm, ConfigPageQuery } from "@/packageB/api/system/config";

// 状态管理
const loading = ref(false);
const showFilterPopup = ref(false);
const showEditPopup = ref(false);
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more');

// 数据列表
const pageData = ref<ConfigPageVO[]>([]);
const total = ref(0);

// 查询参数
const queryParams = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 表单数据
const form = reactive<ConfigForm>({
  id: undefined,
  configName: "",
  configKey: "",
  configValue: "",
  remark: ""
});

// 表单引用
const formRef = ref();
const formPopup = ref();

// 表单验证规则
const rules = {
  configName: {
    rules: [{ required: true, errorMessage: '请输入配置名称' }]
  },
  configKey: {
    rules: [{ required: true, errorMessage: '请输入配置键名' }]
  },
  configValue: {
    rules: [{ required: true, errorMessage: '请输入配置键值' }]
  }
};

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
function handleReset() {
  queryParams.pageNum = 1;
  queryParams.keywords = "";
  pageData.value = [];
  showFilterPopup.value = false;
  handleQuery();
}

/**
 * 加载更多
 */
function loadmore() {
  if (loading.value || loadMoreStatus.value === 'noMore') return;

  loading.value = true;
  loadMoreStatus.value = 'loading';

  ConfigAPI.getPage(queryParams)
      .then((data) => {
        if (queryParams.pageNum === 1) {
          pageData.value = data.list || [];
        } else {
          pageData.value = [...pageData.value, ...(data.list || [])];
        }
        total.value = data.total || 0;
        queryParams.pageNum++;

        // 更新加载状态
        loadMoreStatus.value = pageData.value.length >= total.value ? 'noMore' : 'more';
      })
      .catch((error) => {
        console.error('加载数据失败:', error);
        uni.showToast({ title: "加载失败", icon: "none" });
      })
      .finally(() => {
        loading.value = false;
      });
}

/**
 * 打开添加对话框
 */
function handleOpenDialog() {
  // 重置表单
  Object.assign(form, {
    id: undefined,
    configName: "",
    configKey: "",
    configValue: "",
    remark: ""
  });
  showEditPopup.value = true;
  formPopup.value.open();
}

/**
 * 编辑配置
 */
function handleEdit(id: number) {
  ConfigAPI.getFormData(id).then((data) => {
    Object.assign(form, data);
    showEditPopup.value = true;
    formPopup.value.open();
  }).catch(error => {
    console.error('获取配置数据失败:', error);
    uni.showToast({ title: "获取数据失败", icon: "none" });
  });
}

/**
 * 提交表单
 */
async function submitForm() {
  if (loading.value) return;

  try {
    const valid = await formRef.value.validate();
    if (valid) {
      loading.value = true;

      const apiCall = form.id ? ConfigAPI.update(form.id, form) : ConfigAPI.add(form);

      await apiCall;
      uni.showToast({
        title: form.id ? "更新成功" : "添加成功",
        icon: "success"
      });

      showEditPopup.value = false;
      formPopup.value.close();
      handleQuery(); // 刷新列表
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 刷新缓存
 */
const refreshCache = () => {
  uni.showLoading({ title: '刷新中...' });
  ConfigAPI.refreshCache().then(() => {
    uni.hideLoading();
    uni.showToast({
      title: "刷新缓存成功",
      icon: "success",
      duration: 1000
    });
  }).catch(error => {
    uni.hideLoading();
    console.error('刷新缓存失败:', error);
    uni.showToast({ title: "刷新缓存失败", icon: "none" });
  });
};

/**
 * 删除配置
 */
function handleDelete(item: ConfigPageVO) {
  uni.showModal({
    title: "提示",
    content: "确定要删除该配置吗？",
    success: async (res) => {
      if (res.confirm && item.id) {
        try {
          await ConfigAPI.deleteById(item.id);
          uni.showToast({ title: "删除成功", icon: "success" });
          handleQuery(); // 刷新列表
        } catch (error) {
          console.error('删除失败:', error);
          uni.showToast({ title: "删除失败", icon: "none" });
        }
      }
    }
  });
}

/**
 * 操作按钮
 */
function handleAction(item: ConfigPageVO) {
  const actions = ["编辑", "删除"];
  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      switch (actions[tapIndex]) {
        case "编辑":
          if (item.id) handleEdit(item.id);
          break;
        case "删除":
          handleDelete(item);
          break;
      }
    }
  });
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
.work {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 120rpx; /* 为底部按钮留出空间 */
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

.config-card {
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
  align-items: center;
}

.config-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.card-content {
  padding: 20rpx 0;
}

.info-item {
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

.config-value {
  font-family: monospace;
  background: #f5f5f5;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.btn-action {
  padding: 12rpx 24rpx;
  background: #007AFF;
  color: white;
  border-radius: 6rpx;
  font-size: 24rpx;
  border: none;
}

// 底部操作按钮
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  border-top: 1rpx solid #eee;
  z-index: 100;

  button {
    flex: 1;
    padding: 24rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }

  .btn-add {
    background: #007AFF;
    color: white;
  }

  .btn-refresh {
    background: #18A058;
    color: white;
  }
}

// 表单弹窗
.form-popup {
  background: #fff;
  width: 100%;
  max-height: 80vh;
  border-radius: 20rpx 20rpx 0 0;
}

.form-content {
  max-height: 60vh;
  padding: 0 40rpx;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #f8f8f8;
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.form-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #eee;

  button {
    flex: 1;
    padding: 24rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }

  .btn-cancel {
    background: #f5f5f5;
    color: #666;
  }

  .btn-submit {
    background: #007AFF;
    color: white;
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

  .bottom-actions {
    flex-direction: column;
    gap: 16rpx;
  }

  .form-footer {
    flex-direction: column;
    gap: 16rpx;
  }
}
</style>
