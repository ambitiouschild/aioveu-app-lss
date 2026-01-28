<template>
  <div class="product-detail-page">
    <!-- 商品轮播图（展示多张商品图） -->
    <div class="carousel-container">
      <el-carousel>
        <el-carousel-item v-for="(img, index) in product.images" :key="index">
          <el-image :src="img" fit="cover"></el-image>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 商品规格选择（替换剧集选择） -->
    <div class="spec-panel-wrapper">
      <div class="spec-scroll-container">
        <div
          v-for="spec in product.specs"
          :key="spec.id"
          :class="{ active: currentSpec === spec }"
          class="spec-item"
          @click="selectSpec(spec)"
        >
          {{ spec.name }}
          <div class="spec-price">¥{{ spec.price }}</div>
        </div>
      </div>
    </div>

    <!-- 商品基本信息 -->
    <div class="product-info">
      <div class="price-section">
        <div class="current-price">¥{{ product.price }}</div>
        <div class="original-price">¥{{ product.originalPrice }}</div>
        <div class="discount">{{ product.discount }}折</div>
      </div>
      <h1 class="product-title">{{ product.title }}</h1>
      <div class="product-tags">
        <el-tag v-for="tag in product.tags" :key="tag">{{ tag }}</el-tag>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="product-actions">
      <el-button type="primary" icon="ShoppingCart" @click="addToCart">
        加入购物车
      </el-button>
      <el-button type="success" icon="ShoppingBag" @click="buyNow">
        立即购买
      </el-button>
      <el-button icon="Star" :type="product.collected ? 'warning' : ''" @click="toggleCollect">
        {{ product.collected ? '已收藏' : '收藏' }}
      </el-button>
      <el-button icon="Share" @click="shareProduct">分享</el-button>
    </div>

    <!-- 商品详情 -->
    <div class="product-detail">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="商品详情" name="detail">
          <div v-html="product.detailHtml"></div>
        </el-tab-pane>
        <el-tab-pane label="规格参数" name="spec">
          <el-descriptions :column="2" border>
            <el-descriptions-item
              v-for="param in product.params"
              :key="param.key"
              :label="param.label"
            >
              {{ param.value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="评价({{ product.commentCount }})" name="comment">
          <!-- 评论列表 -->
          <div v-for="comment in product.comments" :key="comment.id" class="comment-item">
            <el-avatar :src="comment.avatar"></el-avatar>
            <div class="comment-content">
              <div class="comment-user">
                <span>{{ comment.username }}</span>
                <el-rate v-model="comment.rating" disabled></el-rate>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-images">
                <el-image
                  v-for="img in comment.images"
                  :key="img"
                  :src="img"
                  fit="cover"
                ></el-image>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 猜你喜欢（商品推荐） -->
    <div class="recommend-section">
      <div class="section-title">猜你喜欢</div>
      <div class="recommend-grid">
        <div
          v-for="item in recommendedProducts"
          :key="item.id"
          class="recommend-product"
          @click="goToProduct(item.id)"
        >
          <el-image :src="item.image" fit="cover"></el-image>
          <div class="product-info">
            <div class="product-name">{{ item.name }}</div>
            <div class="product-price">¥{{ item.price }}</div>
            <div class="product-sales">月销{{ item.sales }}件</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
