<script lang="ts" setup>
    import { useRoute, useRouter } from 'vue-router';
    import { data } from '../composables/useLS';
    import { computed, onMounted, reactive } from 'vue';
    import { user } from '../composables/useUser';
    import { addToCart, minusToCart } from '../composables/useCart';

    const route = useRoute()
    const router = useRouter()
    onMounted(() => {
        const id = Number(route.params.id as string)
        if (data.products[id] == undefined) return router.push({ name: "not_found" })
    })

    const product = computed(() => data.products[Number(route.params.id as string)])
    const cart = data.carts[user.id]
    const users = computed(() => data.users)

    const comments = computed(() => {
        if (product.value.comments !== undefined && product.value.comments.length > 0) {
            return [...product.value.comments].sort((a, b) => b.created_at - a.created_at)
        }
        return []
    })

    function formatDate(date: Date = new Date()): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`
    }

    const comment = reactive({
        id: -1,
        text: "",
        user_id: user.id,
        created_at: 0,
        time: ""
    })
    function send() {
        if (user.id == -1) return router.push({ name: 'auth' })
        let id = 0
        if (product.value.comments[0]) {
            product.value.comments.forEach(value => {
                if (id <= value.id) id = value.id + 1
            })
        }
        if (comment.text.length == 0) return
        comment.id = id
        comment.created_at = Date.now()
        comment.time = formatDate()
        data.products[Number(route.params.id as string)].comments.push({ ...comment })
        Object.assign(comment, {
            id: -1,
            text: "",
            user_id: user.id,
            created_at: 0,
            time: ""
        })
    }
    function delete_comment(id: number) {
        const index = product.value.comments.findIndex((comm) => comm.id === id)
        if (index !== -1) data.products[Number(route.params.id as string)].comments.splice(index, 1)
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
    <section>
        <h2>
            {{ product.name }}
        </h2>
        <div class="form-grid">
            <img src="../assets/image.png" :alt="'фото продукта ' + product.name">
            <div class="name-and-add">
                <div class="ingridients-section">
                    <div class="title">Состав:</div>
                    <div class="ingridients">{{ product.ingridients }}</div>
                </div>
                <div class="desktop">
                    <p class="title">Описание:</p>
                    <p class="description">{{ product.description }}</p>
                </div>
                <div class="desktop grid-button">
                    <div class="product-price">{{ product.price }} руб.</div>
                    <div class="button-container">
                        <button v-if="user.root >= 0 && !cart?.products?.[product.id]" class="btn-primary"
                            @click.prevent="addToCart(product.id)" title="Добавить в корзину">Добавить в
                            корзину</button>
                        <div v-if="user.root >= 0 && cart.products[product.id]" class="control-amount">
                            <button @click.prevent="minusToCart(product.id)" class="left"
                                title="Уменьшить количество">-</button>
                            {{ cart.products[product.id] }}
                            <button @click.prevent="addToCart(product.id)" class="right"
                                title="Увеличить количество">+</button>
                        </div>
                        <button v-if="user.root < 0" class="btn-primary" @click.prevent="router.push({ name: 'auth' })"
                            title="Нужно зарегистрироваться">Добавить в корзину</button>
                    </div>
                    <div class="favorite">
                        <button v-if="user.root >= 0" class="btn-primary" @click.prevent="changeFavorite(product.id)">
                            {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                        </button>
                        <button v-if="user.root < 0" class="btn-primary" @click.prevent="router.push({ name: 'auth' })">
                            {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class="mobile grid-button">
                <div class="product-price">{{ product.price }} руб.</div>
                <div class="button-container">
                    <button v-if="user.root >= 0 && !cart?.products?.[product.id]" class="btn-primary"
                        @click.prevent="addToCart(product.id)" title="Добавить в корзину">Добавить в корзину</button>
                    <div v-if="user.root >= 0 && cart.products[product.id]" class="control-amount">
                        <button @click.prevent="minusToCart(product.id)" class="left"
                            title="Уменьшить количество">-</button>
                        {{ cart.products[product.id] }}
                        <button @click.prevent="addToCart(product.id)" class="right"
                            title="Увеличить количество">+</button>
                    </div>
                    <button v-if="user.root < 0" class="btn-primary" @click.prevent="router.push({ name: 'auth' })"
                        title="Нужно зарегистрироваться">Добавить в корзину</button>
                </div>
                <div class="favorite">
                    <button v-if="user.root >= 0" class="btn-primary" @click.prevent="changeFavorite(product.id)">
                        {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                    </button>
                    <button v-if="user.root < 0" class="btn-primary" @click.prevent="router.push({ name: 'auth' })">
                        {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                    </button>
                </div>
            </div>

            <div class="mobile">
                <p class="title">Описание:</p>
                <p class="description">{{ product.description }}</p>
            </div>
        </div>
    </section>
    <section class="comment">
        <h2>Коментарии</h2>
        <div class="grid-send">
            <input type="text" v-model="comment.text" @submit.prevent="send" class="inp-underline" autocomplete="none">
            <button @click.prevent="send" class="btn-primary">Отправить</button>
        </div>
        <div v-for="comment in comments" v-if="comments" class="comment-row">
            <div class="flex">
                <div class="comment-username">
                    {{ users[comment.user_id]?.firstname }} {{ users[comment.user_id]?.lastname }}
                </div>
                <button v-if="user.root > 0" class="btn-circle" @click="delete_comment(comment.id)">&#128465;</button>
            </div>
            <div class="comment-text">
                {{ comment.text }}
            </div>
            <div class="comment-time">
                {{ comment.time }}
            </div>
        </div>
    </section>
</template>
<style lang="css" scoped>
    section {
        padding-top: 3rem;
    }

    section.comment {
        position: relative;
        width: 100%;
        overflow: hidden;
        padding-top: 3rem;
    }

    img {
        aspect-ratio: 1/1;
        width: 20rem;

        @media (width < 1300px) {
            width: 15rem;
        }

        @media (width < 900px) {
            width: 10rem;
        }
    }

    .name-and-add {
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        gap: 20px;
        height: 100%;
        width: 100%;
    }

    h2 {
        position: absolute;
        top: 0;
        right: 5rem;
        margin: 0;
        padding: 0;
    }

    .grid-button {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        justify-items: center;
        align-items: center;
    }

    .product-price {
        grid-column: 1/3;
        place-self: center;
    }

    .title {
        float: left;
        width: 90px;
        height: 20px;
        margin-right: 5px;
        margin-bottom: 0px;
        shape-outside: margin-box;

        @media (pointer: coarse) {
            height: 18px;
        }
    }

    .ingridients,
    .description {
        width: 100%;
        word-break: break-word;
    }

    .desktop {
        @media (width < 1300px) {
            display: none;
        }
    }

    .mobile {
        padding-top: 2rem;

        @media (width >=1300px) {
            display: none;
        }
    }

    .button-container {
        width: 100%;
        min-height: 1rem;
        display: flex;
        justify-content: center;
    }

    .grid-send {
        display: grid;
        width: 100%;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin-bottom: 30px;
    }

    .comment-row {
        height: 100%;
        display: block;
        position: relative;
        background-color: var(--surface);
        padding: 0.5rem;
        margin: 5px;
        border-radius: 10px;
    }

    .flex {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
    }

    .comment-username {
        border-radius: 20px;
        height: min-content;
        width: fit-content;
        padding: 2px;
        word-break: keep-all;
        background-color: var(--accent);
        color: var(--bg);
    }

    .comment-text {
        padding-left: 5dvw;
        word-break: break-word;
    }

    .comment-time {
        justify-self: end;
    }
</style>