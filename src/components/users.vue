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
                <div v-else class="cursor">Админ</div>
            </div>
            <div class="cell flex-row">
                <button class="btn-icon" @click="open_edit(user.id)" v-if="user.id != global_user.id">&#9998;</button>
                <button class="btn-icon non-active" v-else>&#9998;</button>
                <button class="btn-icon" @click="deleteUser(user.id)" v-if="user.id != global_user.id">&#10006;</button>
                <button class="btn-icon non-active" v-else>&#10006;</button>
            </div>
        </div>
    </div>
    <div class="mobile">
        Для нормального отображения вы должны зайти с компьютера
    </div>
    <Transition name="modal-animation" @after-enter="edit.open = true">
        <div class="modal" v-if="modal">
            <Transition name="animation-edit" @after-leave="modal = false">
                <div class="edit" v-if="edit.open">
                    <div class="btn-icon close" @click="edit.open = false">&#10006;</div>
                    <Transition name="label-animation">
                        <label for="login" v-if="flag_open.login">{{ output.login }}</label>
                    </Transition>
                    <p>Логин:</p>
                    <input type="text" id="login" v-model="user.login">
                    <Transition name="label-animation">
                        <label for="firstname" v-if="flag_open.firstname">{{ output.firstname }}</label>
                    </Transition>
                    <p>Имя:</p>
                    <input type="text" id="firstname" v-model="user.firstname">
                    <Transition name="label-animation">
                        <label for="lastname" v-if="flag_open.lastname">{{ output.lastname }}</label>
                    </Transition>
                    <p>Фамилия:</p>
                    <input type="text" id="lastname" v-model="user.lastname">
                    <Transition name="label-animation">
                        <label for="email" v-if="flag_open.email">{{ output.email }}</label>
                    </Transition>
                    <p>Email:</p>
                    <input type="text" id="email" v-model="user.email">
                    <Transition name="label-animation">
                        <label for="phone" v-if="flag_open.phone">{{ output.phone }}</label>
                    </Transition>
                    <p>Телефон:</p>
                    <input type="text" id="phone" v-model="user.phone">
                    <Transition name="label-animation">
                        <label for="address" v-if="flag_open.address">{{ output.address }}</label>
                    </Transition>
                    <p>Адрес:</p>
                    <input type="text" id="address" v-model="user.address">
                    <button class="save" @click="save">Сохранить</button>
                </div>
            </Transition>
        </div>
    </Transition>
</template>
<style lang="css" scoped>
    .grid {
        display: grid;
        grid-template-columns: 1fr 2fr 2fr 2fr 2fr 2fr 2fr 3fr 2fr;
        grid-template-rows: 35px;
        width: 99dvw;
        height: 35px;
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
        font-size: 18px;
        cursor: default;
    }

    .container {
        margin: 0;
        padding: 0;
        width: 100dvw;
        height: 96%;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .change-root,
    .change-root:hover,
    .change-root:active {
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
        font-size: 16px;

        @media (pointer: coarse) {
            border: 1px solid green;
        }
    }

    .flex-row {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        justify-content: space-evenly;
    }

    .btn-icon {
        background-color: rgba(0, 0, 0, 0);
        outline: 0;
        box-shadow: none;
        border: 1px solid black;
        border-radius: 25px;
        height: 25px;
        width: 25px;
        font-size: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background-color: var(--accent);
        color: var(--bg);
    }

    .btn-icon:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .non-active {
        cursor: not-allowed;
        box-shadow: none !important;
    }

    .desktop {
        @media (pointer: coarse) {
            display: none;
        }
    }

    .mobile {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        @media (pointer:fine) {
            display: none;
        }
    }

    .modal {
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
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
    }

    label {
        grid-column: 1/3;
        color: rgb(151, 22, 22);
        opacity: 1;
        max-height: 50px;
        overflow: hidden;
        transition: 0.3s ease-in-out;

        @media (prefers-color-scheme: dark) {
            color: rgb(94, 0, 0);
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
    }

    input {
        height: 20px;
        outline: 0;
        border: 0;
        border-bottom: 1px solid black;
        background-color: rgba(0, 0, 0, 0);
        line-height: 1;
    }

    input:hover,
    input:focus {
        @media (pointer: fine) {
            border-bottom: 1px solid var(--text);
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
    }

    .save {
        grid-column: 1/3;
        width: 50dvw;
        place-self: center;
        outline: none;
        border: 1px solid black;
        border-radius: 20px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0);
        text-wrap: nowrap;
        cursor: pointer;

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
</style>