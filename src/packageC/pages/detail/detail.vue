<template>
  <div class="detail-page">
    <!-- 轮播图区域 -->
    <div class="carousel-container">
      <el-carousel
        :autoplay="true"
        :interval="3000"
        :indicator-position="'outside'"
        height="200px"
      >
        <el-carousel-item v-for="(item, index) in data.imgList" :key="index">
          <div class="image-wrapper">
            <el-image
              :src="item.src"
              :class="item.loaded"
              fit="cover"
              @load="imageOnLoad('imgList', index)"
            >
              <template #placeholder>
                <div class="image-skeleton"></div>
              </template>
            </el-image>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 选集面板 -->
    <div class="episode-panel-wrapper">
      <div class="episode-scroll-container">
        <div
          class="episode-item"
          v-for="(item, index) in data.episodeList"
          :key="index"
          :class="{ current: currentEpd === item, skeleton: !loaded }"
          @click="changeEpd(index)"
        >
          {{ item }}
        </div>
      </div>
    </div>

    <!-- 视频信息 -->
    <div class="info-section">
      <div class="video-info">
        <div class="title-container">
          <div :class="{ skeleton: !loaded }" class="main-title">
            {{ data.title }}
          </div>
          <div :class="{ skeleton: !loaded }" class="sub-title">
            {{ data.title2 }}
          </div>
        </div>
        <el-icon class="expand-icon"><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-tooltip content="分享" placement="top">
        <el-icon class="action-icon" @click="share">
          <Share />
        </el-icon>
      </el-tooltip>

      <el-tooltip content="播放列表" placement="top">
        <el-icon class="action-icon">
          <List />
        </el-icon>
      </el-tooltip>

      <el-tooltip :content="data.favorite ? '已收藏' : '收藏'" placement="top">
        <el-icon
          class="action-icon"
          :class="{ active: data.favorite }"
          @click="favorite"
        >
          <Star />
        </el-icon>
      </el-tooltip>
    </div>

    <!-- 猜你喜欢 -->
    <div class="recommend-section">
      <div class="section-title">猜你喜欢</div>
      <div class="recommend-grid">
        <div
          v-for="(item, index) in data.guessList"
          :key="index"
          class="recommend-item"
          @click="handleRecommendClick(item)"
        >
          <div class="image-container">
            <el-image
              :src="item.src"
              :class="item.loaded"
              fit="cover"
              @load="imageOnLoad('guessList', index)"
            >
              <template #placeholder>
                <div class="image-skeleton"></div>
              </template>
            </el-image>
          </div>
          <div :class="{ skeleton: !loaded }" class="item-title">
            {{ item.title }}
          </div>
          <div :class="{ skeleton: !loaded }" class="item-subtitle">
            {{ item.title2 }}
          </div>
        </div>
      </div>
    </div>

    <!-- 评论区域 -->
    <div class="comment-section">
      <div class="section-title">评论</div>
      <div class="comment-list" :class="{ skeleton: !loaded }">
        <div
          v-for="(item, index) in data.evaList"
          :key="index"
          class="comment-item"
        >
          <el-avatar :src="item.src" class="user-avatar" />
          <div class="comment-content">
            <div class="comment-header">
              <span class="user-name">{{ item.nickname }}</span>
              <span class="comment-time">{{ item.time }}</span>
            </div>
            <div class="comment-body">{{ item.content }}</div>
            <div class="comment-footer">
              <el-icon class="like-icon"><Star /></el-icon>
              <span class="like-count">{{ item.zan }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <el-dialog
      v-model="showShareDialog"
      title="分享"
      width="400px"
      :append-to-body="true"
    >
      <SharePanel :share-list="shareList" @share="handleShare" />
    </el-dialog>
  </div>
</template>

<script setup>

// 这个页面结构非常适合作为商品详情页



import { ref, reactive, onMounted } from 'vue';
import {
  ArrowDown,
  Share,
  List,
  Star
} from '@element-plus/icons-vue';
import { ElCarousel, ElCarouselItem, ElImage, ElIcon, ElTooltip, ElDialog, ElAvatar } from 'element-plus';
import SharePanel from '@/components/SharePanel.vue';
import { getDetailData, getShareList } from '@/api/detail';

// 响应式数据
const loaded = ref(false);
const currentEpd = ref(1);
const showShareDialog = ref(false);
const data = reactive({
  imgList: [],
  episodeList: [],
  title: '',
  title2: '',
  favorite: false,
  guessList: [{}, {}, {}, {}],
  evaList: []
});
const shareList = ref([]);

// 生命周期
onMounted(async () => {
  try {
    const [detailData, shareListData] = await Promise.all([
      getDetailData(),
      getShareList()
    ]);

    // 更新数据
    Object.assign(data, detailData);
    shareList.value = shareListData;
    loaded.value = true;

    // 设置页面标题
    document.title = detailData.title;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
});

// 图片加载完成事件
const imageOnLoad = (key, index) => {
  data[key][index].loaded = 'loaded';
};

// 切换剧集
const changeEpd = (index) => {
  const epd = data.episodeList[index];
  currentEpd.value = epd;
  console.log(`切换到第${epd}集`);
};

// 分享
const share = () => {
  showShareDialog.value = true;
};

// 收藏/取消收藏
const favorite = () => {
  data.favorite = !data.favorite;
  console.log(data.favorite ? '已收藏' : '取消收藏');
};

// 处理推荐项点击
const handleRecommendClick = (item) => {
  console.log('点击推荐:', item);
  // 这里可以跳转到对应的详情页
};

// 处理分享
const handleShare = (platform) => {
  console.log('分享到:', platform);
  showShareDialog.value = false;
};
</script>

<style scoped>
.detail-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 轮播图样式 */
.carousel-container {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-wrapper .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.image-wrapper .el-image:hover {
  transform: scale(1.05);
}

.image-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

/* 选集面板样式 */
.episode-panel-wrapper {
  background: #fff;
  padding: 20px 0;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.episode-scroll-container {
  display: flex;
  gap: 20px;
  padding: 0 40px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.episode-scroll-container::-webkit-scrollbar {
  display: none;
}

.episode-item {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5f7fa;
  color: #606266;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.episode-item:hover {
  background: #e6f7ff;
  color: #07a7a7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(7, 167, 167, 0.2);
}

.episode-item.current {
  background: #07a7a7;
  color: #fff;
  font-weight: 600;
}

/* 骨架屏效果 */
.episode-item.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  color: transparent;
}

/* 视频信息样式 */
.info-section {
  background: #fff;
  padding: 20px 40px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.video-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.title-container {
  flex: 1;
}

.main-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
}

.sub-title {
  font-size: 16px;
  color: #909399;
  line-height: 1.5;
}

.expand-icon {
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  transition: transform 0.3s;
}

.expand-icon:hover {
  color: #07a7a7;
  transform: rotate(180deg);
}

/* 操作按钮样式 */
.action-buttons {
  background: #fff;
  padding: 20px 28px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 30px;
  justify-content: center;
}

.action-icon {
  font-size: 28px;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 50%;
}

.action-icon:hover {
  background: #f5f7fa;
  color: #07a7a7;
  transform: scale(1.1);
}

.action-icon.active {
  color: #ff4443;
}

/* 猜你喜欢样式 */
.recommend-section {
  background: #fff;
  padding: 30px 40px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #07a7a7;
  border-radius: 2px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.recommend-item {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.recommend-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recommend-item:hover .item-title {
  color: #07a7a7;
}

.image-container {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.image-container .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
}

.recommend-item:hover .image-container .el-image {
  transform: scale(1.05);
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}

.item-subtitle {
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

/* 评论区域样式 */
.comment-section {
  background: #fff;
  padding: 40px 0;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comment-list {
  padding: 0 40px;
}

.comment-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 14px;
  color: #909399;
}

.comment-body {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 6px;
}

.like-icon {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}

.like-icon:hover {
  color: #ff4443;
}

.like-count {
  font-size: 14px;
  color: #909399;
}

/* 骨架屏动画 */
@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  color: transparent;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .episode-scroll-container {
    padding: 0 20px;
  }

  .info-section,
  .recommend-section,
  .comment-list {
    padding-left: 20px;
    padding-right: 20px;
  }

  .recommend-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .action-buttons {
    gap: 20px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .recommend-grid {
    grid-template-columns: 1fr 1fr;
  }

  .main-title {
    font-size: 20px;
  }

  .sub-title {
    font-size: 14px;
  }

  .episode-item {
    width: 48px;
    height: 48px;
    font-size: 16px;
  }
}
</style>
