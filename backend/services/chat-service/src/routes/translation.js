const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const axios = require('axios');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/**
 * POST /api/translation/transcribe
 * Transcribe a voice message using Whisper.
 */
router.post('/transcribe', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

    const transcription = await openai.audio.transcriptions.create({
      file: new File([req.file.buffer], req.file.originalname || 'audio.mp3', {
        type: req.file.mimetype || 'audio/mpeg',
      }),
      model: 'whisper-1',
      response_format: 'json',
    });

    res.json({
      transcription: transcription.text,
      language: transcription.language,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/translation/translate
 * Translate a message using OpenAI.
 */
router.post('/translate', async (req, res, next) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'text and targetLanguage are required' });
    }

    const prompt = sourceLanguage
      ? `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translated text.\n\n"${text}"`
      : `Translate the following text to ${targetLanguage}. Return only the translated text.\n\n"${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional translator. Always return only the translated text without any explanations.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || '';

    res.json({
      original: text,
      translated: translatedText,
      targetLanguage,
      sourceLanguage,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
