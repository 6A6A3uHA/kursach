<script lang="ts" setup>
    import { useRoute, useRouter } from 'vue-router';
    import { data } from '../composables/useLS';
    import { computed, onMounted, reactive, ref } from 'vue';
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

    const now = ref("")

    function formatDate(date: Date = new Date()): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`
    }

    setInterval(() => {
        now.value = formatDate()
    }, 1000);

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
        <h1>
            {{ product.name }}
        </h1>
        <div class="grid">
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
                    <div class="button-container">
                        <button v-if="user.root >= 0 && !cart?.products?.[product.id]" class="card-button"
                            @click.prevent="addToCart(product.id)" title="Добавить в корзину">Добавить в
                            корзину</button>
                        <div v-if="user.root >= 0 && cart.products[product.id]" class="edit-amount">
                            <button @click.prevent="minusToCart(product.id)" class="left"
                                title="Уменьшить количество">-</button>
                            {{ cart.products[product.id] }}
                            <button @click.prevent="addToCart(product.id)" class="right"
                                title="Увеличить количество">+</button>
                        </div>
                        <button v-if="user.root < 0" class="card-button" @click.prevent="router.push({ name: 'auth' })"
                            title="Нужно зарегистрироваться">Добавить в корзину</button>
                    </div>
                    <div class="favorite">
                        <button v-if="user.root >= 0" class="card-button" @click.prevent="changeFavorite(product.id)">
                            {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                        </button>
                        <button v-if="user.root < 0" class="card-button" @click.prevent="router.push({ name: 'auth' })">
                            {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class="mobile grid-button">
                <div class="button-container">
                    <button v-if="user.root >= 0 && !cart?.products?.[product.id]" class="card-button"
                        @click.prevent="addToCart(product.id)" title="Добавить в корзину">Добавить в корзину</button>
                    <div v-if="user.root >= 0 && cart.products[product.id]" class="edit-amount">
                        <button @click.prevent="minusToCart(product.id)" class="left"
                            title="Уменьшить количество">-</button>
                        {{ cart.products[product.id] }}
                        <button @click.prevent="addToCart(product.id)" class="right"
                            title="Увеличить количество">+</button>
                    </div>
                    <button v-if="user.root < 0" class="card-button" @click.prevent="router.push({ name: 'auth' })"
                        title="Нужно зарегистрироваться">Добавить в корзину</button>
                </div>
                <div class="favorite">
                    <button v-if="user.root >= 0" class="card-button" @click.prevent="changeFavorite(product.id)">
                        {{ existFavorites(product.id) ? 'Убрать из избранного' : 'В избранное' }}
                    </button>
                    <button v-if="user.root < 0" class="card-button" @click.prevent="router.push({ name: 'auth' })">
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
    <section>
        <h2>Коментарии</h2>
        <div class="grid-send">
            <input type="text" v-model="comment.text" @submit.prevent="send">
            <button @click.prevent="send" class="send">Отправить</button>
        </div>
        <div v-for="comment in comments" v-if="comments">
            <div class="flex">
                <div class="comment-username">
                    {{ users[comment.user_id]?.firstname }} {{ users[comment.user_id]?.lastname }}
                </div>
                <button v-if="user.root > 0" class="send" @click="delete_comment(comment.id)">&#128465</button>
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
        padding: 40px;
        position: relative;
        padding-left: 10dvw;
        padding-right: 10dvw;
        width: 80dvw;
        overflow: hidden;

        @media (pointer: fine) {
            padding-top: 3dvh;
        }
    }

    .grid {
        padding-top: 4dvh;
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 20px;
    }

    img {
        aspect-ratio: 1/1;
        width: 30dvh;

        @media (orientation: portrait) {
            width: 30dvw;
        }
    }

    .name-and-add {
        display: flex;
        /* position: relative; */
        flex-flow: column nowrap;
        align-items: start;
        gap: 20px;
        height: 100%;
        width: 100%;
    }

    h1 {
        position: absolute;
        top: 2dvh;
        right: 10dvw;
        margin: 0;
        padding: 0;
    }

    .grid-button {
        width: 30dvw;
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-items: center;
        align-items: center;

        @media (pointer: coarse) {
            width: 80dvw;
        }

    }

    .button-container {
        align-self: center;
        margin-top: auto;
    }

    .card-button {
        text-decoration: none;
        box-sizing: border-box;
        color: black;
        border: 1px solid black;
        border-radius: 20px;
        justify-self: center;
        padding: 2px 8px 2px 8px;
        line-height: 1;
        font-size: 20px;
        cursor: pointer;
        transition: 0.1s ease-in-out;

        background-color: var(--accent);
        color: var(--bg);

        @media (pointer: coarse) {
            font-size: 16px;
        }
    }

    .card-button:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .card-button:active {
        box-shadow: 1px 1px 5px black;
    }

    .edit-amount {
        display: grid;
        grid-template-columns: 30px 40px 30px;
        gap: 5px;
        justify-items: center;
        font-size: 24px;
        height: 40px;
        border: 1px solid black;
        border-radius: 20px;
        overflow: hidden;
        align-items: center;
    }

    .edit-amount>button {
        text-decoration: none;
        width: 30px;
        height: 40px;
        background-color: var(--surface);
        color: var(--text);
        border: 0px solid black;
        font-size: 24px;
        cursor: pointer;
    }

    .left {
        border-right: 1px solid black !important;
        text-align: right;
        padding-right: 10px;
    }

    .right {
        border-left: 1px solid black !important;
        padding-left: 8px;
        text-align: left;
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

    .ingridients-section {
        width: 100%;

        @media (pointer: coarse) {
            height: 100%;
        }
    }

    .ingridients,
    .description {
        width: 100%;
        word-break: break-word;
    }

    .other-grid-column {
        display: block;
        width: 100%;
    }

    p {
        margin: 0;
        padding: 0;
    }

    .desktop {
        @media (pointer: coarse) {
            display: none;
        }
    }

    .mobile {
        padding-top: 2dvh;

        @media (pointer: fine) {
            display: none;
        }
    }

    .grid-send {
        display: grid;
        grid-template-columns: 3fr 1fr;
        margin-bottom: 30px;
    }

    input {
        outline: 0;
        border: 0;
        opacity: 1;
        border-bottom: 1px solid black;
        height: 16px;
        background-color: rgba(0, 0, 0, 0);
        transition: 0.3s ease-in-out;

        @media (pointer: coarse) {
            height: 10px;
        }

        align-self: center;
    }

    input:hover,
    input:active {
        border-bottom: 1px solid var(--text);
    }

    .flex {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
    }

    .send {
        text-decoration: none;
        box-sizing: border-box;
        color: black;
        border: 1px solid black;
        border-radius: 20px;
        justify-self: center;
        padding: 2px 8px 2px 8px;
        line-height: 1;
        font-size: 20px;
        cursor: pointer;
        transition: 0.1s ease-in-out;
        background-color: var(--accent);
        color: var(--bg);
    }

    .send:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .comment-username {
        border: 1px solid black;
        border-radius: 20px;
        height: min-content;
        width: fit-content;
        padding: 2px;
        word-break: keep-all;
    }

    .comment-text {
        padding-left: 5dvw;
    }

    .comment-time {
        justify-self: end;
    }
</style>