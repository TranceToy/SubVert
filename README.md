# SubVert

A small browser app for self-guided immersive sessions. It layers four things on top of each other and lets you mix them however you like:

1. **Slideshow** — cycles through a folder of images you pick from your own computer.
2. **Spiral** — a slowly rotating spiral drawn over the slideshow.
3. **Binaural beats** — two pure tones, one per ear, that produce a perceived pulsing beat. Common presets for Delta, Theta, Alpha, Beta and Gamma frequency ranges are provided.
4. **Suggestions** — short audio clips you choose from a folder, played at random intervals across the left, center, and right speakers.

Each layer has its own Play / Stop button, so you can run any combination of them.

## Quickstart

1. Open the app in a recent **Chromium-based browser** — Chrome, Edge, Brave, Vivaldi, Arc, Opera. Firefox and Safari are not supported because they do not (yet) implement the local-folder picker the app relies on.
2. The settings panel on the right is open by default. Use it to:
   - **Pick an image folder** for the slideshow.
   - **Pick an audio folder** for suggestions (optional).
   - Adjust the slideshow interval, binaural carrier and beat frequencies, spiral appearance, and volumes.
3. Press the play buttons at the bottom of the screen to start each layer. They stay visible while nothing is playing; once something starts, they fade and reappear on hover.
4. Put on **headphones** for the binaural beats — the effect depends on each ear hearing a slightly different tone.

## Install as an app

In a Chromium browser, click the install icon in the address bar (or use the browser menu → "Install SubVert"). After installing:

- The app launches in its own fullscreen window from your normal app launcher.
- It works **offline** after the first online launch — the app's code is cached locally, so an internet connection is not required to run it.

The image and audio folders you pick are read directly from your disk and never leave your device.

## Privacy

There is no backend. No accounts, no uploads, no analytics, no tracking. All images and audio you supply are read locally through your browser's File System Access API and stay on your computer. The app's own code is the only thing that comes from the network, and only the first time you load it.

## Tips

- For the slideshow, file order is alphabetical (with natural number sorting), so name files `001.jpg`, `002.jpg`… if order matters.
- The "Suggestions" feature is designed for very short clips played in long random sequences. Typical use is a folder of one- to three-second voice samples.
- The spiral and slideshow can be enjoyed without any audio.
- Binaural beats need headphones to work as intended; speakers will not produce the same effect.
