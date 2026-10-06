<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { editUser, exitFromUser, setUserFromActiveSession } from '../composables/useUser';
    import { user as global_user, guest } from '../composables/useUser'
    import { onMounted, reactive, ref, watch } from 'vue';
    import type { User } from '../composables/types';
    import { checkPassword, setPassword } from '../composables/usePassword';

    const router = useRouter()
    let change = ref(false)
    let change_password = ref(false)
    let open_password = ref(false)
    const user = reactive({ ...guest })
    const output = reactive({
        login: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
        old_password: "",
        new_password: "",
        repeat_new_password: ""
    })
    const flag_open = reactive({
        login: false,
        firstname: false,
        lastname: false,
        email: false,
        phone: false,
        address: false,
        old_password: false,
        new_password: false,
        repeat_new_password: false
    })

    const passwords = reactive({
        old_password: "",
        new_password: "",
        repeat_new_password: ""
    })

    const flag_edit_password = ref(false)

    watch(passwords, () => {
        let pass = true
        for (let key in passwords) {
            if (passwords[key as keyof typeof passwords] != "") {
                pass = false
            }
        }
        if (pass) flag_edit_password.value = false
        else flag_edit_password.value = true
        return
    })


    onMounted(() => {
        Object.assign(user, global_user)
    })

    function open(key: keyof typeof output, value: string) {
        flag_open[key] = true
        output[key] = value
    }

    function close(key: keyof typeof output) {
        flag_open[key] = false
    }

    function save() {
        close_form_pass()
        Object.keys(output).forEach((key) => close(key as keyof typeof output))
        if (!change.value) {
            return change.value = !change.value
        }
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

        const user_keys = Object.keys(global_user)
        let edit = false
        for (let index in user_keys) {
            const key = user_keys[index]
            if (global_user[key as keyof User] != user[key as keyof User]) {
                edit = true
            }
        }
        if (!edit) return change.value = !change.value
        const result = editUser(user)
        setUserFromActiveSession()
        if (result.result) {
            Object.assign(user, global_user)
            router.push({ name: "account", params: { login: global_user.login } })
            return change.value = !change.value
        }
        user.login = global_user.login
        output.login = "Такой логин уже существует."
    }
    function open_form_pass() {
        open_password.value = !open_password.value
        setTimeout(() => {
            change_password.value = !change_password.value
        }, 1);
    }
    function clear_passwords() {
        Object.keys(passwords).forEach((key) => {
            close(key as keyof typeof passwords)
        })
        if (!flag_edit_password.value) return
        Object.keys(passwords).forEach((key) => {
            passwords[key as keyof typeof passwords] = ""
        })
        return
    }
    function close_form_pass() {
        clear_passwords()
        change_password.value = false
        setTimeout(() => {
            open_password.value = false
        }, 1);

    }

    function edit_password() {
        change.value = false
        Object.keys(user).forEach((key) => {
            if (!["id", "root"].includes(key))
                close(key as keyof typeof output)
        })
        Object.assign(user, global_user)
        Object.keys(output).forEach((key) => {
            if (["old_password", "new_password", "repeat_new_password"].includes(key)) {
                close(key as keyof typeof passwords)
            }
        })
        if (!change_password.value) {
            open_form_pass()
            return
        }
        if (!flag_edit_password.value) {
            close_form_pass()
            return
        }

        let pass = true
        for (let key in passwords) {
            if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(passwords[key as keyof typeof passwords])) {
                open(key as keyof typeof passwords, "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
                pass = false
            }
        }
        if (passwords.new_password != passwords.repeat_new_password) {
            open('new_password', "Пароли не совпадают.")
            open('repeat_new_password', "Пароли не совпадают.")
            pass = false
        }
        if (!pass) return

        if (!checkPassword(user.id, passwords.old_password)) return output.old_password = "Пароль не подходит"
        setPassword(user.id, passwords.new_password)

        close_form_pass()
        return
    }

    function exit() {
        exitFromUser()
        router.push({ name: "home" })
    }
</script>
<template>
    <form class="important" @submit.prevent="save">
        <div class="img">
            <img src="../assets/image.png" alt="Фото пользователя">
        </div>
        <div class="info">
            <Transition name="label-animation" @after-leave="output.login = ''">
                <label for="login" v-if="flag_open.login">{{ output.login }}</label>
            </Transition>
            <p>Логин:</p>
            <div class="cell">
                <Transition name="p-animation">
                    <p v-if="!change" class="fixed-grid">
                        {{ user.login }}
                    </p>
                </Transition>
                <Transition name="input-animation">
                    <input v-if="change" type="text" v-model="user.login" id="login" autocomplete="username"
                        class="fixed-grid">
                </Transition>
            </div>

            <Transition name="label-animation" @after-leave="output.lastname = ''">
                <label for="lastname" v-if="flag_open.lastname">{{ output.lastname }}</label>
            </Transition>
            <p>Фамилия:</p>
            <div class="cell">
                <Transition name="p-animation">
                    <p v-if="!change" class="fixed-grid">
                        {{ user.lastname }}
                    </p>
                </Transition>
                <Transition name="input-animation">
                    <input v-if="change" type="text" v-model="user.lastname" id="lastname" autocomplete="family-name"
                        class="fixed-grid">
                </Transition>
            </div>

            <Transition name="label-animation" @after-leave="output.firstname = ''">
                <label for="firstname" v-if="flag_open.firstname">{{ output.firstname }}</label>
            </Transition>
            <p>Имя:</p>
            <div class="cell">
                <Transition name="p-animation">
                    <p v-if="!change" class="fixed-grid">
                        {{ user.firstname }}
                    </p>
                </Transition>
                <Transition name="input-animation">
                    <input v-if="change" type="text" v-model="user.firstname" id="firstname" autocomplete="given-name"
                        class="fixed-grid">
                </Transition>
            </div>

            <Transition name="label-animation" @after-leave="output.email = ''">
                <label for="email" v-if="flag_open.email">{{ output.email }}</label>
            </Transition>
            <p>Email:</p>
            <div class="cell">
                <Transition name="p-animation">
                    <p v-if="!change" class="fixed-grid">
                        {{ user.email == "" ? "Нет email" : user.email }}
                    </p>
                </Transition>
                <Transition name="input-animation">
                    <input v-if="change" type="text" v-model="user.email" id="email" autocomplete="email"
                        class="fixed-grid">
                </Transition>
            </div>

            <Transition name="label-animation" @after-leave="output.phone = ''">
                <label for="phone" v-if="flag_open.phone">{{ output.phone }}</label>
            </Transition>
            <p>Телефон:</p>
            <div class="cell">
                <Transition name="p-animation">
                    <p v-if="!change" class="fixed-grid">
                        {{ user.phone == "" ? "Нет номера" : user.phone }}
                    </p>
                </Transition>
                <Transition name="input-animation">
                    <input v-if="change" type="text" v-model="user.phone" id="phone" autocomplete="tel"
                        class="fixed-grid">
                </Transition>
            </div>
        </div>
        <div class="info address">
            <Transition name="label-animation" @after-leave="output.address = ''">
                <label for="address" :class="{ 'label-open': flag_open.address }" v-if="flag_open.address">{{
                    output.address }}</label>
            </Transition>
            <p>Адрес:</p>
            <div class="cell">
                <Transition name="p-animation">
                    <p v-if="!change" class="fixed-grid">
                        {{ user.address == "" ? "Нет" : user.address }}
                    </p>
                </Transition>
                <Transition name="input-animation">
                    <input v-if="change" type="text" v-model="user.address" id="address" autocomplete="street-address"
                        class="fixed-grid">
                </Transition>
            </div>
        </div>
        <button class="change">{{ !change ? "Изменить информацию" : "Сохранить" }}</button>
    </form>
    <form class="change-password" @submit.prevent="edit_password">
        <Transition name="password-form-animation" @after-leave="clear_passwords">
            <div class="info password" v-if="open_password">
                <Transition name="label-animation" @after-leave="output.old_password = ''">
                    <label for="old_password" v-if="flag_open.old_password">{{ output.old_password }}</label>
                </Transition>
                <p>Старый пароль:</p> <input type="text" id="old_password" v-model="passwords.old_password"
                    autocomplete="current-password">
                <Transition name="label-animation" @after-leave="output.new_password = ''">
                    <label for="new_password" v-if="flag_open.new_password">{{ output.new_password }}</label>
                </Transition>
                <p>Новый пароль:</p> <input type="text" id="new_password" v-model="passwords.new_password"
                    autocomplete="new-password">
                <Transition name="label-animation" @after-leave="output.repeat_new_password = ''">
                    <label for="repeat_new_password" v-if="flag_open.repeat_new_password">{{ output.repeat_new_password
                        }}</label>
                </Transition>
                <p>Повторите пароль:</p> <input type="text" id="repeat_new_password"
                    v-model="passwords.repeat_new_password" autocomplete="off">
            </div>
        </Transition>
        <button class="save_password">
            {{ !open_password ? "Изменить пароль" : flag_edit_password ? "Сохранить" : "Закрыть" }}
        </button>
    </form>
    <button @click="exit" class="exit">Выйти из аккаунта</button>
</template>
<style lang="css" scoped>
    .important {
        display: grid;
        width: 90dvw;
        grid-template-columns: 1fr 3fr;
        grid-template-rows: 10fr 2fr 1fr;
        gap: 30px;
        padding-left: 5dvw;
        padding-right: 5dvw;
        padding-top: 10px;

        @media (pointer: coarse) {
            gap: 15px;
        }

        height: 80dvh;
        max-height: 425px;
        margin-bottom: 20px;
    }

    .img {
        grid-area: 1 / 1 / 2 / 2;
    }

    img {
        width: 20dvh;
        scale: 1/1;

        @media (pointer: coarse) {
            width: 20dvw;
        }
    }

    .info {
        height: 100%;
        grid-area: 1 / 2 / 1 / 3;
        padding: 0;
        display: grid;
        grid-template-columns: 1fr 6fr;
        grid-auto-rows: 1fr;
        row-gap: 10px;
        overflow: hidden;
    }

    .cell {
        grid-column: 2/3;
        align-self: center;
        align-items: center;
        height: 20px;
        position: relative;

        @media (pointer: coarse) {
            height: 14px;
        }
    }

    p {
        opacity: 1;
        margin: 0px;
        padding: 0px;
        align-self: center;
        transition: 0.3s ease-in-out;
        line-height: 1;

        @media (pointer: coarse) {
            font-size: 14px;
        }

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

    .address {
        grid-area: 2/1/3/3;
        grid-template-columns: 1fr 3fr;
        grid-template-rows: 30px 1fr;
        overflow: hidden;
    }

    .fixed-grid {
        top: 0;
        left: 0;
        position: absolute;
        width: 100%;
    }

    .p-animation-enter-from,
    .p-animation-leave-to {
        opacity: 0;
        transform: translateX(-40px);
    }

    .p-animation-enter-to,
    .p-animation-leave-from {
        opacity: 1;
        transform: translateX(0);
    }

    .input-animation-enter-from,
    .input-animation-leave-to {
        opacity: 0;
        transform: translateX(40dvw);
    }

    .input-animation-enter-to,
    .input-animation-leave-from {
        opacity: 1;
        transform: translateX(0);
    }

    label {
        height: auto;
        max-height: 80px;
        opacity: 1;
        align-self: center;
        font-size: 16px;
        grid-column: 1 / 3;
        margin: 0;
        padding: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        color: rgb(195, 5, 5);

        @media (prefers-color-scheme: dark) {
            color: rgb(117, 7, 7);
        }

        @media (pointer: coarse) {
            font-size: 14px;
        }
    }

    .label-animation-enter-to,
    .label-animation-leave-from {
        max-height: 80px;
        opacity: 1;
    }

    .label-animation-leave-to,
    .label-animation-enter-from {
        max-height: 0px;
        opacity: 0;
    }

    .change {
        grid-area: 3 / 1 / 4 / 3;
        width: 50dvw;
        place-self: center;
        outline: none;
        border: 1px solid black;
        border-radius: 20px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0);
        text-wrap: nowrap;
        background-color: var(--accent);
        color: var(--bg);

    }

    .change-password {
        width: 100dvw;
        padding-bottom: 20dvh;
        display: flex;
        flex-flow: column nowrap;
    }

    .password {
        display: grid;
        width: 90dvw;
        grid-template-columns: 1fr 3fr;
        grid-template-rows: repeat(20px 1fr, 3);
        row-gap: 30px;
        padding-left: 5dvw;
        padding-right: 5dvw;
        opacity: 1;
        max-height: 400px;

        @media (pointer: coarse) {
            row-gap: 15px;
        }

        transition:max-height 0.3s ease-in-out,
        opacity 0.3s ease-in-out;
    }

    .password-form-animation-enter-from,
    .password-form-animation-leave-to {
        opacity: 0;
        max-height: 0px
    }

    .password-form-animation-enter-to,
    .password-form-animation-leave-from {
        opacity: 1;
        max-height: 400px;
    }

    .save_password {
        width: 40dvw;
        place-self: center;
        outline: none;
        border: 1px solid black;
        border-radius: 20px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0);
        margin-top: 20px;

        @media(pointer: coarse) {
            padding: 20px;
        }

        background-color: var(--accent);
        color: var(--bg);
    }

    .exit {
        position: absolute;
        bottom: 5dvh;
        right: 5dvh;
        outline: none;
        border: 1px solid black;
        border-radius: 20px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0);

        @media(pointer: coarse) {
            padding: 20px;
        }

        background-color: var(--accent);
        color: var(--bg);
    }

    button {
        cursor: pointer;
    }

    button:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }
</style>