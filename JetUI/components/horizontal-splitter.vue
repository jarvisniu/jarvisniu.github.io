<style>
@import "components/horizontal-splitter.css";
</style>

<template>
<div class="horizontal-splitter" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp">
    <div class="panel" style="flex: 1;">
        <slot name="left" style="height: 100%;"></slot>
    </div>
    <div class="splitter-handle">
        <div class="splitter-line"></div>
    </div>
    <div class="panel" style="flex: 1;">
        <slot name="right" style="height: 100%;"></slot>
    </div>
</div>
</template>

<script>
export default {
    data: function() {
        return {
            downOnSplitter: false,
            domHandle: null,
            domLeftPanel: null,
            domRightPanel: null
        }
    },
    props: ['theme'],
    methods: {
        onMouseDown: function(ev) {
            if (this.isDomOn(ev.target, this.domHandle)) {
                this.downOnSplitter = true;
            }
        },
        onMouseMove: function(ev) {
            if (this.downOnSplitter) this.moveSplitter(ev.movementX);
        },
        onMouseUp: function(ev) {
            this.downOnSplitter = false;
        },
        isDomOn: function(child, parent) {
            if (child == parent) return true;

            var p = child.parentNode;
            while (!(p instanceof HTMLBodyElement)) {
                if (p == parent) return true;
                p = p.parentNode;
            };
            return false;
        },
        getPxStyle: function(dom, style) {
            return parseFloat(getComputedStyle(dom)[style]);
        },
        moveSplitter: function(delta) {
            var widthLeft = this.getPxStyle(this.domLeftPanel, "width");
            var widthRight = this.getPxStyle(this.domRightPanel, "width");

            widthLeft += delta;
            widthRight -= delta;

            this.domLeftPanel.style.flexGrow = widthLeft / (widthLeft + widthRight);
            this.domRightPanel.style.flexGrow = widthRight / (widthLeft + widthRight);
        }
    },
    ready: function() {
        this.domHandle = this.$el.querySelector(".splitter-handle");
        this.domLeftPanel = this.$el.querySelectorAll(".panel")[0];
        this.domRightPanel = this.$el.querySelectorAll(".panel")[1];
    }
}
</script>
