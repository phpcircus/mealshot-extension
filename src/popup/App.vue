<template>
    <div class="extension">
        <div class="flex flex-col w-full bg-white h-60p">
            <h1 class="text-base font-semibold text-teal-800">
                Meal<span class="text-teal-500">SHOT</span>
            </h1>
            <h2 class="font-sigmar subpixel-antialiased text-lg text-teal-500 font-semibold mx-auto">Let Us Pick Your Meal</h2>
        </div>
        <div class="w-full flex flex-col bg-purple-500 p-4 text-left">
            <p v-if="geolocationError && useLocation === 'current'" class="w-full md:w-1/2 text-red-500 text-sm font-semibold px-4 py-2 bg-red-200 text-red-800 rounded mb-6 leading-snug" v-html="getLocationErrors()" />
            <label class="inline-flex items-center mr-4 mb-2">
                <input v-model="useLocation"
                        type="radio"
                        class="form-radio text-teal-800"
                        value="custom"
                        :checked="useLocation === 'custom'"
                >
                <span class="text-teal-800 font-semibold ml-1">Use custom location</span>
            </label>
            <label class="inline-flex items-center mb-4">
                <input v-model="useLocation" type="radio" class="form-radio text-teal-800"
                        value="current"
                        :checked="useLocation === 'current'"
                >
                <span class="text-teal-800 font-semibold ml-1">Use current location</span>
            </label>
            <p v-if="getLocationErrors() && useLocation === 'custom'" class="w-full md:w-1/2 text-red-500 text-sm font-semibold px-4 py-2 bg-red-200 text-red-800 rounded mb-6 leading-snug" v-html="getLocationErrors()" />
            <autocomplete-address v-if="useLocation === 'custom'" label="Enter address for the search area" @input="setCustomAddress" />
            <p class="text-xl font-bold uppercase text-teal-800 mt-4 mb-2">
                Meal Type
            </p>
            <div class="flex w-full">
                <label class="inline-flex justify-center items-center mr-4">
                    <input v-model="level" type="radio" class="form-radio text-teal-800"
                            value="100-1000-0009"
                            :checked="level === '100-1000-0009'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Fast Food</span>
                </label>
                <label class="inline-flex items-center mr-4">
                    <input v-model="level" type="radio" class="form-radio text-teal-800"
                            value="100-1000-0001"
                            :checked="level === '100-1000-0001'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Casual</span>
                </label>
                <label class="inline-flex items-center mr-4">
                    <input v-model="level" type="radio" class="form-radio text-teal-800"
                            value="100-1000-0002"
                            :checked="level === '100-1000-0002'"
                    >
                    <span class="text-teal-800 font-semibold ml-1">Fine Dining</span>
                </label>
            </div>
            <p class="text-xl font-bold uppercase text-teal-800 mt-4 mb-2">
                Search Range
            </p>
            <div class="flex">
                <select-input v-model="searchRadius" class="w-1/2" :errors="getErrors('searchRadius')">
                    <option :key="2" :value="2" :selected="searchRadius === 2">
                        2 Miles
                    </option>
                    <option :key="5" :value="5" :selected="searchRadius === 5">
                        5 Miles
                    </option>
                    <option :key="10" :value="10" :selected="searchRadius === 10">
                        10 Miles
                    </option>
                    <option :key="15" :value="15" :selected="searchRadius === 15">
                        15 Miles
                    </option>
                    <option :key="20" :value="20" :selected="searchRadius === 20">
                        20 Miles
                    </option>
                    <option :key="25" :value="25" :selected="searchRadius === 25">
                        25 Miles
                    </option>
                </select-input>
            </div>
            <p class="text-xl font-bold uppercase text-teal-800 mt-4 mb-2">
                Maximum number of results
            </p>
            <div class="flex">
                <select-input v-model="maxResults" class="mb-6 w-1/4" :errors="getErrors('maxResults')">
                    <option :key="1" :value="1" :selected="maxResults === 1">
                        1
                    </option>
                    <option :key="2" :value="2" :selected="maxResults === 2">
                        2
                    </option>
                    <option :key="3" :value="3" :selected="maxResults === 3">
                        3
                    </option>
                    <option :key="4" :value="4" :selected="maxResults === 4">
                        4
                    </option>
                    <option :key="5" :value="5" :selected="maxResults === 5">
                        5
                    </option>
                </select-input>
            </div>
            <loading-button class="bttn bttn-4 btn-sep items-center h-60p w-full group shadow-md" :disabled="pickingMeal" type="button" @clicked="pickMeal()">
                <icon-base icon-fill="fill-white" classes="mr-4 group-hover:fill-teal-100">
                    <food />
                </icon-base>
                Pick Meal!
            </loading-button>
        </div>
    </div>
</template>

<script>
const browser = require('webextension-polyfill');
import Food from 'SHARED/icons/Food';
import IconBase from 'SHARED/IconBase';
import TextInput from 'SHARED/TextInput';
import SelectInput from 'SHARED/SelectInput';
import LoadingButton from 'SHARED/LoadingButton';
import AutocompleteAddress from 'SHARED/AutocompleteAddress';

export default {
    components: {
        Food,
        IconBase,
        TextInput,
        SelectInput,
        LoadingButton,
        AutocompleteAddress,
    },
    props: {
        errors: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            useLocation: 'custom',
            gettingLocation: false,
            searchRadius: 2,
            level: '100-1000-0009',
            customLocationAddress: null,
            customLocationId: null,
            pickingMeal: false,
            initialCurrentLocation: null,
            currentLocation: null,
            maxResults: 1,
            geolocationError: null,
        };
    },
    watch: {
        useLocation: function (newValue, oldValue) {
            if (newValue === 'custom') {
                this.currentLocation = null;
            } else {
                this.customLocationAddress = null;
                this.customLocationId = null;
            }
        },
    },
    created () {
        this.$listen('locationSet', ({locationId, address}) => {
            this.customLocationAddress = address;
            this.customLocationId = locationId;
        });
    },
    methods: {
        async pickMeal (preserveState = true) {
            this.getCurrentLocation().then( () => {
                this.pickingMeal = true;
                if (this.useLocation === 'current') {
                    this.currentLocation = this.initialCurrentLocation;
                }
                this.$inertia.post(this.route('pick'), {
                    search: {
                        useLocation: this.useLocation,
                        customLocationId: this.customLocationId,
                        customLocationAddress: this.customLocationAddress,
                        currentLocation: this.currentLocation,
                        searchRadius: this.searchRadius,
                        level: this.level,
                        maxResults: this.maxResults,
                    },
                },{
                        preserveState: preserveState,
                        preserveScroll: true,
                }).then(() => this.pickingMeal = false);
            }).catch( () => {
                console.log('something went wrong');
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

                    this.initialCurrentLocation = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                    resolve();
                }, err => {
                    this.gettingLocation = false;
                    this.geolocationError = err.message;

                    reject();
                });
            });
        },
        getLocationErrors () {
            let custom = this.getErrors(this.errors, 'customLocationId');
            let current = this.getErrors(this.errors, 'currentLocation');

            if (custom && custom.length > 0) {
                return custom[0];
            }

            if (current && current.length > 0) {
                return current[0];
            }

            return '';
        },
        setCustomAddress (input) {
            if (this.customLocationId) {
                this.customLocationId = null;
            }

            this.customLocationAddress = input;
        },
    }
};
</script>

<style scoped>
p {
  font-size: 16px;
}
.extension {
  width: 300px;
  text-align: center;
}
</style>
