<template>
  <!-- <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div> -->
  <!-- 全局 shadcn toast 支持 -->
  <div>
    <ClientOnly>
      <Toaster />
    </ClientOnly>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>

</template>
