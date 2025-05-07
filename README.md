# CPU Scheduling Algorithm Simulator

A web-based, interactive simulator designed to visualize and compare common CPU scheduling algorithms. This tool helps users understand the behavior and performance implications of techniques like FCFS, SJF, SRTF, Priority (Non-Preemptive & Preemptive), and Round Robin. It's built entirely with client-side HTML, CSS, and Vanilla JavaScript.

## Table of Contents

*   [Features](#features)
*   [Technologies Used](#technologies-used)
*   [Installation](#installation)
*   [Usage](#usage)
    *   [Inputting Processes](#inputting-processes)
    *   [Selecting an Algorithm](#selecting-an-algorithm)
    *   [Simulation Controls](#simulation-controls)
    *   [Understanding the Output](#understanding-the-output)
*   [Contributing](#contributing)
*   [Future Enhancements](#future-enhancements)
*   [Feedback and Issues](#feedback-and-issues)
*   [License](#license)

## Features

*   **Process Configuration:**
    *   Input custom process details: Arrival Time, CPU Burst Time, and Priority.
    *   Automatically generate random process data for quick setup.
*   **Algorithm Selection:**
    *   First-Come, First-Served (FCFS)
    *   Shortest Job First (SJF) (Non-Preemptive)
    *   Shortest Remaining Time First (SRTF) (Preemptive SJF)
    *   Priority (Non-Preemptive)
    *   Priority (Preemptive)
    *   Round Robin (RR) with configurable Time Quantum.
*   **Real-Time Simulation:**
    *   Observe algorithm execution step-by-step.
    *   Control simulation speed (Play, Pause, Reset, Speed Slider).
*   **Dynamic Gantt Chart:**
    *   Visual representation of process execution over time, including 'Idle' periods.
    *   Timeline markers for key events.
*   **Live Results Table:**
    *   Displays individual process metrics: Status, Waiting Time, Turnaround Time, Completion Time.
    *   Updates in real-time as the simulation progresses.
*   **Performance Metrics:**
    *   Calculates and displays average Waiting Time and average Turnaround Time upon completion.
*   **System Monitor:**
    *   Live view of simulated CPU Utilization.
    *   Live view of simulated Memory Usage (based on process burst times).
    *   Current simulation time display.
    *   Real-time display of the Ready Queue.
*   **Theme Toggle:**
    *   Switch between Light and Dark mode for user preference.
    *   Theme preference saved in browser's `localStorage`.
*   **Client-Side Logic:**
    *   No backend required; runs entirely in the browser.
    *   Pure Vanilla JavaScript implementation.

## Technologies Used

*   **HTML5:** Structures the content of the web pages.
*   **CSS3:** Styles the application for a clean interface, layout (Flexbox), and visualizations.
*   **JavaScript (Vanilla):** Implements all client-side logic, including:
    *   Dynamic input field generation and validation.
    *   Real-time simulation engine (`setInterval`).
    *   Scheduling algorithm logic.
    *   Performance metric calculations.
    *   DOM manipulation for results, Gantt chart, system monitor, and trace updates.
    *   Event handling.
    *   Theme management.

## Installation

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

## Usage

### Inputting Processes

1.  **Number of Processes:** Enter the desired number of processes in the "Number of Processes" field.
2.  **Generate Fields:** Click the "Generate Fields" button. This will create input rows for each process.
    *   The fields will be auto-populated with random values for Arrival Time, Burst Time, and Priority.
3.  **Customize (Optional):** You can manually change the auto-generated values for Arrival, Burst, and Priority for each process to test specific scenarios.

### Selecting an Algorithm

1.  Use the "Algorithm" dropdown menu to select the scheduling algorithm you want to simulate (e.g., FCFS, SJF, RR).
2.  **Time Quantum (for Round Robin):** If you select "Round Robin (RR)", an input field for "Time Quantum" will appear. Enter the desired time slice value.

### Simulation Controls

*   **▶️ Play:** Starts or resumes the simulation.
*   **⏸️ Pause:** Pauses the currently running simulation.
*   **⏹️ Reset:** Stops the simulation, clears all results and the Gantt chart, and resets the processes to their initial state, ready for a new run.
*   **Speed Slider:** Adjust the slider to control the speed of the simulation (milliseconds per step). Slower speeds make it easier to observe step-by-step execution.

### Understanding the Output

*   **Status Message:** Provides feedback on the simulation's state or any input errors.
*   **Process Details Table:**
    *   **PID:** Process ID.
    *   **Arrival:** The time the process arrives in the system.
    *   **Burst:** The total CPU time required by the process.
    *   **Priority:** The priority of the process (lower number = higher priority).
    *   **Status:** Current state (e.g., Waiting, Ready, Running, Completed).
    *   **Wait:** Total time the process spent waiting in the ready queue.
    *   **TAT:** Turnaround Time (Completion Time - Arrival Time).
    *   **Comp:** Completion Time (the time unit when the process finishes).
*   **Averages:** Displays the average Waiting Time and average Turnaround Time for all completed processes.
*   **Gantt Chart:**
    *   Visually shows which process is running on the CPU at each time unit.
    *   "Idle" indicates the CPU was not utilized.
    *   The timeline below the chart marks significant time units.
*   **System Monitor:**
    *   **CPU Utilization:** Percentage of time the CPU has been busy.
    *   **Memory Usage:** A conceptual representation of memory used by active processes.
    *   **Current Time:** The current time unit of the simulation.
    *   **Ready Queue:** Lists the PIDs of processes currently in the ready state.


## Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or fix: `git checkout -b feature/your-feature-name` or `git checkout -b fix/bug-description`.
3.  **Make your changes** and commit them with clear, descriptive messages.
4.  **Push your changes** to your forked repository: `git push origin feature/your-feature-name`.
5.  **Open a Pull Request** against the `main` branch of this repository.

## Future Enhancements

This project is a learning tool and has potential for further development. Some ideas include:

*   **Variable Memory Allocation:** Implement checking/waiting for memory.
*   **Multi-Level Queues (MLQ/MLFQ):** Add support for multiple queue structures.
*   **Multiple I/O Devices:** Simulate different I/O device queues and speeds.
*   **Advanced Gantt Chart:** Zooming, panning, better visual state representation.
*   **Detailed Queue Visualization:** Animated movement of processes between states/queues.
*   **Aging Implementation:** Add aging to priority or MLFQ algorithms.
*   **Context Switch Overhead:** Input for context switch time that visually appears on Gantt chart and affects metrics. (Your `index.html` mentions this as a current feature, so ensure it's fully implemented or adjust this point)
*   **Save/Load Configurations:** Allow users to save and load process sets to/from local files or browser storage. (Your `index.html` mentions this as a current feature - if implemented, update here)
*   **Preset Examples:** Offer a selection of predefined process scenarios. (Your `index.html` mentions this as a current feature - if implemented, update here)
*   **Code Modularization:** Refactor large JS file into modules for better maintainability.

(Review the "Current Features" and "Future Enhancements" sections in your `index.html` and align these points accordingly. Remove items from "Future Enhancements" if they are already implemented.)

## Feedback and Issues

If you encounter any bugs, have suggestions, or want to provide feedback, please [open an issue](https://github.com/Sukhpreet7975/CPU-Scheduling-Algorithm-Simulator/issues) on GitHub.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---
© 2025 [Sukhpreet Singh]
