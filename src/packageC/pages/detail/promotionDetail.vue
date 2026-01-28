<template>
  <div class="promotion-detail-page">
    <!-- 活动轮播图 -->
    <div class="carousel-container">
      <el-carousel>
        <el-carousel-item v-for="img in promotion.images" :key="img">
          <el-image :src="img" fit="cover"></el-image>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 倒计时和活动信息 -->
    <div class="promotion-info">
      <div class="countdown">
        <span>距结束</span>
        <count-down :end-time="promotion.endTime"></count-down>
      </div>
      <h1 class="promotion-title">{{ promotion.title }}</h1>
      <div class="promotion-price">
        <span class="current">¥{{ promotion.currentPrice }}</span>
        <span class="original">¥{{ promotion.originalPrice }}</span>
      </div>
    </div>

    <!-- 参与商品列表 -->
    <div class="product-list">
      <div
        v-for="product in promotion.products"
        :key="product.id"
        class="product-item"
      >
        <!-- 商品信息 -->
      </div>
    </div>
  </div>
</template>

<!--限时抢购、秒杀活动详情页-->
