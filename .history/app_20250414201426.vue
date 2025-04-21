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
    <ClientOnly>
      <Transition name="slide-fade" mode="out-in">
        <Login v-if="showLoginTeleport" @close="closeLogin" />
      </Transition>
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>

</template>
