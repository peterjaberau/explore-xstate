<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import FlowMachine  from "@/views/flow-machine.vue";
import ToggleMachine from "@/views/toggle-machine.vue";
import ScannerMachine from "@/views/scanner-machine.vue";


</script>

<template>


  <div class="grid grid-cols-4 gap-x-5 p-10">
    <flow-machine />
    <toggle-machine/>
    <scanner-machine/>

<!--      <div class="col-span-2 max-h-60 overflow-hidden rounded-lg bg-white shadow ">-->
<!--        <div class="px-4 py-5 sm:p-6">-->
<!--          <h3 class="text-lg leading-6 font-medium text-gray-900">-->
<!--            Logs-->
<!--          </h3>-->
<!--          <div class="mt-2 max-h-60 overflow-hidden text-sm text-gray-500">-->
<!--            <p>-->
<!--              * This is a flow machine-->
<!--            </p>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

  </div>






<!--  <RouterView />-->
</template>

<style scoped>

</style>
