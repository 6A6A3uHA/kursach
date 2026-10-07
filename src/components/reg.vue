<script lang="ts" setup>
    import { reactive } from 'vue';
    import { createUser } from '../composables/useUser';
    import { useRouter } from 'vue-router';
    import { redirect_from } from '../route';
    import { setActiveUser } from '../composables/useLS';
    import { user as global_user } from '../composables/useUser';

    const router = useRouter()

    const user = reactive({
        login: {
            text: "Введите логин:",
            isneed: true,
            placeholder: "login",
            input: "",
            message: "",
            open: false,
            autocomplete: "username"
        },
        password: {
            text: "Введите пароль:",
            isneed: true,
            placeholder: "password",
            input: "",
            message: "",
            open: false,
            autocomplete: "new-password"
        },
        password2: {
            text: "Повторите пароль:",
            isneed: true,
            placeholder: "password",
            input: "",
            message: "",
            open: false,
            autocomplete: "off"
        },
        firstname: {
            text: "Введите имя:",
            isneed: true,
            placeholder: "Имя",
            input: "",
            message: "",
            open: false,
            autocomplete: "given-name"
        },
        lastname: {
            text: "Введите фамилию:",
            isneed: true,
            placeholder: "Фамилия",
            input: "",
            message: "",
            open: false,
            autocomplete: "family-name"
        },
        phone: {
            text: "Введите телефон:",
            isneed: false,
            placeholder: "+79999999999",
            input: "",
            message: "",
            open: false,
            autocomplete: "tel"
        },
        email: {
            text: "Введите емайл:",
            isneed: false,
            placeholder: "aaa@gmail.com | aaa@mail.ru",
            input: "",
            message: "",
            open: false,
            autocomplete: "email"
        },
        address: {
            text: "Введите адрес:",
            isneed: false,
            placeholder: "адрес",
            input: "",
            message: "",
            open: false,
            autocomplete: "street-address"
        }
    })
    function open(key: keyof typeof user, text: string) {
        user[key].message = text
        user[key].open = true
    }
    function registration() {
        Object.keys(user).forEach(key => user[key as keyof typeof user].open = false)
        let pass = true
        if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(user.login.input)) {
            open('login', "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
            pass = false
        }

        if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(user.password.input)) {
            open('password', "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
            pass = false
        }

        if (!/[A-Za-z0-9\-\_\@\,\.]{8,}/.test(user.password2.input)) {
            open('password2', "Минимальное колличество символов 8. Допустимые символы: латиница, цифры, '-', '_', '@', ',', '.'")
            pass = false
        }

        if (user.password.input != user.password2.input) {
            open('password', "Пароли не совпадают")
            open('password2', "Пароли не совпадают")
            pass = false
        }

        if (!/[а-яА-ЯёЁ]{2,}/.test(user.firstname.input)) {
            open('firstname', "Минимальное колличество символов 2. Допустимые символы: кириллица.")
            pass = false
        }

        if (!/[а-яА-ЯёЁ]{2,}/.test(user.lastname.input)) {
            open('lastname', "Минимальное колличество символов 2. Допустимые символы: кириллица.")
            pass = false
        }

        if (user.phone.input.length > 0 && !/\+[1-9][0-9]{10}/.test(user.phone.input)) {
            open('phone', "Поле можно оставить пустым. Номер пишется в формате +12345678901, обязательно начинается с + и содержит 11 цифр. Код страны не может быть нулевым.")
            pass = false
        }

        if (user.email.input.length > 0 && !/[a-zA-Z][a-zA-Z0-9\-\_]{0,}\@(mail\.ru|gmail\.com)/.test(user.email.input)) {
            open('email', "Поле можно оставить пустым. Первый символ обязательно латиница. Допустимые символы: латиница, цифры, '-', '_'. Почта обязательно заканчивается на @mail.ru или @gmail.com")
            pass = false
        }
        if (!pass) return
        const result = createUser(
            {
                login: user.login.input,
                firstname: user.firstname.input,
                lastname: user.lastname.input,
                phone: user.phone.input,
                email: user.email.input,
                address: user.address.input
            },
            user.password.input
        )
        if (result.result) {
            Object.assign(global_user, result.user)
            setActiveUser(global_user.id)
            return router.push(redirect_from.value?.path ?? { name: "home" })
        }
        user.login.input = ""
        user.login.message = "Такой логин уже существует."
    }
</script>
<template>
    <form class="form-grid" @submit.prevent="registration">
        <template v-for="value, key in user">
            <Transition name="label-animation">
                <label :for="key" v-if="value.open">
                    {{ value.message }}
                </label>
            </Transition>
            <p class="name">{{ value.text }} <span>{{ value.isneed ? "*" : "" }}</span></p>
            <input class="inp-underline" :type="['password', 'password2'].includes(key) ? 'password' : 'text'"
                :placeholder="value.placeholder" v-model="value.input" :inputmode="key == 'phone' ? 'tel' : 'text'"
                :id="key" :autocomplete="user[key].autocomplete">
        </template>
        <button class="btn-primary grid-center">Зарегистрироваться</button>
        <p class="grid-center">Есть аккаунт? <RouterLink class="btn-primary" :to="{ name: 'auth' }">Войти</RouterLink>
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

    .name {
        opacity: 1;
        margin: 0px;
        padding: 0px;
        align-self: center;
        transition: 0.3s ease-in-out;
        line-height: 1;
    }

    span {
        color: rgb(185, 3, 3);

        @media (prefers-color-scheme: dark) {
            color: rgb(255, 70, 70);
        }
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
