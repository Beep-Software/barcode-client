<template>
  <div class="container">
    <Header></Header>
    <RouterView></RouterView>
  </div>
</template>

<script lang="ts" setup>
import Header from '@/components/ui/Header.vue';
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>