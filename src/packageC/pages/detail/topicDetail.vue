<template>
  <div class="topic-detail-page">
    <!-- 专题封面轮播 -->
    <div class="carousel-container">
      <el-carousel>
        <el-carousel-item v-for="cover in topic.covers" :key="cover">
          <el-image :src="cover" fit="cover"></el-image>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 专题介绍 -->
    <div class="topic-intro">
      <h1>{{ topic.title }}</h1>
      <div class="topic-desc">{{ topic.description }}</div>
    </div>

    <!-- 专题商品分类 -->
    <div class="category-tabs">
      <el-tabs v-model="activeCategory">
        <el-tab-pane
          v-for="category in topic.categories"
          :key="category.id"
          :label="category.name"
          :name="category.id"
        >
          <!-- 该分类下的商品 -->
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<!--商品专题、集合页-->
