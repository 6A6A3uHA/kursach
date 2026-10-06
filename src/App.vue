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
    <nav class="pc">
      <div class="logo">Вкусный вечер</div>
      <RouterLink :to="{ name: 'home' }" :class="{ choose: route.name == 'home' }">Каталог</RouterLink>
      <RouterLink :to="{ name: 'auth' }" :class="{ choose: ['reg', 'auth'].includes(route.name as string) }"
        v-if="user.root < 0">Вход</RouterLink>
      <RouterLink :to="{ name: 'cart' }" :class="{ choose: route.name == 'cart' }">Корзина</RouterLink>
      <RouterLink :to="{ name: 'userOrder' }" :class="{ choose: route.name == 'userOrder' }" v-if="user.id != -1">Заказы
      </RouterLink>
      <RouterLink :to="{ name: 'favorite' }" :class="{ choose: route.name == 'favorite' }" v-if="user.id != -1">
        Избранное
      </RouterLink>
      <RouterLink :to="{ name: 'users' }"
        :class="{ choose: ['admin', 'users', 'products', 'orders'].includes(route.name as string) }"
        v-if="user.root == 1">
        Админ панель</RouterLink>
      <RouterLink :to="{ name: 'account', params: { login: user.login } }" :class="{ choose: route.name == 'account' }"
        v-if="user.id != -1">Мой профиль</RouterLink>
    </nav>
    <div class="mobile">
      <div class="logo">Вкусный вечер</div>
      <div class="none"></div>
      <button class="nav_open" @click="nav_open = !nav_open">{{ nav_open ? ">" : "&equiv;" }}</button>
    </div>
    <hr class="hr">
  </header>
  <nav class="mobile-nav" :class="nav_open ? 'open' : ''">
    <div class="none2"></div>
    <RouterLink :to="{ name: 'home' }" :class="{ choose: route.name == 'home' }">Каталог</RouterLink>
    <RouterLink :to="{ name: 'auth' }" :class="{ choose: ['reg', 'auth'].includes(route.name as string) }"
      v-if="user.root < 0">
      Вход
    </RouterLink>
    <RouterLink :to="{ name: 'cart' }" :class="{ choose: route.name == 'cart' }">Корзина</RouterLink>
    <RouterLink :to="{ name: 'favorite' }" :class="{ choose: route.name == 'favorite' }" v-if="user.id != -1">Избранное
    </RouterLink>
    <RouterLink :to="{ name: 'users' }"
      :class="{ choose: ['admin', 'users', 'products', 'orders'].includes(route.name as string) }"
      v-if="user.root == 1">
      Админ панель</RouterLink>
    <RouterLink :to="{ name: 'account', params: { login: user.login } }" :class="{ choose: route.name == 'account' }"
      v-if="user.id != -1">Мой профиль</RouterLink>
    <div class="none2"></div>
  </nav>
  <main>
    <RouterView></RouterView>
  </main>
  <hr>
  <footer>
    © 2026-2026 Вкусный вечер
  </footer>
</template>
<style lang="css" scoped>
  header {
    display: flex;
    position: fixed;
    flex-flow: column nowrap;
    width: 100dvw;
    height: 15dvh;
    z-index: 100;
    background-color: var(--bg);

    @media (pointer: fine) {
      background-color: var(--surface);
    }
  }

  .pc {
    display: none;
    flex-flow: row nowrap;
    justify-content: space-evenly;
    align-items: center;
    gap: 40px;
    height: 15dvh;
    width: 100dvw;

    @media(pointer: fine) {
      display: flex;
    }
  }

  .mobile {
    display: none;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    height: 15dvh;
    width: 80dvw;
    padding-left: 10dvw;
    padding-right: 10dvw;

    @media (pointer: coarse) {
      display: flex;
    }
  }

  .logo {
    width: 25dvw;
    display: flex;
    flex-flow: row nowrap;
    height: 100%;
    justify-content: center;
    align-items: center;
    text-wrap: nowrap;
    font-size: 1.5rem;
  }

  .none {
    width: 20dvw;
  }

  .none2 {
    height: 30dvh;
  }

  .nav_open {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 30px;
    width: 5vh;
    min-height: 30px;
    height: 5vh;
    font-size: 30px;
    border: 1px solid black;
    border-radius: 100%;
    outline: none;
    background-color: var(--accent);
  }

  .mobile-nav {
    display: none;
    position: fixed;
    flex-flow: column nowrap;
    width: 100vw;
    height: 100vh;
    justify-content: space-evenly;
    background-color: var(--surface);
    transform: translateX(180dvw);
    transition: 0.3s ease-out;
    z-index: 99;

    @media(pointer: coarse) {
      display: flex;
    }
  }

  .open {
    transform: translateX(0);
  }

  header>.pc>a,
  nav>a {
    border: 1px solid black;
    border-radius: 20px;
    padding: 5px;
    text-align: center;
    background-color: var(--accent)
  }

  header>.pc>a:hover,
  nav>a:hover {
    @media (pointer: fine) {
      box-shadow: 1px 1px 5px black;
    }
  }

  .choose {
    color: var(--bg);
  }

  main {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    min-height: 70dvh;
    padding-top: 15dvh;
    width: 100dvw;
  }

  hr {
    margin: 0;
    padding: 0;
  }

  .hr {
    @media (pointer: coarse) {
      display: none;
    }
  }

  footer {
    display: flex;
    flex-flow: column nowrap;
    width: 100vw;
    height: 15dvh;
    justify-content: center;
    align-items: center;
    padding-bottom: 40px;
    background-color: var(--surface);
  }

  a {
    text-decoration: none;
  }

  button {
    background-color: rgba(0, 0, 0, 0);
  }
</style>