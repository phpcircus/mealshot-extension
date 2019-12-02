import Vue from 'vue';

const state = Vue.observable({
    useLocation: 'custom',
    searchRadius: 2,
    level: '100-1000-0009',
    customLocationAddress: null,
    customLocationId: null,
    initialCurrentLocation: null,
    currentLocation: null,
    maxResults: 1,
});

export const getters = {
    getUseLocation: () => state.useLocation,
    getSearchRadius: () => state.searchRadius,
    getLevel: () => state.level,
    getCustomLocationAddress: () => state.customLocationAddress,
    getCustomLocationId: () => state.customLocationId,
    getInitialCurrentLocation: () => state.initialCurrentLocation,
    getCurrent: () => state.currentLocation,
    getMaxResults: () => state.maxResults,
};

export const mutations = {
    setUseLocation: value => state.useLocation = value,
    setSearchRadius: value => state.searchRadius = value,
    setLevel: value => state.level = value,
    setCustomLocationAddress: value => state.customLocationAddress = value,
    setCustomLocationId: value => state.customLocationId = value,
    setInitialCurrentLocation: value => state.initialCurrentLocation = value,
    setCurrentLocation: value => state.currentLocation = value,
    setMaxResults: value => state.maxResults = value,
    setCustomLocation: value => {
        if (state.customLocationId) {
            state.customLocationId = null;
        }
        state.customLocationAddress = value;
    },
    setDefaultState: () => {
        state.useLocation = 'custom';
        state.searchRadius = 2;
        state.level = '100-1000-0009';
        state.customLocationAddress = null;
        state.customLocationId = null;
        state.initialCurrentLocation = null;
        state.currentLocation = null;
        state.maxResults = 1;
    },
};
