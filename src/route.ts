import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from 'vue-router'

import reg from './components/reg.vue'
import auth from './components/auth.vue'
import cart from './components/cart.vue'
import card from './components/card.vue'
import admin from './components/admin.vue'
import catalog from './components/catalog.vue'
import not_found from './components/not_found.vue'
import account from './components/account.vue'
import users from './components/users.vue'
import products from './components/products.vue'
import orders from './components/orders.vue'
import { ref } from 'vue'
import { user } from './composables/useUser.ts'
import favorites from './components/favorites.vue'
import userOrders from './components/userOrders.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', component: catalog, name: 'home' },
    { path: '/registration', component: reg, name: 'reg' },
    { path: '/auth', component: auth, name: 'auth' },
    { path: '/card/:id([0-9]{1,})', component: card, name: 'card' },
    { path: '/cart', component: cart, name: 'cart', meta: { access: 0 } },
    { path: '/favorite', component: favorites, name: 'favorite', meta: { access: 0 } },
    {
        path: '/admin', component: admin, name: 'admin', meta: { access: 1 }, children: [
            { path: 'edit-users', component: users, name: 'users', meta: { access: 1 } },
            { path: 'edit-products', component: products, name: 'products', meta: { access: 1 } },
            { path: 'edit-orders', component: orders, name: 'orders', meta: { access: 1 } },
        ]
    },
    { path: '/orders', component: userOrders, name: 'userOrder', meta: { access: 0 } },
    { path: '/:a(.*)*', component: not_found, name: 'not_found' },
    { path: '/account/:login', component: account, name: 'account', meta: { access: 1 } }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})
export const redirect_from = ref<RouteLocationNormalized | null>(null)
router.beforeEach((to) => {
    const access = to.meta?.access as 0 | 1 | undefined ?? -1

    if (user.root > -1 && (to.name == "reg" || to.name == "auth")) return { name: "home" }

    if (access == -1) return

    if (user.root >= access) return

    if (to.name == "account" && to.params.login == user.login) return

    redirect_from.value = to

    if (access == 0) return { name: 'auth' }

    return { name: 'not_found' }
})

export { router }