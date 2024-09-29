import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import dotenv from "dotenv";
import which from "which";
import config from "./config.js";

dotenv.config();

// Get the system FFmpeg path explicitly
const ffmpegPath = which.sync("ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supportedFormats = [".mp4", ".mkv", ".avi", ".mov", ".flv"];

// Function to extract audio from video using FFmpeg
async function extractAudio(videoFilePath, outputAudioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoFilePath)
      .setFfmpegPath(ffmpegPath)
      .output(outputAudioPath)
      .audioCodec("libmp3lame")
      .audioBitrate(config.audioBitrate)
      .on("end", () => {
        console.log(`Audio extracted to ${outputAudioPath}`);
        resolve(outputAudioPath);
      })
      .on("error", (err) => {
        console.error("Error extracting audio:", err.message);
        reject(err);
      })
      .run();
  });
}

// Function to convert transcription to SRT format with timestamps
function convertToSRT(transcriptionData) {
  console.log("DATA", transcriptionData, transcriptionData.tokens);
  let srt = "";

  transcriptionData.segments.forEach((segment, index) => {
    const startTimestamp = formatTime(segment.start);
    const endTimestamp = formatTime(segment.end);

    srt += `${
      index + 1
    }\n${startTimestamp} --> ${endTimestamp}\n${segment.text.trim()}\n\n`;
  });

  return srt;
}

// Helper function to format time in SRT format (hh:mm:ss,ms)
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toFixed(3).replace(".", ",").padStart(6, "0");
  return `${hours}:${minutes}:${secs}`;
}

// Function to transcribe audio using OpenAI's Whisper API
async function transcribeAudio(filePath) {
  try {
    const audioData = fs.createReadStream(filePath);

    const response = await openai.audio.transcriptions.create({
      file: audioData,
      model: "whisper-1",
      response_format: "verbose_json",
      language: config.language,
    });

    return response;
  } catch (error) {
    console.error(
      "Error during transcription:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Main function to process video, extract audio, and transcribe it
async function processVideo() {
  const inputFolder = path.join(__dirname, "input");
  const outputFolder = path.join(__dirname, "output");

  // Get the first supported video file from the input folder
  const files = fs
    .readdirSync(inputFolder)
    .filter((file) =>
      supportedFormats.includes(path.extname(file).toLowerCase())
    );

  if (files.length === 0) {
    console.error("No supported video files found in the input folder.");
    return;
  }

  if (files.length > 1) {
    console.error(
      "Multiple files found in the input folder. Please only include one file."
    );
    return;
  }

  const videoFile = files[0];
  const videoFilePath = path.join(inputFolder, videoFile);

  const fileNameWithoutExtension = path.parse(videoFile).name;

  const audioFileName = `${fileNameWithoutExtension}.mp3`;
  const audioFilePath = path.join(outputFolder, audioFileName);

  const srtFilePath = path.join(
    outputFolder,
    `${fileNameWithoutExtension}.srt`
  );

  console.log(`Processing video file: ${videoFile}`);

  try {
    // Step 1: Extract audio from the video
    await extractAudio(videoFilePath, audioFilePath);

    // Step 2: Transcribe the extracted audio
    const transcriptionData = await transcribeAudio(audioFilePath);

    // Step 3: Convert the transcription to SRT format
    const srtContent = convertToSRT(transcriptionData);

    // Step 4: Save the SRT file
    fs.writeFileSync(srtFilePath, srtContent);

    console.log(`SRT file saved to ${srtFilePath}`);
  } catch (error) {
    console.error("Failed to process video:", error.message);
  }
}

// Run the transcription process
processVideo();
