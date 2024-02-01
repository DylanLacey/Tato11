<script lang="ts">
  console.log("Hello from the popup!");

  import { fetchAudio } from "../addMissingVoices";
  import { Button } from "flowbite-svelte";
</script>

<div>
  <img src="/icon-with-shadow.svg" alt="" />
  <h1>vite-plugin-web-extension</h1>
  <Button on:click={fetchAudio} color="primary" size="lg">Do It</Button>
  <p>
    Template: <code>svelte-ts</code>
  </p>
</div>

<style>

</style>
