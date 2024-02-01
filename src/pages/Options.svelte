<script lang="ts">
    import { FloatingLabelInput, Button, Toast, Heading, P } from "flowbite-svelte";
    import browser from "webextension-polyfill";
    import { onMount } from "svelte";

    let apiKey: string;
    let truncatedKey: string;

    let checkingKey = false;
    let keySaved = false;

    let status: string = "";

    onMount( async () => {
        truncatedKey = (await browser.storage.sync.get("truncated_eleven_labs_key")).toString()
    })

    const storeAPIKey = async (event: MouseEvent) => {
        const key = document.getElementById("eleven_labs_key") as HTMLInputElement

        status="extracting"

        if (key?.value) {
            const providedKey = key?.value
            const truncatedKey = providedKey.slice(0, 1) + "..." + providedKey.slice(-3)

            checkingKey = true

            try {
                const response = await fetch(
                "https://api.elevenlabs.io/v1/user", 
                {
                    method: "GET",
                    headers: {
                        "xi-api-key": providedKey
                    }
                })
            
                if (response.status === 200) {
                    status="success"
                    await browser.storage.local.set({ eleven_labs_key: providedKey, truncated_eleven_labs_key: truncatedKey });
                }
                checkingKey = false
                keySaved = true
            } catch {
                status="error"
                checkingKey = false
            }
        }
    }
</script>

{status}
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

    <div class="mb-2">
        <FloatingLabelInput bind:value={apiKey} id="eleven_labs_key" name="apiKey" type="text" label="Elevenlabs API Key">
            Elevenlabs API Key
        </FloatingLabelInput>
    </div>
    <div>
        <Button on:click={storeAPIKey}>Save</Button>
    </div>
</div>  

<div id="toast" style:display={checkingKey ? "block" : "none"}>
    <Toast>
        "Checking your API Key."
    </Toast>
</div>

<div id="toast" style:display={keySaved ? "block" : "none"}>
    <Toast>
        "Valid API Key; saved."
    </Toast>
</div>