import browser from "webextension-polyfill";

const defaultVoice = "IKne3meq5aSn9XLyUdCD"
const defaultText = "Mate! You forgot to provide a text argument!"
const sample_rate = 24000
let apiKey: string

browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes["eleven_labs_key"]) {
        apiKey = changes["eleven_labs_key"].newValue
    }
})

/** 
 * Uses the Web Audio API to playback the desired audio
 * @param {text} - Text to be turned into speech
 * @param {voice_id} {string} - Eleven Labs voice_id
 * @param {number} [delay=0] - [How long to wait before starting playback (Seconds, as a double)
*/
export const streamAudio = async (text: string = defaultText, voice_id: string = defaultVoice, delay: number = 0) => {
    const response = await doFetch(text, voice_id)
    const handler = playHandler(delay)

    await processStream(response, handler)
}

/** 
 * Returns audio data as a Float32 Array suitable for piping into the Web Audio API
 * @param {text} - Text to be turned into speech
 * @param {voice_id} {string} - Eleven Labs voice_id
*/
export const retrieveAudioData = async (text: string = defaultText, voice_id: string = defaultVoice) => {
    const response = await doFetch(text, voice_id)
    const {audioDataProducer, audioDataChunkHandler} = getHandlers()

    await processStream(response, audioDataChunkHandler)
    return audioDataProducer
}

/** 
 * Uses the Web Audio API to playback the desired audio
 * @param {text} - Text to be turned into speech
 * @param {voice_id} {string} - Eleven Labs voice_id
 * @param {number} [delay=0] - [How long to wait before starting playback (Seconds, as a double)
*/
export const streamAndRetrieveAudioData = async (text: string = defaultText, voice_id: string = defaultVoice, delay: number = 0) => {
    const response = await doFetch(text, voice_id)

    const {audioDataProducer, audioDataChunkHandler} = getHandlers()
    const audioPlayChunkHandler = playHandler(delay)

    const doBoth = (chunkData: Float32Array) => {
        audioPlayChunkHandler(chunkData)
        audioDataChunkHandler(chunkData)
    }

    await processStream(response, doBoth)

    return audioDataProducer()
}

const playHandler = (delay: number = 0) => {
    const context = new AudioContext()
    let startAt = context.currentTime + delay

    return (chunkData: Float32Array) => {
        const processingBuffer = context.createBuffer(1, chunkData.length, sample_rate)
        processingBuffer.copyToChannel(chunkData, 0)

        const nowBufferingSource = context.createBufferSource()
        nowBufferingSource.buffer = processingBuffer
        nowBufferingSource.connect(context.destination)

        nowBufferingSource.start(startAt)
        startAt += processingBuffer.duration
    }
}

const getHandlers = () => {
    const chunksArray = new Array()
    let totalBytes = 0

    const audioDataChunkHandler = (chunkData: Float32Array) => {
        chunksArray.push({data:chunkData, size: chunkData.length})
        totalBytes += chunkData.length
    }

    const audioDataProducer = () => {      
        let responseData = new Float32Array(totalBytes)
        
        responseData = chunksArray.reduce((response, chunk) => { 
            response.data.set(chunk.data, response.offset)
            response.offset += chunk.size
    
            return response
        },
            {data: responseData, offset: 0}
        ).data
    
        return responseData
    }

    return {audioDataProducer, audioDataChunkHandler}
}

export const processStream = async (streamReader: ReadableStreamDefaultReader | undefined, fn: {(chunk: Float32Array): any}) => {
    let readingStream = true
    let leftover: number | undefined;
    while (readingStream) {
        const chunk = await streamReader?.read()
        if (chunk?.value) {
            let chunkBytes: Uint8Array

            if (leftover) {
                chunkBytes = new Uint8Array([leftover, ...chunk.value])
                leftover = undefined
            } else {
                chunkBytes = chunk.value
            }

            if (chunkBytes.byteLength % 2 == 1) {
                leftover = chunkBytes[chunkBytes.byteLength - 1];
            }

            let dataView = new DataView(chunkBytes.buffer)
            let channelData = new Float32Array(chunkBytes.byteLength / 2)

            for (let i = 0; i < Math.floor(dataView.byteLength / 2) * 2; i+= 2) {
                const sample = dataView.getInt16(i, true)
                let floatSample = sample / 32768
                channelData[i/2] = floatSample
            }

            console.log("channelData is ", channelData.length)
            console.log("There were ", Math.floor(dataView.byteLength / 2))
            fn(channelData)
        }

        readingStream = !(chunk?.done)
    }
}    

const doFetch = async (text: string, voice_id: string) => {
    apiKey = apiKey ? apiKey : (await browser.storage.local.get("eleven_labs_key"))["eleven_labs_key"]
    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`)
    url.searchParams.append("optimize_streaming_latency", "2")
    url.searchParams.append("output_format", "pcm_24000")

    console.log(`Asking for ${text} from ${url}`)
    try{
        const response =  await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey
            },
            body: JSON.stringify({
                model_id: "eleven_multilingual_v2",
                text: text,
            })
        })

        if (response.status === 200) {
            return response.body?.getReader()
        } else {
            console.log("Tato11 couldn't access the Elevenlabs API: ", response)
        }
    } catch (e){
        console.log("Error accessing Elevenlabs API: ", e)
    }
}  