<script lang="ts" setup>
    import { useRoute } from 'vue-router';

    const route = useRoute()
</script>
<template>
    <hr class="desktop">
    <nav>
        <RouterLink :to="{ name: 'users' }" :class="{ choose: route.name == 'users' }">Пользователи</RouterLink>
        <RouterLink :to="{ name: 'products' }" :class="{ choose: route.name == 'products' }">Товары</RouterLink>
        <RouterLink :to="{ name: 'orders' }" :class="{ choose: route.name == 'orders' }">Заказы</RouterLink>
    </nav>
    <hr>
    <section>
        <RouterView />
    </section>
</template>
<style lang="css" scoped>
    nav {
        height: 6dvh;
        align-items: center;
        padding-right: 10dvw;

        padding-left: 10dvw;
        width: 80dvw;
        display: grid;
        grid-template-columns: repeat(3, 1fr);

        background-color: var(--surface);
    }

    .desktop {
        @media (pointer:fine) {
            display: none;
        }
    }

    nav>a {
        text-decoration: none;
        box-sizing: border-box;
        color: black;
        border: 1px solid black;
        border-radius: 20px;
        justify-self: center;
        padding: 2px 8px 2px 8px;
        line-height: 1;
        background-color: var(--accent);
        color: var(--bg);
    }

    nav>a:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    hr {
        padding: 0;
        margin: 0;
        width: 100dvw;
    }

    section {
        position: relative;
        width: 100dvw;
        overflow: hidden;
        height: 70dvh;
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