<script lang="ts">
	import { createCheckbox } from '@melt-ui/svelte';
	import Check from '~icons/lucide/check';
	import Minus from '~icons/lucide/minus';

	const { root, input, isChecked, isIndeterminate } = createCheckbox({
		checked: 'indeterminate',
	});
</script>

<form>
	<div class="flex items-center justify-center">
		<button
			{...$root}
			use:root
			class="flex h-6 w-6 appearance-none items-center justify-center rounded-sm bg-white text-magnum-600 shadow-lg hover:opacity-75"
			id="checkbox"
		>
			{#if $isIndeterminate}
				<Minus />
			{:else if $isChecked}
				<Check />
			{/if}
			<input {...$input} />
		</button>
		<label class="pl-[15px] text-[15px] leading-none text-white" for="checkbox">
			Accept terms and conditions.
		</label>
	</div>
</form>
