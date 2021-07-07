import api from "../../api/shop";

export default {
    state: {
        items: [],
        checkoutStatus: null
    },
    mutations: {
        pushProductToCart(state, productId) {
            state.items.push({
                id: productId,
                quantity: 1
            });
        },
        incrementItemQuantity(state, cartItem) {
            cartItem.quantity++;
        },
        decrementItemQuantity(state, cartItem) {
            let cartProduct = state.items.find((product) => product.id === cartItem.id);

            cartProduct.quantity--;
            if (cartProduct.quantity === 0) {
                let cartProductIndex = state.items.indexOf(cartProduct);
                state.items.splice(cartProductIndex, 1);
            }
        },
        removeProductFromCart(state, productItem) {
            let cartProductIndex = state.items.indexOf(productItem);
            state.items.splice(cartProductIndex, 1);
        },
        setCheckoutStatus(state, status) {
            state.checkoutStatus = status;
        },
        emptyCart(state) {
            state.items = [];
        }
    },
    actions: {
        addProductToCart({state, getters, commit, rootState, rootGetters}, producto) {
            if (rootGetters.productIsInStock(producto)) {
                const cartItem = state.items.find(item => item.id === producto.id);
                if (!cartItem) {
                    commit('pushProductToCart', producto.id)
                } else {
                    commit('incrementItemQuantity', cartItem)
                }
                commit('decrementProductInventory', producto);
            }
        },
        removeProductFromCart({commit, rootState}, productItem) {
            const product = rootState.productos.productos.find((product) => product.id === productItem.id);
            commit('removeProductFromCart', productItem);
            product.inventory += productItem.quantity;
        },
        decrementItemQuantity({commit, rootState}, productItem) {
            const producto = rootState.productos.productos.find(item=>item.id===productItem.id);
            commit('decrementItemQuantity', productItem);
            producto.inventory += 1;
        },
        checkout({state, commit}) {
            api.buyProducts(
                state.productos,
                () => {
                    commit('emptyCart');
                    commit('setCheckoutStatus', 'success');
                },
                () => {
                    commit('setCheckoutStatus', 'fail');
                }
            )
        }
    },
    getters: {
        productsOnCart(state, getters, rootState) {
            return state.items.map(item => {
                const producto = rootState.productos.productos.find(product => product.id === item.id);
                return {
                    id: producto.id,
                    price: producto.price,
                    title: producto.title,
                    quantity: item.quantity
                }
            });
        },
        cartTotal(state, getters) {
            let total = 0;
            getters.productsOnCart.forEach(product => {
                total += product.price * product.quantity;
            })
            return total.toFixed(2);
        },
        isCartEmpty(state){
            return (state.items.length === 0);
        }
    }
}
