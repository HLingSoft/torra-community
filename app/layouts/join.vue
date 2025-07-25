<script setup lang="ts">

const { t } = useI18n()
useHead({
    title: `Torra - ${t('join')}`,

})


</script>

<template>

    <section class="max-w-screen  overflow-hidden flex flex-col items-center  min-h-screen max-h-screen h-screen">
        <Header class="w-full" />
        <main class="flex-1 w-full max-w-7xl flex flex-col items-center justify-center px-4 py-10">
            <slot></slot>
        </main>

        <footer class=" w-full " aria-labelledby="footer-heading">

            <div class="mx-auto max-w-7xl text-black  py-5">


                <div class="     md:flex md:items-center md:justify-between">
                    <p class="  text-sm leading-5  md:order-1 md:mt-0">
                        2025 Copyright@ HLingSoft (Shanghai) Co., Ltd.<a href="https://beian.miit.gov.cn" target="_blank" class=" ml-10">沪ICP备2021004837号</a>
                    </p>
                </div>
            </div>
        </footer>
    </section>
</template>
