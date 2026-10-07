<script lang="ts" setup>
    import { computed, onMounted, reactive, ref } from 'vue';
    import { addToCart, deleteToCart, minusToCart } from '../composables/useCart';
    import { user as global_user } from '../composables/useUser';
    import { data } from '../composables/useLS';
    import { useRouter } from 'vue-router';
    import type { NewOrder } from '../composables/types';
    import { addOrder } from '../composables/useOrders';

    onMounted(() => {
        Object.assign(user, global_user)
    })

    const router = useRouter()
    const cart = computed(() => {
        if (!data.carts[global_user.id]) {
            data.carts[global_user.id] = {
                id: global_user.id,
                products: {}
            }
        }
        return data.carts[global_user.id]
    })
    const products = computed(() => data.products)
    const guest_user = { email: "", phone: "", address: "" }
    const user = reactive({ ...guest_user })

    const pay_type = ref<'' | NewOrder['pay_type']>('')

    const total_price = computed(() => {
        if (!cart.value || !cart.value.products) return 0

        const productsId = Object.keys(cart.value.products)
        let total = 0

        productsId.forEach((id) => {
            total += products.value[Number(id)].price * cart.value.products[Number(id)]
        })
        return total
    })

    const modal = ref(false)
    const modal_type = ref(false)
    const edit = reactive({
        open: false
    })

    const output = reactive({
        email: "",
        phone: "",
        address: ""
    })
    const flag_open = reactive({
        email: false,
        phone: false,
        address: false
    })

    function copy_user() {
        user.address = global_user.address
        user.email = global_user.email
        user.phone = global_user.phone
    }

    function open_edit() {
        if (modal.value == false) {
            copy_user()
        }
        modal.value = true
    }

    function open_pay_type() {
        modal_type.value = true
    }

    function open(key: keyof typeof output, value: string) {
        flag_open[key] = true
        output[key] = value
    }

    function close(key: keyof typeof output) {
        flag_open[key] = false
    }

    function buy() {
        Object.keys(output).forEach((key) => close(key as keyof typeof output))
        let pass = true
        if (!/\+[0-9]{11}/.test(user.phone) && !/\+[0-9]{11}/.test(global_user.phone)) {

            open('phone', "Номер пишется в формате +12345678901, обязательно начинается с + и содержит 11 цифр.")
            pass = false
        }

        if (!/[a-zA-Z][a-zA-Z0-9\-\_]{0,}\@(mail\.ru|gmail\.com)/.test(user.email) && !/[a-zA-Z][a-zA-Z0-9\-\_]{0,}\@(mail\.ru|gmail\.com)/.test(global_user.email)) {

            open('email', "Первый символ обязательно латиница. Допустимые символы: латиница, цифры, '-', '_'. Почта обязательно заканчивается на @mail.ru или @gmail.com")
            pass = false
        }
        if (!/[А-Яа-яёЁ\ \.\-\,0-9]{3,}/.test(user.address) && !/[А-Яа-яёЁ\ \.\-\,0-9]{3,}/.test(global_user.address)) {
            open('address', "Для адреса допускается кириллица и спецсимволы: пробел, '.', '-', ','.")
            pass = false
        }
        if (!pass) return open_edit()
        if (edit.open) {
            Object.assign(data.users[global_user.id], user)
            Object.assign(global_user, data.users[global_user.id])
            edit.open = false
        }
        if (pay_type.value == '') {
            return open_pay_type()
        }
        else {
            edit.open = false
        }

        addOrder({
            user_id: global_user.id,
            products: cart.value.products,
            pay_type: pay_type.value,
            total_price: total_price.value,
            address: global_user.address
        })
        data.carts[global_user.id] = { id: global_user.id, products: {} }
        router.push({ name: 'userOrder' })
    }
</script>
<template>
    <div v-if="total_price !== 0 && cart.products !== undefined">
        <RouterLink :to="{ name: 'card', params: { id: id } }" class="product-row" v-for="number, id in cart.products"
            :title="'Перейти к товару ' + products[Number(id)].name">
            <div class="img">
                <img src="../assets/image.png" alt="">
            </div>
            <div class="center text">
                {{ products[Number(id)].name }}
            </div>
            <div class="button-container">
                <div class="control-amount">
                    <button @click.prevent="minusToCart(Number(id))" class="left"
                        title="Уменьшить количество">-</button>
                    {{ number }}
                    <button @click.prevent="addToCart(Number(id))" class="right" title="Увеличить количество">+</button>
                </div>
            </div>
            <button @click.prevent="deleteToCart(Number(id))" class="btn-circle del">&#128465</button>
            <div class="center">
                {{ products[Number(id)].price + ' руб' }}
            </div>
        </RouterLink>
    </div>
    <div class="product-row no-box" v-if="total_price != 0">
        <div class="center">Итого:</div>
        <div class="end center">{{ total_price + ' руб' }}</div>
        <button @click="buy" class="btn-primary end center">Заказать</button>
    </div>

    <Transition name="modal-animation" @after-enter="edit.open = true">
        <div class="modal" v-if="modal">
            <Transition name="animation-edit"
                @after-leave="Object.keys(output).forEach((key) => close(key as keyof typeof output)); modal = false">
                <div class="form-grid" v-if="edit.open">
                    <div class="warning">При неправильно заполненных данных вы можете не получить свой заказ</div>
                    <div class="btn-circle" @click="edit.open = false">&#10006;</div>
                    <Transition name="label-animation">
                        <label for="email" v-if="flag_open.email">{{ output.email }}</label>
                    </Transition>
                    <p>Email:</p>
                    <input type="text" name="email" v-model="user.email" autocomplete="email" class="inp-underline">
                    <Transition name="label-animation">
                        <label for="phone" v-if="flag_open.phone">{{ output.phone }}</label>
                    </Transition>
                    <p>Телефон:</p>
                    <input type="text" name="phone" v-model="user.phone" autocomplete="tel" class="inp-underline">
                    <Transition name="label-animation">
                        <label for="address" v-if="flag_open.address">{{ output.address }}</label>
                    </Transition>
                    <p>Адрес:</p>
                    <input type="text" name="address" v-model="user.address" autocomplete="street-address"
                        class="inp-underline">
                    <button class="btn-primary grid-center" @click="buy">Сохранить</button>
                </div>
            </Transition>
        </div>
    </Transition>
    <Transition name="modal-animation" @after-enter="edit.open = true">
        <div class="modal" v-if="modal_type">
            <Transition name="animation-edit" @after-leave="modal_type = false">
                <div class="form-grid" v-if="edit.open">
                    <div class="btn-circle" @click="edit.open = false">&#10006;</div>
                    <div class="edit-pay-type">
                        <h3 class="title">Выберите тип оплаты</h3>
                        <button class="btn-primary" @click="pay_type = 'online'; buy()">Онлайн</button>
                        <button class="btn-primary" @click="pay_type = 'offline'; buy()">При получении</button>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>
    <div class="empty" v-if="total_price == 0">
        <div>Вы ничего не выбрали</div>
        <RouterLink :to="{ name: 'home' }">В каталог</RouterLink>
    </div>
</template>
<style lang="css" scoped>

    .product-row {
        display: grid;
        margin: 0 5px;
        grid-template-columns: 1fr 3fr 1fr 1fr 1fr;
        grid-auto-rows: 3rem;
        border: 1px solid var(--text);
        border-radius: 20px;
        overflow: hidden;
        align-content: center;
        justify-items: center;
        margin-bottom: 1rem;
        background-color: var(--surface);

        &:not(.no-box)&:hover {
            box-shadow: 1px 1px 5px var(--text);
        }
    }

    .img {
        justify-self: start;
    }

    img {
        aspect-ratio: 1/1;
        height: 100%;
    }

    .button-container {
        align-content: center;
        height: 100%;
    }

    .del {
        position: static;
        align-self: center;
        justify-self: center;
    }

    .end {
        grid-column: 5/6;
    }

    .text {
        word-break: keep-all;
    }

    .center {
        align-self: center;
    }

    .no-box {
        border: 0;
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
        color: #000000;
        background-color: var(--accent);
        color: var(--bg);
    }

    .page-center>a:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .modal {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(88, 88, 88, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    .warning {
        grid-column: 1/3;
    }

    .form-grid {
        position: relative;
        width: 80%;
        height: 80%;
        overflow-y: scroll;
        outline: 2px dashed black;
        border-radius: 20px;
        padding: 20px;
        background-color: var(--bg);

        transition: transform 0.1s ease-in-out,
            opacity 0.2s ease-in-out;
    }

    .grid-center {
        grid-column: 1/3;
        justify-self: center;
    }

    .edit-pay-type {
        grid-column: 1/3;
        place-self: center;
        width: 80%;
        height: 60%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        place-items: center;

        @media (width < 1300px) {
            height: 100%;
            grid-template-columns: 1fr !important;
            grid-template-rows: repeat(3, 1fr) !important;
        }
    }

    .label-animation-enter-from,
    .label-animation-leave-to {
        max-height: 0px;
        opacity: 0;
    }

    .label-animation-enter-to,
    .label-animation-leave-from {
        max-height: 50px;
        opacity: 1;
    }

    .modal-animation-enter-from,
    .modal-animation-leave-to {
        opacity: 0;
    }

    .modal-animation-enter-to,
    .modal-animation-leave-from {
        opacity: 1;
    }

    .animation-edit-enter-from {
        transform: translateY(-70px);
        opacity: 0;
    }

    .animation-edit-leave-to {
        transform: translateY(70px);
        opacity: 0;
    }

    .animation-edit-enter-to,
    .animation-edit-leave-from {
        opacity: 1;
    }

    .title {
        place-self: center;

        @media (width >=1300px) {
            grid-column: 1/3;
        }
    }
</style>
