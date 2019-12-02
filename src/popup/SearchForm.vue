<template>
    <div>
        <div class="w-full flex flex-col bg-purple-400 p-4 text-left">
            <p v-if="geolocationError && getUseLocation === 'current'" class="w-full md:w-1/2 text-red-500 text-sm font-semibold px-4 py-2 bg-red-200 text-red-800 rounded mb-6 leading-snug" v-html="getLocationErrors()" />
            <div class="flex justify-between">
                <label class="inline-flex items-center mb-2">
                    <input v-model="useLocation"
                            type="radio"
                            class="form-radio text-teal-800"
                            value="custom"
                            :checked="getUseLocation === 'custom'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Use custom location</span>
                </label>
                <label class="inline-flex items-center mb-2">
                    <input v-model="useLocation" type="radio" class="form-radio text-teal-800"
                            value="current"
                            :checked="getUseLocation === 'current'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Use current location</span>
                </label>
            </div>
            <p v-if="hasValidationErrors" class="w-full text-red-500 text-sm font-semibold px-4 py-2 bg-red-200 text-red-800 rounded mb-2 leading-snug" v-html="getValidationError()" />
            <autocomplete-address v-if="getUseLocation === 'custom'" label="Enter address for the search area" :value="getCustomLocationAddress ? getCustomLocationAddress : ''" :parent-errors="validationErrors" @input="setCustomLocation" />
            <p class="text-base font-bold uppercase text-teal-800 mt-4 mb-2">
                Meal Type
            </p>
            <div class="flex w-full">
                <label class="inline-flex justify-center items-center mr-4">
                    <input v-model="level" type="radio" class="form-radio text-teal-800"
                            value="100-1000-0009"
                            :checked="getLevel === '100-1000-0009'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Fast Food</span>
                </label>
                <label class="inline-flex items-center mr-4">
                    <input v-model="level" type="radio" class="form-radio text-teal-800"
                            value="100-1000-0001"
                            :checked="getLevel === '100-1000-0001'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Casual</span>
                </label>
                <label class="inline-flex items-center mr-4">
                    <input v-model="level" type="radio" class="form-radio text-teal-800"
                            value="100-1000-0002"
                            :checked="getLevel === '100-1000-0002'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Fine Dining</span>
                </label>
            </div>
            <p class="text-base font-bold uppercase text-teal-800 mt-4 mb-2">
                Search Range
            </p>
            <div class="flex">
                <select-input v-model="searchRadius" class="w-1/2" :errors="hasValidationErrors ? getErrors(validationErrors, 'searchRadius') : []">
                    <option :key="2" :value="2" :selected="getSearchRadius === 2">
                        2 Miles
                    </option>
                    <option :key="5" :value="5" :selected="getSearchRadius === 5">
                        5 Miles
                    </option>
                    <option :key="10" :value="10" :selected="getSearchRadius === 10">
                        10 Miles
                    </option>
                    <option :key="15" :value="15" :selected="getSearchRadius === 15">
                        15 Miles
                    </option>
                    <option :key="20" :value="20" :selected="getSearchRadius === 20">
                        20 Miles
                    </option>
                    <option :key="25" :value="25" :selected="getSearchRadius === 25">
                        25 Miles
                    </option>
                </select-input>
            </div>
            <p class="text-base font-bold uppercase text-teal-800 mt-4 mb-2">
                Max results
            </p>
            <div class="flex mb-4">
                <select-input v-model="maxResults" class="w-1/4" :errors="hasValidationErrors ? getErrors(validationErrors, 'maxResults') : []">
                    <option :key="1" :value="1" :selected="getMaxResults === 1">
                        1
                    </option>
                    <option :key="2" :value="2" :selected="getMaxResults === 2">
                        2
                    </option>
                    <option :key="3" :value="3" :selected="getMaxResults === 3">
                        3
                    </option>
                    <option :key="4" :value="4" :selected="getMaxResults === 4">
                        4
                    </option>
                    <option :key="5" :value="5" :selected="getMaxResults === 5">
                        5
                    </option>
                </select-input>
            </div>
            <div class="flex justify-between items-center w-full">
                <loading-button class="bttn bttn-4 btn-sep items-center h-40p w-1/2 group shadow-md" :loading="pickingMeal" type="button" @clicked="pickMeal()">
                    <icon-base icon-fill="fill-white" classes="mr-2 group-hover:fill-teal-100">
                        <food />
                    </icon-base>
                    Pick!
                </loading-button>
                <button class="btn btn-text uppercase w-1/3 mt-4" @click="resetForm()">
                    Reset
                </button>
            </div>
        </div>
    </div>
</template>

<script>
const browser = require('webextension-polyfill');

import axios from 'axios';
import Results from './Results';
import { isEmpty } from 'lodash';
import Food from 'SHARED/icons/Food';
import SearchForm from './SearchForm';
import IconBase from 'SHARED/IconBase';
import TextInput from 'SHARED/TextInput';
import SelectInput from 'SHARED/SelectInput';
import LoadingButton from 'SHARED/LoadingButton';
import { getters, mutations } from './store.js';
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
    data() {
        return {
            gettingLocation: false,
            pickingMeal: false,
            geolocationError: null,
            validationErrors: null,
        };
    },
    computed: {
        ...getters,
        hasValidationErrors () {
            return ! isEmpty(this.validationErrors);
        },
        useLocation: {
            set (value) {
                this.setUseLocation(value);
            },
            get () {
                return this.getUseLocation;
            },
        },
        level: {
            set (value) {
                this.setLevel(value);
            },
            get () {
                return this.getLevel;
            },
        },
        searchRadius: {
            set (value) {
                this.setSearchRadius(value);
            },
            get () {
                return this.getSearchRadius;
            },
        },
        maxResults: {
            set (value) {
                this.setMaxResults(value);
            },
            get () {
                return this.getMaxResults;
            },
        },
    },
    watch: {
        useLocation: function (newValue, oldValue) {
            if (newValue === 'custom') {
                this.setCurrentLocation(null);
            } else {
                this.setCustomLocationAddress(null);
                this.setCustomLocationId(null);
            }
        },
    },
    created () {
        this.$listen('locationSet', ({locationId, address}) => {
            this.setCustomLocationAddress(address);
            this.setCustomLocationId(locationId);
        });
    },
    methods: {
        ...mutations,
        async pickMeal (preserveState = true) {
            if (this.getUseLocation === 'current') {
                this.getCurrentLocation().then( (location) => {
                    this.setCurrentLocation(location);
                    this.pickingMeal = true;
                    this.callMealShotApi();
                }).catch( error => {
                    console.log(error);
                });
            } else {
                this.callMealShotApi();
            }
        },
        callMealShotApi () {
            axios.post('https://mealshot.test/api/pick', {
                search: {
                    useLocation: this.getUseLocation,
                    customLocationId: this.getCustomLocationId,
                    customLocationAddress: this.getCustomLocationAddress,
                    currentLocation: this.getCurrent,
                    searchRadius: this.getSearchRadius,
                    level: this.getLevel,
                    maxResults: this.getMaxResults,
                },
            }).then(response => {
                this.$dispatch('resultsReturned', response.data.restaurants);
                this.pickingMeal = false;
            }).catch(errors => {
                this.validationErrors = errors.response.data.errors;
            });
        },
        getCurrentLocation () {
            return new Promise( (resolve, reject) => {
                if(! ('geolocation' in navigator)) {
                    this.geolocationError = 'Geolocation is not available.';

                    reject();
                }

                this.gettingLocation = true;

                navigator.geolocation.getCurrentPosition(pos => {
                    this.gettingLocation = false;

                    this.setInitialCurrentLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
                    resolve(this.getInitialCurrentLocation);
                }, err => {
                    this.gettingLocation = false;
                    this.geolocationError = err.message;

                    reject();
                });
            });
        },
        getValidationError () {
            let custom = this.getErrors(this.validationErrors, 'customLocationId');
            let current = this.getErrors(this.validationErrors, 'currentLocation');
            let throttle = this.getErrors(this.validationErrors, 'throttle');

            if (custom && custom.length > 0) {
                return custom[0];
            }

            if (current && current.length > 0) {
                return current[0];
            }

            if (throttle && throttle.length > 0) {
                return throttle[0];
            }

            return '';
        },
        resetForm () {
            this.setDefaultState();
            this.$dispatch('stateResetInitiated');
        },
    }
};
</script>
