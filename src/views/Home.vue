<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <Calculation />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Calculation from "@/components/Calculation.vue";

@Options({
  components: {
    Calculation,
  },
})
export default class Home extends Vue {}
</script>
