<script lang="ts">
  console.log("Hello from the popup!");

  import { streamAudio, fetchAudio } from "../addMissingVoices";
  import { Button } from "flowbite-svelte";
</script>

<div>
  <img src="/icon-with-shadow.svg" alt="" />
  <h1>vite-plugin-web-extension</h1>
  <Button on:click={streamAudio} color="primary" size="lg">Refactored</Button>
  <Button on:click={fetchAudio} color="primary" size="lg">Old</Button>
  <p>
    Template: <code>svelte-ts</code>
  </p>
</div>

<style>

</style>
