# Video to SRT Subtitle Generator

This project extracts audio from a video file and transcribes it using OpenAI's Whisper model (with support for multiple languages), and generates subtitles in **SRT format** with pretty accurate timestamps. These SRT files can be imported into Premiere Pro or any video editing software that supports subtitles.

## Features

- Extracts audio from video files using FFmpeg.
- Transcribes audio using OpenAI Whisper in multiple languages.
- Generates an SRT file with kind of accurate timestamps from Whisper's transcription.
- Customizable bitrate and transcription language via the `config.js` file.

## Prerequisites

- **Node.js** installed on your machine.
- **FFmpeg** installed via [Homebrew](https://brew.sh/) (on macOS) or your preferred package manager:
  ```bash
  brew install ffmpeg
  ```
- **OpenAI API Key**: You need an OpenAI API key to use the Whisper model. You can get it by signing up at [OpenAI](https://platform.openai.com/). You need to pay for usage as well.

## Installation

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file and add your OpenAI API key:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Make sure **FFmpeg** is installed correctly by running:

   ```bash
   ffmpeg -version
   ```

## Usage

1. **Configure Language and Bitrate**:  
   You can customize the transcription language and audio bitrate by editing the `config.js` file.

   Examples:

   ```json
   {
     "language": "de", // Suggested: "de" | "en" | "es" | other languages supported by OpenAI Whisper
     "audioBitrate": "64k" // Suggested: "32k" | "64k" | "128k" (Lower = smaller file size, higher bitrate does not improve accuracy but can result in better audio quality)
   }
   ```

2. Place your video file (e.g., `.mp4`, `.mov`, `.avi`) in the `input` folder.
3. Run the script:

   ```bash
   node index.js
   ```

4. The script will:
   - Extract the audio from the video and convert it to MP3 format.
   - Send the MP3 file to OpenAI Whisper for transcription in the specified language.
   - Generate an SRT file with timestamps.
   - Save the generated MP3 and SRT file in the `output` folder.

## Limitations

- **File Size Limit**: The Whisper API has a **25 MB** limit for audio files. If your video is long, and reducing the bitrate is not enough, you may need to ensure the extracted audio is under this limit by either compressing the video/audio or splitting the video into smaller chunks.

- **Supported Video Formats**:

  - `.mp4`, `.mkv`, `.avi`, `.mov`, `.flv`

- **Accuracy of Transcription**: The transcription quality depends on the quality of the audio and Whisper's capabilities. It may struggle with heavy background noise or poor-quality recordings.

- **Whisper Model Limitations**: Whisper is a general-purpose model and may not handle domain-specific jargon or accents perfectly.

## To Customize

- **Language**: You can change the transcription language by modifying the `language` parameter in the `config.js` file. Whisper can also handle translations if the input language differs from the target transcription language:

  ```json
  {
    "language": "en" // For English, or change to the desired language code
  }
  ```

- **Bitrate/Audio Quality**: If the file size is too large, you can reduce the audio bitrate when extracting the audio by adjusting this in `config.js`:
  ```json
  {
    "audioBitrate": "32k" // Lower bitrate reduces file size; Whisper can handle lower-quality audio but this may affect audio clarity.
  }
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
