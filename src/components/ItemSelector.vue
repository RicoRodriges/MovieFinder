<template>
    <multiselect :loading="isLoading"
                 :internal-search="false"
                 :placeholder="placeholder"
                 :options="items"
                 @search-change="onSearchCustom"
                 @select="onSelect"
                 :option-height="104"
                 :show-labels="false"
                 :preserveSearch="true">
        <template v-slot:option="props">
            <slot name="default" v-bind:item="props.option"></slot>
        </template>
        <template v-slot:noOptions>{{ emptyPlaceholder }}</template>
        <template v-slot:noResult>{{ notFoundPlaceholder }}</template>
    </multiselect>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import Multiselect from 'vue-multiselect';

    @Component({
        components: {
            Multiselect,
        },
    })
    export default class ItemSelector extends Vue {
        @Prop() private placeholder!: string;
        @Prop() private emptyPlaceholder!: string;
        @Prop() private notFoundPlaceholder!: string;
        @Prop() private onSearchChange!: (text: string) => Promise<any>;
        @Prop() private onSelect!: (item: any) => void;
        private isLoading = false;
        private items = [];

        private onSearchCustom(text: string) {
            this.isLoading = true;
            this.onSearchChange(text)
                .then((v) => {
                    this.items = v;
                    this.isLoading = false;
                });
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>

</style>
