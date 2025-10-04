# Soundscapes 🎧
Custom ambient audio builder - Mix ambient layers into shareable, timed soundscapes

## Features

### Core Features
- **Layer Mixer**: Mix multiple ambient audio layers with independent volume controls
  - 🌧️ Rain
  - ☕ Café ambience
  - 📻 White Noise
  - 🎹 Synth Pad
- **Timer/Scheduler**: Set sleep timers (15m, 30m, 1h, 2h)
- **Crossfade**: Smooth volume transitions between states
- **Shareable Links**: Share your custom soundscapes via URL
- **Presets**: Save and load your favorite soundscapes
- **PWA Support**: Works offline, installable as an app

### Pages
1. **Mixer** - Control audio layers and create soundscapes
2. **Presets** - Save, load, and manage your soundscapes
3. **Share** - Generate shareable links for your soundscapes
4. **Account** - Settings and data management

## Technology

- **WebAudio API**: Procedurally generated ambient audio layers
- **Progressive Web App (PWA)**: Offline support with service workers
- **Local Storage**: Client-side preset and settings storage
- **Vanilla JavaScript**: No framework dependencies

## Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Click "Play" to start mixing
3. Adjust volume sliders for each layer
4. Save your favorite combinations as presets
5. Share your soundscapes via shareable links

### Installation
The app can be installed as a PWA on supported devices:
1. Open the app in your browser
2. Look for "Install" or "Add to Home Screen" option
3. Follow the prompts to install

## Usage

### Creating a Soundscape
1. Navigate to the **Mixer** page
2. Adjust volume sliders for desired layers
3. Use the play/pause buttons for individual layers
4. Click "Play" to start all active layers
5. Set an optional timer for auto-stop

### Saving Presets
1. Configure your desired soundscape in the Mixer
2. Enter a name in the "Preset name" field
3. Click "Save Preset"
4. Access saved presets in the **Presets** page

### Sharing Soundscapes
1. Create your soundscape in the Mixer
2. Navigate to the **Share** page
3. Copy the generated shareable link
4. Share the link with others

### Settings
In the **Account** page, you can:
- Adjust crossfade duration (0-5 seconds)
- Toggle auto-loop for layers
- Export presets as JSON
- Clear all stored data

## Audio Implementation

All audio is procedurally generated using the WebAudio API:
- **Rain**: Pink noise filtered for natural rain sound
- **Café**: Brown noise with modulation for ambient chatter
- **White Noise**: Pure white noise for focus
- **Synth Pad**: Low-frequency harmonic oscillations

## Browser Compatibility

Requires a modern browser with:
- WebAudio API support
- Service Worker support (for PWA features)
- LocalStorage support

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

### Premium Features (Planned)
- High-resolution audio stems
- Mobile app (iOS/Android)
- Additional ambient layers
- Custom audio upload
- Cloud sync for presets

## License

MIT License - Feel free to use and modify

## Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.
