<!-- Popup.svelte -->
<script>
  export let show = false;
  export let onClose = () => {};
</script>

{#if show}
  <div class="overlay">
    <div class="popup">
      <h2>Api ID คืออะไร</h2>
      <p>คุณสามารถรับ Api key ได้จากเว็บไซต์ AIForThai</p>
      <p><a href="https://www.aiforthai.in.th">aiforthai.in.th</a></p>
      <button on:click={onClose}>Close</button>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    background: none; /* ไม่ต้องมีพื้นหลังมืด */
  }

  .popup {
    background: white;
    padding: 1rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 0 10px rgba(0,0,0,0.25);
  }
</style>

