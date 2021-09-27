<template>
    <multiselect :customLabel="toName"
                 :taggable="true"
                 :showLabels="false"
                 :multiple="true"
                 :options="items"
                 @select="onSelect"
                 @remove="onRemove"
                 :placeholder="placeholder"
                 :value="value">
    </multiselect>
</template>

<script lang="ts">
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component({
    components: {
        Multiselect,
    },
})
export default class TagSelector<T> extends Vue {
    @Prop() private placeholder!: string;
    @Prop() private items!: T[];
    @Prop() private value!: T[];
    @Prop() private toName!: (x: T) => string;

    @Emit('input')
    private input(items: T[]) {
        return;
    }

    private onSelect(item: T) {
        this.input([...this.value, item]);
    }

    private onRemove(item: T) {
        this.input(this.value.filter(v => v !== item));
    }
}
</script>

<style scoped>

</style>
