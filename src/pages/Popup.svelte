<script lang="ts">
  console.log("Hello from the popup!");

  import { streamAudio, streamAndRetrieveAudioData } from "../addMissingVoices";
  import { Button } from "flowbite-svelte";

  const doVoice = async () => {
    streamAudio()
  }
</script>

<div>
  <img src="/icon-with-shadow.svg" alt="" />
  <h1>vite-plugin-web-extension</h1>
  <Button on:click={doVoice} color="primary" size="lg">Test Audio</Button>
  <p>
    Template: <code>svelte-ts</code>
  </p>
</div>

<style>

</style>