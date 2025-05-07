# 🖥️ CPU Scheduling Algorithm Simulator 📊

A web-based, interactive simulator designed to visualize and compare common CPU scheduling algorithms. This tool helps users understand the behavior and performance implications of techniques like FCFS, SJF, SRTF, Priority (Non-Preemptive & Preemptive), and Round Robin. It's built entirely with client-side HTML, CSS, and Vanilla JavaScript.

**Live Demo:** 🚀 [Link to your live GitHub Pages demo if you have one - e.g., https://sukhpreet7975.github.io/CPU-Scheduling-Algorithm-Simulator/]

## 📋 Table of Contents

*   [✨ Features](#sparkles-features)
*   [💻 Technologies Used](#technologies-used)
*   [⚙️ Installation](#gear-installation)
*   [🚀 Usage](#rocket-usage)
    *   [⌨️ Inputting Processes](#keyboard-inputting-processes)
    *   [🖱️ Selecting an Algorithm](#️-selecting-an-algorithm)
    *   [🎛️ Simulation Controls](#control_knobs-simulation-controls)
    *   [🔍 Understanding the Output](#mag-understanding-the-output)
*   [🤝 Contributing](#🤝-contributing)
*   [🔮 Future Enhancements](#crystal_ball-future-enhancements)
*   [💬 Feedback and Issues](#speech_balloon-feedback-and-issues)
*   [📄 License](#license)

## ✨ Features

*   **Process Configuration:**
    *   Input custom process details: Arrival Time, CPU Burst Time, and Priority.
    *   Automatically generate random process data for quick setup.
    *   Load preset process examples.
*   **Algorithm Selection:**
    *   First-Come, First-Served (FCFS)
    *   Shortest Job First (SJF) (Non-Preemptive - based on next CPU burst)
    *   Shortest Remaining Time First (SRTF) (Preemptive SJF - based on remaining CPU burst)
    *   Priority (Non-Preemptive)
    *   Priority (Preemptive)
    *   Round Robin (RR) with configurable Time Quantum.
*   **Context Switch Simulation:**
    *   Input for Context Switch Time, visually represented on the Gantt chart and factored into metrics.
*   **Real-Time Simulation:**
    *   Observe algorithm execution step-by-step.
    *   Control simulation speed (Play, Pause, Reset, Speed Slider).
*   **Dynamic Gantt Chart:**
    *   Visual representation of process execution over time, including 'Idle' and 'CS' (Context Switch) periods.
    *   Timeline markers for key events.
*   **Live Results Table:**
    *   Displays individual process metrics: Status, Waiting Time, Turnaround Time, Response Time, Completion Time.
    *   Updates in real-time as the simulation progresses.
*   **Performance Metrics:**
    *   Calculates and displays average Waiting Time, Turnaround Time, Response Time, and Throughput upon completion.
*   **System Monitor:**
    *   Live view of simulated CPU Utilization.
    *   Live view of simulated Memory Usage (based on process burst times).
    *   Current simulation time display.
    *   Real-time display of the Ready Queue.
    *   Step-by-step execution trace panel.
*   **Data Persistence:**
    *   Save and Load process configurations to/from browser `localStorage`.
*   **Theme Toggle:**
    *   Switch between Light and Dark mode for user preference.
    *   Theme preference saved in browser's `localStorage`.
*   **Client-Side Logic:**
    *   No backend required; runs entirely in the browser.
    *   Pure Vanilla JavaScript implementation.

## 💻 Technologies Used

*   **HTML5:** Structures the content of the web pages.
*   **CSS3:** Styles the application for a clean interface, layout (Flexbox), and visualizations.
*   **JavaScript (Vanilla):** Implements all client-side logic, including:
    *   Dynamic input field generation and validation (including burst sequence parsing).
    *   Real-time simulation engine (`setInterval`).
    *   Scheduling algorithm logic (FCFS, SJF, SRTF, Priority NP/P, RR).
    *   Handling of I/O bursts and blocked state.
    *   Simulation of context switch overhead.
    *   Performance metric calculations (Wait, TAT, Response, Throughput).
    *   DOM manipulation for results, Gantt chart, system monitor, and trace updates.
    *   Event handling for controls, inputs, save/load, presets.
    *   Basic state saving/loading with `localStorage`.

## ⚙️ Installation

This project is a client-side application and requires no special installation steps beyond a modern web browser.

1.  **Clone the repository (or download the ZIP):**
    ```bash
    git clone https://github.com/Sukhpreet7975/CPU-Scheduling-Algorithm-Simulator.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd CPU-Scheduling-Algorithm-Simulator
    ```
3.  **Open `index.html` in your web browser:**
    *   You can usually do this by double-clicking the `index.html` file.
    *   Alternatively, for a better experience (especially if you plan to make changes), you can use a simple HTTP server. If you have Python installed:
        *   Python 3: `python -m http.server`
        *   Python 2: `python -m SimpleHTTPServer`
        Then open `http://localhost:8000` (or the port specified) in your browser. Many code editors (like VS Code with the "Live Server" extension) also offer this functionality.

## 🚀 Usage

### ⌨️ Inputting Processes

1.  **Number of Processes:** Enter the desired number of processes in the "Number of Processes" field.
2.  **Generate Fields:** Click the "Generate Fields" button. This will create input rows for each process.
    *   The fields will be auto-populated with random values for Arrival Time, Burst Time, and Priority.
3.  **Customize (Optional):** You can manually change the auto-generated values for Arrival, Burst (CPU/IO sequence), and Priority for each process.
4.  **Context Switch Time:** Enter the desired overhead for context switches.

### 🖱️ Selecting an Algorithm

1.  Use the "Algorithm" dropdown menu to select the scheduling algorithm you want to simulate (e.g., FCFS, SJF, RR).
2.  **Time Quantum (for Round Robin):** If you select "Round Robin (RR)", an input field for "Time Quantum" will appear. Enter the desired time slice value.

### 🎛️ Simulation Controls

*   **▶️ Play:** Starts or resumes the simulation.
*   **⏸️ Pause:** Pauses the currently running simulation.
*   **⏹️ Reset:** Stops the simulation, clears all results and the Gantt chart, and resets the processes to their initial state, ready for a new run.
*   **Speed Slider:** Adjust the slider to control the speed of the simulation (milliseconds per step). Slower speeds make it easier to observe step-by-step execution.

### 🔍 Understanding the Output

*   **Status Message:** Provides feedback on the simulation's state or any input errors.
*   **Process Details Table:** Displays PID, Arrival, Burst, Priority, Status, Wait, TAT, Response, and Completion time for each process.
*   **Averages:** Displays the average Waiting Time, Turnaround Time, Response Time, and Throughput.
*   **Gantt Chart:** Visually shows process execution, idle times, and context switches (CS).
*   **System Monitor:**
    *   **CPU & Memory Utilization:** Live progress bars.
    *   **Current Time:** The simulation's internal clock.
    *   **Ready Queue:** Lists PIDs of processes ready for the CPU.
    *   **Execution Trace:** A step-by-step log of scheduler decisions.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or fix: `git checkout -b feature/your-feature-name` or `git checkout -b fix/bug-description`.
3.  **Make your changes** and commit them with clear, descriptive messages.
4.  **Push your changes** to your forked repository: `git push origin feature/your-feature-name`.
5.  **Open a Pull Request** against the `main` branch of this repository.

Please ensure your code adheres to the existing style and that any new features are well-documented.

## 🔮 Future Enhancements

This project is a learning tool and has potential for further development. Some ideas include:

*   **Variable Memory Allocation:** Implement checking/waiting for memory.
*   **Multi-Level Queues (MLQ/MLFQ):** Add support for multiple queue structures.
*   **Multiple I/O Devices:** Simulate different I/O device queues and speeds.
*   **Advanced Gantt Chart:** Zooming, panning, better visual state representation.
*   **Detailed Queue Visualization:** Animated movement of processes between states/queues.
*   **Aging Implementation:** Add aging to priority or MLFQ algorithms.
*   **Improved Error Handling:** More robust parsing and user feedback.
*   **Full Accessibility Audit (a11y):** Comprehensive accessibility improvements.
*   **Performance Optimization:** Especially for Gantt rendering with very long traces.
*   **Code Modularization:** Refactor large JS file into ECMAScript modules.

## 💬 Feedback and Issues

If you encounter any bugs, have suggestions, or want to provide feedback, please [open an issue](https://github.com/Sukhpreet7975/CPU-Scheduling-Algorithm-Simulator/issues) on GitHub.

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---
© 2025 Sukhpreet Singh
