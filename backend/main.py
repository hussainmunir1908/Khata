import json
import base64
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="Digital Khata AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

VOICE_SYSTEM_PROMPT = """You are a financial transaction parser for Pakistani users.
Extract transaction details from Urdu/English/mixed text and return a JSON object.
Return ONLY valid JSON with these exact fields:
{
  "amount": <number>,
  "entity": "<person or shop name in English>",
  "category": "<one of: groceries, utilities, food, transport, shopping, healthcare, education, misc>",
  "type": "<credit or debt>",
  "description": "<brief English summary>"
}

=== TYPE DEFINITIONS ===
"debt"   = SOMEONE OWES YOU — money is coming IN to you. You lent money or are owed money.
"credit" = YOU OWE or YOU SPENT — money is going OUT from you. You paid, gave, or borrowed.

CRITICAL: Ask yourself — whose pocket is lighter after this transaction?
- If YOUR pocket is lighter (you paid/gave/borrowed) → "credit"
- If THEIR pocket is lighter (they borrowed from you, owe you) → "debt"

=== URDU PATTERNS ===

DEBT (they owe you — money coming IN):
- "se lene hain / se lena hai"  → "Ali se lene hain 2000" = Ali owes you
- "wapas karna hai"             → "Fatima ko 200 wapas karna hai" = Fatima must return to you
- "udhar diya tha / diye thay"  → "Hassan ko udhar diya tha 3000" = you lent, he owes
- "qarz hai / baqi hai"         → "Ahmed ke 500 baqi hain" = Ahmed still owes
- "X owes me / X owes mujhe"    → direct English debt signal
- "X ne mujh se liye thay"      → X had borrowed FROM you
- "X ko mujhe dene hain"        → X needs to give YOU (they owe)

CREDIT (you spent / you owe — money going OUT):
- "ko diye / ko dia"            → "Fatima ko 200 diye" = you gave to Fatima
- "se liya / se liye"           → "Ali se liya 1500" = you borrowed FROM Ali
- "ko dena hai mujhe"           → "Hassan ko dena hai 3000" = you must give to Hassan
- "kharch kiye / kharch kiya"   → you spent
- "ada karna hai"               → you need to pay
- "I owe X / mujhe X ko dena"  → you owe them
- "paid X / gave X"             → you paid out

=== TRICKY CASES ===
"Ali ko dene hain"              → I owe Ali → CREDIT
"Ali ko mujhe dene hain"        → Ali owes me → DEBT
"diye thay" (past, lent)        → DEBT (you lent, they still owe)
"diye" (just now, current)      → CREDIT (you just paid out)

=== OUTPUT RULES ===
- Always transliterate entity names to English ("سلمان" → "Salman", "دکان" → "Shop")
- All fields must be in English only — no Urdu or Arabic script in output
- Extract numeric amount only (no currency symbols)"""

OCR_SYSTEM_PROMPT = """You are a receipt OCR parser. Extract all data from this receipt image.
The receipt may be in Urdu, English, or mixed. Translate everything to English.
Return ONLY valid JSON with these exact fields:
{
  "shop_name": "<store name>",
  "items": [{"item": "<item name>", "price": <number>}],
  "total_amount": <number>,
  "category": "<one of: groceries, utilities, food, transport, shopping, healthcare, education, misc>",
  "currency": "PKR",
  "description": "<one line English summary>"
}
If you cannot read the receipt clearly, make your best attempt at extraction."""


@app.get("/")
async def root():
    return {"status": "Digital Khata AI Backend running"}


@app.post("/voice-to-ledger")
async def voice_to_ledger(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()

        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=(audio.filename or "recording.webm", audio_bytes, audio.content_type or "audio/webm"),
            language="ur",
        )

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": VOICE_SYSTEM_PROMPT},
                {"role": "user", "content": f"Parse this transaction: {transcript.text}"},
            ],
            response_format={"type": "json_object"},
        )

        data = json.loads(completion.choices[0].message.content)
        return {"transcription": transcript.text, "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr-to-ledger")
async def ocr_to_ledger(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        mime = image.content_type or "image/jpeg"

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": OCR_SYSTEM_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64_image}"},
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"},
        )

        data = json.loads(completion.choices[0].message.content)
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
