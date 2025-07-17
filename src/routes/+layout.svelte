<script lang="ts">
    import '../app.css';
	let { children } = $props();
</script>
<div> 
	<main>
    	{@render children()}
	</main>
</div>
<style>
	main {
		min-width: 350px;
		overflow-x: hidden;
	}
</style>