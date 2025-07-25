<script setup lang="ts">

definePageMeta({
    layout: 'me',
    title: '个人信息',
})
const { user } = storeToRefs(useUserStore())
const uploadAvatarUrl = ref('')
const { onChange: avatarFileOnChange, open: openUploadUserAvatar } = useFileDialog({
    accept: 'image/*',
    multiple: false,
})
avatarFileOnChange(async (files) => {
    /** do something with files */
    if (files && files.length > 0) {
        const file = files[0]
        const avFile = new LC.File(file.name, file)
        await avFile.save()
        // console.log(avFile.url())
        if (user.value) {
            user.value.avatar = avFile.url()
            uploadAvatarUrl.value = avFile.url()
        }
    }
})
// const gender = ref(1)
onMounted(() => {
    if (user.value) {
        uploadAvatarUrl.value = user.value.avatar
        // gender.value = user.value.gender
        // console.log('user.value.gender', user.value.gender)
    }
})
const { copy } = useClipboard()
const copyUserId = () => {
    if (user.value) {
        copy(user.value.objectId)
        useToast('User ID copied to clipboard')
    }
}

const save = async () => {
    if (user.value) {
        user.value.avatar = uploadAvatarUrl.value
        await user.value.save()
        useToast('Profile updated successfully')

    }
}
</script>

<template>
    <div v-if="user" class="flex flex-col items-start space-y-2 p-6 w-full max-w-lg">
        <div class="">
            <h3 class="text-lg font-medium">
                Profile
            </h3>
            <p class="text-sm text-muted-foreground">
                This is how others will see you on the site.
            </p>
        </div>
        <Separator class="mb-4" />
        <div class="mt-6 flex flex-col gap-8 w-full">
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>Default User Id
                    <NuxtIcon size="19" name="solar:copy-line-duotone" class="cursor-copy" @click="copyUserId" />
                </Label>
                <Input type="text" :disabled="true" v-model:model-value="user.objectId" placeholder="objectId" class="w-full" />

            </div>
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>UserName</Label>
                <Input type="text" v-model:model-value="user.name" placeholder="username" class="w-full" />
            </div>
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>Email</Label>
                <Input type="email" v-model:model-value="user.email" placeholder="email" class="w-full" />
            </div>
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>Phone</Label>
                <Input type="text" :disabled="true" v-model:model-value="user.phone" class="w-full" />
            </div>
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>Gender</Label>

                <div class="flex flex-row items-center space-x-6">
                    <div class="flex flex-row items-center space-x-2 text-xs">
                        <Label for="gender">Male</Label>
                        <input v-model.number="user.gender" type="radio" name="gender" :value="1" class="radio radio-sm">
                    </div>

                    <div class="flex flex-row items-center space-x-2">
                        <Label for="gender">Female</Label>
                        <input v-model.number="user.gender" type="radio" name="gender" :value="2" class="radio radio-sm">
                    </div>
                </div>
            </div>
            <div class="grid w-full max-w-sm items-center gap-5">
                <Label>Avatar</Label>
                <div class="cursor-pointer  rounded-full  " @click="openUploadUserAvatar()">
                    <NuxtIcon v-if="!uploadAvatarUrl" name="icon-park-outline:upload-one" size="26" class="cursor-pointer" />
                    <div v-else class="avatar online">
                        <div class=" ring-primary ring-offset-base-100 ring ring-offset-2 w-11 rounded-full">
                            <img :src="uploadAvatarUrl" />
                        </div>
                    </div>
                </div>
            </div>


        </div>
        <Separator class="my-5" />
        <div class="flex w-full max-w-sm items-center  space-x-2">
            <Button @click="save">Save</Button>

        </div>

    </div>
</template>
