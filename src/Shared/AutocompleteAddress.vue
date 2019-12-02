<template>
    <div class="w-full relative">
        <text-input v-model="input" :errors="getErrors(parentErrors, field)" class="w-full mt-px mr-4"
                    placeholder="123 Easy St. Beverly Hills, CA 90210"
                    :label="label"
                    label-class="text-sm text-white"
                    autocomplete="off"
                    @input="handleInput()"
        />
        <div v-if="results.length > 0" class="flex flex-col bg-white border border-gray-500 absolute top-16 w-full p-2 mb-4 z-20">
            <div v-for="suggestion in results" :key="suggestion.locationId" class="w-full mb-1 px-2 py-2 border-b border-gray-400 cursor-pointer last:mb-0 hover:bg-blue-500 group">
                <span class="block text-xs text-gray-700 font-semibold whitespace-no-wrap overflow-hidden group-hover:text-white" @click="setAddress(suggestion)">
                    {{ suggestion.address.houseNumber }} {{ suggestion.address.street }} {{ suggestion.address.city }}, {{ suggestion.address.state }} {{ suggestion.address.postalCode }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { debounce } from 'lodash';
import TextInput from 'SHARED/TextInput';
import { getters, mutations } from 'SHARED/store.js';

export default {
    components: {
        TextInput,
    },
    props: {
        field: {
            type: String,
            default: () => 'address',
        },
        label: {
            type: String,
            default: () => 'Address',
        },
        parentErrors: {
            type: [Array,Object],
            default: () => ({}),
        },
        value: {
            type: String,
            default: () => '',
        },
    },
    data () {
        return {
            input: null,
            options: null,
            results: [],
        }
    },
    computed: {
        ...getters,
    },
    watch: {
        input: function (newInput, oldInput) {
            this.debounceAutosuggest();
        },
    },
    created () {
        this.$listen('stateResetInitiated', () => {
            this.setDefaultState();
            this.input = null;
            this.results = [];
        });

        if (this.value) {
            this.input = this.value;
        }

        this.debounceAutosuggest = debounce(this.callHereAutosuggest, 500);
    },
    methods: {
        ...mutations,
        handleInput () {
            this.setAutocompleteFound(false);
            this.$emit('input', this.input);
        },
        callHereAutosuggest () {
            if (! this.getAutocompleteFound) {
                axios.post('https://mealshot.test/api/location/autocomplete', { search: this.input }).then(response => {
                    this.results = response.data.autocomplete;
                });
            }
        },
        setAddress (suggestion) {
            this.input = `${suggestion.address.houseNumber} ${suggestion.address.street} ${suggestion.address.city}, ${suggestion.address.state} ${suggestion.address.postalCode}`;
            this.results = [];
            this.setAutocompleteFound(true);

            this.$dispatch('locationSet', { locationId: suggestion.locationId, address: this.input });
        },
    },
}
</script>
