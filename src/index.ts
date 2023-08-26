import wavefile from 'wavefile';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { Pipeline, pipeline, env } from '@xenova/transformers';
import { DEFAULT_MODEL, MODELS_LIST, NODE_MODULES_MODELS_PATH } from './constants.js';

env.local_files_only = true;
env.localModelPath = NODE_MODULES_MODELS_PATH;
env.backends.onnx.wasm.numThreads = 1;

const readFile = util.promisify(fs.readFile);

const modelPromise = (modelName: string): Promise<Pipeline> => {
  return new Promise<Pipeline>(async (resolve, reject) => {
    try {
      
      if (!MODELS_LIST[modelName])
        throw `[whisper-onnx-speech-to-text] modelName "${modelName}" not found in list of models.\n`;
      
      if (!fs.existsSync(`${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}`))
        throw `[whisper-onnx-speech-to-text] '${modelName}' not downloaded! Run 'npx whisper-onnx-speech-to-text download'\n`;
      
      resolve(await pipeline("automatic-speech-recognition", MODELS_LIST[modelName], { quantized: false }));

    } catch (err) {
        reject(err);
    }
  });
};

const prepareAudio = async (filePath: string): Promise<Float64Array> => {
  const wav = new wavefile.WaveFile(await readFile(path.normalize(filePath)));
  wav.toBitDepth('32f');
  wav.toSampleRate(16000);
  let audioData = wav.getSamples();

  if (Array.isArray(audioData)) {
      if (audioData.length > 1) {
          const SCALING_FACTOR = Math.sqrt(2);

          for (let i = 0; i < audioData[0].length; ++i) {
              audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
          }
      }

      audioData = audioData[0];
  }

  return audioData;
};

class Whisper {
  private model: Pipeline;

  constructor(model: Pipeline) {
    this.model = model;
  }

  public async transcribe(filePath: string, language?: string) {
    try {
      const audioData = await prepareAudio(filePath);

      const lang = language ? { language } : {};
      
      return this.model(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        ...lang
      });
    } catch (error) {
      console.log("[whisper-onnx-speech-to-text] Problem:", error);
    }
  }

  public async disposeModel() {
    return this.model.dispose();
  }
}

export const initWhisper = async (modelName?: string): Promise<Whisper> => {
  if (!modelName)
    console.log("[whisper-onnx-speech-to-text] No 'modelName' provided. Trying default model:", DEFAULT_MODEL, "\n");

  const model = await modelPromise(modelName || DEFAULT_MODEL);
  return new Whisper(model);
};
