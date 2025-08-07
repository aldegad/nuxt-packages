<script setup lang="ts">
import { PerformanceMonitor } from "@aldegad/nuxt-core";
</script>

<template>
  <ClientOnly>
    <NuxtLayout>
      <NuxtPage />
      <PerformanceMonitor />
    </NuxtLayout>
  </ClientOnly>
</template>
