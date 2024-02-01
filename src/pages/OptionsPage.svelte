<script lang="ts">
    import { FloatingLabelInput, Button, Toast, Heading, P } from "flowbite-svelte";

    import Options from "./Options.svelte";
    import browser from "webextension-polyfill";
    import { onMount } from "svelte";

    let truncatedKey: string;

    onMount( async () => {
        truncatedKey = (await browser.storage.local.get("truncated_eleven_labs_key"))["truncated_eleven_labs_key"]
    })

    const removeAPIKey = async (event: MouseEvent) => {
        await browser.storage.local.remove(["eleven_labs_key", "truncated_eleven_labs_key"])
        truncatedKey = ""
    }
</script>

<div class="flex flex-col m-4">
    <Heading tag="h2" class="mb-4">Tato11 Options</Heading>

    <P class="my-2">
        To use Tato11, you'll need to create a free account on <a href="https://elevenlabs.io">Elevenlabs</a>.
        
        Once you've signed up, log in and check your profile settings to find your API key.
    </P>

    {#if truncatedKey}
        <P class="my-2">
            (Currently saved key: {truncatedKey})
        </P>
    {/if}

    <Options />

    <div class="mx-2" style:display={truncatedKey ? "block" : "none"}>
        <P>
            To remove your API key entirely.... You know how buttons work.
        </P>
        <br/>
        <Button on:click={removeAPIKey}>Remove</Button>
    </div>
</div>  