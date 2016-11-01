<style>
@import "components/tab-bar.css";
</style>

<template>
<div class="tab-bar">
    <div class="tab-bar-container">
        <tab-button v-for="tab in tabs" :model="tab"></tab-button>
        <div class="tabbar-filler"></div>
    </div>
</div>
</template>

<script>
export default {
    data: function() {
        return {
            tabs: [
                //        {
                //          icon: 'js',
                //          label: "three.js",
                //          selected: false
                //        }
            ]
        }
    },
    events: {
        tabClick: function(button) {
            var tabs = this.$children;
            for (var i in tabs) {
                if (!tabs.hasOwnProperty(i)) continue;
                if (tabs[i] !== button) {
                    tabs[i].model.selected = false
                } else {
                    tabs[i].model.selected = true;
                    this.$dispatch("tabChanged", tabs[i].model.key);
                }
            }
        }
    },
    methods: {
        getTabButtonIndex: function(button) {
            return Array.prototype.indexOf.call(this.$el.children[0].children, button.$el);
        },
        isFirst: function(button) {
            return this.getTabButtonIndex(button) == 0;
        },
        isLast: function(button) {
            return this.getTabButtonIndex(button) == this.tabs.length - 1;
        },
        closeTab: function(button) {
            var index = this.getTabButtonIndex(button);

            var tabs = [];
            for (var i = 0; i < this.tabs.length; i++) tabs[i] = this.tabs[i];

            tabs.splice(index, 1);
            this.tabs = tabs;
        },
        getDesIndex: function(button) {
            var index = this.getTabButtonIndex(button);

            var delta = 0;
            var cIndex = index;
            if (button.left < 0) {
                for (var i = index - 1; i > -1; i--) {
                    var widthI = parseInt(window.getComputedStyle(this.$el.children[0].children[i]).width);
                    if (button.left < delta - widthI / 2) cIndex = i;
                    delta -= widthI;
                }
            } else {
                for (var i = index + 1; i < this.tabs.length; i++) {
                    var widthI = parseInt(window.getComputedStyle(this.$el.children[0].children[i]).width);
                    if (button.left > delta + widthI / 2) cIndex = i;
                    delta += widthI;
                }
            }
            return cIndex;
        },
        adjuctTabs: function(button) {
            var index = this.getTabButtonIndex(button);
            var desIndex = this.getDesIndex(button);
            var width = parseFloat(window.getComputedStyle(button.$el).width);
            for (var i = 0; i < this.tabs.length; i++) {
                if (i != index) {
                    if ((index - i) * (desIndex - i) <= 0)
                        this.$children[i].left = width * Math.sign(index - i);
                    else
                        this.$children[i].left = 0;
                }
            }
        },
        resetAllTabs: function(button) {
            for (var i = 0; i < this.tabs.length; i++) {
                this.$children[i].left = 0;
                this.$children[i].isMouseDown = false;
            }
        },
        reindexTabs: function(button) {
            var index = this.getTabButtonIndex(button);
            var desIndex = this.getDesIndex(button);

            var tabs = [];
            for (var i = 0; i < this.tabs.length; i++) tabs[i] = this.tabs[i];

            var tmp = tabs.splice(index, 1)[0];
            tabs.splice(desIndex, 0, tmp);

            tmp = this.$children.splice(index, 1)[0];
            this.$children.splice(desIndex, 0, tmp);

            this.tabs = tabs;
        }
    }
}
</script>
