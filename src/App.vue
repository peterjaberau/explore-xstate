<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import FlowMachine  from "@/views/flow-machine.vue";
import ToggleMachine from "@/views/toggle-machine.vue";


</script>

<template>


  <div class="grid grid-cols-2 gap-x-5">
    <flow-machine />
    <toggle-machine/>

  </div>





<!--  <RouterView />-->
</template>

<style scoped>

</style>
