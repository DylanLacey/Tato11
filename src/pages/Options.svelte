<script lang="ts">
    import { FloatingLabelInput, Button, Toast, Heading, P } from "flowbite-svelte";
    import browser from "webextension-polyfill";
    import { onMount } from "svelte";

    let apiKey: string;
    let truncatedKey: string;

    let checkingKey = false;
    let keySaved = false;
    let keyWrong = false;

    onMount( async () => {
        truncatedKey = (await browser.storage.local.get("truncated_eleven_labs_key"))["truncated_eleven_labs_key"]
    })

    const storeAPIKey = async (event: MouseEvent) => {
        const key = document.getElementById("eleven_labs_key") as HTMLInputElement

        if (key?.value) {
            const providedKey = key?.value
            const truncatedKey = providedKey.slice(0, 1) + "..." + providedKey.slice(-3)

            checkingKey = true

            try {
                const response = await fetch( "https://api.elevenlabs.io/v1/user", 
                {
                    headers: { "xi-api-key": providedKey }
                })
            
                checkingKey = false
                if (response.status === 200) {
                    await browser.storage.local.set({ 
                        eleven_labs_key: providedKey, 
                        truncated_eleven_labs_key: truncatedKey 
                    });
                    keySaved = true
                } else {
                    keyWrong = true
                }
            } catch {
                keyWrong = true
                checkingKey = false
            }
        }
    }
</script>

<div class="flex flex-col m-4">
    <div class="mb-2">
        <FloatingLabelInput bind:value={apiKey} 
            id="eleven_labs_key" name="apiKey" type="text" label="Elevenlabs API Key">

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

<div id="toast" style:display={keyWrong ? "block" : "none"}>
    <Toast>
        "Invalid API Key."
    </Toast>
</div>