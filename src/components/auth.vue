<script lang="ts" setup>
    import { reactive } from 'vue';
    import { getUserFromLoginPassword } from '../composables/useUser';
    import { useRouter } from 'vue-router';
    import { redirect_from } from '../route';
    import { user as global_user } from '../composables/useUser';
    import { setActiveUser } from '../composables/useLS';

    const router = useRouter()

    const user = reactive({
        login: {
            text: "Введите логин:",
            placeholder: "login",
            input: "",
            message: "",
            open: false,
            autocomplete: "username"
        },
        password: {
            text: "Введите пароль:",
            placeholder: "password",
            input: "",
            message: "",
            open: false,
            autocomplete: "current-password"
        }
    })
    function open(key: keyof typeof user, text: string) {
        user[key].message = text
        user[key].open = true
    }

    function authorization() {
        Object.keys(user).forEach(key => {
            user[key as keyof typeof user].open = false
        })
        let pass = true
        if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(user.login.input)) {
            open("login", "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
            pass = false
        }

        if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(user.password.input)) {
            open("password", "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
            pass = false
        }
        if (!pass) return

        const result = getUserFromLoginPassword(user.login.input, user.password.input)

        if (result.result) {
            Object.assign(global_user, result.user)
            setActiveUser(global_user.id)
            return router.push(redirect_from.value?.path ?? { name: "home" })
        }
        console.log(result.reason);
        if (result.reason == 0) return open('login', "Такого логина нет.")
        return open('password', 'Пароль не подходит.')
    }
</script>
<template>
    <form @submit.prevent="authorization">
        <template v-for="value, key in user">
            <Transition name="label-animation" @leave="value.message = ''">
                <label :for="key" v-if="value.open">{{ value.message }}</label>
            </Transition>
            <p class="name">{{ value.text }}</p>
            <input :type="key == 'login' ? 'text' : 'password'" :placeholder="value.placeholder" v-model="value.input"
                inputmode="text" :id="key" :autocomplete="value.autocomplete">
        </template>
        <button class="grid-center">Войти</button>
        <p class="grid-center">Нет аккаунта? <RouterLink :to="{ name: 'reg' }">Зарегистрироваться</RouterLink>
        </p>
    </form>
</template>
<style lang="css" scoped>
    form {
        display: grid;
        margin-left: 20dvw;
        margin-right: 20dvw;
        width: 60dvw;
        grid-template-columns: 1fr 3fr;
        grid-template-rows: auto;
        row-gap: 10px;

        @media (pointer: fine) {
            padding-top: 20px;
        }
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

    .name {
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
        background-color: rgba(0, 0, 0, 0) !important;
        transition: 0.3s ease-in-out;

        @media (pointer: coarse) {
            height: 10px;
        }

        align-self: center;
        transition: border-bottom 0.2s ease-in-out;
    }

    input:hover,
    input:focus {
        border-bottom: 1px solid var(--text);
    }

    input::placeholder {
        color: var(--text);
    }

    button {
        cursor: pointer;
        box-sizing: border-box;
        border: 1px solid black;
        outline: none !important;
        border-radius: 20px;
        height: 3dvh;
        width: 5dvw;
        min-width: 50px;
        box-shadow: none;

        @media (pointer:coarse) {
            height: 5dvh;
        }

        min-height: 35px;
        max-height: 50px;
        background-color: var(--accent);
        color: var(--bg);
        transition: box-shadow 0.2s ease-in-out,
        width 0.2s ease-in-out;
    }

    button:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    a {
        border: 1px solid black;
        border-radius: 20px;
        padding: 5px;
        text-align: center;
        text-decoration: none;
        background-color: var(--accent);
        color: var(--bg);
    }

    a:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }

    .grid-center {
        grid-column: 1/3;
        justify-self: center;
    }
</style>