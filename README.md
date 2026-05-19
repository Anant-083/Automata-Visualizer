# ⚙️ Automata Visualizer

> **The world's first AI-powered automata diagram generator from natural language.**

🔗 **Live Demo:** https://automata-visualizer.onrender.com

---

## 🚀 What Makes This Different?

Every automata tool online requires you to **manually input states, transitions, and alphabets** one by one through forms and dropdowns.

**Automata Visualizer does something no other tool does:**

> You describe your automaton in plain English → AI understands it → Draws the complete transition diagram instantly.

No other free tool combines:
- ✅ Natural language input
- ✅ AI-powered diagram generation
- ✅ All automata types in one place
- ✅ String testing
- ✅ Transition table generation
- ✅ Light/Dark mode
- ✅ Mobile friendly

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

User types description
↓
Flask backend receives request
↓
Groq AI (LLaMA 3.3 70B) generates automaton JSON
↓
JavaScript renders SVG transition diagram
↓
Diagram displayed instantly

---

## 🏗️ Local Setup

```bash
git clone https://github.com/Anant-083/Automata-Visualizer
cd Automata-Visualizer
pip install -r requirements.txt
Create .env file:
GROQ_API_KEY=your_groq_api_key
Run:
python app.py
👨‍💻 Author
Anant Paul
B.Tech CSE (AI & ML) — Brainware University
🎯 Aspiring Full-Stack AI Developer
(https://github.com/Anant-083)

⭐ Support
If you find this useful, please give it a star ⭐ on GitHub!
Built to make Automata Theory visual, intuitive, and accessible for every CS student.


