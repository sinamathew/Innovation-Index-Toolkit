import { useSignal } from "@preact/signals";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Chart } from "https://esm.sh/chart.js@3.7.1";
import { jsPDF } from "https://esm.sh/jspdf@2.4.0";

// Define questions
const questions = [
	"How effectively does your organization identify and articulate key business challenges?",
	"How often does your team refine and reframe problems before jumping to solutions?",
	"How frequently does your organization involve diverse stakeholders in problem-identification processes?",
	"To what degree does your company encourage cross-functional collaboration when defining problems?",
	"How effectively does your organization engage with customers or end-users to understand their pain points?",
	"How often does your team conduct field research or ethnographic studies to observe problems firsthand?",
	"To what extent does your organization use data analytics to identify emerging issues or trends?",
	"How effectively does your company leverage customer feedback channels to spot potential problems?",
];

// Define two sets of answers options 
const answerOptionsA = [
	"Very Poorly",
	"Poorly",
	"Neutral",
	"Well",
	"Execellently Well",
];

const answerOptionsB = [
	"Not Likely",
	"Slightly Likely",
	"Neutral",
	"Likely",
	"Always",
];

// Map answer to the respective answer set (true = set A, false = set B)
const questionSetMap = [true, false, false, false, true, false, false, true];



export default function Home(props: PageProps) {

	// Using signals for state management
	const currentQuestion = useSignal(0);
	const answers = useSignal<number[]>([]);
	const showResults = useSignal(false);

	// Function to display a single question with radio options
	const displayQuestion = (index: number) => {

		//Choose the correct set
		const options = questionSetMap[index] ?answerOptionsA : answerOptionsB;

		return (
			<div class="div-question">
				<label>{questions[index]}</label>
				{options.map((label, i) => {
					const value = i + 1; // Numeric value from 1 to 5
					return (<>
						<input
							type="radio"
							name={`question-${index}`}
							value={value}
							id={`q${index}-option${value}`}
							checked={answers.value[index] === value}
						/>
						<label htmlFor={`q${index}-option${value}`}>{label}</label>
					</>);
				})}
			</div>
		);
	};

  // Function to handle moving to the next question or displaying results
  const handleNext = () => {
    // Get the selected radio button value
    const selectedAnswer = parseInt(
      (document.querySelector(
        `input[name="question-${currentQuestion.value}"]:checked`
      ) as HTMLInputElement)?.value
    );
    // Alert if no answer is selected
    if (isNaN(selectedAnswer) && currentQuestion.value < questions.length) {
      alert("Please select an answer");
      return;
    }

    // Update the answers signal and move to the next question or show results
    if (currentQuestion.value < questions.length - 1) {
      answers.value = [
        ...answers.value.slice(0, currentQuestion.value),
        selectedAnswer,
      ];
      currentQuestion.value++;
    } else {
      answers.value = [
        ...answers.value.slice(0, currentQuestion.value),
        selectedAnswer,
      ];
      showResults.value = true;
    }
  };

  // Function to handle moving to the previous question
  const handlePrev = () => {
    if (currentQuestion.value > 0) {
      currentQuestion.value--;
    }
  };

  // Function to display the results chart and download button
  const displayResults = () => {
    // Count the occurrences of each answer
    const counts = [0, 0, 0, 0, 0];
    answers.value.forEach((answer) => counts[answer - 1]++);

    // Create a canvas element for the chart
    const canvas = document.createElement("canvas");
    // Initialize Chart.js with the counts
    new Chart(canvas.getContext("2d")!, {
      type: "bar",
      data: {
        labels: ["1", "2", "3", "4", "5"],
        datasets: [{
          label: "Response Distribution",
          data: counts,
          backgroundColor: "#4eed80",
          borderColor: "#6e87d4",
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Function to download the chart as a PDF
    const downloadPdf = () => {
      const canvasImg = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF();
      pdf.addImage(canvasImg, "PNG", 15, 15, 180, 100);
      pdf.save("survey-results.pdf");
    };

    return (
      <div id="results-container">
        {canvas}
        <button onClick={downloadPdf}>Download PDF Report</button>
      </div>
    );
  };

  return (
    <div id="survey-container">
      {/* Include the external stylesheet */}
      <link rel="stylesheet" href="/styles.css" />
      <div id="header">
        <img src="https://hybrgroup.net/wp-content/uploads/2023/09/hybr-300x94.png" alt="Logo" />
        <h1>Innovation Index Toolkit</h1>
      </div>
      {!showResults.value && (
        <>
          <div id="question-container">
            {displayQuestion(currentQuestion.value)}
          </div>
          <div id="navigation">
            <button
              class="button-prev"
              disabled={currentQuestion.value === 0}
              onClick={handlePrev}
            >
              Previous
            </button>
            <button class="button-next" onClick={handleNext}>
              {currentQuestion.value === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </>
      )}
      {showResults.value && displayResults()}
    </div>
  );
}

