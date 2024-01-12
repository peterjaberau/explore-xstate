<script setup lang="ts">
import { ref } from 'vue'
import { useActorRef, useSelector } from "@xstate/vue";
import { scannerMachine } from "@/machines/scanner/scannerMachine"

// ['START_SCAN', 'RESTART']

const localState = ref({})
localState.value = {
  'basePath': 'c:/docs',
  'destinationPath': 'd:/mydocs',
};

const actorRef = useActorRef(scannerMachine, {  input: localState.value  });
const selectorRef = useSelector(actorRef, (s) => s);


</script>

<template>

  <div class="shadow">
    <div class="font-bold p-3">Scanner machine</div>
    <div class="flex flex-col h-full justify-start">
      <div class="flex flex-row  p-3">
        <div class="flex-1">Current State</div>
        <div class="flex-1 text-red-600 font-bold text-sm">{{selectorRef.value}}</div>
      </div>
      <div class="px-5">
<!--                       v-model="localState.applicant.age"-->
        <input class="p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          type="text"
        />
      </div>
      <div class="flex flex-row justify-center p-2">
        <button type="button" class="rounded bg-white mx-1 px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            @click="() => actorRef.send({ type: 'START_SCAN'  })"
        >
          START_SCAN
        </button>
        <button type="button" class="rounded bg-white mx-1 px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                @click="() => actorRef.send({ type: 'RESTART'  })"
        >
          RESTART
        </button>
      </div>
      <div class="flex flex-row flex-1 h-full bg-gray-50  font-mono text-xs p-3">
        <div class="flex flex-col">
          <div class="p-3 border-solid border-2 border-gray-300">
            snapshot
            {{selectorRef}}
          </div>
          <div class="p-3 border-solid border-2 border-gray-300">
            output
            {{selectorRef.output}}
          </div>

        </div>


      </div>
    </div>
  </div>


</template>

<style scoped>

</style>
