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
                            :class="{ active: !excludeMoviesFromSet }"
                            @click="excludeMoviesFromSet = !excludeMoviesFromSet"
                        >
                            {{
                                excludeMoviesFromSet
                                    ? $t("movie.showAll")
                                    : $t("movie.excludeMovies")
                            }}
                        </button>
                        <br />
                        <TagSelector
                            v-model="includedGenres"
                            :items="genres"
                            :placeholder="$t('filter.chooseGenresToInclude')"
                            :toName="genreToName"
                        />
                        <br />
                        <TagSelector
                            v-model="excludedGenres"
                            class="excluded-tags"
                            :items="genres"
                            :placeholder="$t('filter.chooseGenresToExclude')"
                            :toName="genreToName"
                        />
                        <br />
                        <YearRangePicker v-model="years" :min="yearRange[0]" :max="yearRange[1]" />
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
import TagSelector from '@/components/selectors/TagSelector.vue';
import YearRangePicker from '@/components/YearRangePicker.vue';
import Genre from '@/models/Genre';

export type Filters = {
    excludeMoviesFromSet: boolean;
    includedGenres: Genre[];
    excludedGenres: Genre[];
    years: [number | null, number | null] | null;
    sort: string;
};

@Component({
  components: {
    TagSelector,
    YearRangePicker,
  },
})
export default class MovieFilters extends Vue {
    @Prop() private value!: Filters;

    @Prop() private genres!: Genre[];

    @Prop() private sortOptions!: Array<{ id: string; n: string }>;

    @Prop() private yearRange!: [number, number];

    private get excludeMoviesFromSet(): boolean {
      return this.value.excludeMoviesFromSet;
    }

    private set excludeMoviesFromSet(v: boolean) {
      this.input({ ...this.value, excludeMoviesFromSet: v });
    }

    private get includedGenres(): Genre[] {
      return this.value.includedGenres;
    }

    private set includedGenres(v: Genre[]) {
      this.input({ ...this.value, includedGenres: v });
    }

    private get excludedGenres(): Genre[] {
      return this.value.excludedGenres;
    }

    private set excludedGenres(v: Genre[]) {
      this.input({ ...this.value, excludedGenres: v });
    }

    private get years(): [number | null, number | null] | null {
      return this.value.years;
    }

    private set years(v: [number | null, number | null] | null) {
      this.input({ ...this.value, years: v });
    }

    private get sort(): string {
      return this.value.sort;
    }

    private set sort(v: string) {
      this.input({ ...this.value, sort: v });
    }

    private genreToName(v: Genre): string {
      return v.name;
    }

    @Emit('input')
    private input(v: Filters) {}
}
</script>

<style>
.excluded-tags .multiselect__tag {
    background: #dc3545;
}
</style>
