<script lang="ts">
	let counter = $state(2);
	const date = new Date();
</script>

<button onclick={() => (counter += 1)}>{counter}</button>
{date.toLocaleString()}
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
