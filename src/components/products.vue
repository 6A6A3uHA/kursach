<script lang="ts" setup>
    import { reactive, ref } from 'vue';
    import { data } from '../composables/useLS';
    import { addProduct, deleteProduct, editProduct, empty_product } from '../composables/useProduct';
    const products = data.products

    const modal = ref(false)
    const edit = reactive({
        open: false,
        id: -1
    })

    const product = reactive({ ...empty_product })

    const output = reactive({
        name: "",
        ingridients: "",
        description: "",
        price: ""
    })
    const flag_open = reactive({
        name: false,
        ingridients: false,
        description: false,
        price: false
    })
    function open_edit(id: number) {
        Object.assign(product, products[id])
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
        if (!/[А-Яа-яёЁ][А-Яа-яёЁ\-\.\–]{1,60}/.test(product.name)) {
            open("name", "Минимальное колличество символов 2. Допустимые символы: латиница, цифры, '-', '.', '–'")
            pass = false
        }

        if (!/[а-яА-ЯёЁ][а-яА-ЯёЁ\,\.\ \-\–]{1,200}/.test(product.ingridients)) {
            open("ingridients", "Минимальное колличество символов 2. Допустимые символы: кириллица, ',', '.', '-', ' ', '–'")
            pass = false
        }

        if (!/[а-яА-ЯёЁ][а-яА-ЯёЁ\,\.\ \-\–]{1,499}/.test(product.description)) {
            open("description", "Минимальное колличество символов 2. Допустимые символы: кириллица, ',', '.', '-', ' ', '–'")
            pass = false
        }

        if (!/^[1-9][0-9]{1,}(\.[0-9]{1,2}|$)/.test(String(product.price))) {
            open('price', "Минимальное колличество символов 2 до дробной части. Допустимые символы: цифры, '.'")
            pass = false
        }

        if (!pass) return
        if (edit.id == -1) {
            addProduct(product)
            return edit.open = false
        }
        const result = editProduct({ id: edit.id, ...product })
        if (!result) {
            Object.keys(output).forEach(key => {
                open(key as keyof typeof output, "Такого продукта не существует")
            })
            setTimeout(() => {
                return edit.open = false
            }, 500);
        }
        return edit.open = false

    }
</script>
<template>
    <div class="container">
        <div class="grid">
            <div class="cell">id</div>
            <div class="cell">Название</div>
            <div class="cell">Состав</div>
            <div class="cell">Описание</div>
            <div class="cell">Цена</div>
            <div class="cell">Редактировать/Удалить</div>
        </div>
    </div>
    <div class="container desktop">
        <div class="grid" v-for="product in products">
            <div class="cell">{{ product.id }}</div>
            <div class="cell">{{ product.name }}</div>
            <div class="cell">{{ product.ingridients }}</div>
            <div class="cell">{{ product.description }}</div>
            <div class="cell">{{ product.price }}</div>
            <div class="cell flex-row">
                <button class="btn-circle" @click="open_edit(product.id)">&#9998;</button>
                <button class="btn-circle" @click="deleteProduct(product.id)">&#10006;</button>
            </div>
        </div>
    </div>
    <div class="mobile">
        Для нормального отображения вы должны зайти с компьютера.
    </div>
    <Transition name="modal-animation" @after-enter="edit.open = true"
        @after-leave="edit.id = -1; Object.assign(product, empty_product)">
        <div class="modal" v-if="modal">
            <Transition name="animation-edit" @after-leave="modal = false">
                <div class="form-grid" v-if="edit.open">
                    <div class="btn-circle absolute" @click="edit.open = false">&#10006;</div>
                    <Transition name="label-animation">
                        <label for="login" v-if="flag_open.name">{{ output.name }}</label>
                    </Transition>
                    <p>Название</p>
                    <input class="inp-underline" type="text" name="login" v-model="product.name">
                    <Transition name="label-animation">
                        <label for="firstname" v-if="flag_open.ingridients">{{ output.ingridients }}</label>
                    </Transition>
                    <p>Состав</p>
                    <input class="inp-underline" type="text" name="firstname" v-model="product.ingridients">
                    <Transition name="label-animation">
                        <label for="firstname" v-if="flag_open.description">{{ output.description }}</label>
                    </Transition>
                    <p>Описание</p>
                    <input class="inp-underline" type="text" name="firstname" v-model="product.description">
                    <Transition name="label-animation">
                        <label for="lastname" v-if="flag_open.price">{{ output.price }}</label>
                    </Transition>
                    <p>Цена</p>
                    <input class="inp-underline" type="text" name="lastname" v-model="product.price">
                    <button class="btn-primary" @click="save">Сохранить</button>
                </div>
            </Transition>
        </div>
    </Transition>
    <button class="btn-primary add" @click="open_edit(-1)">Добавить продукт</button>
</template>
<style lang="css" scoped>
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 4fr 6fr 1fr 1fr;
        grid-template-rows: 50px;
        width: 100%;
        height: 50px;
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

    .btn-primary {
        grid-column: 1/3;
        justify-self: center;
    }

    .add {
        position: absolute;
        right: 20px;
        bottom: 20px;

        @media (width<600px) {
            display: none;
        }
    }
</style>