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
                <input type="number" min="0" v-model="min" class="inp-underline" autocomplete="none" id="min">
                <p>- до</p>
                <input type="number" max="9999" v-model="max" class="inp-underline" autocomplete="none" id="max">
            </div>
        </div>
        <div class="box-sort">
            <p>Сортировка</p>
            <div class="sort">
                <button @click="sortName()">
                    {{
                        sort.name === 1
                            ? "Название &#8595;"
                            : sort.name === 2
                                ? "Название &#8593;"
                                : "Название"
                    }}
                </button>
                <button @click="sortPrice()">
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
    </div>
    <div class="product-grid">
        <template v-for="product in listProducts">
            <RouterLink :to="{ name: 'card', params: { id: String(product.id) } }" class="product-card"
                title="Переход на страницу товара">
                <div class="img">
                    <img src="../assets/image.png" :alt="'фото продукта ' + product.name">
                </div>
                <div class="text">{{ product.name }}</div>
                <div class="text">{{ `${product.price} руб.` }}</div>
                <button v-if="user.root >= 0 && !cart?.products?.[product.id]" class="btn-primary"
                    @click.prevent="addToCart(product.id)" title="Добавить в корзину">Добавить в корзину</button>
                <div v-if="user.root >= 0 && cart.products[product.id]" class="control-amount">
                    <button @click.prevent="minusToCart(product.id)" class="left"
                        title="Уменьшить количество">-</button>
                    {{ cart.products[product.id] }}
                    <button @click.prevent="addToCart(product.id)" class="right" title="Увеличить количество">+</button>
                </div>
                <button v-if="user.root < 0" class="btn-primary" @click.prevent="router.push({ name: 'auth' })"
                    title="Нужно зарегистрироваться">Добавить в корзину</button>
                <button v-if="user.root >= 0" class="btn-circle" @click.prevent="changeFavorite(product.id)">
                    {{ existFavorites(product.id) ? '&#9829;' : '&#9825;' }}
                </button>
                <button v-if="user.root < 0" class="btn-circle" @click.prevent="router.push({ name: 'auth' })">
                    {{ existFavorites(product.id) ? '&#9829;' : '&#9825;' }}
                </button>
            </RouterLink>
        </template>
    </div>
</template>
<style lang="css" scoped>
    .filter-sort {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: 3fr 4fr;

        @media (pointer: coarse) {
            grid-template-columns: 1fr;
        }

        @media (width < 900px) {
            grid-template-columns: 1fr;
        }

        justify-content: space-around;
        align-items: center;
        gap: 5dvw;
        padding-bottom: 3rem;
        font-size: var(--font-size-large);
    }

    .box-filter {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        width: 100%;
    }

    .filter {
        display: grid;
        grid-template-columns: repeat(2, auto 1fr);
        overflow: hidden;
        align-items: center;
        width: 100%;
    }

    .box-sort {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        width: 100%;
    }

    .sort {
        width: 100%;
        display: grid;
        column-gap: var(--space-3);
        grid-template-columns: repeat(2, 1fr);
        justify-items: center;

        button {

            padding: 2px 8px;
            width: 100%;
            color: var(--accent);
            background-color: var(--surface);
            border: 0;
            outline: 0;
            transition: 0.3s ease-in-out;
            font-size: var(--font-size-large);

            &:hover {
                color: var(--bg);
                background-color: var(--accent);
            }
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
        border-radius: 10px;
    }

    .btn-primary {
        font-style: italic;
    }
</style>
