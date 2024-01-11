<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { useActorRef, useSelector } from "@xstate/vue";
import { toggleMachine } from "@/machines/toggle/toggleMachine"

const actorToggleRef = useActorRef(toggleMachine);
const selectorToggleRef = useSelector(actorToggleRef, (s) => s);

</script>

<template>
  {{selectorToggleRef}}
  <button @click="() => actorToggleRef.send({type: 'toggle'})" type="button">Toggle</button>

<!--  <RouterView />-->
</template>

<style scoped>

</style>
