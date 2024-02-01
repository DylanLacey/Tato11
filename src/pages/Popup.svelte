<script lang="ts">
  import { onMount } from "svelte";
  import browser from "webextension-polyfill";

  console.log("Hello from the popup!");

  import { streamAudio, streamAndRetrieveAudioData } from "../elevenAPI";
  import Options from "../pages/Options.svelte"
  import { Button, Heading, P } from "flowbite-svelte";

  let keySaved = false

  const doVoice = async () => {
    streamAudio("Seems like everything's working!")
  }

  onMount( async () => {
    keySaved = (await browser.storage.local.get("truncated_eleven_labs_key"))["truncated_eleven_labs_key"]
  })

</script>

<div class="wrapper">
  <div>
    <img src="/bunny_2.svg" alt="" />

    <div>
      <Heading tag="h2">
        Tato11
      </Heading>
    </div>

    <hr/>

    <div>
      <P class="px-4">
        Tato11 fills in the gaps in Tatoeba's database of sentences. To use it, open your sentences list and click the bunny icon:
        <img src="/bunny.svg" alt="The Tato11 icon; Bunny ears emerging from a top hat." style="height: 24px; width: 24px;" class="inline"/>
      </P>
    </div>

    <hr/>
    <P class="px-4">
      {#if keySaved}
        You've already configured an API Key. To change it, go to "Manage Extension".
      {:else}
        To use Tato11, you'll need to create a free account on <a href="https://elevenlabs.io">Elevenlabs</a>.
        
        Once you've signed up, log in and check your profile settings to find your API key.
        <Options />
      {/if}
    </P>

    
      {#if keySaved}
        <Button on:click={doVoice} color="primary" size="lg">Test Audio</Button>
      {/if}
  </div>

</div>

<style>
  img {
    width: 200px;
    height: 200px;
  }

  .wrapper {
    width: 400px;
    height: 600px;
    padding: 8px;
    padding-top: 24px;
    margin: 0;
  }

  .wrapper div {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
  }
</style>