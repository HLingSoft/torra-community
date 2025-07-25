import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'

export default defineNuxtPlugin(() => {
    dayjs.extend(quarterOfYear)
})
