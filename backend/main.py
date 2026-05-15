from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
import os

# LOAD ENV
load_dotenv()

# FASTAPI APP
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OPENROUTER CLIENT
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# MEMORY
conversation_memory = []

# HOME ROUTE
@app.get("/")
def home():

    return {
        "message": "AI Voice Agent Backend Running"
    }

# CHAT ROUTE
@app.get("/chat")
def chat(message: str, scenario: str = "general"):

    try:

        # SCENARIOS
        scenario_prompts = {

            "Calling Agent":
                """
                You are a professional calling agent.
                Talk naturally and professionally.
                Keep responses short.
                """,

            "Customer Support":
                """
                You are a customer support assistant.
                Solve user problems politely.
                Keep replies conversational.
                """,

            "Technical Assistant":
                """
                You are a technical assistant.
                Help users solve technical problems.
                Give beginner-friendly answers.
                """
        }

        # SYSTEM PROMPT
        system_prompt = scenario_prompts.get(
            scenario,
            "You are a helpful AI assistant."
        )

        # STORE USER MESSAGE
        conversation_memory.append(f"User: {message}")

        # LAST 6 MESSAGES
        recent_memory = "\n".join(conversation_memory[-6:])

        # FINAL PROMPT
        final_prompt = f"""
        {system_prompt}

        Conversation:
        {recent_memory}

        User: {message}

        AI:
        """

        # AI RESPONSE
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": final_prompt
                }
            ]
        )

        print(response)
        ai_reply = response.choices[0].message.content

        # STORE AI RESPONSE
        conversation_memory.append(f"AI: {ai_reply}")

        return {
            "reply": ai_reply
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }