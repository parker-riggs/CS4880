from flask import Flask, render_template, request, jsonify, send_file
from groq import Groq
from dotenv import load_dotenv
import os, io, asyncio, re, json
import edge_tts
import html as html_lib

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── NPC Dialogue ──────────────────────────────────────────────────────────────

WORLD_CONTEXT = """
World: The village of Eldoria is in danger. A darkness spreads from the Cursed Mines to the south.
Strange creatures lurk at the forest edge at night. Three weeks ago, a group of villagers went into
the mines and only one returned — mad and mute. The village elder is desperate for help.
"""

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/interact", methods=["POST"])
def interact():
    data      = request.json
    npc       = data.get("npc", {})
    choice    = data.get("choice", "")
    history   = data.get("history", [])
    flags     = data.get("flags", {})

    if not history:
        system_msg = f"""You are {npc['name']} in a dark fantasy RPG village.
Character: {npc['role']}
{WORLD_CONTEXT}
Player flags (what the player has done so far): {json.dumps(flags)}

Rules:
- Stay in character. Speak naturally, 1-3 sentences maximum.
- After your line, provide exactly 3 short response options for the player:
  OPT_1: [player response, under 8 words]
  OPT_2: [player response, under 8 words]
  OPT_3: [a farewell/leave option]
- If the player chose a farewell option, reply briefly and add END_CONVERSATION on its own line."""
        history = [
            {"role": "system", "content": system_msg},
            {"role": "user",   "content": "The adventurer walks up to you. Greet them."},
        ]
    else:
        history.append({"role": "user", "content": f'Player: "{choice}"'})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=history,
        max_tokens=220,
    )

    reply = response.choices[0].message.content
    history.append({"role": "assistant", "content": reply})

    # Parse out dialogue text and options
    dialogue = re.sub(r'OPT_\d+:\s*.+', '', reply, flags=re.IGNORECASE)
    dialogue = re.sub(r'END_CONVERSATION', '', dialogue).strip()
    options  = [m.strip() for m in re.findall(r'OPT_\d+:\s*(.+)', reply, re.IGNORECASE)]
    ended    = bool(re.search(r'END_CONVERSATION', reply, re.IGNORECASE))

    return jsonify({
        "dialogue": dialogue,
        "options":  options[:3],
        "ended":    ended,
        "history":  history,
    })


# ── Text-to-Speech ────────────────────────────────────────────────────────────

VOICE = "en-US-ChristopherNeural"

def _build_ssml(text: str) -> str:
    safe = html_lib.escape(text)
    safe = re.sub(r'([.!?])\s+', r'\1<break time="500ms"/>', safe)
    return (
        f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
        f'<voice name="{VOICE}"><prosody rate="-20%" pitch="-4Hz">{safe}</prosody></voice></speak>'
    )

async def _tts(text: str) -> io.BytesIO:
    buf = io.BytesIO()
    async for chunk in edge_tts.CommunicateSSML(_build_ssml(text)).stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])
    buf.seek(0)
    return buf

@app.route("/narrate", methods=["POST"])
def narrate():
    text = request.json.get("text", "").strip()
    if not text:
        return ("", 204)
    return send_file(asyncio.run(_tts(text)), mimetype="audio/mpeg")


if __name__ == "__main__":
    app.run(debug=True)
