#! /usr/bin/env node

import shell from 'shelljs';
import readlineSync from 'readline-sync';
import path from 'path';
import { MODELS_LIST, DEFAULT_MODEL, NODE_MODULES_MODELS_PATH } from './constants.js';

const MODEL_FILES = [
  "added_tokens.json",
  "config.json",
  "generation_config.json",
  "merges.txt",
  "normalizer.json",
  "preprocessor_config.json",
  "quant_config.json",
  "special_tokens_map.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "vocab.json",
  "onnx/encoder_model.onnx",
  "onnx/decoder_model_merged.onnx"
];

const src="https://huggingface.co/Xenova";
const pfx="resolve/main";

const askModel = async () => {
  const answer = await readlineSync.question(`\n[whisper-onnx-speech-to-text] Enter model name (e.g. 'base.en') or 'cancel' to exit\n(ENTER for base.en): `)

  if (answer === "cancel") {
    console.log("[whisper-onnx-speech-to-text] Exiting model downloader. Run again with: 'npx whisper-onnx-speech-to-text download'");
    process.exit(0);
  }
  else if (answer === "") {
    console.log("[whisper-onnx-speech-to-text] Going with", DEFAULT_MODEL);
    return DEFAULT_MODEL;
  }
  else if (!MODELS_LIST[answer]) {
    console.log("\n[whisper-onnx-speech-to-text] FAIL: Name not found.");

    return await askModel();
  }

  return answer;
}

export default async function downloadModel() {
  try {
    console.log(`
| Model     | Disk   |
|-----------|--------|
| tiny      | 235 MB |
| tiny.en   | 235 MB |
| base      | 400 MB |
| base.en   | 400 MB |
| small     | 1.1 GB |
| small.en  | 1.1 GB |
| medium    | 1.2 GB |
| medium.en | 1.2 GB |
`);

    const modelName = await askModel();

    if (!!shell.which("wget")) {
      MODEL_FILES.forEach(fileName => {
        shell.exec(`wget --quiet --show-progress -P ./${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}/${path.dirname(fileName)} ${src}/${MODELS_LIST[modelName]}/${pfx}/${fileName}`);
      });
    }
    else if (!!shell.which("curl")) {
      MODEL_FILES.forEach(fileName => {
        shell.exec(`curl -L ${src}/${MODELS_LIST[modelName]}/${pfx}/${fileName} -o ${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}/${fileName} --create-dirs`);
      });
    }
    else {
      console.log("[whisper-onnx-speech-to-text] Either wget or curl is required to download models.");
    }

    process.exit(0);
  } catch (error) {
    console.log("ERROR Caught in download model");
    console.log(error);
    return error;
  }
}

downloadModel();
