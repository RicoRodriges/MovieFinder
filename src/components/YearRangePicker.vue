<template>
    <div>
        <div class="text-center">
            <label>{{ $t("filter.year") }}</label>
            <input
                :value="start"
                @input="onStartChange"
                type="text"
                class="form-control d-inline-block"
                :class="{ 'is-invalid': !isStartValid }"
                style="width:6rem;"
                :placeholder="min.toString()"
            />
            -
            <input
                :value="end"
                @input="onEndChange"
                type="text"
                class="form-control d-inline-block"
                :class="{ 'is-invalid': !isEndValid }"
                style="width:6rem;"
                :placeholder="max.toString()"
            />
        </div>
        <div v-if="!isStartValid || !isEndValid" class="invalid-feedback d-block">
            {{ $t("filter.validYearRange", { min, max }) }}
        </div>
    </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';

@Component
export default class YearRangePicker extends Vue {
    @Prop() private value!: [number | null, number | null] | null;

    @Prop() private min!: number;

    @Prop() private max!: number;

    private start!: number | null;

    private end!: number | null;

    private isStartValid!: boolean;

    private isEndValid!: boolean;

    private created() {
      if (this.value === null) {
        [this.start, this.end] = [null, null];
      } else {
        [this.start, this.end] = [
          this.value[0] ? this.value[0] : null,
          this.value[1] ? this.value[1] : null,
        ];
      }
      [this.isStartValid, this.isEndValid] = this.valid();
    }

    private onStartChange(e: Event) {
      const val = YearRangePicker.normalizeInt((e.target as HTMLInputElement).value);
      if (val !== undefined) {
        this.start = val;
        this.onRangeChange();
      }
      this.$forceUpdate();
    }

    private onEndChange(e: Event) {
      const val = YearRangePicker.normalizeInt((e.target as HTMLInputElement).value);
      if (val !== undefined) {
        this.end = val;
        this.onRangeChange();
      }
      this.$forceUpdate();
    }

    private onRangeChange() {
      [this.isStartValid, this.isEndValid] = this.valid();
      if (this.isStartValid && this.isEndValid) {
        if (this.start === null && this.end === null) {
          this.input(null);
        } else {
          this.input([this.start, this.end]);
        }
      }
    }

    private valid(): [boolean, boolean] {
      const v0 = this.start;
      const v1 = this.end;

      const v0Valid = v0 === null || (v0 >= this.min && v0 <= this.max);
      const v1Valid = v1 === null || (v1 >= this.min && v1 <= this.max);
      const validRange = v0 === null || v1 === null || v0 <= v1;
      return [v0Valid && validRange, v1Valid && validRange];
    }

    private static normalizeInt(v: string): number | null | undefined {
      v = v.trim();
      if (v === '') return null;
      if (!/^[0-9]+$/.test(v)) return undefined;
      return parseInt(v.trim(), 10);
    }

    @Emit('input')
    private input(v: [number | null, number | null] | null) {}
}
</script>

<style scoped></style>
