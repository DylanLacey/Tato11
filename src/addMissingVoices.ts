
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
    let nowPlaying = false;

    let totalBytes = 0;
    const context = new AudioContext();
    let startAt = context.currentTime;
    let offset = 0;
    // const processingBuffer = context.createBuffer(1, sample_rate * 2, 24000)

    let fullBuffer
    let counter = 0

    // for await (let chunk of readable) {

    // }

    let audioChunks: Float32Array = new Float32Array(100000);
    let audioChunkOffset = 0;

    let throwAwayNext = false
    let leftover: number | undefined;
    while (readingStream) {
    //     const chunk = await streamReader?.read()
        
    //     if (chunk?.value) {
    //         const range = (start: number, stop: number, step = 1): number[] => {
    //             return Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
    //         }

    //         // const processingBuffer = context.createBuffer(1, chunkBytes.length, sample_rate)
    //         const processingBuffer = context.createBuffer(1, chunkBytes.length / 2, sample_rate)
    //         const nowBufferingSource = context.createBufferSource()

    //         let dataView = new DataView(chunkBytes.buffer)

    //         let channelD = []

    //         for (let i = 0; i < chunkBytes.byteLength; i+= 2) {
    //             const sample = dataView.getInt16(i, true)
    //             channelD[i/2] = sample / 32768
    //         }

    //         const signed = Int8Array.from(chunkBytes)

    //         console.debug(`Chunk length: ${chunkBytes.length} (${chunkBytes.byteLength}) bytes`)
    //         console.debug(`Signed length: ${signed.length} (${signed.byteLength}) bytes`)

    //         console.debug(chunkBytes)
    //         console.debug(signed)

            
    //         // console.debug(chunkBytes.join(""))

    //         // const floatChunk = Float32Array.from(chunkBytes, octet => octet / 0xff)
    //         // const IEEE754Chunk = floatChunk.map((i) => { return i/32768})

    //         let targetLength = chunkBytes.length


    //         console.debug("Data View Created")
    //         console.debug(range(0, targetLength, 4))
    //         const floatArray = range(0, targetLength, 4).map((i) => {
    //             try {
    //                 return dataView.getFloat32(i)
    //             } catch (RangeError){
    //                 console.log("Discarding two bytes. Sorry kids.")
    //             }

    //         })
    //         console.debug("floatArray created")
    //         const floatTypedArray = new Float32Array(floatArray)

    //         console.debug(`Float Chunk length: ${floatTypedArray.length} (${floatTypedArray.byteLength}) bytes`)
    //         console.debug("Chunk ", chunkBytes)
    //         console.debug("Float Chunk ", floatTypedArray)

    //         processingBuffer.copyToChannel(floatTypedArray, 0)

    //         nowBufferingSource.buffer = processingBuffer
    //         nowBufferingSource.connect(context.destination)

    //         if (!nowPlaying) {
    //             console.debug("Starting Playback")
    //             nowBufferingSource.start(startAt)
    //             startAt = context.currentTime + processingBuffer.duration
    //             nowPlaying = true
    //         }
    //     }

    //     readingStream = !(chunk?.done) 
    //     console.debug("Reading Stream: " + readingStream)
    // }

    const chunk = await streamReader?.read()
    
    if (chunk?.value) {
        let chunkBytes = chunk.value

        if (leftover) {
            chunkBytes = new Uint8Array([leftover, ...chunkBytes])
            leftover = undefined
        }

        if (chunkBytes.byteLength % 2 == 1) {
            leftover = chunkBytes[chunkBytes.byteLength - 1];
        }

        totalBytes += chunkBytes.byteLength
        const processingBuffer = context.createBuffer(1, chunkBytes.length / 2, sample_rate)

        let dataView = new DataView(chunkBytes.buffer)
        let channelData = new Float32Array(chunkBytes.length / 2)

        for (let i = 0; i < Math.floor(dataView.byteLength / 2) * 2; i+= 2) {
            // try {
                const sample = dataView.getInt16(i, true)
                let floatSample = sample / 32768
                channelData[i/2] = floatSample
                audioChunks[audioChunkOffset] = floatSample
                audioChunkOffset += 1    
            // } catch (e) {
            //     throwAwayNext = true
            //     // console.log(`Could not read chunk from position ${i} ` + e)
            //     // console.log(`Buffer is ${chunkBytes.buffer.byteLength} bytes long`)
            //     // console.log(`DataView is ${dataView.byteLength} bytes long`)
            // }
        }
        
        // console.log("Number of zeros:", numberOfZeros, numberOfFloatZeros)
        // console.log(channelD.join(","))
        // processingBuffer.copyToChannel(channelD, 0)
        processingBuffer.copyToChannel(channelData, 0)

        const nowBufferingSource = context.createBufferSource()
        nowBufferingSource.buffer = processingBuffer
        nowBufferingSource.connect(context.destination)

        if (!nowPlaying) {
            nowPlaying = true

        }

        console.debug(`Chunk of duration ${processingBuffer.duration} starts at ${startAt} skipNext=${throwAwayNext}`)
        nowBufferingSource.start(startAt)
        startAt += processingBuffer.duration
    }

    counter += 1

    readingStream = !(chunk?.done) 

    // if (!readingStream) {
    // }
    // break;
    // console.log("FINISHED")
}   

// await new Promise((resolve, r) => {
//     setTimeout(() => { resolve(true) }, 5000)
// })

console.debug("Total data read: " + totalBytes)

await new Promise((resolve, r) => {
    setTimeout(() => { resolve(true) }, 2000)
})

// console.log("attempting play all")
// const processingBuffer = context.createBuffer(1, audioChunkOffset, sample_rate)
// const nowBufferingSource = context.createBufferSource()
// console.log("Audio Chunks: ", audioChunks)
// processingBuffer.copyToChannel(audioChunks, 0)
// nowBufferingSource.buffer = processingBuffer
// nowBufferingSource.connect(context.destination)
// nowBufferingSource.start()
// console.log("started second attempt")

await new Promise((resolve, r) => {
    setTimeout(() => { resolve(true) }, 5000)
})
}