<template>
  <nav
    ref="navRef"
    class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
  >
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
    >
      <router-link
        class="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
        :to="{ name: 'Home' }"
        alt="Home"
      >
        <img
          src="/favicon-96x96.png"
          alt="Logo"
          width="30"
          height="30"
          class="inline-block"
        />
        Internum
      </router-link>

      <button
        type="button"
        class="inline-flex items-center rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        :aria-expanded="mobileOpen.toString()"
        aria-controls="navDrawer"
        aria-label="Alternar navegação"
        @click="mobileOpen = !mobileOpen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="h-5 w-5"
          aria-hidden="true"
        >
          <path
            v-if="!mobileOpen"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
          <path
            v-else
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
          />
        </svg>
      </button>

      <!-- Desktop: barra horizontal + dropdowns -->
      <div class="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
        <ul
          v-if="isAuthenticated"
          class="flex items-center gap-1"
          @keydown="onL1Keydown"
        >
          <li
            v-for="item in activeMenu"
            :key="item.key || item.label"
            class="relative"
            :data-dropdown="item.type === 'dropdown' ? '' : undefined"
            @mouseenter="hoverMenu(item.key)"
            @mouseleave="leaveMenu(item.key)"
          >
            <router-link
              v-if="item.type === 'link'"
              :class="[navL1, isActiveMenu(item) ? l1Active : '']"
              :to="{ name: item.name }"
              @click="closeMenus"
            >
              {{ item.label }}
            </router-link>

            <template v-else-if="item.type === 'dropdown'">
              <button
                :id="'dd-trigger-' + item.key"
                type="button"
                :class="[navL1, isActiveMenu(item) ? l1Active : '']"
                :aria-expanded="(openMenu === item.key).toString()"
                aria-haspopup="menu"
                :aria-controls="'dd-' + item.key"
                @click="toggleMenu(item.key)"
              >
                {{ item.label }}
                <ChevronDown
                  :class="openMenu === item.key ? 'rotate-180' : ''"
                />
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                leave-active-class="transition duration-200 ease-out"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <ul
                  v-if="openMenu === item.key"
                  :id="'dd-' + item.key"
                  :class="[ddCard, 'absolute top-full left-0 min-w-56']"
                  role="menu"
                  :aria-labelledby="'dd-trigger-' + item.key"
                  @keydown="onMenuKeydown"
                >
                  <template v-for="(sub, i) in item.items" :key="i">
                    <li v-if="sub.type === 'divider'" role="none">
                      <hr :class="divider" />
                    </li>
                    <li v-else-if="sub.type === 'link'" role="none">
                      <router-link
                        :class="[ddItem, isCurrent(sub.name) ? current : '']"
                        :to="{ name: sub.name }"
                        role="menuitem"
                        @click="closeMenus"
                      >
                        {{ sub.label }}
                      </router-link>
                    </li>
                    <li
                      v-else-if="sub.type === 'submenu'"
                      class="relative"
                      role="none"
                      @mouseenter="hoverSub(sub.key)"
                      @mouseleave="leaveSub(sub.key)"
                    >
                      <button
                        :id="'sub-trigger-' + sub.key"
                        type="button"
                        :class="[
                          ddItem,
                          'justify-between',
                          isActiveSub(sub) ? current : '',
                        ]"
                        role="menuitem"
                        :aria-expanded="(openSub === sub.key).toString()"
                        aria-haspopup="menu"
                        :aria-controls="'sub-' + sub.key"
                        @click="toggleSub(sub.key)"
                        @keydown="(e) => onSubTriggerKeydown(sub.key, e)"
                      >
                        {{ sub.label }}
                        <ChevronRight
                          :class="openSub === sub.key ? 'rotate-90' : ''"
                        />
                      </button>
                      <Transition
                        enter-active-class="transition duration-200 ease-out"
                        enter-from-class="opacity-0 translate-x-2"
                        leave-active-class="transition duration-200 ease-out"
                        leave-to-class="opacity-0 translate-x-2"
                      >
                        <ul
                          v-if="openSub === sub.key"
                          :id="'sub-' + sub.key"
                          :class="[
                            ddCard,
                            'absolute top-0 min-w-56 max-h-[70vh] overflow-y-auto',
                            subFlip ? 'left-auto right-full' : 'left-full',
                          ]"
                          role="menu"
                          :aria-labelledby="'sub-trigger-' + sub.key"
                          @keydown="onMenuKeydown"
                        >
                          <template v-for="(leaf, j) in sub.items" :key="j">
                            <li v-if="leaf.type === 'divider'" role="none">
                              <hr :class="divider" />
                            </li>
                            <li v-else role="none">
                              <router-link
                                :class="[
                                  ddLeaf,
                                  isCurrent(leaf.name) ? current : '',
                                ]"
                                :to="{ name: leaf.name }"
                                role="menuitem"
                                @click="closeMenus"
                              >
                                {{ leaf.label }}
                              </router-link>
                            </li>
                          </template>
                        </ul>
                      </Transition>
                    </li>
                  </template>
                </ul>
              </Transition>
            </template>
          </li>
        </ul>

        <div class="ml-auto flex items-center gap-2">
          <router-link
            v-if="!isAuthenticated"
            class="btn-primary"
            :to="{ name: 'Login' }"
          >
            Login
          </router-link>

          <template v-else>
            <router-link
              :to="{ name: 'NoticesListByUser' }"
              class="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400"
              title="Meus avisos"
              aria-label="Meus avisos"
            >
              <Icon name="envelope" class="h-6 w-6" aria-hidden="true" />
              <span
                v-if="noticeStore.unreadCount > 0"
                class="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white"
              >
                {{ noticeStore.unreadCount }}
              </span>
            </router-link>

            <button
              type="button"
              :class="themeBtn"
              :aria-pressed="isDark.toString()"
              :title="buttonTitle"
              @click="toggle"
            >
              <Icon :name="icon" aria-hidden="true" />
              <span class="sr-only">{{ buttonTitle }}</span>
            </button>

            <div
              class="relative"
              data-dropdown
              @mouseenter="hoverMenu('user-desktop')"
              @mouseleave="leaveMenu('user-desktop')"
            >
              <button
                :id="'dd-trigger-user-desktop'"
                type="button"
                :class="navL1"
                :aria-expanded="(openMenu === 'user-desktop').toString()"
                aria-haspopup="menu"
                aria-controls="dd-user-desktop"
                @click="toggleMenu('user-desktop')"
              >
                Olá, {{ authStore?.formattedName }}
                <ChevronDown
                  :class="openMenu === 'user-desktop' ? 'rotate-180' : ''"
                />
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                leave-active-class="transition duration-200 ease-out"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <ul
                  v-if="openMenu === 'user-desktop'"
                  id="dd-user-desktop"
                  :class="[ddCard, 'absolute top-full right-0 min-w-48']"
                  role="menu"
                  aria-labelledby="dd-trigger-user-desktop"
                  @keydown="onMenuKeydown"
                >
                  <template v-for="(it, i) in accountMenu" :key="i">
                    <li v-if="it.type === 'divider'" role="none">
                      <hr :class="divider" />
                    </li>
                    <li v-else-if="it.type === 'link'" role="none">
                      <router-link
                        :class="[ddItem, isCurrent(it.name) ? current : '']"
                        :to="{ name: it.name }"
                        role="menuitem"
                        @click="closeMenus"
                      >
                        {{ it.label }}
                      </router-link>
                    </li>
                    <li v-else role="none">
                      <button
                        type="button"
                        :class="[ddItem, 'text-red-600 dark:text-red-400']"
                        role="menuitem"
                        @click="onLogout"
                      >
                        {{ it.label }}
                      </button>
                    </li>
                  </template>
                </ul>
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-out"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        aria-hidden="true"
        @click="mobileOpen = false"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform duration-200 ease-out"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="mobileOpen"
        id="navDrawer"
        ref="drawerRef"
        class="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85%] flex-col bg-white shadow-2xl lg:hidden dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <router-link
            class="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
            :to="{ name: 'Home' }"
            @click="closeMenus"
          >
            <img
              src="/favicon-96x96.png"
              alt="Logo"
              width="30"
              height="30"
              class="inline-block"
            />
            Internum
          </router-link>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Fechar menu"
            @click="mobileOpen = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
              />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-3 py-4">
          <ul v-if="isAuthenticated" class="space-y-1">
            <li
              v-for="item in activeMenu"
              :key="item.key || item.label"
              class="relative"
            >
              <router-link
                v-if="item.type === 'link'"
                :class="[mobL1, isActiveMenu(item) ? current : '']"
                :to="{ name: item.name }"
                @click="closeMenus"
              >
                {{ item.label }}
              </router-link>

              <template v-else-if="item.type === 'dropdown'">
                <button
                  type="button"
                  :class="[mobL1, isActiveMenu(item) ? current : '']"
                  :aria-expanded="(openMenu === item.key).toString()"
                  aria-haspopup="menu"
                  :aria-controls="'dd-' + item.key"
                  @click="toggleMenu(item.key)"
                >
                  {{ item.label }}
                  <ChevronDown
                    :class="openMenu === item.key ? 'rotate-180' : ''"
                  />
                </button>
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  leave-active-class="transition duration-200 ease-out"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <ul v-if="openMenu === item.key" :class="mobTree">
                    <template v-for="(sub, i) in item.items" :key="i">
                      <li v-if="sub.type === 'divider'">
                        <hr :class="divider" />
                      </li>
                      <li v-else-if="sub.type === 'link'">
                        <router-link
                          :class="[mobL2, isCurrent(sub.name) ? current : '']"
                          :to="{ name: sub.name }"
                          @click="closeMenus"
                        >
                          {{ sub.label }}
                        </router-link>
                      </li>
                      <li v-else-if="sub.type === 'submenu'">
                        <button
                          type="button"
                          :class="[
                            mobL2,
                            'justify-between',
                            isActiveSub(sub) ? current : '',
                          ]"
                          :aria-expanded="(openSub === sub.key).toString()"
                          aria-haspopup="menu"
                          :aria-controls="'sub-' + sub.key"
                          @click="toggleSub(sub.key)"
                        >
                          {{ sub.label }}
                          <ChevronRight
                            :class="openSub === sub.key ? 'rotate-90' : ''"
                          />
                        </button>
                        <Transition
                          enter-active-class="transition duration-200 ease-out"
                          enter-from-class="opacity-0 -translate-y-1"
                          leave-active-class="transition duration-200 ease-out"
                          leave-to-class="opacity-0 -translate-y-1"
                        >
                          <ul v-if="openSub === sub.key" :class="mobTree">
                            <template v-for="(leaf, j) in sub.items" :key="j">
                              <li v-if="leaf.type === 'divider'">
                                <hr :class="divider" />
                              </li>
                              <li v-else>
                                <router-link
                                  :class="[
                                    mobL3,
                                    isCurrent(leaf.name) ? current : '',
                                  ]"
                                  :to="{ name: leaf.name }"
                                  @click="closeMenus"
                                >
                                  {{ leaf.label }}
                                </router-link>
                              </li>
                            </template>
                          </ul>
                        </Transition>
                      </li>
                    </template>
                  </ul>
                </Transition>
              </template>
            </li>
          </ul>
        </div>

        <div class="border-t border-slate-200 p-4 dark:border-slate-700">
          <router-link
            v-if="!isAuthenticated"
            class="btn-primary w-full"
            :to="{ name: 'Login' }"
          >
            Login
          </router-link>

          <template v-else>
            <div class="relative">
              <button
                type="button"
                :class="[mobL1, 'justify-between']"
                :aria-expanded="(openMenu === 'user-mobile').toString()"
                aria-haspopup="menu"
                aria-controls="dd-user-mobile"
                @click="toggleMenu('user-mobile')"
              >
                Olá, {{ authStore?.formattedName }}
                <ChevronDown
                  :class="openMenu === 'user-mobile' ? 'rotate-180' : ''"
                />
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                leave-active-class="transition duration-200 ease-out"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <ul
                  v-if="openMenu === 'user-mobile'"
                  id="dd-user-mobile"
                  :class="mobTree"
                >
                  <template v-for="(it, i) in accountMenu" :key="i">
                    <li v-if="it.type === 'divider'">
                      <hr :class="divider" />
                    </li>
                    <li v-else-if="it.type === 'link'">
                      <router-link
                        :class="[mobL2, isCurrent(it.name) ? current : '']"
                        :to="{ name: it.name }"
                        @click="closeMenus"
                      >
                        {{ it.label }}
                      </router-link>
                    </li>
                    <li v-else>
                      <button
                        type="button"
                        :class="[mobL2, 'text-red-600 dark:text-red-400']"
                        @click="onLogout"
                      >
                        {{ it.label }}
                      </button>
                    </li>
                  </template>
                </ul>
              </Transition>
            </div>

            <button
              type="button"
              :class="[themeBtn, 'mt-2 w-full justify-center']"
              :aria-pressed="isDark.toString()"
              :title="buttonTitle"
              @click="toggle"
            >
              <Icon :name="icon" aria-hidden="true" />
              <span>{{ buttonTitle }}</span>
            </button>
          </template>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
  import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    h,
  } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useNoticeStore } from '@/stores/notices'
  import { useTheme } from '@/composables/useTheme'
  import Icon from '@/components/Icon.vue'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const noticeStore = useNoticeStore()
  const { isDark, icon, buttonTitle, toggle } = useTheme()

  const isAuthenticated = computed(() => Boolean(authStore?.accessToken))

  const navRef = ref(null)
  const drawerRef = ref(null)
  const mobileOpen = ref(false)
  const openMenu = ref(null)
  const openSub = ref(null)
  const pinned = ref(false)
  const pinnedSub = ref(false)
  const subFlip = ref(false)

  const hoverCapable =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const HOVER_DELAY = 180
  const CLOSE_DELAY = 200

  let openTimer = null
  let closeTimer = null
  let subOpenTimer = null
  let subCloseTimer = null

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
  const navL1 = [
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary-700',
    focusRing,
    'dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-primary-400',
  ].join(' ')
  const l1Active =
    'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
  const ddCard =
    'z-50 space-y-0.5 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800'
  const divider = 'my-1.5 border-t border-slate-200 dark:border-slate-700'
  const ddItem = [
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900',
    focusRing,
    'dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white',
  ].join(' ')
  const ddLeaf = [
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900',
    focusRing,
    'dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white',
  ].join(' ')
  const current =
    'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
  const mobL1 = [
    'flex min-h-11 w-full items-center gap-1.5 rounded-lg px-3 py-3 text-left text-base font-semibold text-slate-900 transition hover:bg-slate-100',
    focusRing,
    'dark:text-slate-100 dark:hover:bg-slate-800',
  ].join(' ')
  const mobL2 = [
    'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-100',
    focusRing,
    'dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ')
  const mobL3 = [
    'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-slate-100',
    focusRing,
    'dark:text-slate-400 dark:hover:bg-slate-800',
  ].join(' ')
  const mobTree =
    'ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-3 dark:border-slate-700'
  const themeBtn = [
    'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100',
    focusRing,
    'dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
  ].join(' ')

  function toggleMenu(name) {
    if (openMenu.value === name) {
      openMenu.value = null
      openSub.value = null
      pinned.value = false
      pinnedSub.value = false
    } else {
      openMenu.value = name
      openSub.value = null
      pinnedSub.value = false
      pinned.value = true
    }
  }

  function toggleSub(name) {
    if (openSub.value === name) {
      openSub.value = null
      pinnedSub.value = false
    } else {
      openSub.value = name
      pinnedSub.value = true
      nextTick(() => positionFlyout(name))
    }
  }

  function closeMenus() {
    openMenu.value = null
    openSub.value = null
    pinned.value = false
    pinnedSub.value = false
    mobileOpen.value = false
  }

  function hoverMenu(key) {
    if (!hoverCapable) return
    window.clearTimeout(closeTimer)
    window.clearTimeout(openTimer)
    openTimer = window.setTimeout(() => {
      if (!pinned.value) {
        openMenu.value = key
        openSub.value = null
      }
    }, HOVER_DELAY)
  }

  function leaveMenu(key) {
    if (!hoverCapable) return
    window.clearTimeout(openTimer)
    window.clearTimeout(closeTimer)
    closeTimer = window.setTimeout(() => {
      if (!pinned.value && openMenu.value === key) {
        openMenu.value = null
        openSub.value = null
      }
    }, CLOSE_DELAY)
  }

  function hoverSub(key) {
    if (!hoverCapable) return
    window.clearTimeout(subCloseTimer)
    window.clearTimeout(subOpenTimer)
    subOpenTimer = window.setTimeout(() => {
      if (!pinnedSub.value) {
        openSub.value = key
        nextTick(() => positionFlyout(key))
      }
    }, HOVER_DELAY)
  }

  function leaveSub(key) {
    if (!hoverCapable) return
    window.clearTimeout(subOpenTimer)
    window.clearTimeout(subCloseTimer)
    subCloseTimer = window.setTimeout(() => {
      if (!pinnedSub.value && openSub.value === key) {
        openSub.value = null
      }
    }, CLOSE_DELAY)
  }

  function positionFlyout(key) {
    const el = document.getElementById('sub-' + key)
    if (!el) {
      subFlip.value = false
      return
    }
    const rect = el.getBoundingClientRect()
    subFlip.value = rect.right > window.innerWidth - 8
  }

  function focusFirst(menuId) {
    const menu = document.getElementById(menuId)
    const first = menu?.querySelector('[role="menuitem"]')
    first?.focus()
  }

  function onL1Keydown(e) {
    const items = Array.from(
      e.currentTarget.querySelectorAll(':scope > li > a, :scope > li > button'),
    )
    const idx = items.indexOf(document.activeElement)
    if (idx === -1) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      items[(idx + 1) % items.length].focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      items[(idx - 1 + items.length) % items.length].focus()
    } else if (e.key === 'ArrowDown') {
      const controls = items[idx].getAttribute('aria-controls')
      if (controls) {
        e.preventDefault()
        openMenu.value = controls.replace(/^dd-/, '')
        openSub.value = null
        pinned.value = true
        nextTick(() => focusFirst(controls))
      }
    }
  }

  function onMenuKeydown(e) {
    const items = Array.from(
      e.currentTarget.querySelectorAll(':scope > li > [role="menuitem"]'),
    )
    const idx = items.indexOf(document.activeElement)
    if (idx === -1) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(idx + 1) % items.length].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(idx - 1 + items.length) % items.length].focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0].focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1].focus()
    }
  }

  function onSubTriggerKeydown(key, e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (openSub.value !== key) {
        openSub.value = key
        pinnedSub.value = true
        nextTick(() => focusFirst('sub-' + key))
      }
    } else if (e.key === 'ArrowLeft' && openSub.value === key) {
      e.preventDefault()
      openSub.value = null
      pinnedSub.value = false
      e.currentTarget.focus()
    }
  }

  function onDocClick(e) {
    if (drawerRef.value?.contains(e.target)) return

    if (openMenu.value && !e.target.closest('[data-dropdown]')) {
      openMenu.value = null
      openSub.value = null
      pinned.value = false
      pinnedSub.value = false
    }

    if (
      mobileOpen.value &&
      navRef.value &&
      !navRef.value.contains(e.target) &&
      !drawerRef.value?.contains(e.target)
    ) {
      mobileOpen.value = false
    }
  }

  function onDocKeydown(e) {
    if (e.key !== 'Escape') return
    if (openSub.value) {
      const subKey = openSub.value
      openSub.value = null
      pinnedSub.value = false
      navRef.value
        ?.querySelector('[aria-controls="sub-' + subKey + '"]')
        ?.focus()
      e.preventDefault()
    } else if (openMenu.value) {
      const menuKey = openMenu.value
      openMenu.value = null
      pinned.value = false
      navRef.value
        ?.querySelector('[aria-controls="dd-' + menuKey + '"]')
        ?.focus()
      e.preventDefault()
    } else if (mobileOpen.value) {
      mobileOpen.value = false
      navRef.value?.querySelector('[aria-controls="navDrawer"]')?.focus()
    }
  }

  function onWinResize() {
    if (openSub.value) positionFlyout(openSub.value)
  }

  onMounted(() => {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onDocKeydown)
    window.addEventListener('resize', onWinResize)
    window.addEventListener('scroll', onWinResize, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onDocKeydown)
    window.removeEventListener('resize', onWinResize)
    window.removeEventListener('scroll', onWinResize)
    window.clearTimeout(openTimer)
    window.clearTimeout(closeTimer)
    window.clearTimeout(subOpenTimer)
    window.clearTimeout(subCloseTimer)
    document.body.style.overflow = ''
  })

  watch(
    () => route.path,
    () => closeMenus(),
  )

  watch(mobileOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  })

  async function onLogout() {
    closeMenus()
    try {
      await authStore.logout()
      await router.push({ name: 'Login' })
    } catch (err) {
      console.error('Erro no logout', err)
    }
  }

  const adminMenu = [
    {
      type: 'dropdown',
      key: 'avisos',
      label: 'Avisos',
      activeNames: ['NoticesListByUser', 'NoticesList'],
      items: [
        { type: 'link', label: 'Meus Avisos', name: 'NoticesListByUser' },
        { type: 'divider' },
        { type: 'link', label: 'Gerir Avisos', name: 'NoticesList' },
      ],
    },
    { type: 'link', label: 'Ementas', name: 'LegalBriefsList' },
    {
      type: 'dropdown',
      key: 'biblioteca',
      label: 'Biblioteca',
      activeNames: [
        'BooksReqList',
        'MyLoansList',
        'BooksList',
        'BooksCreate',
        'BookEdit',
        'BookDetail',
        'AdminLoansList',
      ],
      items: [
        { type: 'link', label: 'Acervo', name: 'BooksReqList' },
        { type: 'link', label: 'Meus empréstimos', name: 'MyLoansList' },
        { type: 'divider' },
        { type: 'link', label: 'Gerenciar Livros', name: 'BooksList' },
        {
          type: 'link',
          label: 'Gerenciar Empréstimos',
          name: 'AdminLoansList',
        },
      ],
    },
    {
      type: 'dropdown',
      key: 'rh',
      label: 'RH',
      activeNames: [
        'UsersList',
        'UsersCreate',
        'UsersDetail',
        'UsersEdit',
        'VacationMyVacation',
        'VacationRequestsCreate',
        'VacationRequestsList',
        'VacationRequestDetail',
        'VacationAdminRequestsList',
        'VacationAdminRequestDetail',
        'VacationAdminGrantsList',
        'VacationAdminAccrualList',
        'VacationAdminAlerts',
      ],
      items: [
        {
          type: 'submenu',
          key: 'usuarios',
          label: 'Usuários',
          items: [
            { type: 'link', label: 'Listar Usuários', name: 'UsersList' },
            { type: 'link', label: 'Cadastrar Usuário', name: 'UsersCreate' },
          ],
        },
        {
          type: 'submenu',
          key: 'ferias',
          label: 'Férias',
          items: [
            {
              type: 'link',
              label: 'Minhas Férias',
              name: 'VacationMyVacation',
            },
            {
              type: 'link',
              label: 'Nova Solicitação',
              name: 'VacationRequestsCreate',
            },
            {
              type: 'link',
              label: 'Minhas Solicitações',
              name: 'VacationRequestsList',
            },
            { type: 'divider' },
            {
              type: 'link',
              label: 'Gerir Solicitações',
              name: 'VacationAdminRequestsList',
            },
            {
              type: 'link',
              label: 'Gerir Concessões',
              name: 'VacationAdminGrantsList',
            },
            {
              type: 'link',
              label: 'Alertas de Férias',
              name: 'VacationAdminAlerts',
            },
          ],
        },
      ],
    },
  ]

  const userMenu = [
    { type: 'link', label: 'Avisos', name: 'NoticesListByUser' },
    { type: 'link', label: 'Ementas', name: 'LegalBriefsList' },
    {
      type: 'dropdown',
      key: 'biblioteca-user',
      label: 'Biblioteca',
      activeNames: [
        'BooksReqList',
        'MyLoansList',
        'BooksList',
        'BooksCreate',
        'BookEdit',
        'BookDetail',
        'AdminLoansList',
      ],
      items: [
        { type: 'link', label: 'Acervo', name: 'BooksReqList' },
        { type: 'link', label: 'Meus empréstimos', name: 'MyLoansList' },
      ],
    },
    {
      type: 'dropdown',
      key: 'ferias-user',
      label: 'Férias',
      activeNames: [
        'VacationMyVacation',
        'VacationRequestsCreate',
        'VacationRequestsList',
        'VacationRequestDetail',
      ],
      items: [
        { type: 'link', label: 'Minhas Férias', name: 'VacationMyVacation' },
        {
          type: 'link',
          label: 'Nova Solicitação',
          name: 'VacationRequestsCreate',
        },
        {
          type: 'link',
          label: 'Minhas Solicitações',
          name: 'VacationRequestsList',
        },
      ],
    },
  ]

  const accountMenu = [
    { type: 'link', label: 'Meu Perfil', name: 'UserProfile' },
    { type: 'link', label: 'Alterar Senha', name: 'UserChangePassword' },
    { type: 'divider' },
    { type: 'action', label: 'Sair' },
  ]

  const activeMenu = computed(() =>
    authStore.isAdminOrCoord ? adminMenu : userMenu,
  )

  function isActiveMenu(item) {
    if (item.type === 'link') return route.name === item.name
    return (
      Array.isArray(item.activeNames) && item.activeNames.includes(route.name)
    )
  }

  function isActiveSub(sub) {
    return sub.items?.some(
      (leaf) => leaf.type === 'link' && route.name === leaf.name,
    )
  }

  function isCurrent(name) {
    return route.name === name
  }

  function ChevronDown() {
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        fill: 'currentColor',
        class: 'h-3 w-3 shrink-0 transition-transform duration-200',
        'aria-hidden': 'true',
      },
      [
        h('path', {
          d: 'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708',
        }),
      ],
    )
  }

  function ChevronRight() {
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        fill: 'currentColor',
        class: 'h-3 w-3 shrink-0 transition-transform duration-200',
        'aria-hidden': 'true',
      },
      [
        h('path', {
          d: 'M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671',
        }),
      ],
    )
  }
</script>
