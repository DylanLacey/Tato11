const defaultVoice = "IKne3meq5aSn9XLyUdCD"
const defaultText = "Mate! You forgot to provide a text argument!"
const apiKey = "c52d67f158423efa139aa506780a72c7"

const sample_rate = 24000

// export const streamAudio = async (text: string, voice_id: string) => {
//     await playResponse(await doFetch("久しぶり、だな", voice_id))
// }

// export const retrieveAudioData = async (text: string, voice_id: string) => {
//     return getResponse(await doFetch("久しぶり、だな", voice_id))
// }

export const streamAudio = async (text: string = defaultText, voice_id:string = defaultVoice) => {
    await playResponse(await doFetch(text, voice_id))
}

export const retrieveAudioData = async (text: string = defaultText, voice_id: string = defaultVoice) => {
    return getResponse(await doFetch(text, voice_id))
}

export const streamAndRetrieveAudioData = async (text: string = defaultText, voice_id: string = defaultVoice) => {
    const apiResponse = await doFetch(text, voice_id)

    const {audioDataProducer, audioDataChunkHandler} = storeHandlers()
    const audioPlayChunkHandler = playHandler()

    const doboth = (chunkData: Float32Array) => {
        audioPlayChunkHandler(chunkData)
        audioDataChunkHandler(chunkData)
    }

    await processStream(apiResponse, doboth)

    return audioDataProducer()
}

const playHandler = (context: AudioContext = new AudioContext(), delay: number = 0) => {
    let startAt = context.currentTime + delay;

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

const storeHandlers = () => {
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

const getResponse = async (response: Response) => {
    const chunksArray = new Array()

    let totalBytes = 0
    const concater = (chunkData: Float32Array) => {
        chunksArray.push({data:chunkData, size: chunkData.length})
        totalBytes += chunkData.length
    }

    await processStream(response, concater)

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

const playResponse = async (response: Response, delay: number = 0) => {
    const context = new AudioContext();
    let startAt = context.currentTime + delay;

    const play = (chunkData: Float32Array) => {
        const processingBuffer = context.createBuffer(1, chunkData.length, sample_rate)
        processingBuffer.copyToChannel(chunkData, 0)

        const nowBufferingSource = context.createBufferSource()
        nowBufferingSource.buffer = processingBuffer
        nowBufferingSource.connect(context.destination)

        nowBufferingSource.start(startAt)
        startAt += processingBuffer.duration
    }

    await processStream(response, play)
}

export const processStream = async (response: Response, fn: Function) => {
    const streamReader = response.body?.getReader()

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

            fn(channelData)
        }

        readingStream = !(chunk?.done)
    }
}    

const doFetch = async (text: string, voice_id: string) => {
    console.log("Making request")
    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`)
    url.searchParams.append("optimize_streaming_latency", "2")
    url.searchParams.append("output_format", "pcm_24000")

    return await fetch(url, {
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
}