<template>
    <div class="flex flex-col">
        <div class="flex flex-col bg-purple-800 w-full text-center py-4">
            <template v-if="restaurantsFound">
                <h1 class="font-sigmar text-white text-2xl uppercase mb-4">{{ heading }}</h1>
                <div v-for="restaurant in restaurants" :key="restaurant.id" class="flex flex-col mb-4">
                    <a :href="restaurant.share" target="_blank" class="text-white text-2xl mb-2 underline hover:text-teal-300">{{ restaurant.title }}</a>
                    <p class="text-white text-sm" v-html="restaurant.address" />
                </div>
            </template>
            <template v-else class="mb-4">
                <p class="text-white text-xl px-2 mb-2">Sorry, no restaurants found.</p>
                <p class="text-teal-200 text-base px-2"> Try changing your options...</p>
            </template>
        </div>
        <div class="bg-white mx-8 my-4">
            <div class="w-full mb-12">
                <div class="flex justify-between px-4">
                    <button type="button" class="btn btn-text text-gray-900 hover:text-gray-500"
                            @click="close()"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        restaurantsFound: {
            type: Boolean,
            default: () => false,
        },
        restaurants: {
            type: Array,
            default: () => [],
        },
    },
    data () {
        return {
            heading: `Your results...`,
        }
    },
    methods: {
        close () {
            this.$dispatch('resultsClosed');
        },
    },
}
</script>

<style scoped>
    p {
        font-size: 16px;
    }
</style>
