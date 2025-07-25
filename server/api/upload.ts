import { writeFile } from 'node:fs/promises'



export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)

    const file = formData?.find(f => f.name === 'file')
    if (!file) {
        return { error: 'no file' }
    }

    const ext = file.filename?.split('.').pop()
    const filename = `avatar_${Date.now()}.${ext}`
    const path = `./public/uploads/${filename}`

    await writeFile(path, file.data)

    return { url: `/uploads/${filename}` }
})
