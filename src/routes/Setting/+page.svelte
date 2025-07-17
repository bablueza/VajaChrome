
<script lang="ts">
  import config from '$lib/configs/api.json';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import magnifier_icon from '$lib/img/magnifier.svg';
  import Popup from '$lib/component/Popup.svelte';
  import { checkKey } from '$lib/ts/api/checkApikey';
  
  let grpc_url = config.socket_url;
  let key_id = '';
  let newKey = '';
  const rateArrey = ["x-low", "low", "100%", "high", "x-high"];
  let slideRate = 3
  let voice_name = config.speaker;
  let voiceList = ["nana","noina","farah","mewzy","farsai","prim","ped","poom","doikham","praw","wayu","namphueng","toon","sanooch","thanwa"];

  let showPopup = false;
  onMount(() => {
      if (browser) {
          grpc_url = localStorage.getItem('url') || config.socket_url;
          key_id = localStorage.getItem('key') || '';
          newKey = localStorage.getItem('key') || '';
          let speedRate = localStorage.getItem('rate') || "high";
          voice_name = localStorage.getItem('voice') || config.speaker;
          slideRate = rateArrey.indexOf(speedRate); // เริ่มต้นที่ "100%"
      }
  });
  async function saveHandle() {
    let status_auther = true
    if (newKey !== "") {
      if (key_id !== newKey) {
        let res_key = await checkKey(newKey)
        // alert(res_key);
        if (res_key) {
          key_id = newKey;
        } else {
          status_auther = false
          alert('Invalid authentication credentials');
        }
      }
    } else {
      status_auther = false
      alert('Invalid authentication credentials');
    }
    
    if (browser && status_auther) {
        localStorage.setItem('url', grpc_url);
        localStorage.setItem('key', key_id);
        localStorage.setItem('rate', rateArrey[slideRate]);
        localStorage.setItem('voice', voice_name);
        alert('Settings saved successfully!');
        goto('/');
    }
  }

</script>
<div class="div-center">
  <div class="div-row">
    <div class="div-between">
      <label for="grpc_url">gRPC URL:</label>
      <input type="text" id="grpc_url" bind:value={grpc_url} />
    </div>
    <div style="width: 56px;"></div>
  </div>
  <div class="div-row">
    <div class="div-between">
      <label for="key_id">Api Key:</label>
      <input type="text" id="key_id" bind:value={newKey} />
    </div>
    <button class="bnt-magnifier" on:click={() => showPopup = true}>
          <img class="img-magnifier" src={magnifier_icon} alt="magnifier" />
    </button>
  </div>
  <Popup show={showPopup} onClose={() => showPopup = false} />
  <label for="slider">ความเร็วเสียง: {rateArrey[slideRate]}</label>
  <input type="range" min="0"  max="4" step="1"
      bind:value={slideRate}
      style="width: 235px"
  />
  <div class="div-between">
    <label for="voice_name">Voice Name:</label>
    <select id="voice_name" bind:value={voice_name}>
        {#each voiceList as name, index}
            <option value={name}>{name}</option>
        {/each}
    </select>
  </div>
  <div>
    <button on:click={saveHandle}>Save Settings</button>
  <button on:click={() => {
    goto('/');
  }}>Cancel</button>
  </div>
  
  
</div>
<style>
    .div-center {
        /* margin: 10px; */
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .div-row{
        /* margin: 10px; */
        display: flex;
        flex-direction: row;
    }
   .div-between {
        /* margin: 10px; */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 280px;
    }
    button {
        margin: 10px;
        padding: 5px 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        width: 120px;
    }
    .bnt-magnifier {
        width: 35px;
        height: 35px;
        background-color: transparent;
        border: none;
    }
    .img-magnifier {
        width: 100%;
        height: 100%;
    }
</style>