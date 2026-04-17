import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOCAB_FILE = path.join(__dirname, '../src/data/vocabulary.json');
const INPUT_FILE = path.join(__dirname, '../input_words.txt');
const BATCH_SIZE = 20;

const PROMPT = `You are a lexicographer specializing in C2 (Mastery) level English vocabulary for Brazilian students.

Generate a JSON array of objects with the following C2-level vocabulary data for each word. Use sophisticated, academic English matching Oxford Dictionary standards.

For each word, generate:
{
  "word": "the English word in lowercase",
  "definition": "an academic definition (30-60 words, sophisticated tone)",
  "example_sentence": "a complex example sentence using advanced grammar (subjunctive, passive voice, or advanced clauses)",
  "translation": "the Brazilian Portuguese translation (PT-BR)",
  "definition_pt": "the definition in Portuguese (formal, academic tone)",
  "example_pt": "the Portuguese translation of the example (preserve grammatical complexity)",
  "level": "C2"
}

IMPORTANT:
- Definitions must use formal, academic language (NOT colloquial)
- Example sentences should use: subjunctive mood, passive voice, cleft sentences, or advanced relative clauses
- Portuguese translations must be in European Brazilian Portuguese (not European Portuguese)
- Output ONLY valid JSON array - no markdown, no explanation

Generate ${BATCH_SIZE} vocabulary entries for these words:`;

async function loadVocabulary() {
  try {
    const data = fs.readFileSync(VOCAB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing vocabulary found, starting fresh');
    return [];
  }
}

async function loadInputWords() {
  try {
    const data = fs.readFileSync(INPUT_FILE, 'utf-8');
    return data.split('\n').map(w => w.trim()).filter(w => w && !w.startsWith('#'));
  } catch (error) {
    console.error('Error reading input_words.txt:', error.message);
    process.exit(1);
  }
}

function filterExistingWords(inputWords, vocabulary) {
  const existingWords = new Set(vocabulary.map(w => w.word.toLowerCase()));
  return inputWords.filter(w => !existingWords.has(w.toLowerCase()));
}

async function generateVocabulary(words, apiKey) {
  const prompt = `${PROMPT}\n${words.join(', ')}`;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        topP: 0.95,
        topK: 40,
      }
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function saveVocabulary(vocabulary) {
  const json = JSON.stringify(vocabulary, null, 2);
  fs.writeFileSync(VOCAB_FILE, json + '\n');
  console.log(`Saved ${vocabulary.length} words to ${VOCAB_FILE}`);
}

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error('Error: GOOGLE_API_KEY not found in .env file');
    console.error('Please add your API key to .env file');
    process.exit(1);
  }

  console.log('Loading existing vocabulary...');
  const vocabulary = await loadVocabulary();
  console.log(`Found ${vocabulary.length} words in vocabulary.json`);

  console.log('Loading input words...');
  let inputWords = await loadInputWords();
  console.log(`Found ${inputWords.length} words in input_words.txt`);

  inputWords = filterExistingWords(inputWords, vocabulary);
  console.log(`Filtered to ${inputWords.length} new words`);

  if (inputWords.length === 0) {
    console.log('No new words to process');
    process.exit(0);
  }

  const batches = [];
  for (let i = 0; i < inputWords.length; i += BATCH_SIZE) {
    batches.push(inputWords.slice(i, i + BATCH_SIZE));
  }

  let currentId = vocabulary.length > 0 
    ? Math.max(...vocabulary.map(w => w.id)) + 1 
    : 1;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batch.length} words)...`);

    try {
      const newWords = await generateVocabulary(batch, apiKey);
      
      const wordsWithIds = newWords.map((w, idx) => ({
        ...w,
        id: currentId + idx,
        status: 'not_started'
      }));

      vocabulary.push(...wordsWithIds);
      currentId += wordsWithIds.length;

      await saveVocabulary(vocabulary);
      console.log(`Batch ${i + 1} completed`);

      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error.message);
      break;
    }
  }

  console.log('\nDone!');
  console.log(`Total words: ${vocabulary.length}`);
}

main();