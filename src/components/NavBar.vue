<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="#">{{name}}</a>
        <button class="navbar-toggler" type="button" @click="showMenu = !showMenu">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div :class="'collapse navbar-collapse' + (showMenu ? ' show' : '')">
            <ul class="navbar-nav mr-auto">
                <li v-for="pageName in pages"
                    :class="'nav-item mr-2' + (pageName === currentPage ? ' active' : '')">
                    <a :class="'nav-link' + (pageName === currentPage ? ' disabled' : '')" href="#"
                       @click.prevent="onChange(pageName)">{{pageName}}</a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator';

@Component
export default class NavBar extends Vue {
    @Prop() private name !: string;
    @Prop() private pages !: string[];
    @Prop() private currentPage !: string;
    private showMenu = false;

    @Emit('onChange')
    public onChange(pageName: string) {
        // emit
    }
}
</script>

<style scoped>

</style>
