import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM from "https://esm.sh/react-dom@18.2.0";
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

const SCALES: Record<string, string[]> = {
  A: ["Very Poorly", "Poorly", "Neutral", "Well", "Excellently Well"],
  B: ["Not Likely", "Slightly Likely", "Neutral", "Likely", "Always"],
};

function InnovationTool() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(
    Array(QUESTIONS.length).fill(undefined)
  );
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const handleNext = () => {
    // Check that an answer is selected
    if (answers[currentStep] === undefined) {
      alert("Please select an answer before continuing");
      return;
    }
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const calculateScores = () => {
    const total = answers.reduce((sum, answer) => sum + (answer ?? 0), 0);
    const average = total / QUESTIONS.length;
    let category = "Beginner";
    if (average >= 3.5) category = "Advanced";
    else if (average >= 2.5) category = "Intermediate";
    return { total, average, category };
  };

  useEffect(() => {
    if (showResults && canvasRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels: QUESTIONS.map((_, i) => `Q${i + 1}`),
          datasets: [
            {
              label: "Innovation Scores",
              data: answers,
              backgroundColor: "#3B82F6",
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [showResults]);

  const scores = calculateScores();

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <img
          src="https://hybrgroup.net/wp-content/uploads/2023/09/hybr-300x94.png"
          className="h-16 mx-auto mb-4"
          alt="Hybr Group Logo"
        />
        <h1 className="text-2xl font-bold text-gray-800">
          Innovation Index Toolkit
        </h1>
      </header>

      {/* Form / Results */}
      {!showResults ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Question {currentStep + 1}/{QUESTIONS.length}
            </h2>
            <p className="mb-4">{QUESTIONS[currentStep].text}</p>
            <div className="space-y-2">
              {SCALES[QUESTIONS[currentStep].scale].map((label, i) => (
                <label
                  key={i}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="radio"
                    name={`answer-${currentStep}`} // unique name per question
                    value={i + 1}
                    checked={answers[currentStep] === i + 1}
                    onChange={(e) =>
                      handleAnswerChange(parseInt(e.target.value))
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="flex-1">
                    {i + 1} - {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === QUESTIONS.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      ) : (
        // Results
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Your Innovation Report</h2>
          <div className="mb-4">
            <p>Total Score: {scores.total}</p>
            <p>Average Score: {scores.average.toFixed(2)}</p>
            <p>Category: {scores.category}</p>
          </div>
          <div className="mb-6" style={{ height: "300px" }}>
            <canvas ref={canvasRef} className="max-h-96"></canvas>
          </div>
          <button
            onClick={() => {
              const pdf = new jsPDF();
              pdf.text("Innovation Index Report", 10, 10);
              pdf.text(`Total Score: ${scores.total}`, 10, 20);
              pdf.text(
                `Average Score: ${scores.average.toFixed(2)}`,
                10,
                30
              );
              pdf.text(`Category: ${scores.category}`, 10, 40);
              pdf.save("innovation-report.pdf");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<InnovationTool />, document.getElementById("root"));
