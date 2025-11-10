import { defineStore } from 'pinia'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    unreadCount: 0,
  }),
  actions: {
    setUnreadCount(count) {
      this.unreadCount = count
    },
  },
})
