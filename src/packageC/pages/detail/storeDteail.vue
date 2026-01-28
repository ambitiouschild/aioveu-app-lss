<template>
  <div class="store-home-page">
    <!-- 店铺banner轮播 -->
    <div class="carousel-container">
      <el-carousel>
        <el-carousel-item v-for="banner in store.banners" :key="banner.id">
          <el-image :src="banner.image" fit="cover"></el-image>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 店铺信息 -->
    <div class="store-info">
      <el-avatar :src="store.logo" :size="80"></el-avatar>
      <div class="store-detail">
        <h2>{{ store.name }}</h2>
        <div class="store-tags">
          <el-tag>正品保证</el-tag>
          <el-tag>7天退换</el-tag>
        </div>
      </div>
      <el-button type="primary" @click="followStore">
        {{ store.followed ? '已关注' : '关注店铺' }}
      </el-button>
    </div>

    <!-- 热销商品 -->
    <div class="hot-products">
      <div class="section-title">热销商品</div>
      <!-- 商品列表 -->
    </div>
  </div>
</template>

<!--品牌旗舰店或店铺首页-->
