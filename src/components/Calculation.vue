<template>
  <div>
    <input type="file" @change="previewFiles" multiple />
    <button @click="calculate">Hello</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { calculate } from "@/helpers/calculator";

export default defineComponent({
  data() {
    return {
      files: [] as File[],
    };
  },
  methods: {
    previewFiles(event: Event) {
      const fileList = (event.target as HTMLInputElement).files;

      if (fileList === null) return;

      for (const file of fileList) {
        this.files.push(file);
      }
    },
    calculate() {
      calculate(this.files, [], true).then((models) => {
        if (models.isErr()) {
          console.log(models.error.message);
          return;
        }

        console.log(models.value);
      });
    },
  },
});
</script>
