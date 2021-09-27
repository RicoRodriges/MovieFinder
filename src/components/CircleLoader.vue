<template>
    <div class="circle-wrapper">
        <div id="circle">
            <div class="loader">
                <div class="loader">
                    <div class="loader">
                        <div class="loader">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class CircleLoader extends Vue {}
</script>

<style scoped>
.circle-wrapper {
    position: relative;
    margin: auto;
    width: 150px;
    height: 150px;
}

.circle-wrapper > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
}

.loader {
    width: calc(100% - 0px);
    height: calc(100% - 0px);
    border: 8px solid #162534;
    border-top: 8px solid #09f;
    border-radius: 50%;
    animation: rotate 5s linear infinite;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
</style>
