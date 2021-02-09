<template>
	<div>
		<button @click="calculate">
			Hello
		</button>
	</div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
	methods: {
		calculate: () => {
			console.log("Hello");
		},
	},
})
export default class Calculation extends Vue {}
</script>
