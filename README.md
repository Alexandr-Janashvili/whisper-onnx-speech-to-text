# whisper-onnx-speech-to-text

[![npm downloads](https://img.shields.io/npm/dm/whisper-onnx-speech-to-text)](https://npmjs.org/package/whisper-onnx-speech-to-text)
[![npm downloads](https://img.shields.io/npm/l/whisper-onnx-speech-to-text)](https://npmjs.org/package/whisper-onnx-speech-to-text)  

Transcribe speech to text on node.js using OpenAI's Whisper models converted to cross-platform ONNX format

## Installation

1. Add dependency to project

```text
npm install whisper-onnx-speech-to-text
```

2. Download whisper model of choice

```text
npx whisper-onnx-speech-to-text download
```

## Usage

```js
import { initWhisper } from 'whisper-onnx-speech-to-text';

const whisper = await initWhisper("base.en");

const transcript = await whisper.transcribe("example/sample.wav");
```

### Result (JSON)

```javascript
[
  {
    text: " And so my fellow Americans ask not what your country can do for you, ask what you can do for your country."
    chunks: [
       { timestamp: [0, 8.18],  text: " And so my fellow Americans ask not what your country can do for you" },
       { timestamp: [8.18, 11.06], text: " ask what you can do for your country." }
    ]
  }
]
```

## API

### initWhisper
The `initWhisper()` takes the name of the model and returns an instance of the Whisper class initialized with the chosen model.

### Whisper

The `Whisper` class has the following methods:

#### 1. `transcribe(filePath: string, language?: string)` : transcribes speech from wav file.
Parameters:

- `filePath`: path to wav file
- `language`: target language for recognition. Name format - the full name in English like `'spanish'`

#### 2. `disposeModel()` : dispose initialized model.

## Made with

- [Transformers.js](https://www.npmjs.com/package/@xenova/transformers)
- [ShellJS](https://www.npmjs.com/package/shelljs)
