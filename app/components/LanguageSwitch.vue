<script setup lang="ts">
import { useI18n } from '#imports'
// @ts-expect-error Nuxt-i18n extends Composer
const { locale, locales, setLocale } = useI18n({ useScope: 'global' })

const options = computed(() =>
    locales.value.map(l => ({
        code: l.code,
        label: {
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文',
            en: 'English',
            ja: '日本語'
        }[l.code] ?? l.code
    }))
)

// 直接用带 setter 的 computed 与 <Select v-model> 双向绑定
const selected = computed({
    get: () => locale.value,
    set: val => setLocale(val as string)
})
</script>

<template>


    <Select v-model="selected">
        <SelectTrigger>
            <SelectValue :placeholder="$t('selectLanguage')" class="min-w-20" />
        </SelectTrigger>

        <SelectContent>
            <SelectItem v-for="o in options" :key="o.code" :value="o.code">
                {{ o.label }}
            </SelectItem>
        </SelectContent>
    </Select>

</template>
