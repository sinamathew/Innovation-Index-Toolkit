// routes/index.tsx
import { useSignal } from "https://esm.sh/@preact/signals@1.2.3";
import { useEffect, useRef } from "preact/hooks";
import { Chart } from "https://esm.sh/chart.js@4.4.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

// Question configuration
const QUESTIONS = [
  {
    text: "How effectively does your organization identify and articulate key business challenges?",
    scale: "A",
  },
  {
    text: "How often does your team refine and reframe problems before jumping to solutions?",
    scale: "B",
  },
  {
    text: "How frequently does your organization involve diverse stakeholders in problem-identification processes?",
    scale: "B",
  },
  {
    text: "To what degree does your company encourage cross-functional collaboration when defining problems?",
    scale: "B",
  },
  {
    text: "How effectively does your organization engage with customers or end-users to understand their pain points?",
    scale: "A",
  },
  {
    text: "How often does your team conduct field research or ethnographic studies to observe problems firsthand?",
    scale: "B",
  },
  {
    text: "To what extent does your organization utilize data analytics to identify emerging challenges?",
    scale: "B",
  },
  {
    text: "How effectively does your company leverage customer feedback channels to spot potential problems?",
    scale: "A",
  },
];

const SCALES = {
  A: ["Very Poorly", "Poorly", "Neutral", "Well", "Excellently Well"],
  B: ["Not Likely", "Slightly Likely", "Neutral", "Likely", "Always"],
};

export default function InnovationTool() {
  const currentStep = useSignal(0);
  const answers = useSignal<(number | undefined)[]>(Array(QUESTIONS.length).fill(undefined));
  const showResults = useSignal(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Navigation handlers
  const handleNext = () => {
    console.log("Current step:", currentStep.value, "Answer:", answers.value[currentStep.value]);
    if (answers.value[currentStep.value] === undefined) {
      alert("Please select an answer before continuing");
      return;
    }
    if (currentStep.value < QUESTIONS.length - 1) {
      currentStep.value++;
    } else {
      showResults.value = true;
      console.log("Showing results:", answers.value);
    }
  };

  const handlePrev = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  // Score calculation
  const calculateScores = () => {
    const total = answers.value.reduce((sum, answer) => sum + (answer ?? 0), 0);
    const average = total / QUESTIONS.length;
    let category = "Beginner";
    if (average >= 3.5) category = "Advanced";
    else if (average >= 2.5) category = "Intermediate";
    return { total, average, category };
  };

  // Initialize the chart only once when results are shown
  useEffect(() => {
    if (showResults.value && canvasRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels: QUESTIONS.map((_, i) => `Q${i + 1}`),
          datasets: [{
            label: "Innovation Scores",
            data: answers.value,
            backgroundColor: "#3B82F6",
          }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [showResults.value]);

  const scores = calculateScores();

  // Handle radio button selection
  const handleAnswerSelection = (value: number) => {
    const newAnswers = [...answers.value];
    newAnswers[currentStep.value] = value;
    answers.value = newAnswers;
    console.log("Updated answers:", newAnswers);
  };

  return (
    <div class="max-w-4xl mx-auto p-4">
      {/* Header */}
      <header class="text-center mb-8">
        <img
          src="https://hybrgroup.net/wp-content/uploads/2023/09/hybr-300x94.png"
          class="h-16 mx-auto mb-4"
        />
        <h1 class="text-2xl font-bold text-gray-800">
          Innovation Index Toolkit
        </h1>
      </header>

      {!showResults.value ? (
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-4">
              Question {currentStep.value + 1}/{QUESTIONS.length}
            </h2>
            <p class="mb-4">{QUESTIONS[currentStep.value].text}</p>
            <div class="space-y-2">
              {SCALES[QUESTIONS[currentStep.value].scale].map((label, i) => (
                <label key={i} class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name={`answer-${currentStep.value}`}
                    value={i + 1}
                    checked={answers.value[currentStep.value] === i + 1}
                    onChange={() => handleAnswerSelection(i + 1)}
                    class="h-4 w-4 text-blue-600"
                  />
                  <span class="flex-1">
                    {i + 1} - {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div class="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep.value === 0}
              class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep.value === QUESTIONS.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      ) : (
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4">Your Innovation Report</h2>
          <div class="mb-4">
            <p>Total Score: {scores.total}</p>
            <p>Average Score: {scores.average.toFixed(2)}</p>
            <p>Category: {scores.category}</p>
          </div>
          <div class="mb-6" style={{ height: "300px" }}>
            <canvas ref={canvasRef} class="max-h-96"></canvas>
          </div>
          <button
            onClick={() => {
              const pdf = new jsPDF();
              pdf.text("Innovation Index Report", 10, 10);
              pdf.text(`Total Score: ${scores.total}`, 10, 20);
              pdf.text(`Average Score: ${scores.average.toFixed(2)}`, 10, 30);
              pdf.text(`Category: ${scores.category}`, 10, 40);
              pdf.save("innovation-report.pdf");
            }}
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
}