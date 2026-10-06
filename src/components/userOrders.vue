<script lang="ts" setup>
    import { data } from '../composables/useLS';
    import { user } from '../composables/useUser';

    const sortedOrders = Object.values(data.orders).sort((a, b) => b.created_at - a.created_at)

</script>
<template>
    <section>
        <template v-for="order in sortedOrders" v-if="sortedOrders.length > 0">
            <div v-if="order.user_id == user.id" class="card">
                <div class="title-right">
                    <p>Статус:</p>
                    <h3>{{ order.status == 'created'
                        ? 'Сформирован'
                        : order.status == 'in-work'
                            ? 'Готовится'
                            : order.status == 'delivery'
                                ? 'В доставке'
                                : order.status == 'closed'
                                    ? 'Завершен'
                                    : 'Ошибка' }}</h3>
                </div>
                <div class="products">
                    <p class="title">Продукты:</p>
                    <div class="product-row">
                        <div>
                            <p>Название</p>
                        </div>
                        <div>
                            <p>Цена</p>
                        </div>
                        <div>
                            <p>Количество</p>
                        </div>
                        <div>
                            <p>Всего</p>
                        </div>
                        <template v-for="amount, productId in order.products">
                            <div>
                                <p>{{ data.products[Number(productId)].name }}</p>
                            </div>
                            <div>
                                <p>{{ data.products[Number(productId)].price }}</p>
                            </div>
                            <div>
                                <p>{{ amount }}</p>
                            </div>
                            <div>
                                <p>{{ data.products[Number(productId)].price * amount }}</p>
                            </div>
                        </template>
                        <div class="empty"></div>
                        <div class="empty"></div>
                        <div class="empty border-right"></div>
                        <div>
                            <p>Итого:</p>
                            <p>{{ order.total_price }}</p>
                        </div>
                    </div>
                </div>
                <div>

                </div>
                <div class="card-button">
                    <div class="pay-type">
                        <p>Оплата:</p>
                        <p>{{ order.pay_type == 'online'
                            ? 'Онлайн'
                            : order.pay_type == 'offline'
                                ? 'Офлайн'
                                : 'Ошибка' }}</p>
                    </div>
                    <div class="date">
                        <p>Дата:</p>
                        <p>{{ order.date }}</p>
                    </div>
                </div>
            </div>
        </template>
        <div v-else class="center">
            <p>Вы ничего не заказывали</p>
            <RouterLink :to="{ name: 'cart' }">В корзину</RouterLink>
        </div>
    </section>
</template>
<style lang="css" scoped>
    section {
        padding-left: 10dvw;
        padding-right: 10dvw;
        width: 80dvw;
        padding-bottom: 5dvh;

        @media (pointer: fine) {
            padding-top: 5dvh;
        }
    }

    .card {
        display: flex;
        flex-flow: column nowrap;
        gap: 0;
        border: 1px dotted black;
        box-shadow: 1px 1px 10px black;
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 3dvh;
        background-color: var(--surface);
    }

    .title {
        align-self: flex-start;
    }

    .title-right {
        align-self: flex-end;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: flex-end;
        padding-top: 5px;
        padding-right: 25px;
    }

    .products {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        width: 70dvw;
        padding-left: 5dvw;
        padding-right: 5dvw;
    }

    .product-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        width: 70dvw;
    }

    .product-row>div:not(.empty) {
        justify-items: center;
        border: 1px solid black;
        align-items: center;
    }

    .empty {
        border-top: 1px solid black;
    }

    .border-right {
        border-right: 1px solid black;
    }

    .card-button {
        display: flex;
        flex-flow: row;
        justify-content: space-between;
    }

    .pay-type {
        padding-bottom: 5px;
        padding-left: 25px;
        align-self: flex-start;
        align-items: flex-end;
        justify-content: center;
    }

    .date {
        padding-bottom: 5px;
        padding-right: 25px;
        align-self: flex-end;
        align-items: flex-start;
        justify-content: center;
    }

    .center {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        height: 60dvh;
        gap: 3dvh;
    }

    .center>a {
        border: 1px solid black;
        border-radius: 20px;
        padding: 20px;
        text-align: center;
        text-decoration: none;
        background-color: var(--accent);
        color: var(--bg);
    }

    .center>a:hover {
        @media (pointer: fine) {
            box-shadow: 1px 1px 5px var(--text);
            color: var(--text);
        }
    }
</style>