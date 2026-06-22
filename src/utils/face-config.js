import * as faceapi from 'face-api.js';  // بدون @vladmandic
import * as canvas from 'canvas';
import * as tf from '@tensorflow/tfjs';  // بدون -node
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

export async function loadModels() {
  const modelPath = path.join(__dirname, '../../models');
  
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  
  console.log('✅ Models loaded!');
}

export async function getFaceDescriptor(imageBuffer) {
  const img = await canvas.loadImage(imageBuffer);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  
  return Array.from(detection.descriptor);
}