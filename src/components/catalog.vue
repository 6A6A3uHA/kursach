<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { data } from '../composables/useLS';
    import { user } from '../composables/useUser';
    import { addToCart, minusToCart } from '../composables/useCart';
    import { computed, reactive, ref } from 'vue';
    import type { Product } from '../composables/types';

    const min = ref(0)
    const max = ref(9999)

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

    const products = computed(() => data.products)
    const listProducts = computed(() => {
        let start_list = filter_price(min.value, max.value)
        if (sort.name == 1) return sortByName(start_list)
        if (sort.name == 2) return otherSortByName(start_list)
        if (sort.price == 1) return sortByPrice(start_list)
        if (sort.price == 2) return otherSortByPrice(start_list)
        return start_list.toSorted((a, b) => a.id - b.id)
    })
    const sort = reactive({
        name: 0,
        price: 0,
    })

    function sortName() {
        if (sort.price != 0) sort.price = 0
        if (sort.name == 0) return sort.name = 1
        if (sort.name == 1) return sort.name = 2
        sort.name = 0
    }

    function sortPrice() {
        if (sort.name != 0) sort.name = 0
        if (sort.price == 0) return sort.price = 1
        if (sort.price == 1) return sort.price = 2
        sort.price = 0
    }

    function filter_price(min = 0, max = 999999) {

        let list_products = JSON.parse(JSON.stringify(Object.values(products.value))) as Product[]
        return list_products.filter((product) => product.price >= min && product.price <= max)
    }

    function sortByName(list: Array<Product>) {
        return list.toSorted((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: 'base' }))
    }

    function otherSortByName(list: Array<Product>) {
        return list.toSorted((a, b) => b.name.localeCompare(a.name, "ru", { sensitivity: 'base' }))
    }

    function sortByPrice(list: Array<Product>) {
        return list.toSorted((a, b) => a.price - b.price)
    }

    function otherSortByPrice(list: Array<Product>) {
        return list.toSorted((a, b) => b.price - a.price)
    }


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
    <div class="filter-sort">
        <div class="box-filter">
            <p>Цена</p>
            <div class="filter">
                <p>От</p>
                <input type="number" min="0" v-model="min">
                <p>-</p>
                <p>до</p>
                <input type="number" max="9999" v-model="max" class="max">
            </div>
        </div>
        <div class="box-sort">
            <button class="sort" @click="sortName()">
                {{
                    sort.name === 1
                        ? "Название &#8595;"
                        : sort.name === 2
                            ? "Название &#8593;"
                            : "Название"
                }}
            </button>
            <button class="sort" @click="sortPrice()">
                {{
                    sort.price === 1
                        ? "Цена &#8595;"
                        : sort.price === 2
                            ? "Цена &#8593;"
                            : "Цена"
                }}
            </button>
        </div>
    </div>
    <div class="grid">
        <template v-for="product in listProducts">
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
</template>
<style lang="css" scoped>
    .filter-sort {
        display: flex;
        flex-flow: row nowrap;
        width: 70dvw;
        padding-left: 15dvw;
        padding-right: 15dvw;
        justify-content: space-around;
        align-items: center;
        gap: 5dvw;
    }

    .box-filter {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
    }

    .filter {
        display: flex;
        flex-flow: row nowrap;
        height: 2dvh;
        overflow: hidden;
        align-items: center;
        justify-content: space-between;
        width: 20dvw;

        @media (pointer: coarse) {
            width: 25dvw;
        }
    }

    .filter>input {
        outline: 0px;
        border: 0px;
        border-bottom: 1px solid black;
        background-color: var(--surface);
        transition: 0.3s ease-in-out;
        width: 5dvw;

        @media (device-width<=786px) {
            width: 6dvw;
        }

        @media (device-width<=425px) {
            width: 7dvw;
        }

        @media (device-width<=320px) {
            width: 4dvw;

            &.max {
                width: 10dvw;
            }
        }

        &:hover {
            background-color: var(--accent);
            border-bottom: 1px solid var(--text)
        }
    }

    .box-sort {
        display: grid;
        width: 45dvw;
        grid-template-columns: 1fr 1fr;
        row-gap: 10dvw;
        align-items: center;
    }

    .sort {
        width: 15dvw;
        color: var(--accent);
        background-color: var(--surface);
        border: 0;
        outline: 0;
        transition: 0.3s ease-in-out;

        &:hover {
            color: var(--bg);
            background-color: var(--accent);
        }
    }


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

        text-decoration: none;
        box-shadow: 1px 1px 3px var(--text);
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

    .card-button:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .card-button:active {
        box-shadow: 1px 1px black;
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
        color: var(--bg);
        background-color: var(--accent);
    }

    .add-to-favorite:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }
</style>
