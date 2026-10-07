<script lang="ts" setup>
    import { useRoute } from 'vue-router';

    const route = useRoute()
</script>
<template>
    <nav>
        <RouterLink class="btn-primary" :to="{ name: 'users' }" :class="{ choose: route.name == 'users' }">Пользователи
        </RouterLink>
        <RouterLink class="btn-primary" :to="{ name: 'products' }" :class="{ choose: route.name == 'products' }">Товары
        </RouterLink>
        <RouterLink class="btn-primary" :to="{ name: 'orders' }" :class="{ choose: route.name == 'orders' }">Заказы
        </RouterLink>
    </nav>
    <section>
        <RouterView />
    </section>
</template>
<style lang="css" scoped>
    nav {
        height: 3rem;
        align-items: center;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);
    }

    section {
        position: relative;
        width: 100%;
        overflow: hidden;
        height: 60vh;
        box-sizing: border-box;
        border: 2px solid black;
        outline: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
    }

    .choose {
        color: var(--text);
    }
</style>