<style>
@import "components/rotated-panel.css";
</style>

<template>
<div class="rotated-panel">
    <slot></slot>
</div>
</template>

<script>
export default {
    data: function() {
        return {
            childDom: null
        }
    },
    methods: {
        setTranslate: function(height) {
            this.$el.style.width = getComputedStyle(this.childDom).height;
            this.childDom.style.transform = "translateY(" + height + ") rotateZ(-90deg)";
            this.childDom.style.width = height;
        }
    },
    ready: function () {
        this.childDom = this.$el.children[0];
        var vm = this;
        var onResize = function(ev) {
            var h = getComputedStyle(vm.$el).height;
            vm.setTranslate(h);
        };
        window.addEventListener('resize', onResize);
        setInterval(onResize, 1);
    }
}
</script>
