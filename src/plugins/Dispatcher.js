import Dispatcher from '@/events/hub';

export default {
    install (Vue, options) {
        Vue.prototype.$dispatcher = Dispatcher;
        Vue.prototype.$listen = (event, callback) => Dispatcher.$on(event, callback);

        Vue.prototype.$dispatch = (event, data = null) => {
            Dispatcher.$emit(event, data)
        };
    },
}
