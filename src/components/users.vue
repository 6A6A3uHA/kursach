<script lang="ts" setup>
    import { reactive, ref } from 'vue';
    import { data } from '../composables/useLS';
    import { deleteUser, existLogin, user as global_user, guest } from '../composables/useUser'
    const users = data.users

    const modal = ref(false)
    const edit = reactive({
        open: false,
        id: -1
    })

    const user = reactive({ ...guest })

    const output = reactive({
        login: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: ""
    })
    const flag_open = reactive({
        login: false,
        firstname: false,
        lastname: false,
        email: false,
        phone: false,
        address: false
    })

    function change_root(id: number) {
        users[id].root == 0 ? users[id].root = 1 : users[id].root = 0
    }
    function open_edit(id: number) {
        modal.value = true
        edit.id = id
        Object.assign(user, users[id])
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
        if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(user.login)) {
            open("login", "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
            pass = false
        }

        if (!/[а-яА-ЯёЁ]{2,}/.test(user.firstname)) {
            open("firstname", "Минимальное колличество символов 2. Допустимые символы: кириллица.")
            pass = false
        }

        if (!/[а-яА-ЯёЁ]{2,}/.test(user.lastname)) {
            open('lastname', "Минимальное колличество символов 2. Допустимые символы: кириллица.")
            pass = false
        }

        if (user.phone.length > 0 && !/\+[0-9]{11}/.test(user.phone)) {
            open('phone', "Поле можно оставить пустым. Номер пишется в формате +12345678901, обязательно начинается с + и содержит 11 цифр.")
            pass = false
        }

        if (user.email.length > 0 && !/[a-zA-Z][a-zA-Z0-9\-\_]{0,}\@(mail\.ru|gmail\.com)/.test(user.email)) {
            open('email', "Поле можно оставить пустым. Первый символ обязательно латиница. Допустимые символы: латиница, цифры, '-', '_'. Почта обязательно заканчивается на @mail.ru или @gmail.com")
            pass = false
        }
        if (user.address.length > 0 && !/[А-Яа-яёЁ\ \.\-\,]{3,}/.test(user.address)) {
            open('address', "Поле можно оставить пустым. Для адреса допускается кириллица и спецсимволы: пробел, '.', '-', ','.")
            pass = false
        }
        if (!pass) return
        const result = existLogin(user.login)
        if (result === null || result === user.id) {
            Object.assign(users[edit.id], user)
            return edit.open = false
        }
        user.login = global_user.login
        output.login = "Такой логин уже существует."
    }
</script>
<template>
    <div class="container">
        <div class="grid">
            <div class="cell">id</div>
            <div class="cell">Логин</div>
            <div class="cell">Имя</div>
            <div class="cell">Фамилия</div>
            <div class="cell">Email</div>
            <div class="cell">Телефон</div>
            <div class="cell">Адрес</div>
            <div class="cell">Права</div>
            <div class="cell">Редактировать/Удалить</div>
        </div>
    </div>
    <div class="container desktop">
        <div class="grid" v-for="user in users">
            <div class="cell">{{ user.id }}</div>
            <div class="cell">{{ user.login }}</div>
            <div class="cell">{{ user.firstname }}</div>
            <div class="cell">{{ user.lastname }}</div>
            <div class="cell">{{ user.email }}</div>
            <div class="cell">{{ user.phone }}</div>
            <div class="cell">{{ user.address }}</div>
            <div class="cell">
                <button @click="change_root(user.id)" v-if="user.id != global_user.id" class="change-root">
                    {{ user.root == 1 ? "Сделать пользователем" : "Сделать админом" }}
                </button>
                <div v-else>Админ</div>
            </div>
            <div class="cell flex-row">
                <button class="btn-circle" @click="open_edit(user.id)" v-if="user.id != global_user.id">&#9998;</button>
                <button class="btn-circle non-active" v-else>&#9998;</button>
                <button class="btn-circle" @click="deleteUser(user.id)"
                    v-if="user.id != global_user.id">&#10006;</button>
                <button class="btn-circle non-active" v-else>&#10006;</button>
            </div>
        </div>
    </div>
    <div class="mobile">
        Для нормального отображения вы должны зайти с компьютера
    </div>
    <Transition name="modal-animation" @after-enter="edit.open = true">
        <div class="modal" v-if="modal">
            <Transition name="animation-edit" @after-leave="modal = false">
                <div class="form-grid" v-if="edit.open">
                    <div class="btn-circle absolute" @click="edit.open = false">&#10006;</div>
                    <Transition name="label-animation">
                        <label for="login" v-if="flag_open.login">{{ output.login }}</label>
                    </Transition>
                    <p>Логин:</p>
                    <input class="inp-underline" type="text" id="login" v-model="user.login">
                    <Transition name="label-animation">
                        <label for="firstname" v-if="flag_open.firstname">{{ output.firstname }}</label>
                    </Transition>
                    <p>Имя:</p>
                    <input class="inp-underline" type="text" id="firstname" v-model="user.firstname">
                    <Transition name="label-animation">
                        <label for="lastname" v-if="flag_open.lastname">{{ output.lastname }}</label>
                    </Transition>
                    <p>Фамилия:</p>
                    <input class="inp-underline" type="text" id="lastname" v-model="user.lastname">
                    <Transition name="label-animation">
                        <label for="email" v-if="flag_open.email">{{ output.email }}</label>
                    </Transition>
                    <p>Email:</p>
                    <input class="inp-underline" type="text" id="email" v-model="user.email">
                    <Transition name="label-animation">
                        <label for="phone" v-if="flag_open.phone">{{ output.phone }}</label>
                    </Transition>
                    <p>Телефон:</p>
                    <input class="inp-underline" type="text" id="phone" v-model="user.phone">
                    <Transition name="label-animation">
                        <label for="address" v-if="flag_open.address">{{ output.address }}</label>
                    </Transition>
                    <p>Адрес:</p>
                    <input class="inp-underline" type="text" id="address" v-model="user.address">
                    <button class="btn-primary" @click="save">Сохранить</button>
                </div>
            </Transition>
        </div>
    </Transition>
</template>
<style lang="css" scoped>
    .grid {
        display: grid;
        grid-template-columns: 1fr 2fr 2fr 2fr 2fr 2fr 2fr 3fr 2fr;
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

    .change-root {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        line-height: 1;
        background-color: rgba(0, 0, 0, 0);
        outline: 0;
        border: 0;
        cursor: pointer;
        text-align: start;
        color: var(--text);

        &:hover {
            color: var(--accent);
        }
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

    .non-active {
        cursor: not-allowed;
        box-shadow: none !important;
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
</style>