<template>
    <div class="row">
        <div class="col-md-6 col-12">
            <div class="card mx-auto my-2" style="max-width: 40rem;">
                <div class="card-body">
                    <div class="card-title">
                        <img src="@/assets/filter.svg" class="mx-2" style="height: 1.8rem;" />
                        {{ $t("filter.filters") }}
                    </div>
                    <div class="card-text">
                        <button
                            type="button"
                            class="btn btn-outline-danger my-3"
                            :class="{ active: !excludeActorsFromSet }"
                            @click="excludeActorsFromSet = !excludeActorsFromSet"
                        >
                            {{
                                excludeActorsFromSet
                                    ? $t("actor.showAll")
                                    : $t("actor.excludeMovies")
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-12">
            <div class="card mx-auto my-2" style="max-width: 40rem;">
                <div class="card-body">
                    <div class="card-title">
                        <img src="@/assets/sort.svg" class="mx-2" style="height: 1.8rem;" />
                        {{ $t("filter.sort") }}
                    </div>
                    <div class="card-text">
                        {{ $t("filter.sortBy") }}
                        <select
                            v-model="sort"
                            class="form-control form-control-sm d-inline ml-2"
                            style="max-width: 10rem;"
                        >
                            <option value="" disabled>{{ $t("general.chooseOptions") }}</option>
                            <option
                                v-for="o in sortOptions"
                                :key="o.id"
                                :value="o.id"
                                :selected="o.id === sort"
                                >{{ $t(o.n) }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';

export type Filters = {
    excludeActorsFromSet: boolean;
    sort: string;
};

@Component
export default class ActorFilters extends Vue {
    @Prop() private value!: Filters;

    @Prop() private sortOptions!: Array<{ id: string; n: string }>;

    private get excludeActorsFromSet(): boolean {
      return this.value.excludeActorsFromSet;
    }

    private set excludeActorsFromSet(v: boolean) {
      this.input({ ...this.value, excludeActorsFromSet: v });
    }

    private get sort(): string {
      return this.value.sort;
    }

    private set sort(v: string) {
      this.input({ ...this.value, sort: v });
    }

    @Emit('input')
    private input(v: Filters) {}
}
</script>

<style scoped></style>
