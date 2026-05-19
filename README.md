# ⚙️ Automata Visualizer

> **One of the most complete AI-powered automata visualizers — supporting all 9 automata types from natural language descriptions.**

🔗 **Live Demo:** https://automata-visualizer.onrender.com

---

## 🎯 Problem It Solves

Every CS student studying Automata Theory faces the same problem:

- 📚 Textbook diagrams are static and hard to understand
- ✏️ Drawing transition diagrams by hand is time-consuming and error-prone
- 🖥️ Existing online tools require manual input of every state and transition
- 😕 No single tool covers all automata types in one place

**Automata Visualizer solves this by:**

- Letting you describe your automaton in plain English
- Instantly generating a clean, accurate transition diagram
- Supporting all 9 automata types in one place
- Making it easy to test strings and verify your understanding
- Being accessible on any device including mobile

> *From exam preparation to project work — just describe it and see it.*

---

## 🚀 What Makes This Different?

Most automata tools online require you to manually input states, transitions, and alphabets one by one through forms and dropdowns. Some AI tools exist but only support DFA/NFA.

You describe your automaton in plain English → AI understands it → Draws the complete transition diagram instantly.

| Feature | Other Tools | Automata Visualizer |
|---------|------------|-------------------|
| Natural language input | Partial | ✅ Full |
| DFA / NFA | ✅ | ✅ |
| PDA / Turing Machine | ❌ | ✅ |
| Mealy / Moore Machine | ❌ | ✅ |
| CFG / Regular Grammar | ❌ | ✅ |
| String Testing | Partial | ✅ |
| Transition Table | Partial | ✅ |
| Mobile Friendly | ❌ | ✅ |
| Light / Dark Mode | ❌ | ✅ |
| Free & Open Source | Partial | ✅ |

---

## 🧠 Supported Automata Types

| Type | Description |
|------|-------------|
| DFA | Deterministic Finite Automaton |
| NFA | Non-deterministic Finite Automaton |
| ε-NFA | NFA with Epsilon transitions |
| PDA | Pushdown Automaton |
| Turing Machine | With tape alphabet visualization |
| Mealy Machine | Output on transitions |
| Moore Machine | Output on states |
| CFG | Context Free Grammar |
| Regular Grammar | Production rules |

---

## ✨ Features

- 🗣️ **Natural Language Input** — Just describe what you want
- 🎨 **SVG Diagrams** — Clean, crisp, zoomable diagrams
- 🧪 **String Testing** — Test if a string is accepted or rejected
- 📊 **Transition Table** — Auto-generated for every automaton
- 🌙 **Light/Dark Mode** — Toggle anytime
- 📱 **Mobile Friendly** — Works perfectly on phone

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, SVG
- **Backend:** Python, Flask
- **AI:** Groq API (LLaMA 3.3 70B)
- **Deployment:** Render

---

## 🖥️ How It Works

1. User types a description in plain English
2. Flask backend receives the request
3. Groq AI (LLaMA 3.3 70B) generates automaton JSON
4. JavaScript renders SVG transition diagram
5. Diagram displayed instantly

---

## 🏗️ Local Setup

1. Clone the repo

   git clone https://github.com/Anant-083/Automata-Visualizer
   cd Automata-Visualizer

2. Install dependencies

   pip install -r requirements.txt

3. Create a .env file and add your Groq API key

   GROQ_API_KEY=your_groq_api_key

4. Run the app

   python app.py

5. Open http://localhost:5000

---

## 👨‍💻 Author

**Anant Paul**
B.Tech CSE (AI & ML) — Brainware University
🎯 Aspiring Full-Stack AI Developer

[

![GitHub](https://img.shields.io/badge/GitHub-Anant--083-blue?style=flat&logo=github)

](https://github.com/Anant-083)

---

## ⭐ Support

If you find this useful, please give it a star ⭐ on GitHub!

---

> *Built to make Automata Theory visual, intuitive, and accessible for every CS student.*
