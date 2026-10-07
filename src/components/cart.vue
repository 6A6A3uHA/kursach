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
    <div class="padding-top"></div>
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
                <div class="edit-amount">
                    <button @click.prevent="minusToCart(Number(id))" class="left"
                        title="Уменьшить количество">-</button>
                    {{ number }}
                    <button @click.prevent="addToCart(Number(id))" class="right" title="Увеличить количество">+</button>
                </div>
            </div>
            <button @click.prevent="deleteToCart(Number(id))" class="del">&#128465</button>
            <div class="center">
                {{ products[Number(id)].price + ' руб' }}
            </div>
        </RouterLink>
    </div>
    <div class="product-row no-box" v-if="total_price != 0">
        <div class="center">Итого:</div>
        <div class="end center">{{ total_price + ' руб' }}</div>
    </div>
    <div class="product-row no-box" v-if="total_price != 0">
        <button @click="buy" class="btn end center">Заказать</button>
    </div>
    <div class="page-center" v-if="total_price == 0">
        <div>Вы ничего не выбрали</div>
        <RouterLink :to="{ name: 'home' }">В каталог</RouterLink>
    </div>
    <Transition name="modal-animation" @after-enter="edit.open = true">
        <div class="modal" v-if="modal">
            <Transition name="animation-edit"
                @after-leave="Object.keys(output).forEach((key) => close(key as keyof typeof output)); modal = false">
                <div class="edit" v-if="edit.open">
                    <div class="warning">При неправильно заполненных данных вы можете не получить свой заказ</div>
                    <div class="btn-icon close" @click="edit.open = false">&#10006;</div>
                    <Transition name="label-animation">
                        <label for="email" v-if="flag_open.email">{{ output.email }}</label>
                    </Transition>
                    <p>Email:</p>
                    <input type="text" name="email" v-model="user.email" autocomplete="email">
                    <Transition name="label-animation">
                        <label for="phone" v-if="flag_open.phone">{{ output.phone }}</label>
                    </Transition>
                    <p>Телефон:</p>
                    <input type="text" name="phone" v-model="user.phone" autocomplete="tel">
                    <Transition name="label-animation">
                        <label for="address" v-if="flag_open.address">{{ output.address }}</label>
                    </Transition>
                    <p>Адрес:</p>
                    <input type="text" name="address" v-model="user.address" autocomplete="street-address">
                    <button class="save" @click="buy">Сохранить</button>
                </div>
            </Transition>
        </div>
    </Transition>
    <Transition name="modal-animation" @after-enter="edit.open = true">
        <div class="modal" v-if="modal_type">
            <Transition name="animation-edit" @after-leave="modal_type = false">
                <div class="edit edit-pay-type" v-if="edit.open">
                    <div class="btn-icon close" @click="edit.open = false">&#10006;</div>
                    <h3 class="title">Выберите тип оплаты</h3>
                    <button class="btn edit-btn" @click="pay_type = 'online'; buy()">Онлайн</button>
                    <button class="btn edit-btn" @click="pay_type = 'offline'; buy()">При получении</button>
                </div>
            </Transition>
        </div>
    </Transition>
</template>
<style lang="css" scoped>
    .padding-top {
        padding-top: 5dvh;
    }

    .product-row {
        margin-left: 5dvw;
        margin-right: 5dvw;
        display: grid;
        grid-template-columns: 1fr 3fr 1fr 1fr 1fr;
        grid-auto-rows: 5dvh;
        border: 1px solid black;
        border-radius: 20px;
        overflow: hidden;
        align-content: center;
        justify-items: center;
        margin-bottom: 1dvh;
        color: black;
        text-decoration: none;

        @media (pointer: coarse) {
            font-size: 16px;
        }
    }

    .img {
        justify-self: start;
    }

    img {
        aspect-ratio: 1/1;
        height: 5dvh;
    }

    .button-container {
        align-self: center;
        margin-top: auto;
    }

    .edit-amount {
        display: grid;
        grid-template-columns: 30px 40px 30px;
        gap: 5px;
        justify-items: center;
        font-size: 24px;
        height: 5dvh;
        border: 1px solid black;
        border-radius: 20px;
        overflow: hidden;
        align-items: center;

        @media (pointer: coarse) {
            font-size: 20px;
        }
    }

    .edit-amount>button {
        text-decoration: none;
        width: 30px;
        height: 4.7dvh;
        background-color: var(--surface);
        border: 0px solid black;
        font-size: 24px;
        cursor: pointer;
        align-content: center;

        @media (pointer: coarse) {
            font-size: 20px;
        }
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

    .del {
        text-decoration: none;
        box-sizing: border-box;
        border: 1px solid black;
        border-radius: 20px;
        justify-self: center;
        padding: 2px 8px 2px 8px;
        line-height: 1;
        font-size: 20px;
        background-color: var(--surface);
        cursor: pointer;

        @media (pointer: coarse) {
            font-size: 16px;
        }
    }

    .del {
        height: 5dvh;
        width: 5dvh;
        align-self: center;
    }

    .end {
        grid-column: 5/6;
    }

    .text {
        word-break: keep-all;
    }

    .center {
        align-self: center;

        @media (pointer: coarse) {
            font-size: 16px;
        }
    }

    .no-box {
        border: 0;
    }

    .btn {
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

    .btn:hover {
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
        top: 15dvh;
        width: 100dvw;
        height: 70dvh;
        background-color: rgba(88, 88, 88, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    .edit {
        position: relative;
        width: 80dvw;
        height: 60dvh;
        display: grid;
        grid-template-columns: 1fr 3fr;
        row-gap: 10px;
        outline: 2px dashed black;
        border-radius: 20px;
        padding: 20px;
        background-color: var(--surface);

        transition: transform 0.1s ease-in-out,
            opacity 0.2s ease-in-out;

        @media (pointer: coarse) {
            font-size: 16px;
        }
    }

    .edit-pay-type {
        display: grid;
        grid-template-columns: 1fr 1fr !important;
        grid-template-rows: 1fr 1fr !important;

        @media (pointer: coarse) {
            grid-template-columns: 1fr !important;
            grid-template-rows: repeat(3, 1fr) !important;
        }
    }

    label {
        grid-column: 1/3;
        color: rgb(151, 22, 22);
        opacity: 1;
        max-height: 100px;
        overflow: hidden;
        transition: 0.3s ease-in-out;

        @media (prefers-color-scheme: dark) {
            color: rgb(94, 0, 0);
        }

        @media (pointer: coarse) {
            font-size: 16px;
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

    .edit>p {
        height: 20px;
        padding: 0;
        margin: 0;
        line-height: 1;

        @media (pointer: coarse) {
            font-size: 16px;
        }
    }

    input {
        height: 20px;
        outline: 0;
        border: 0;
        border-bottom: 1px solid black;
        background-color: rgba(0, 0, 0, 0);
        line-height: 1;

        @media (pointer: coarse) {
            font-size: 16px;
        }
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

    .close {
        position: absolute;
        right: 5px;
        top: 5px;
        cursor: pointer;
    }

    .save {
        grid-column: 1/3;
        width: 50dvw;
        place-self: center;
        outline: none;
        border: 1px solid black;
        border-radius: 20px;
        padding: 10px;
        text-wrap: nowrap;

        @media(pointer: coarse) {
            padding: 20px;
        }

        background-color: var(--accent);
        color: var(--bg);
    }

    .save:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .warning {
        grid-column: 1/3;
        color: rgb(151, 22, 22);

        @media (prefers-color-scheme: dark) {
            color: rgb(94, 0, 0);
        }
    }

    .title {
        place-self: center;

        @media (pointer: fine) {
            grid-column: 1/3;
        }
    }

    .edit-btn {
        height: 5dvh;
        width: 20dvw;
        min-width: 200px;
        transition: 0.3s;
    }

    .edit-btn:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }
</style>
