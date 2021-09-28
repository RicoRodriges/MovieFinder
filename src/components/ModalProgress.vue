<template>
<div>
    <div class="modal show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-xl">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="progress">
                        <div
                            class="progress-bar progress-bar-striped progress-bar-animated"
                            :style="{ width: progress + '%' }"
                        >
                            {{ progress + "%" }}
                        </div>
                    </div>
                    <div class="text-center mt-1">{{ ready }} / {{ total }}</div>
                    <div class="text-center mt-3">{{ $t('general.loading') }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop show"></div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ModalProgress extends Vue {
    @Prop() private ready!: number;

    @Prop() private total!: number;

    private get progress(): number {
      return Math.floor((this.ready * 100) / this.total);
    }
}
</script>

<style scoped></style>
