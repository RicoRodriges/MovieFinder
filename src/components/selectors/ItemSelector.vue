<template>
    <multiselect
        :loading="isLoading"
        :internal-search="false"
        :placeholder="placeholder"
        :options="items"
        @search-change="onChangeDebounce"
        @select="onSelect"
        :option-height="104"
        :show-labels="false"
        :preserveSearch="true"
    >
        <template v-slot:option="props">
            <slot name="default" v-bind:item="props.option"></slot>
        </template>
        <template v-slot:noOptions>{{ emptyPlaceholder }}</template>
        <template v-slot:noResult>{{ notFoundPlaceholder }}</template>
    </multiselect>
</template>

<script lang="ts">
import { debounce } from 'debounce';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';

@Component({
  components: {
    Multiselect,
  },
})
export default class ItemSelector<T> extends Vue {
    @Prop() private placeholder!: string;

    @Prop() private emptyPlaceholder!: string;

    @Prop() private notFoundPlaceholder!: string;

    @Prop() private suggest!: (text: string) => Promise<T[]>;

    @Prop() private changeDebounceTime!: number;

    private isLoading = false;

    private items: T[] = [];

    private onChangeDebounce!: ((text: string) => Promise<void>) & any;

    private created() {
      if (this.changeDebounceTime) {
        this.onChangeDebounce = debounce(this.onSearchCustom, this.changeDebounceTime);
      } else {
        this.onChangeDebounce = this.onSearchCustom;
      }
    }

    private beforeDestroy() {
      if (this.onChangeDebounce.clear) {
        this.onChangeDebounce.clear();
      }
    }

    private async onSearchCustom(text: string): Promise<void> {
      if (!this.isLoading) {
        try {
          this.isLoading = true;
          this.items = await this.suggest(text);
        } finally {
          this.isLoading = false;
        }
      }
    }

    @Emit('onSelect')
    private onSelect(item: T) {}
}
</script>

<style scoped></style>
