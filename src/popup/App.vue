<template>
    <div class="extension">
        <div class="flex flex-col w-full bg-white h-60p">
            <a href="https://mealshot.test/" target="_blank" class="flex group items-center justify-center">
                <h1 class="text-base font-semibold text-teal-800 group-hover:text-teal-500">
                    Meal
                </h1>
                <span class="text-base font-semibold text-teal-500 group-hover:text-teal-800">SHOT</span>
            </a>
            <h2 class="font-sigmar subpixel-antialiased text-lg text-teal-500 font-semibold mx-auto">Let Us Pick Your Meal</h2>
        </div>
        <search-form v-if="! showResults" />
        <results v-else-if="showResults" :restaurants="results" :restaurants-found="found" />
    </div>
</template>

<script>
const browser = require('webextension-polyfill');

import axios from 'axios';
import Results from './Results';
import Food from 'SHARED/icons/Food';
import SearchForm from './SearchForm';
import IconBase from 'SHARED/IconBase';
import TextInput from 'SHARED/TextInput';
import SelectInput from 'SHARED/SelectInput';
import LoadingButton from 'SHARED/LoadingButton';
import AutocompleteAddress from 'SHARED/AutocompleteAddress';

export default {
    components: {
        Food,
        Results,
        IconBase,
        TextInput,
        SearchForm,
        SelectInput,
        LoadingButton,
        AutocompleteAddress,
    },
    data () {
        return {
            showResults: false,
            results: null,
            found: false,
        }
    },
    created () {
        this.$listen('resultsReturned', (restaurants) => {
            this.showResults = true;
            if (restaurants.length) {
                this.found = true;
                this.results = restaurants;
            }
        });
        this.$listen('resultsClosed', () => {
            this.showResults = false;
            this.found = false;
            this.results = null;
        });
    },
    methods: {
        dismiss () {
            this.showResults = false;
        },
        pickAgain () {
            this.$dispatch('pickMeal');
            this.showResults = false;
        },
    },
};
</script>

<style scoped>
    .extension {
        width: 300px;
        text-align: center;
    }
</style>
