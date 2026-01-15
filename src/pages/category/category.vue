<template>
  <view class="content">
    <!-- 左侧一级分类 -->
    <scroll-view scroll-y class="left-aside">
      <view
        v-for="item in flist"
        :key="item.id"
        class="f-item b-b"
        :class="{ active: item.id == currentId }"
        @click="tabtap(item)"
      >
        {{ item.name }}
      </view>
    </scroll-view>

    <!-- 右侧二级分类 -->
    <scroll-view
      scroll-with-animation
      scroll-y
      class="right-aside"
      @scroll="handleScroll"
      :scroll-top="tabScrollTop"
    >
      <view
        v-for="item in safeSlist"
        :key="item.id"
        class="s-list"
        :id="'main-' + item.id"
      >
        <text class="s-item">{{ item.name }}</text>
        <view class="t-list">
          <!-- 三级分类 -->
          <view
            v-for="titem in getThirdCategories(item.id)"
            :key="titem.id"
            @click="goToList(item.id, titem.id)"
            class="t-item"
          >
            <image :src="titem.iconUrl || defaultImageUrl"></image>
            <text>{{ titem.name }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategoryList } from '@/api/pms/category'

//Vue 2 的 Options API 和 Vue 3 的 Composition API
//✅ 纯 Vue 3 Composition API
//✅ 正确的响应式数据访问

// 响应式数据
const sizeCalcState = ref(false)  // 是否已计算尺寸
const tabScrollTop = ref(0)       // 右侧滚动位置
const currentId = ref(0)          // 当前选中的一级分类ID
const flist = ref([])             // 一级分类列表
const slist = ref([])             // 二级分类列表
const tlist = ref([])             // 三级分类列表
const defaultImageUrl = '/static/default-category.png'  // 默认图片

// 计算属性：安全的二级分类列表
const safeSlist = computed(() => {
  return slist.value.filter(item => item && item.id && item.name)
})

// 计算属性：获取指定二级分类下的三级分类
const getThirdCategories = (secondId) => {
  if (!secondId) return []
  return tlist.value.filter(titem => titem && titem.parentId === secondId)
}

/**
 * 加载分类数据
 */
const loadData = async () => {
  try {
    console.log("调用API获取分类数据:")
    const response = await getCategoryList()

    if (!response) {
      console.error("获取分类数据失败")
      return
    }

    const categoryList = response  // ✅ 修复：应该是 response.data
    console.log("分类数据:", categoryList)

    // 重置数据
    flist.value = []
    slist.value = []
    tlist.value = []

    // 处理数据
    categoryList.forEach(first => {
      if (!first?.id) return

      // 一级分类
      flist.value.push({
        id: first.id,
        name: first.name || '未命名',
        parentId: first.parentId || 0
      })

      // 二级分类
      if (first.children?.length) {
        first.children.forEach(second => {
          if (!second?.id) return

          const secondItem = {
            id: second.id,
            name: second.name || '未命名',
            parentId: second.parentId || 0
          }
          slist.value.push(secondItem)

          // 三级分类
          if (second.children?.length) {
            second.children.forEach(third => {
              if (!third?.id) return

              tlist.value.push({
                id: third.id,
                name: third.name || '未命名',
                parentId: third.parentId || 0,
                iconUrl: third.iconUrl || null
              })
            })
          }
        })
      }
    })

    // 排序
    sortCategories()

    // 默认选中第一个
    if (flist.value.length > 0) {
      currentId.value = flist.value[0].id
    }

    console.log("数据加载完成:", {
      一级分类: flist.value.length,
      二级分类: slist.value.length,
      三级分类: tlist.value.length
    })

  } catch (error) {
    console.error("加载失败:", error)
  }
}

/**
 * 排序分类
 */
const sortCategories = () => {
  // 一级分类按ID排序
  flist.value.sort((a, b) => (a.id || 0) - (b.id || 0))

  // 二级分类排序
  slist.value.sort((a, b) => {
    const parentCompare = (a.parentId || 0) - (b.parentId || 0)
    return parentCompare !== 0 ? parentCompare : (a.id || 0) - (b.id || 0)
  })

  // 三级分类排序
  tlist.value.sort((a, b) => {
    const parentCompare = (a.parentId || 0) - (b.parentId || 0)
    return parentCompare !== 0 ? parentCompare : (a.id || 0) - (b.id || 0)
  })
}

/**
 * 点击一级分类
 */
const tabtap = async (item) => {
  // 更新当前选中的分类ID
  currentId.value = item.id

  // 如果还没计算过尺寸，先计算
  if (!sizeCalcState.value) {
    await calculateSizes()
  }

  // 找到对应的二级分类，滚动到该位置
  const index = slist.value.findIndex(sitem => sitem.parentId == item.id)
  if (index !== -1 && slist.value[index].top !== undefined) {
    tabScrollTop.value = slist.value[index].top
  }
}

/**
 * 滚动事件处理
 */
const handleScroll = (e) => {
  // 如果还没计算过尺寸，先计算
  if (!sizeCalcState.value) {
    calculateSizes()
  }

  // 获取当前滚动位置
  const scrollPosition = e.detail.scrollTop

  // 找到当前滚动位置对应的分类
  const visibleCategories = slist.value
    .filter(item => (item.top || 0) <= scrollPosition)
    .reverse()

  if (visibleCategories.length > 0) {
    currentId.value = visibleCategories[0].parentId || 0
  }
}

/**
 * 计算右侧每个分类块的位置和高度
 */
const calculateSizes = () => {
  return new Promise((resolve) => {
    let totalHeight = 0
    let completedCount = 0
    const totalItems = slist.value.length

    if (totalItems === 0) {
      sizeCalcState.value = true
      resolve()
      return
    }

    slist.value.forEach(item => {
      uni.createSelectorQuery()
        .select('#main-' + item.id)
        .fields({ size: true }, (data) => {
          if (data) {
            // 记录该分类块的顶部位置
            item.top = totalHeight
            // 累加高度
            totalHeight += data.height
            // 记录该分类块的底部位置
            item.bottom = totalHeight
          }

          completedCount++
          if (completedCount === totalItems) {
            sizeCalcState.value = true
            console.log('尺寸计算完成，总高度:', totalHeight)
            resolve()
          }
        })
        .exec()
    })
  })
}

/**
 * 跳转到商品列表页
 */
const goToList = (secondId, thirdId) => {
  uni.navigateTo({
    url: `/pages/product/list?fid=${currentId.value}&sid=${secondId}&tid=${thirdId}`
  })
}

// 页面加载
onMounted(() => {
  loadData()
})
</script>

<style lang="scss">
/* 页面基础样式 */
page,
.content {
  height: 100%;
  background-color: #f8f8f8;
}

.content {
  display: flex;   /* 使用flex布局实现左右分栏 */
}

/* 左侧一级分类区域 */
.left-aside {
  flex-shrink: 0;   /* 禁止缩小 */
  width: 200upx;
  height: 100%;
  background-color: #fff;
}

/* 一级分类项样式 */
.f-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100upx;
  font-size: 28upx;
  color: $font-color-base;
  position: relative;

  /* 选中状态 */
  &.active {
    color: $base-color;
    background: #f8f8f8;

    /* 左侧选中指示条 */
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 36upx;
      width: 8upx;
      background-color: $base-color;
      border-radius: 0 4px 4px 0;
      opacity: 0.8;
    }
  }
}

/* 右侧二级分类区域 */
.right-aside {
  flex: 1;   /* 占据剩余空间 */
  overflow: hidden;
  padding-left: 20upx;
}

/* 二级分类标题 */
.s-item {
  display: flex;
  align-items: center;
  height: 70upx;
  padding-top: 8upx;
  font-size: 28upx;
  color: $font-color-dark;
}

/* 三级分类容器 */
.t-list {
  display: flex;
  flex-wrap: wrap;   /* 允许换行 */
  width: 100%;
  background: #fff;
  padding-top: 12upx;

  /* 使用伪元素实现两端对齐 */
  &:after {
    content: '';
    flex: 99;
    height: 0;
  }
}

/* 三级分类项 */
.t-item {
  flex-shrink: 0;   /* 禁止缩小 */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;   /* 垂直排列 */
  width: 176upx;
  font-size: 26upx;
  color: #666;
  padding-bottom: 20upx;

  /* 分类图标 */
  image {
    width: 140upx;
    height: 140upx;
  }
}
</style>
