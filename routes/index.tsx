// routes/index.tsx
import { useSignal } from "@preact/signals";
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
  // Add all 8 questions following the same pattern
];

const SCALES = {
  A: ["Very Poorly", "Poorly", "Neutral", "Well", "Excellently Well"],
  B: ["Not Likely", "Slightly Likely", "Neutral", "Likely", "Always"],
};

export default function InnovationTool() {
  const currentStep = useSignal(0);
  const answers = useSignal<(number | undefined)[]>(Array(QUESTIONS.length).fill(undefined));
  const showResults = useSignal(false);

  // Navigation handlers
  const handleNext = () => {
    if (answers.value[currentStep.value] === undefined) {
      alert("Please select an answer before continuing");
      return;
    }
    if (currentStep.value < QUESTIONS.length - 1) {
      currentStep.value++;
    } else {
      showResults.value = true;
    }
  };

  const handlePrev = () => currentStep.value > 0 && currentStep.value--;

  // Score calculation
  const calculateScores = () => {
    const total = answers.value.reduce((a, b) => a + b, 0);
    const average = total / QUESTIONS.length;
    let category = "Beginner";
    if (average >= 3.5) category = "Advanced";
    else if (average >= 2.5) category = "Intermediate";
    return { total, average, category };
  };

  // Chart rendering
  const renderChart = (canvas: HTMLCanvasElement) => {
    new Chart(canvas, {
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

      {/* Form */}
      {!showResults.value ? (
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-4">
              Question {currentStep.value + 1}/{QUESTIONS.length}
            </h2>
            <p class="mb-4">{QUESTIONS[currentStep.value].text}</p>
            <div class="space-y-2">
              {SCALES[QUESTIONS[currentStep.value].scale].map((label, i) => (
                <label class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="answer"
                    value={i + 1}
                    checked={answers.value[currentStep.value] === i + 1}
                    onChange={(e) => {
                      const newAnswers = [...answers.value];
                      newAnswers[currentStep.value] = parseInt(e.currentTarget.value);
                      answers.value = newAnswers;
                    }}
                    class="h-4 w-4 text-blue-600"
                  />
                  <span class="flex-1">
                    {i + 1} - {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
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
        /* Results */
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4">Your Innovation Report</h2>
          <div class="mb-6">
            <canvas ref={renderChart} class="max-h-96"></canvas>
          </div>
          <button
            onClick={() => {
              const pdf = new jsPDF();
              pdf.text("Innovation Index Report", 10, 10);
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