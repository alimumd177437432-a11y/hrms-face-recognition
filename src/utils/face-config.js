import * as faceapi from 'face-api.js'; 
import * as canvas from 'canvas';
import * as tf from '@tensorflow/tfjs';  
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp'; 

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

export async function loadModels() {
  const modelPath = path.join(__dirname, '../../models');
  
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  
  console.log('✅ Models loaded!');
}

export async function getFaceDescriptor(imageBuffer) {
  const compressedImage = await sharp(imageBuffer)
    .resize(320, 320)        
    .jpeg({ quality: 80 })   
    .toBuffer();

  const img = await canvas.loadImage(compressedImage);
  
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  
  return Array.from(detection.descriptor);
}