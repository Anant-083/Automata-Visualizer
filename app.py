from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an automata theory expert. Return ONLY valid JSON, no markdown, no extra text.

For DFA/NFA/eNFA return:
{
  "type": "DFA",
  "states": ["q0","q1","q2"],
  "alphabet": ["a","b"],
  "transitions": [
    {"from":"q0","input":"a","to":"q1"},
    {"from":"q0","input":"b","to":"q0"}
  ],
  "start": "q0",
  "accept": ["q2"],
  "explanation": "..."
}

For MEALY return:
{
  "type": "MEALY",
  "states": ["q0","q1"],
  "alphabet": ["a","b"],
  "transitions": [
    {"from":"q0","input":"a","to":"q1","output":"0"}
  ],
  "start": "q0",
  "explanation": "..."
}

For MOORE return:
{
  "type": "MOORE",
  "states": ["q0","q1"],
  "alphabet": ["a","b"],
  "outputs": {"q0":"0","q1":"1"},
  "transitions": [
    {"from":"q0","input":"a","to":"q1"}
  ],
  "start": "q0",
  "explanation": "..."
}

For PDA return:
{
  "type": "PDA",
  "states": ["q0","q1","q2"],
  "alphabet": ["a","b"],
  "stack_alphabet": ["A","Z"],
  "transitions": [
    {"from":"q0","input":"a","pop":"Z","push":"AZ","to":"q0"}
  ],
  "start": "q0",
  "start_stack": "Z",
  "accept": ["q2"],
  "explanation": "..."
}

For TM return:
{
  "type": "TM",
  "states": ["q0","q1","qf","qrej"],
  "alphabet": ["a","b"],
  "tape_alphabet": ["a","b","X","Y","_"],
  "transitions": [
    {"from":"q0","read":"a","write":"X","move":"R","to":"q1"}
  ],
  "start": "q0",
  "accept": "qf",
  "reject": "qrej",
  "explanation": "..."
}

For CFG return:
{
  "type": "CFG",
  "variables": ["S","A","B"],
  "terminals": ["a","b"],
  "productions": [
    {"from":"S","to":"AB"},
    {"from":"A","to":"a"},
    {"from":"B","to":"b"}
  ],
  "start": "S",
  "explanation": "..."
}

For REGULAR GRAMMAR return:
{
  "type": "RG",
  "variables": ["S","A"],
  "terminals": ["a","b"],
  "productions": [
    {"from":"S","to":"aA"},
    {"from":"A","to":"b"}
  ],
  "start": "S",
  "explanation": "..."
}
"""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    automata_type = data.get('type', 'DFA')
    description = data.get('description', '')

    prompt = f"Create a {automata_type} for: {description}"

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )

        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'^```json|^```|```$', '', raw, flags=re.MULTILINE).strip()
        result = json.loads(raw)
        return jsonify({"success": True, "data": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/test', methods=['POST'])
def test_string():
    data = request.json
    automaton = data.get('automaton')
    test_input = data.get('input', '')

    prompt = f"""Given this automaton: {json.dumps(automaton)}
Test if the string "{test_input}" is accepted or rejected.
Return ONLY JSON: {{"accepted": true/false, "trace": ["q0","q1",...], "reason": "..."}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an automata theory expert. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )

        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'^```json|^```|```$', '', raw, flags=re.MULTILINE).strip()
        result = json.loads(raw)
        return jsonify({"success": True, "data": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
