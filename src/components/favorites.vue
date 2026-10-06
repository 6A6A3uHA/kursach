<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { data } from '../composables/useLS';
    import { user } from '../composables/useUser';
    import { addToCart, minusToCart } from '../composables/useCart';
    import { computed } from 'vue';
    import type { Id, Products } from '../composables/types';

    const router = useRouter()
    const cart = computed(() => {
        if (!data.carts[user.id]) {
            data.carts[user.id] = {
                id: user.id,
                products: {}
            }
        }
        return data.carts[user.id]
    })

    const cards = computed(() => {
        const ids: Array<Id> = data.favorites[user.id]
        const result: Products = {}
        Object.values(ids).forEach((value) => {
            result[value] = data.products[value]
        })
        return result
    })

    function existFavorites(id: keyof typeof data.products) {
        if (data.favorites === undefined) return false
        if (data.favorites[user.id] === undefined) return false
        if (data.favorites[user.id].includes(id)) return true
        return false
    }
    function changeFavorite(id: keyof typeof data.products) {
        if (data.favorites !== undefined && data.favorites[user.id] !== undefined && data.favorites[user.id].includes(id)) {
            const index = data.favorites[user.id].findIndex((value) => value === id)
            if (index !== -1) return data.favorites[user.id].splice(index, 1)
        }
        if (data.favorites[user.id] === undefined) {
            data.favorites[user.id] = []
        }
        return data.favorites[user.id].push(id)
    }
</script>
<template>
    <div class="grid" v-if="data.favorites[user.id] != undefined && data.favorites[user.id].length > 0">
        <template v-for="product in cards">
            <RouterLink :to="{ name: 'card', params: { id: String(product.id) } }" class="card"
                title="Переход на страницу товара">
                <div class="img">
                    <img src="../assets/image.png" :alt="'фото продукта ' + product.name">
                </div>
                <div class="text">{{ product.name }}</div>
                <div class="text">{{ `${product.price} руб.` }}</div>
                <button v-if="user.root >= 0 && !cart?.products?.[product.id]" class="card-button"
                    @click.prevent="addToCart(product.id)" title="Добавить в корзину">Добавить в корзину</button>
                <div v-if="user.root >= 0 && cart.products[product.id]" class="edit-amount">
                    <button @click.prevent="minusToCart(product.id)" class="left"
                        title="Уменьшить количество">-</button>
                    {{ cart.products[product.id] }}
                    <button @click.prevent="addToCart(product.id)" class="right" title="Увеличить количество">+</button>
                </div>
                <button v-if="user.root < 0" class="card-button" @click.prevent="router.push({ name: 'auth' })"
                    title="Нужно зарегистрироваться">Добавить в корзину</button>
                <button v-if="user.root >= 0" class="add-to-favorite" @click.prevent="changeFavorite(product.id)">
                    {{ existFavorites(product.id) ? '&#9829;' : '&#9825;' }}
                </button>
                <button v-if="user.root < 0" class="add-to-favorite" @click.prevent="router.push({ name: 'auth' })">
                    {{ existFavorites(product.id) ? '&#9829;' : '&#9825;' }}
                </button>
            </RouterLink>
        </template>
    </div>
    <div class="page-center" v-else>
        <div>Вы ничего не выбрали</div>
        <RouterLink :to="{ name: 'home' }">В каталог</RouterLink>
    </div>
</template>
<style lang="css" scoped>
    .grid {
        display: grid;
        padding-top: 5dvh;
        padding-bottom: 30px;
        padding-left: 10dvw;
        padding-right: 10dvw;
        width: 80dvw;
        grid-template-columns: repeat(4, 1fr);
        row-gap: 5dvh;

        @media (pointer: coarse) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (pointer:fine) {
            grid-auto-rows: 22dvh;
        }
    }

    .card {
        position: relative;
        justify-self: center;
        align-self: center;
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        align-items: center;
        width: 15dvw;
        height: 20dvh;
        border: 1px solid black;
        border-radius: 20px;
        padding: 10px;
        transition: 0.3s ease-in-out;
        overflow: hidden;
        background-color: var(--surface);

        @media (pointer: coarse) {
            width: 30dvw;
            height: 30dvh;
        }

        box-shadow: 1px 1px 3px var(--text);
        text-decoration: none;
    }

    .card:hover {
        cursor: pointer;

        @media (pointer: fine) {
            box-shadow: 1px 1px 20px var(--text);
            width: 17dvw;
            height: 22dvh;
        }
    }

    .img {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 15dvw;
        max-height: 60%;
        width: 15dvw;
        max-width: 60%;

        @media (pointer: coarse) {
            height: 30dvw;
            width: 30dvw;
        }
    }

    img {
        object-fit: cover;
        aspect-ratio: 1/1;
        height: 100%;
    }

    .text {
        font-size: 20px;

        @media (pointer:coarse) {
            font-size: 14px;
        }
    }

    .card-button {
        text-decoration: none;
        box-sizing: border-box;
        color: var(--bg);
        border: 1px solid black;
        border-radius: 20px;
        justify-self: center;
        padding: 2px 8px 2px 8px;
        line-height: 1;
        cursor: pointer;
        transition: 0.1s ease-in-out;
        background-color: var(--accent);
    }

    .card-button:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .edit-amount {
        display: grid;
        grid-template-columns: 15px 20px 15px;
        gap: 5px;
        justify-items: center;
        height: 20px;
        border: 1px solid black;
        border-radius: 10px;
        overflow: hidden;
    }

    .edit-amount>button {
        text-decoration: none;
        width: 15px;
        height: 20px;
        background-color: var(--surface);
        border: 0px solid black;
    }

    .left {
        border-right: 1px solid black !important;
        text-align: right;
        padding-right: 4px;
    }

    .right {
        border-left: 1px solid black !important;
        padding-left: 3px;
        text-align: left;
    }

    .add-to-favorite {
        position: absolute;
        top: 1%;
        right: 1%;
        aspect-ratio: 1/1;
        text-decoration: none;
        box-sizing: border-box;
        border: 1px solid black;
        border-radius: 20px;
        justify-self: center;
        padding: 2px 8px 2px 8px;
        line-height: 1;
        cursor: pointer;
        transition: 0.1s ease-in-out;
        background-color: var(--accent);
        color: var(--bg);
    }

    .add-to-favorite:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .page-center {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        height: 60dvh;
        gap: 3dvh;
    }

    .page-center>a {
        border: 1px solid black;
        border-radius: 20px;
        padding: 20px;
        text-align: center;
        text-decoration: none;
        background-color: var(--accent);
        color: var(--bg);
    }

    .page-center>a:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }
</style>