"use client"

import { useState, useRef, useEffect } from "react"

export default function Home() {

  // =========================
  // STATES
  // =========================

  const [messages, setMessages] = useState<any[]>([])

  const [status, setStatus] = useState("Waiting...")

  const [scenario, setScenario] = useState("")

  const [input, setInput] = useState("")

  const recognitionRef = useRef<any>(null)

  const bottomRef = useRef<any>(null)

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    })

  }, [messages])

  // =========================
  // SPEAK AI RESPONSE
  // =========================

  function speakResponse(text: string) {

    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(text)

    speech.lang = "en-US"

    speech.rate = 1

    speech.pitch = 1

    speech.onstart = () => {

      setStatus("AI Speaking...")
    }

    speech.onend = () => {

      setStatus("Waiting...")
    }

    window.speechSynthesis.speak(speech)
  }

  // =========================
  // GET AI RESPONSE
  // =========================

  async function getAIResponse(text: string) {

    try {

      const res = await fetch(
        `https://fastapi-one-zeta.vercel.app/chat?message=${encodeURIComponent(text)}&scenario=${encodeURIComponent(scenario)}`
      )

      const data = await res.json()

      console.log("AI DATA:", data)

      // HANDLE ERROR

      if (data.error) {

        setMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            text: "AI Service Temporarily Unavailable"
          }
        ])

        setStatus("AI Error")

        return
      }

      const aiReply = data.reply || "No AI Reply"

      // ADD AI MESSAGE

      setMessages((prev) => [
        ...prev,
        {
          sender: "AI",
          text: aiReply
        }
      ])

      speakResponse(aiReply)

    } catch (error) {

      console.log(error)

      setMessages((prev) => [
        ...prev,
        {
          sender: "AI",
          text: "Backend Connection Error"
        }
      ])

      setStatus("Backend Error")
    }
  }

  // =========================
  // SEND TEXT MESSAGE
  // =========================

  async function sendMessage() {

    if (!input.trim()) return

    // ADD USER MESSAGE

    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: input
      }
    ])

    const userMessage = input

    setInput("")

    setStatus("Processing...")

    await getAIResponse(userMessage)
  }

  // =========================
  // START LISTENING
  // =========================

  function startListening() {

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {

      alert("Speech Recognition Not Supported")

      return
    }

    const recognition = new SpeechRecognition()

    recognitionRef.current = recognition

    recognition.lang = "en-US"

    recognition.continuous = true

    recognition.interimResults = true

    setStatus("Listening...")

    recognition.start()

    let finalTranscript = ""

    recognition.onresult = async (event: any) => {

      let transcriptText = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {

        transcriptText += event.results[i][0].transcript
      }

      // WAIT UNTIL USER FINISHES SPEAKING

      if (event.results[event.results.length - 1].isFinal) {

        finalTranscript = transcriptText

        recognition.stop()

        if (!finalTranscript.trim()) return

        // ADD USER MESSAGE

        setMessages((prev) => [
          ...prev,
          {
            sender: "You",
            text: finalTranscript
          }
        ])

        setStatus("Processing...")

        await getAIResponse(finalTranscript)
      }
    }

    recognition.onerror = () => {

      setStatus("Speech Error")
    }
  }

  // =========================
  // START CONVERSATION
  // =========================

  function startConversation() {

    if (!scenario) {

      alert("Please Select Scenario")

      return
    }

    startListening()
  }

  // =========================
  // STOP CONVERSATION
  // =========================

  function stopConversation() {

    window.speechSynthesis.cancel()

    if (recognitionRef.current) {

      recognitionRef.current.stop()
    }

    setStatus("Conversation Stopped")
  }

  // =========================
  // CLEAR CONVERSATION
  // =========================

  function clearConversation() {

    setMessages([])

    setStatus("Waiting...")
  }

  // =========================
  // UI
  // =========================

  return (

    <div className="h-screen text-white flex flex-col relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">

      {/* ANIMATED BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        {/* BLUE GLOW */}

        <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

        {/* PURPLE GLOW */}

        <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

        {/* CENTER GLOW */}

        <div className="absolute top-[40%] left-[35%] w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-3xl"></div>

      </div>

      {/* MAIN CONTENT */}

      <div className="relative z-10 flex flex-col h-full">

        {/* HEADER */}

        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-gray-800 px-4 py-3">

          {/* TITLE */}

          <h1 className="text-center text-2xl font-semibold tracking-wide">
            AI Voice Agent
          </h1>

          {/* SELECT SCENARIO */}

          <div className="flex justify-center mt-4">

            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="bg-gray-900/80 text-white px-5 py-3 rounded-full text-sm border border-gray-700 outline-none cursor-pointer shadow-lg"
            >

              <option value="" disabled>
                Select Scenario
              </option>

              <option value="Calling Agent">
                Calling Agent
              </option>

              <option value="Customer Support">
                Customer Support
              </option>

              <option value="Technical Assistant">
                Technical Assistant
              </option>

            </select>

          </div>

          {/* STATUS */}

          <div className="flex justify-center gap-6 mt-3 text-sm">

            <p className="text-green-400">
              Status: {status}
            </p>

            <p className="text-yellow-400">
              {scenario || "No Scenario Selected"}
            </p>

          </div>

        </div>

        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto px-4 py-4">

          <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 pb-52">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`p-4 rounded-2xl text-base max-w-[80%] shadow-xl backdrop-blur-md
                ${msg.sender === "You"
                    ? "bg-blue-600/80 self-end"
                    : "bg-gray-800/80 self-start"
                  }`}
              >

                <p className="font-bold mb-1 text-sm">
                  {msg.sender}
                </p>

                <p className="leading-7">
                  {msg.text}
                </p>

              </div>
            ))}

            <div ref={bottomRef}></div>

          </div>

        </div>

        {/* BOTTOM BAR */}

        <div className="fixed bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-gray-800 px-4 py-4 z-50">

          <div className="max-w-5xl mx-auto flex items-center gap-3">

            {/* TALK BUTTON */}

            <button
              onClick={startConversation}
              className="bg-blue-600 hover:bg-blue-700 transition px-4 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg"
            >
              🎤 Talk
            </button>

            {/* STOP BUTTON */}

            <button
              onClick={stopConversation}
              className="bg-red-600 hover:bg-red-700 transition px-4 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg"
            >
              ⏹ Stop
            </button>

            {/* CLEAR BUTTON */}

            <button
              onClick={clearConversation}
              className="bg-gray-700 hover:bg-gray-800 transition px-4 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg"
            >
              🗑 Clear
            </button>

            {/* INPUT */}

            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  sendMessage()
                }
              }}
              className="flex-1 bg-gray-900/80 text-white px-5 py-3 rounded-full outline-none border border-gray-700"
            />

            {/* SEND BUTTON */}

            <button
              onClick={sendMessage}
              className="bg-green-600 hover:bg-green-700 transition px-5 py-3 rounded-full text-sm shadow-lg"
            >
              ➤ Send
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}