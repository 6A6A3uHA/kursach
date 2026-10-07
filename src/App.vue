<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router'
  import { getData } from './composables/useLS';
  import { setUserFromActiveSession, user } from './composables/useUser';

  onMounted(() => {
    getData()
    setUserFromActiveSession()
  }
  )

  const route = useRoute()
  const nav_open = ref<boolean>(false)

  watch(route, () => {
    nav_open.value = false
  })

</script>

<template>
  <header>
    <h1>Вкусный вечер</h1>
    <button class="btn-circle" @click="nav_open = !nav_open">{{ nav_open ? ">" : "&equiv;" }}</button>
    <nav :class="{ open: nav_open }">
      <RouterLink class="btn-primary" :to="{ name: 'home' }" :class="{ choose: route.name == 'home' }">
        Каталог
      </RouterLink>
      <RouterLink class="btn-primary" :to="{ name: 'auth' }"
        :class="{ choose: ['reg', 'auth'].includes(route.name as string) }" v-if="user.root < 0">
        Вход
      </RouterLink>
      <RouterLink class="btn-primary" :to="{ name: 'cart' }" :class="{ choose: route.name == 'cart' }">
        Корзина
      </RouterLink>
      <RouterLink class="btn-primary" :to="{ name: 'userOrder' }" :class="{ choose: route.name == 'userOrder' }"
        v-if="user.id != -1">
        Заказы
      </RouterLink>
      <RouterLink class="btn-primary" :to="{ name: 'favorite' }" :class="{ choose: route.name == 'favorite' }"
        v-if="user.id != -1">
        Избранное
      </RouterLink>
      <RouterLink class="btn-primary" :to="{ name: 'users' }"
        :class="{ choose: ['admin', 'users', 'products', 'orders'].includes(route.name as string) }"
        v-if="user.root == 1">
        Админ панель
      </RouterLink>
      <RouterLink class="btn-primary" :to="{ name: 'account', params: { login: user.login } }"
        :class="{ choose: route.name == 'account' }" v-if="user.id != -1">
        Мой профиль
      </RouterLink>
    </nav>
  </header>
  <main>
    <RouterView></RouterView>
  </main>
  <hr>
  <footer>
    © 2026-{{ new Date().getFullYear() }} Вкусный вечер
  </footer>
</template>
<style scoped>
  .btn-circle {
    font-size: var(--font-size-large);
  }
</style>