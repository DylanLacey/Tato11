import pcm from "pcm-util"

const voice_id = "ErXwobaYiN019PkySvjV"
const apiKey = "c52d67f158423efa139aa506780a72c7"

const sample_rate = 24000

const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`)
// url.searchParams.append("optimize_streaming_latency", "2")
url.searchParams.append("output_format", "pcm_24000")


export const fetchAudio = async () => {
    console.debug("Beginning")
    const stream = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey
        },
        body: JSON.stringify({
            model_id: "eleven_multilingual_v2",
            text: "世界さん、初めまして！",
        })
    })

    const streamReader = stream.body?.getReader()

    let readingStream = true

    // const context = new (window.AudioContext || window.webkitAudioContext)();
    // const context = new (window.AudioContext)();

    const context = new AudioContext();
    const processingBuffer = context.createBuffer(1, sample_rate * 2, 24000)

    let nowPlaying = false;

    while (readingStream) {
        const chunk = await streamReader?.read()
        console.debug("Reading chunk")

        if (chunk?.value) {
            // console.log(chunk.value)
            // const chunkBuffer = chunk.value.buffer
            // const playingBuffer = context.createBufferSource();
            // playingBuffer.buffer = await context.decodeAudioData(chunkBuffer)
            // playingBuffer.connect(context.destination)
            // playingBuffer.start()

            const nowBufferingSource = context.createBufferSource()
            console.debug("Buffer Source Created")

            console.debug("UTF8 Chunk ", chunk.value)

            console.log(chunk.value.join(""))
            const floatChunk = Float32Array.from(chunk.value)
            const IEEE754Chunk = floatChunk.map((i) => { return i/32768})

            console.debug("IEEE Chunk", IEEE754Chunk)

            processingBuffer.copyToChannel(IEEE754Chunk, 0, 1)

            nowBufferingSource.buffer = processingBuffer
            nowBufferingSource.connect(context.destination)

            if (!nowPlaying) {
                nowBufferingSource.start()
                nowPlaying = true
            }
        }

        readingStream = chunk?.done || false
    }
}