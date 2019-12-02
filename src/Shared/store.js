import Vue from 'vue';

const state = Vue.observable({
    autocompleteFound: false,
});

export const getters = {
    getAutocompleteFound: () => state.autocompleteFound,
};

export const mutations = {
    setAutocompleteFound: value => state.autocompleteFound = value,
    setDefaultState: () => {
        state.autocompleteFound = false;
    },
};
