<script setup lang="ts">
import { ref } from 'vue'
import { useActorRef, useSelector } from "@xstate/vue";
import {toggleMachine} from "@/machines/toggle/toggleMachine";

const actorRef = useActorRef(toggleMachine, );
const selectorRef = useSelector(actorRef, (s) => s);

</script>

<template>

  <div class="shadow">
    <div class="font-bold p-3">Toggle</div>
    <div class="flex flex-col h-full">
      <div class="flex flex-row  p-3">
        <div class="flex-1">Current State</div>
        <div class="flex-1 text-red-600 font-bold text-sm">{{selectorRef.value}}</div>
      </div>
      <div class="px-5">
        <input class="p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
               value=""
               type="text"
        />
      </div>
      <div class="flex flex-row justify-center p-2">
        <button type="button" class="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
         @click="() => actorRef.send({type: 'toggle'})"
        >
          Trigger
        </button>
      </div>
      <div class="flex flex-row flex-1 h-full bg-gray-50  font-mono text-xs p-3">
        {{selectorRef}}
      </div>
    </div>
  </div>


</template>

<style scoped>

</style>
