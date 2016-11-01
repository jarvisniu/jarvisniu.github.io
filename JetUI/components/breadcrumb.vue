<style>
@import "components/breadcrumb.css";
</style>

<template>
<div class="breadcrumb">
    <div class="breadcrumb-container">
        <template v-for="item in items">
            <icon-label :model="item"></icon-label>
            <div class="separator"></div>
        </template>
    </div>
</div>
</template>

<script>
export default {
    data: function() {
        return {
            items: [
                //        {
                //          icon: 'file.png',
                //          label: "three.js"
                //        }
            ]
        }
    },
    events: {}
}
</script>
