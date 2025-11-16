<script lang="ts">
	let counter = $state(2);
</script>

<button onclick={() => (counter += 1)}>{counter}</button>
{new Date().toLocaleString()}
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
