import { has, get } from 'lodash';

export default {
    data () {
        return {
            errorBag: 'default',
        }
    },
    methods: {
        getErrors (errors, field) {
            // if the errors contain the expected errors, we get those
            // errors & assign to a variable for further processing
            if ('default' === this.errorBag) {
                if (has(errors, field)) {
                    return get(errors, field);
                }
                return;
            }

            if (has(errors, this.errorBag)) {
                let errorBag = get(errors, this.errorBag);

                // if the field we need is present in the errors we
                // return the associated error to the component
                if (has(errorBag, field)) {
                    return get(errorBag, field);
                }
            }

            return [];
        },
    },
}
