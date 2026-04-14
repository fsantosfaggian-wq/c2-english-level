# LexiC2 - Mastery English Vocabulary Builder

LexiC2 is a web app developed for Brazilian students seeking to reach the **C2 (Mastery)** level of English proficiency. The app focuses on acquiring advanced vocabulary (target of 20,000 words) using **Active Recall** techniques and **multisensory learning**.

## 🚀 Main Features

- **Focus on C2 Level:** Vocabulary selected for high proficiency, including academic terms and literary nuances.

- **Active Recall System:** Translations and definitions are hidden by default, forcing the user to try to remember the meaning before revealing the answer (eye icon 👁️).

- **Automatic Audio Sequencing:** When revealing the answer, the app automatically pronounces the sequence: **Word → Definition → Example**, using a consistent voice to ensure fluency and naturalness.

- **Support for Brazilians:** All words, definitions, and examples include translations into Brazilian Portuguese (PT-BR) to support learning.

- **Manual Audio Controls:** Individual buttons to repeat the pronunciation of each part of the card whenever necessary.

## 🛠️ Technologies Used

- **React / Next.js:** Framework for the interface and routing.

- **Tailwind CSS:** For a minimalist, responsive, and reader-focused design.

- **Web Speech API:** Used for high-quality and synchronized text-to-speech synthesis.

- **Local Storage:** For persistence of user progress directly in the browser.

- **Vercel:** Deployment and hosting platform.

## 📂 Data Structure

The project uses a JSON structure optimized for bilingual learning:

```json
{
  "word": "Bellicose",
  "translation": "Belicoso",
  "definition_en": "Demonstrating aggression and willingness to fight.",
  "definition_pt": "Demonstrar agressividade e disposição para lutar.",
  "example_en": "A bellicose young man eager to prove himself in battle.",
  "example_pt": "Um jovem belicoso ansioso para provar seu valor na batalha."
}
```
