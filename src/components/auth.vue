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

        if (result.reason == 0) return open('login', "Такого логина нет.")
        return open('password', 'Пароль не подходит.')
    }
</script>
<template>
    <form @submit.prevent="authorization" class="form-grid">
        <template v-for="value, key in user">
            <Transition name="label-animation" @leave="value.message = ''">
                <label :for="key" v-if="value.open">{{ value.message }}</label>
            </Transition>
            <p class="name">{{ value.text }}</p>
            <input :type="key == 'login' ? 'text' : 'password'" :placeholder="value.placeholder" v-model="value.input"
                inputmode="text" :id="key" :autocomplete="value.autocomplete" class="inp-underline">
        </template>
        <button class="grid-center btn-primary">Войти</button>
        <p class="grid-center">Нет аккаунта? <RouterLink :to="{ name: 'reg' }" class="btn-primary">Зарегистрироваться
            </RouterLink>
        </p>
    </form>
</template>
<style lang="css" scoped>

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

    .grid-center {
        grid-column: 1/3;
        justify-self: center;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        align-items: center;
    }
</style>