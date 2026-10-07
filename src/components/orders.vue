<script lang="ts" setup>
    import { computed, reactive, ref } from 'vue';
    import { data } from '../composables/useLS';
    import { deleteOrder, empty_order } from '../composables/useOrders';

    const users = data.users

    const orders = data.orders

    const modal = ref(false)

    const edit = reactive({
        open: false,
        id: -1
    })

    const order = reactive({ ...empty_order })
    const product_keys = computed(() => {
        return Object.keys(order.products)
    })

    const output = reactive({
        amount: "",
        total_price: "",
        address: ""
    })

    const flag_open = reactive({
        amount: false,
        total_price: false,
        address: false
    })

    function changeProduct(id: number, newId: number) {
        order.products[newId] = order.products[id]
        delete order.products[id]
    }

    function open_edit(id: number) {
        modal.value = true
        edit.id = id
    }

    function open(key: keyof typeof output, value: string) {
        flag_open[key] = true
        output[key] = value
    }

    function close(key: keyof typeof output) {
        flag_open[key] = false
    }

    function save() {
        Object.keys(output).forEach((key) => close(key as keyof typeof output))
        let pass = true
        if (Object.values(order.products).some((amount) => amount <= 0)) {
            pass = false
            open('amount', "Количество товаров не может быть меньше 0")
        }
        if (order.total_price < 10) {
            pass = false
            open('total_price', "Итоговая цена не может быть меньше 10")
        }
        if (!/[А-Яа-яёЁ\ \.\-\,0-9]{3,}/.test(order.address)) {
            open('address', "Для адреса допускается кириллица и спецсимволы: пробел, '.', '-', ','.")
            pass = false
        }
        if (!pass) return
        Object.assign(data.orders[edit.id], JSON.parse(JSON.stringify(order)))
        return edit.open = false

    }
</script>
<template>
    <div class="container">
        <div class="grid">
            <div class="cell">id</div>
            <div class="cell">Пользователь</div>
            <div class="cell">Продукты</div>
            <div class="cell">Время создания</div>
            <div class="cell">Тип оплаты</div>
            <div class="cell">Статус</div>
            <div class="cell">Итого</div>
            <div class="cell">Редактирование</div>
        </div>
    </div>
    <div class="container desktop">
        <div class="grid" v-for="order in orders">
            <div class="cell">{{ order.id }}</div>
            <div class="cell">{{ users[order.user_id].firstname + " " + users[order.user_id].lastname }}</div>
            <div class="cell cell-product">
                <div v-for="amount, product_id in order.products" class="product">
                    <p>{{ data.products[product_id].name }}</p>
                    <p>{{ amount }}</p>
                </div>
            </div>
            <div class="cell">{{ order.date }}</div>
            <div class="cell cell-option">
                <select name="type-pay" v-model="data.orders[order.id].pay_type">
                    <option value="online">Онлайн</option>
                    <option value="offline">Офлайн</option>
                </select>
            </div>
            <div class="cell cell-option">
                <select name="type-pay" v-model="data.orders[order.id].status">
                    <option value="created">Создан</option>
                    <option value="in-work">Готовится</option>
                    <option value="delivery">В доставке</option>
                    <option value="closed">Закрыт</option>

                </select>
            </div>
            <div class="cell">{{ order.total_price }}</div>
            <div class="cell flex-row">
                <button class="btn-circle" @click="open_edit(order.id)">&#9998;</button>
                <button class="btn-circle" @click="deleteOrder(order.id)">&#10006;</button>
            </div>
        </div>
    </div>
    <div class="mobile">
        Для нормального отображения вы должны зайти с компьютера.
    </div>
    <Transition name="modal-animation" @after-enter="edit.open = true"
        @after-leave="edit.id = -1; Object.assign(order, empty_order)"
        @before-enter="Object.assign(order, JSON.parse(JSON.stringify(orders[edit.id])))">
        <div class="modal" v-if="modal">
            <Transition name="animation-edit" @after-leave="modal = false">
                <div class="form-grid" v-if="edit.open">
                    <div class="btn-circle absolute" @click="edit.open = false">&#10006;</div>

                    <p>id</p>
                    <p>{{ order.id }}</p>

                    <p>Пользователь</p>
                    <p>{{ data.users[order.user_id].firstname + ' ' + data.users[order.user_id].lastname }}</p>

                    <Transition name="label-animation">
                        <label for="product" v-if="flag_open.amount">{{ output.amount }}</label>
                    </Transition>
                    <p>Продукты</p>
                    <div class="product-overflow">
                        <div v-for="_, product_id, index in order.products" class="products">
                            <select :value="product_id" :id="'product' + index"
                                @change="changeProduct(Number(product_id), Number(($event.target as HTMLSelectElement).value))">
                                <template v-for="product in data.products">
                                    <option :value="product.id"
                                        v-if="product.id == Number(product_id) || !(Object.values(product_keys).includes(String(product.id)))"
                                        :key="product.id" :id="'product' + index + product.id">
                                        {{ product.name }}
                                    </option>
                                </template>
                            </select>
                            <input class="inp-underline" type="number" v-model="order.products[product_id]"
                                :id="'amount' + index">
                            <button class="btn-primary" @click="delete order.products[product_id]">Удалить</button>
                        </div>
                        <button class="btn-primary grid-center" @click="order.products[-1] = 0">Добавить</button>
                    </div>
                    <p>Время создания</p>
                    <p>{{ order.date }}</p>

                    <p>Тип оплаты</p>
                    <select name="status" v-model="order.pay_type">
                        <option value="online">Онлайн</option>
                        <option value="offline">Офлайн</option>
                    </select>

                    <p>Статус</p>
                    <select name="status" v-model="order.status">
                        <option value="created">Создан</option>
                        <option value="in-work">Готовится</option>
                        <option value="delivery">В доставке</option>
                        <option value="closed">Закрыт</option>
                    </select>
                    <Transition name="label-animation">
                        <label for="login" v-if="flag_open.total_price">{{ output.total_price }}</label>
                    </Transition>
                    <p>Итого</p>
                    <input class="inp-underline" type="text" id="total-price" v-model="order.total_price">
                    <Transition name="label-animation">
                        <label for="login" v-if="flag_open.address">{{ output.address }}</label>
                    </Transition>
                    <p>Адрес</p>
                    <input class="inp-underline" type="text" id="address" v-model="order.address">
                    <button class="btn-primary grid-center" @click="save">Сохранить</button>
                </div>
            </Transition>
        </div>
    </Transition>
</template>
<style lang="css" scoped>
    .grid {
        display: grid;
        grid-template-columns: 1fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr;
        grid-auto-rows: 80px;
        width: 100%;
        height: 80px;
        z-index: 1;
    }

    .cell {
        border: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: start;
        overflow-y: hidden;
        overflow-x: auto;
        width: 100%;
        height: 100%;
        cursor: default;
        font-size: var(--font-size-small);
        word-break: keep-all;
    }

    .cell-product {
        display: flex;
        flex-flow: column nowrap;
        overflow-y: scroll;
        height: 100%;
    }

    .cell-option {
        justify-content: center;
    }

    .container {
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .flex-row {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        justify-content: space-evenly;
    }

    .btn-circle {
        position: static;
    }

    .btn-icon:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .absolute {
        position: absolute;
    }

    .desktop {
        height: 93%;

        @media (width < 600px) {
            display: none;
        }
    }

    .mobile {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        @media (width>=600px) {
            display: none;
        }
    }

    .modal {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(88, 88, 88, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    .form-grid {
        position: relative;
        background-color: var(--surface);
        height: 80%;
        width: 80%;
        border-radius: 20px;
        padding: 1rem;
        font-size: var(--font-size-large);
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

    .product {
        width: 100%;
        display: grid;
        grid-template-columns: 2fr 1fr;
    }

    select,
    option {
        background-color: var(--surface);
        outline: 0;
        border: 0;
        box-shadow: none;
        height: auto;
    }

    select:hover,
    select:active,
    option:hover,
    option:active {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
        }
    }

    .products {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: var(--space-3);
        grid-auto-rows: 1fr;
        padding-bottom: 1dvh;
    }

    .product-overflow {
        height: 100%;
        overflow-y: scroll;
    }

    .grid-center {
        grid-column: 1/3;
        justify-self: center;
    }
</style>