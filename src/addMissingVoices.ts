const tatoLogger = {
    log: (msg: string) => {console.debug(`[Tato11] ${msg}`)}
}
tatoLogger.log("Inserted addMissingVoices.js into page")

const volumeIconSelector = "[aria-label='volume_off']"
const sentenceSelector = "sentence-and-translations"
const sentenceTextSelector = '[ng-if="!vm.sentence.furigana"]'
const idLocator = '.md-subheader-content a[ng-href]'
let sentenceElements: Array<Element>

let sentences
let volumeOffIcons

type Entry = {
    text: string, 
    volumeElement: HTMLElement | null, 
    id: string | undefined
}

import browser from "webextension-polyfill";
import iconUrl from "../public/bunny.svg"

sentenceElements = Array.from(document.getElementsByClassName(sentenceSelector))

tatoLogger.log(`Found ${sentenceElements.length} sentences`)
volumeOffIcons = document.querySelectorAll(volumeIconSelector)

sentences = sentenceElements.reduce((acc: Array<Entry>, s) => {
    const missingVolumeIcon = s.querySelector(volumeIconSelector)

    if (missingVolumeIcon) {
        acc.push({
            text: s.querySelector(sentenceTextSelector)?.innerHTML || "",
            volumeElement: s.querySelector(volumeIconSelector),
            id: s.querySelector(idLocator)?.innerHTML.replace("#", "")
        })
    }

    return acc
}, [])

sentences.forEach((s) => {
    const toolTipText = "Generate an example using Eleven Labs."
    
    const newAnchor = document.createElement("a")
    const imageElement = document.createElement("img")

    const volumeLabelContainer = s.volumeElement?.parentElement?.parentElement
    const anchorClasses = (s.volumeElement?.parentElement?.className || "").replace("audioUnavailable", "") 

    newAnchor.className = anchorClasses
    newAnchor.ariaLabel = toolTipText
    newAnchor.addEventListener("click", () => {
        browser.runtime.sendMessage({request: "streamAudio", audioText: s.text})
    })

    imageElement.src = iconUrl
    imageElement.height = s.volumeElement?.offsetHeight || 24
    newAnchor.appendChild(imageElement)

    volumeLabelContainer?.parentElement?.insertBefore(newAnchor, volumeLabelContainer.nextElementSibling)
})