import browser from "webextension-polyfill";
import { streamAudio } from "./elevenAPI";


browser.runtime.onMessage.addListener((msg) => {
  if (msg.request == "streamAudio") {
    streamAudio(msg.audioText)
  }
})


console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});
