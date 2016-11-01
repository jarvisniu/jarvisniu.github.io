<style>
@import "components/tab-button.css";
</style>

<template>
<div class="tab-button" :class="{selected: model.selected}" :style="{left: left + 'px'}" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp">
    <img :src="model.icon">
    <span class="tab-button-label"></span>
    <span class="tab-button-close" @click="onCloseDown"></span>
</div>
</template>

<script>
export default {
    props: [
        'model'
    ],
    data: function() {
        return {
            pixelRatio: window.devicePixelRatio || 1,
            isMouseDown: false,
            left: 0
        }
    },
    methods: {
        getTabWidth: function(dom) {
            return parseInt(window.getComputedStyle(dom).width);
        },
        onMouseDown: function(ev) {
            // move
            this.isMouseDown = true;
            this.mouseDownAtScreenX = ev.screenX / this.pixelRatio - this.left;

            this.$dispatch("tabClick", this);
        },
        onMouseMove: function(ev) {
            if (this.isMouseDown) {
                this.left = ev.screenX / this.pixelRatio - this.mouseDownAtScreenX;
                this.$parent.adjuctTabs(this);
            }
        },
        onMouseUp: function(ev) {
            this.$parent.reindexTabs(this);
            this.$parent.resetAllTabs();
        },
        onCloseDown: function(ev) {
            this.$parent.closeTab(this);
        }
    },
    ready: function() {
        this.$el.querySelector('span').innerText = this.model.label;
        this.$dispatch("childChanged");
    }
}
</script>
