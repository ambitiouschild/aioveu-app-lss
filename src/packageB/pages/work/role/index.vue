<template>
  <view class="role">
    <!-- 状态栏占位 -->
    <view style="width: 100%; height: var(--status-bar-height)" />

    <!-- 自定义导航栏 -->
    <uni-nav-bar
      title="角色管理"
      left-icon="left"
      @clickLeft="handleNavigateback"
      fixed
    />

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
              <button class="btn-reset" @click="handleResetQuery">重置</button>
              <button class="btn-query" @click="handleQuery">确定</button>
            </view>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 卡片列表 -->
    <view class="list-container">
      <uni-card v-for="item in dataList" :key="item.id" class="role-card" :is-shadow="true">
        <template v-slot:title>
          <view class="card-header">
            <view class="role-info">
              <text class="role-name">{{ item.name }}</text>
              <view class="role-status">
                <uni-tag v-if="item.status === 1" text="正常" type="success" size="small" />
                <uni-tag v-else-if="item.status === 0" text="停用" type="warning" size="small" />
              </view>
            </view>
          </view>
        </template>

        <view class="card-content">
          <view class="info-item">
            <uni-icons type="list" size="16" color="#666"></uni-icons>
            <text class="info-label">编码：</text>
            <text class="info-value">{{ item.code }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="sort" size="16" color="#666"></uni-icons>
            <text class="info-label">排序号：</text>
            <text class="info-value">{{ item.sort }}</text>
          </view>
        </view>

        <template v-slot:actions>
          <view class="card-footer">
            <view class="create-time">
              <text class="time-label">创建时间：</text>
              <text class="time-value">{{ item.createTime }}</text>
            </view>
            <view class="action-buttons">
              <button class="btn-action" @click="handleAction(item)">操作</button>
            </view>
          </view>
        </template>
      </uni-card>

      <!-- 加载更多 -->
      <uni-load-more
        v-if="total > 0"
        :status="loadMoreStatus"
        @clickLoadMore="queryPageData"
      />

      <!-- 空状态 -->
      <view v-else-if="total == 0 && !loading" class="empty-tip">暂无数据</view>

    </view>

    <!-- 底部悬浮按钮 -->
    <uni-fab
      horizontal="left"
      vertical="bottom"
      :pop-menu="false"
      @fabClick="handleOpenDialog"
    />

    <!-- 弹窗表单 -->
    <uni-popup ref="formPopup" type="bottom" background-color="#fff">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ formData.id ? '编辑角色' : '新增角色' }}</text>
          <uni-icons type="close" size="20" @click="hancleCloseDialog"></uni-icons>
        </view>

        <scroll-view class="form-content" scroll-y>
          <uni-forms ref="roleFormRef" :model="formData" :rules="rules">
            <uni-forms-item label="角色名称" required name="name">
              <uni-easyinput v-model="formData.name" placeholder="请输入角色名称" />
            </uni-forms-item>

            <uni-forms-item label="角色编码" required name="code">
              <uni-easyinput v-model="formData.code" placeholder="请输入角色编码" />
            </uni-forms-item>

            <uni-forms-item label="数据权限" required name="dataScope">
              <uni-data-select
                v-model="formData.dataScope"
                :localdata="dataScopeOptions"
                placeholder="请选择数据权限"
              />
            </uni-forms-item>

            <uni-forms-item label="状态" required name="status">
              <view class="status-switch">
                <switch
                  :checked="formData.status === 1"
                  @change="formData.status = $event.detail.value ? 1 : 0"
                  color="#007AFF"
                />
                <text class="status-text">{{ formData.status === 1 ? '正常' : '停用' }}</text>
              </view>
            </uni-forms-item>

            <uni-forms-item label="排序号" required name="sort">
              <uni-number-box
                v-model="formData.sort"
                :min="1"
                :max="999"
              />
            </uni-forms-item>
          </uni-forms>
        </scroll-view>

        <view class="form-footer">
          <button class="btn-submit" @click="handleSubmit">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { ref, reactive } from 'vue';

import RoleAPI, { RolePageVO, RolePageQuery, RoleForm } from "@/packageB/api/system/role";

// 加载状态
const loading = ref(false);
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more');
const showFilterPopup = ref(false);

// 查询参数
const queryParams = reactive<RolePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const total = ref(0);
const dataList = ref<RolePageVO[]>([]);

// 弹窗引用
const filterPopup = ref();
const formPopup = ref();
const roleFormRef = ref();

// 数据权限选项
const dataScopeOptions = ref([
  { text: "全部数据", value: 0 },
  { text: "部门及子部门数据", value: 1 },
  { text: "本部门数据", value: 2 },
  { text: "本人数据", value: 3 },
]);

// 表单数据
const initialFormData: RoleForm = {
  id: undefined,
  name: "",
  code: "",
  dataScope: 0,
  status: 1,
  sort: 1,
};

const formData = reactive<RoleForm>({ ...initialFormData });

// 表单验证规则
const rules = {
  name: {
    rules: [{ required: true, errorMessage: '请输入角色名称' }]
  },
  code: {
    rules: [{ required: true, errorMessage: '请输入角色编码' }]
  },
  dataScope: {
    rules: [{ required: true, errorMessage: '请选择数据权限' }]
  },
  status: {
    rules: [{ required: true, errorMessage: '请选择状态' }]
  },
  sort: {
    rules: [{ required: true, errorMessage: '请输入排序号' }]
  }
};

/**
 * 查询
 */
function handleQuery() {
  showFilterPopup.value = false;
  queryParams.pageNum = 1;
  dataList.value = [];
  queryPageData();
}

/**
 * 重置查询
 */
const handleResetQuery = () => {
  queryParams.keywords = "";
  queryParams.pageNum = 1;
  dataList.value = [];
  handleQuery();
};

/**
 * 查询分页数据
 */
function queryPageData() {
  if (loading.value) return;

  loading.value = true;
  loadMoreStatus.value = 'loading';

  RoleAPI.getPage(queryParams)
    .then((data) => {
      if (queryParams.pageNum === 1) {
        dataList.value = data.list || [];
      } else {
        dataList.value = [...dataList.value, ...(data.list || [])];
      }
      total.value = data.total || 0;
      queryParams.pageNum++;

      // 更新加载状态
      loadMoreStatus.value = queryParams.pageNum * queryParams.pageSize < total.value ? 'more' : 'noMore';
    })
    .catch((e) => {
      console.log("系统异常", e);
      dataList.value = [];
      total.value = 0;
      loadMoreStatus.value = 'more';
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 操作按钮
 */
const handleAction = (item: RolePageVO) => {
  const actions = ["编辑", "分配权限", "删除"];
  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      switch (actions[tapIndex]) {
        case "编辑":
          handleOpenDialog(item.id);
          break;
        case "分配权限":
          handleAssignPerm(item.id);
          break;
        case "删除":
          handleDelete(item.id);
          break;
      }
    },
  });
};

/**
 * 打开弹窗
 */
async function handleOpenDialog(id?: number) {
  // 重置表单数据
  Object.assign(formData, initialFormData);

  if (id) {
    try {
      const data = await RoleAPI.getFormData(id);
      Object.assign(formData, { ...data });
    } catch (error) {
      console.error('获取角色数据失败:', error);
      uni.showToast({ title: '获取数据失败', icon: 'none' });
    }
  }

  formPopup.value.open();
}

/**
 * 提交保存
 */
function handleSubmit() {
  roleFormRef.value.validate().then((res: any) => {
    const roleId = formData.id;
    const apiCall = roleId ? RoleAPI.update(roleId, formData) : RoleAPI.add(formData);

    apiCall.then(() => {
      uni.showToast({
        title: roleId ? "修改成功" : "添加成功",
        icon: "success"
      });
      hancleCloseDialog();
      handleQuery();
    }).catch(error => {
      console.error('保存失败:', error);
      uni.showToast({ title: "操作失败", icon: "none" });
    });
  }).catch((err: any) => {
    console.log('表单验证失败:', err);
  });
}

// 关闭弹窗
function hancleCloseDialog() {
  formPopup.value.close();
  Object.assign(formData, initialFormData);
}

/**
 * 删除
 */
function handleDelete(id: number) {
  uni.showModal({
    title: "提示",
    content: "确认删除角色吗？",
    success: (res) => {
      if (res.confirm) {
        RoleAPI.deleteByIds(id + "").then(() => {
          uni.showToast({ title: "删除成功", icon: "success" });
          queryParams.pageNum = 1;
          handleQuery();
        }).catch(error => {
          console.error('删除失败:', error);
          uni.showToast({ title: "删除失败", icon: "none" });
        });
      }
    }
  });
}

/**
 * 分配权限
 */
function handleAssignPerm(id: number) {
  uni.navigateTo({
    url: "/pages/work/role/assign-perm?id=" + id,
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
    queryPageData();
  }
});

onLoad(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.role {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-top: calc(var(--status-bar-height) + 90rpx);
}

.filter-container {
  position: fixed;
  top: calc(var(--status-bar-height) + 90rpx);
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  z-index: 100;
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

.list-container {
  padding: 20rpx;
}

.role-card {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.card-header {
  margin-bottom: 20rpx;
}

.role-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
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
  min-width: 140rpx;
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

.create-time {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.time-label {
  font-size: 24rpx;
  color: #666;
}

.time-value {
  font-size: 24rpx;
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

.status-switch {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
}

.status-text {
  font-size: 28rpx;
  color: #333;
}

.form-footer {
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #eee;

  .btn-submit {
    width: 100%;
    padding: 24rpx;
    background: #007AFF;
    color: white;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .role {
    padding-top: calc(var(--status-bar-height) + 80rpx);
  }

  .filter-container {
    top: calc(var(--status-bar-height) + 80rpx);
    padding: 16rpx;
  }

  .list-container {
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
}
</style>
