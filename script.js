document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const numProcessesInput = document.getElementById('num-processes');
    const generateInputsButton = document.getElementById('generate-inputs');
    const processInputsContainer = document.getElementById('process-inputs-container');
    const algorithmSelect = document.getElementById('algorithm');
    const quantumGroup = document.getElementById('quantum-group');
    const quantumInput = document.getElementById('quantum');
    const statusMessage = document.getElementById('status-message');
    const resultsOutputDiv = document.getElementById('results-output');
    const resultsTbody = document.getElementById('results-tbody');
    const averagesOutput = document.getElementById('averages-output');
    const avgWaitTimeSpan = document.getElementById('avg-wait-time');
    const avgTatTimeSpan = document.getElementById('avg-tat-time');
    const ganttChartDiv = document.getElementById('gantt-chart');
    const ganttTimelineDiv = document.getElementById('gantt-timeline');

    // NEW: Control Elements
    const playPauseButton = document.getElementById('play-pause-button');
    const resetButton = document.getElementById('reset-button');
    const speedSlider = document.getElementById('speed-slider');
    const speedValueSpan = document.getElementById('speed-value');

    // NEW: Monitor Elements
    const cpuUtilizationBar = document.getElementById('cpu-utilization-bar');
    const cpuUtilizationValue = document.getElementById('cpu-utilization-value');
    const memoryUtilizationBar = document.getElementById('memory-utilization-bar');
    const memoryUtilizationValue = document.getElementById('memory-utilization-value');
    const currentTimeValue = document.getElementById('current-time-value');
    const readyQueueValue = document.getElementById('ready-queue-value');

    // --- Simulation State Variables ---
    let processes = [];         // Holds the Process objects
    let simulationIntervalId = null; // ID for setInterval
    let currentTime = 0;
    let completedProcesses = 0;
    let isPaused = true;
    let simulationSpeed = 500; // ms per step
    let readyQueue = [];        // Queue of process indices ready to run
    let runningProcessIndex = -1; // Index of the currently running process, -1 if none
    let ganttLog = [];          // Log for building Gantt chart [{ pid, start, end }, ...]
    let timeQuantum = 2;        // Default for RR
    let currentQuantumSlice = 0;// Time slice used by current process in RR
    let selectedAlgorithm = 'fcfs';

    // NEW: Monitor State
    let totalCpuBusyTime = 0;
    const TOTAL_SYSTEM_MEMORY = 2048; // MB (Arbitrary)
    const MEMORY_PER_BURST_UNIT = 10; // MB (Arbitrary)

    // --- Process Class (Enhanced) ---
    class Process {
        constructor(id, arrival, burst, priority) {
            this.id = id;
            this.arrival = arrival;
            this.burst = burst; // Original burst time
            this.priority = priority; // Lower number means higher priority

            // Simulation metrics & state
            this.remaining_burst = burst;
            this.start_time = -1; // Time it first starts execution
            this.completion_time = -1;
            this.waiting_time = 0;
            this.turnaround_time = 0;
            this.last_execution_time = -1; // For calculating waiting time accurately

            // NEW States
            this.status = 'Waiting'; // Waiting, Ready, Running, Completed
            this.memory_required = Math.max(10, this.burst * MEMORY_PER_BURST_UNIT); // Min 10MB
        }

        reset() {
            this.remaining_burst = this.burst;
            this.start_time = -1;
            this.completion_time = -1;
            this.waiting_time = 0;
            this.turnaround_time = 0;
            this.last_execution_time = -1;
            this.status = 'Waiting';
        }
    }

    // --- Event Listeners ---
    generateInputsButton.addEventListener('click', () => {
        resetSimulation(); // Reset if generating new inputs
        generateProcessInputs();
    });
    algorithmSelect.addEventListener('change', () => {
        selectedAlgorithm = algorithmSelect.value.toLowerCase();
        toggleQuantumInput();
        resetSimulation(); // Algorithm change requires reset
    });
    numProcessesInput.addEventListener('change', () => {
         resetSimulation();
         generateProcessInputs();
    });
    quantumInput.addEventListener('change', () => {
         if (selectedAlgorithm === 'rr') {
             resetSimulation(); // Quantum change requires reset for RR
         }
    });

    // NEW: Control Listeners
    playPauseButton.addEventListener('click', togglePlayPause);
    resetButton.addEventListener('click', resetSimulation);
    speedSlider.addEventListener('input', updateSpeed);

    // --- Initial Setup ---
    generateProcessInputs();
    toggleQuantumInput();
    updateSpeed(); // Set initial speed display
    setStatus('Ready. Configure processes and press Play.', 'info');
    disableControls(true); // Disable controls until processes are generated

    // --- Core Functions ---

    function generateProcessInputs() {
        const n = parseInt(numProcessesInput.value, 10) || 0;
        processInputsContainer.innerHTML = ''; // Clear existing inputs
        clearResultsAndStatus(); // Clear previous results
        processes = []; // Clear internal process data

        if (n <= 0) {
             setStatus('Please enter a positive number of processes.', 'error');
             disableControls(true);
            return;
        }

        for (let i = 1; i <= n; i++) {
            const div = document.createElement('div');
            div.classList.add('process-entry');
            div.dataset.processId = i;

            const row1 = document.createElement('div');
            row1.classList.add('process-entry-row');
            row1.innerHTML = `
                <span class="process-id">P${i}:</span>
                <label for="arrival-${i}">Arrival:</label>
                <input type="number" id="arrival-${i}" class="process-input arrival-input" min="0" value="${Math.floor(Math.random() * (n+1))}" required>
                <label for="burst-${i}">Burst:</label>
                <input type="number" id="burst-${i}" class="process-input burst-input" min="1" value="${Math.floor(Math.random() * 10) + 1}" required>
            `;

            const row2 = document.createElement('div');
            row2.classList.add('process-entry-row');
            row2.style.paddingLeft = "40px"; // Align priority
            row2.innerHTML = `
                <label for="priority-${i}">Priority:</label>
                <input type="number" id="priority-${i}" class="process-input priority-input" min="0" value="${Math.floor(Math.random() * 10)}" required>
            `;

            div.appendChild(row1);
            div.appendChild(row2);
            processInputsContainer.appendChild(div);
        }
        setStatus('Process fields generated. Press Play to start.', 'info');
        initializeTable(n); // Create table rows immediately
        disableControls(false); // Enable controls
    }

    function toggleQuantumInput() {
        selectedAlgorithm = algorithmSelect.value.toLowerCase(); // Ensure it's updated
        quantumGroup.style.display = (selectedAlgorithm === 'rr') ? 'block' : 'none';
    }

    function setStatus(message, type = 'info') { // types: info, success, error
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
        statusMessage.style.display = 'block';
    }

    function clearResultsAndStatus() {
        resultsOutputDiv.innerHTML = '<p>Generate processes, select an algorithm, and press Play.</p>';
        resultsTbody.innerHTML = '';
        averagesOutput.innerHTML = `<p>Avg Waiting Time: <span id="avg-wait-time">N/A</span></p><p>Avg Turnaround Time: <span id="avg-tat-time">N/A</span></p>`;
        ganttChartDiv.innerHTML = '';
        ganttTimelineDiv.innerHTML = '';
        statusMessage.style.display = 'none';
        cpuUtilizationBar.style.width = '0%';
        cpuUtilizationValue.textContent = '0%';
        memoryUtilizationBar.style.width = '0%';
        memoryUtilizationValue.textContent = `0% (0/${TOTAL_SYSTEM_MEMORY} MB)`;
        currentTimeValue.textContent = '0';
        readyQueueValue.textContent = '[Empty]';

         // Clear error styling from inputs
         const inputs = processInputsContainer.querySelectorAll('.process-input');
         inputs.forEach(input => input.classList.remove('input-error'));
         quantumInput.classList.remove('input-error');
    }

    function validateInputs() {
        let isValid = true;
        const tempProcesses = [];
        const processEntries = processInputsContainer.querySelectorAll('.process-entry');

        if(processEntries.length === 0) {
            setStatus('Error: No process fields generated.', 'error');
            return null;
        }

        processEntries.forEach((entry) => {
             const id = parseInt(entry.dataset.processId, 10);
             const arrivalInput = entry.querySelector(`#arrival-${id}`);
             const burstInput = entry.querySelector(`#burst-${id}`);
             const priorityInput = entry.querySelector(`#priority-${id}`);

             arrivalInput.classList.remove('input-error');
             burstInput.classList.remove('input-error');
             priorityInput.classList.remove('input-error');

             const arrival = parseInt(arrivalInput.value, 10);
             const burst = parseInt(burstInput.value, 10);
             const priority = parseInt(priorityInput.value, 10);

             let hasError = false;
             if (isNaN(arrival) || arrival < 0) {
                 arrivalInput.classList.add('input-error'); hasError = true;
             }
             if (isNaN(burst) || burst <= 0) {
                 burstInput.classList.add('input-error'); hasError = true;
             }
             if (isNaN(priority) || priority < 0) {
                 priorityInput.classList.add('input-error'); hasError = true;
             }

             if (hasError) {
                 isValid = false;
             } else {
                 tempProcesses.push(new Process(id, arrival, burst, priority));
             }
         });

         // Validate quantum if RR is selected
         let quantum = null;
         if (selectedAlgorithm === 'rr') {
             quantumInput.classList.remove('input-error');
             quantum = parseInt(quantumInput.value, 10);
             if (isNaN(quantum) || quantum <= 0) {
                 setStatus('Error: Invalid Time Quantum for RR. Must be > 0.', 'error');
                 quantumInput.classList.add('input-error');
                 isValid = false;
             } else {
                 timeQuantum = quantum; // Store valid quantum
             }
         }

        if (!isValid) {
             setStatus('Error: Please fix the highlighted input errors.', 'error');
             return null;
        }

        return tempProcesses;
    }

    // MODIFIED: Initialize table structure without results
    function initializeTable(numProcesses) {
        resultsTbody.innerHTML = ''; // Clear previous rows
        resultsOutputDiv.innerHTML = ''; // Clear initial message
        if (numProcesses > 0) {
            for(let i = 1; i <= numProcesses; i++) {
                const entry = processInputsContainer.querySelector(`.process-entry[data-process-id="${i}"]`);
                if (!entry) continue;
                const arrival = entry.querySelector(`#arrival-${i}`).value;
                const burst = entry.querySelector(`#burst-${i}`).value;
                const priority = entry.querySelector(`#priority-${i}`).value;

                const row = resultsTbody.insertRow();
                row.id = `process-row-${i}`; // ID for easy update
                row.innerHTML = `
                    <td>${i}</td>
                    <td class="arrival-val">${arrival}</td>
                    <td class="burst-val">${burst}</td>
                    <td class="priority-val">${priority}</td>
                    <td class="status-cell"><span class="status-waiting">Waiting</span></td>
                    <td class="wait-val">0</td>
                    <td class="tat-val">0</td>
                    <td class="comp-val">N/A</td>
                `;
            }
        } else {
            resultsTbody.innerHTML = '<tr><td colspan="8">No processes defined.</td></tr>';
        }
         avgWaitTimeSpan.textContent = 'N/A';
         avgTatTimeSpan.textContent = 'N/A';
    }

     // NEW: Update a specific row in the table when a process state changes or finishes
     function updateTableRow(pIndex) {
         const p = processes[pIndex];
         const row = document.getElementById(`process-row-${p.id}`);
         if (row) {
             const statusCell = row.querySelector('.status-cell');
             const waitCell = row.querySelector('.wait-val');
             const tatCell = row.querySelector('.tat-val');
             const compCell = row.querySelector('.comp-val');

             // Update Status Badge
             statusCell.innerHTML = `<span class="status-${p.status.toLowerCase()}">${p.status}</span>`;

             // Update metrics only if relevant
             waitCell.textContent = p.waiting_time.toFixed(0); // Show integer waiting time during run
             if (p.status === 'Completed') {
                 tatCell.textContent = p.turnaround_time.toFixed(0);
                 compCell.textContent = p.completion_time;
             } else {
                 tatCell.textContent = (p.status === 'Waiting' || p.start_time === -1) ? 0 : (currentTime - p.arrival).toFixed(0); // Current Turnaround
                 compCell.textContent = 'N/A';
             }
         }
     }

    // --- Simulation Control Functions ---

    function togglePlayPause() {
        if (simulationIntervalId) { // Already running or paused interval exists
            if (isPaused) {
                // Resume
                isPaused = false;
                playPauseButton.textContent = '⏸️ Pause';
                playPauseButton.classList.remove('play');
                playPauseButton.classList.add('pause');
                setStatus('Simulation Resumed.', 'info');
                // Restart interval with current speed
                startInterval();
                 disableInputs(true); // Disable inputs while running
            } else {
                // Pause
                isPaused = true;
                playPauseButton.textContent = '▶️ Play';
                playPauseButton.classList.remove('pause');
                playPauseButton.classList.add('play');
                setStatus('Simulation Paused.', 'info');
                clearInterval(simulationIntervalId); // Stop the interval
                 disableInputs(false); // Re-enable inputs when paused
            }
        } else {
            // Start new simulation
            startSimulation();
        }
    }

    function startSimulation() {
        const validatedProcesses = validateInputs();
        if (!validatedProcesses) {
            return; // Validation failed
        }

        resetSimulationState(); // Reset counters and queues, but not inputs/table structure
        processes = validatedProcesses; // Load validated processes
        initializeTable(processes.length); // Ensure table reflects potentially validated processes

        isPaused = false;
        playPauseButton.textContent = '⏸️ Pause';
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
        setStatus('Simulation Started...', 'info');
        disableInputs(true); // Disable inputs
        disableControls(false, true); // Keep controls enabled, but reflect running state

        startInterval(); // Start the simulation loop
    }

    function resetSimulation() {
        clearInterval(simulationIntervalId);
        simulationIntervalId = null;
        isPaused = true;

        resetSimulationState(); // Reset time, queues, counters etc.
        // Don't reset inputs, allow user to modify and restart
        // processes array will be repopulated by validateInputs on next play

        clearResultsAndStatus(); // Clear table content, gantt, monitor
        initializeTable(parseInt(numProcessesInput.value, 10)); // Re-initialize table structure based on input field N

        playPauseButton.textContent = '▶️ Play';
        playPauseButton.classList.remove('pause');
        playPauseButton.classList.add('play');
        setStatus('Simulation Reset. Ready to start.', 'info');
        disableInputs(false); // Enable inputs
        disableControls(processes.length === 0); // Disable controls if no processes
    }

    // Resets only the dynamic state, not the input fields or process objects themselves
    function resetSimulationState() {
        currentTime = 0;
        completedProcesses = 0;
        readyQueue = [];
        runningProcessIndex = -1;
        ganttLog = [];
        totalCpuBusyTime = 0;
        currentQuantumSlice = 0;

        // Reset individual process stats
        processes.forEach(p => p.reset());
    }


    function updateSpeed() {
        simulationSpeed = parseInt(speedSlider.max) - parseInt(speedSlider.value) + parseInt(speedSlider.min); // Invert slider value
        speedValueSpan.textContent = `${simulationSpeed} ms/step`;
        // If running, clear old interval and start new one with updated speed
        if (simulationIntervalId && !isPaused) {
            clearInterval(simulationIntervalId);
            startInterval();
        }
    }

    function startInterval() {
        if (simulationIntervalId) clearInterval(simulationIntervalId); // Clear existing interval if any
        simulationIntervalId = setInterval(simulationStep, simulationSpeed);
    }

    function disableInputs(disabled) {
        numProcessesInput.disabled = disabled;
        generateInputsButton.disabled = disabled;
        algorithmSelect.disabled = disabled;
        quantumInput.disabled = disabled;
        const pInputs = processInputsContainer.querySelectorAll('.process-input');
        pInputs.forEach(input => input.disabled = disabled);
    }

    // Disables Play/Reset buttons
    function disableControls(disabled, isStarting = false) {
        if (isStarting) { // Special case when Play is just pressed
             playPauseButton.disabled = false;
             resetButton.disabled = false;
        } else {
             playPauseButton.disabled = disabled;
             resetButton.disabled = disabled;
        }
         // Speed slider might be always enabled or disabled with others
         speedSlider.disabled = disabled;
    }

    // --- Simulation Step Logic ---

    function simulationStep() {
        if (isPaused || processes.length === 0) {
            return; // Should not happen if controls are managed properly, but safety check
        }

        // Check for completion
        if (completedProcesses >= processes.length) {
            finishSimulation();
            return;
        }

        // 1. Check for Arrivals
        checkProcessArrivals();

        // 2. Decide which process runs next based on algorithm
        const previousRunningIndex = runningProcessIndex;
        runningProcessIndex = selectNextProcessToRun();

        // 3. Handle Context Switch (if process changed)
        if (previousRunningIndex !== runningProcessIndex && previousRunningIndex !== -1) {
            // If the previous process wasn't finished, move it back to ready (if applicable)
            const prevProcess = processes[previousRunningIndex];
            if (prevProcess.status === 'Running') {
                 prevProcess.status = 'Ready';
                 if (!readyQueue.includes(previousRunningIndex)) { // Add back if not already there (e.g. RR)
                     readyQueue.push(previousRunningIndex);
                 }
                 updateTableRow(previousRunningIndex);
            }
            currentQuantumSlice = 0; // Reset quantum for new process
        }

        // 4. Update State & Metrics for the current time step
        let cpuUsedThisTick = false;
        if (runningProcessIndex !== -1) {
            // --- Process is Running ---
            cpuUsedThisTick = true;
            const currentProcess = processes[runningProcessIndex];

            // First time running?
            if (currentProcess.start_time === -1) {
                currentProcess.start_time = currentTime;
            }
            currentProcess.status = 'Running';
            currentProcess.remaining_burst--;
            currentProcess.last_execution_time = currentTime; // Mark last run time
            totalCpuBusyTime++;
            currentQuantumSlice++; // Increment RR slice time

            // Add to Gantt Log
             logGantt(currentProcess.id, currentTime, currentTime + 1);

            // Check for completion
            if (currentProcess.remaining_burst === 0) {
                currentProcess.completion_time = currentTime + 1;
                currentProcess.turnaround_time = currentProcess.completion_time - currentProcess.arrival;
                currentProcess.waiting_time = currentProcess.turnaround_time - currentProcess.burst;
                 // Clamp negative waiting time (can happen with arrival=0 and immediate run)
                 if (currentProcess.waiting_time < 0) currentProcess.waiting_time = 0;

                currentProcess.status = 'Completed';
                completedProcesses++;
                runningProcessIndex = -1; // CPU becomes free
                currentQuantumSlice = 0; // Reset quantum
                // Remove completed process from ready queue if it's somehow there
                const idxInQueue = readyQueue.indexOf(runningProcessIndex);
                if(idxInQueue > -1) readyQueue.splice(idxInQueue, 1);

            } else if (selectedAlgorithm === 'rr' && currentQuantumSlice >= timeQuantum) {
                 // Quantum expired for RR, move to back of ready queue
                 currentProcess.status = 'Ready';
                 readyQueue.push(runningProcessIndex); // Add to end
                 runningProcessIndex = -1; // CPU becomes free
                 currentQuantumSlice = 0; // Reset quantum
            }
             updateTableRow(processes.findIndex(p => p.id === currentProcess.id)); // Update table for running/completed


        } else {
            // --- CPU is Idle ---
             logGantt('Idle', currentTime, currentTime + 1);
        }

        // Update waiting time for processes in the ready queue
        readyQueue.forEach(pIndex => {
             if (pIndex !== runningProcessIndex) { // Don't increment waiting time if running
                 processes[pIndex].waiting_time++;
                  // Update table row for waiting processes (optional, can be noisy)
                 // updateTableRow(pIndex);
             }
         });

         // Update status for processes in ready queue (that aren't running)
         readyQueue.forEach(pIndex => {
            if (processes[pIndex].status !== 'Running' && processes[pIndex].status !== 'Completed') {
                processes[pIndex].status = 'Ready';
                updateTableRow(pIndex);
            }
        });


        // 5. Increment Time
        currentTime++;

        // 6. Update UI
        updateUI();

        // Re-check for completion after time increment
        if (completedProcesses >= processes.length) {
            finishSimulation();
        }
    }

    function checkProcessArrivals() {
        for (let i = 0; i < processes.length; i++) {
            if (processes[i].arrival === currentTime && processes[i].status === 'Waiting') {
                processes[i].status = 'Ready';
                readyQueue.push(i); // Add index to ready queue
                updateTableRow(i); // Update status in table
                // Preemption check for SRTF and Priority Preemptive
                if (selectedAlgorithm === 'srtf' || selectedAlgorithm === 'priority_p') {
                    // If a process is running, check if the new arrival should preempt it
                     if (runningProcessIndex !== -1) {
                         const currentRunning = processes[runningProcessIndex];
                         const newArrival = processes[i];
                         let preempt = false;
                         if (selectedAlgorithm === 'srtf' && newArrival.remaining_burst < currentRunning.remaining_burst) {
                             preempt = true;
                         } else if (selectedAlgorithm === 'priority_p' && newArrival.priority < currentRunning.priority) {
                             preempt = true;
                         }

                         if (preempt) {
                              // Put current process back in ready queue
                               currentRunning.status = 'Ready';
                               if (!readyQueue.includes(runningProcessIndex)) { // Avoid duplicates
                                   readyQueue.push(runningProcessIndex);
                               }
                               updateTableRow(runningProcessIndex);
                               runningProcessIndex = -1; // Free up CPU for selection logic below
                               currentQuantumSlice = 0; // Reset quantum if preempted
                         }
                     }
                 }
            }
        }
    }

    // Core algorithm logic resides here
    function selectNextProcessToRun() {
        // If a process is already running and algorithm is non-preemptive or RR (and quantum not expired), continue it
        if (runningProcessIndex !== -1) {
            const currentProcess = processes[runningProcessIndex];
            if (currentProcess.status === 'Running') { // Ensure it didn't complete last tick
                if (selectedAlgorithm === 'fcfs' || selectedAlgorithm === 'sjf' || selectedAlgorithm === 'priority_np') {
                    return runningProcessIndex; // Non-preemptive continue
                }
                if (selectedAlgorithm === 'rr' && currentQuantumSlice < timeQuantum) {
                     return runningProcessIndex; // RR continue within quantum
                }
                 // For preemptive algorithms, we might have been preempted by arrival check,
                 // so runningProcessIndex could be -1 here. Allow selection logic below to run.
            }
        }


        if (readyQueue.length === 0) {
            return -1; // No process ready
        }

        let selectedIndex = -1;

        switch (selectedAlgorithm) {
            case 'fcfs':
                // Find the process in ready queue with the earliest arrival time
                let minArrival = Infinity;
                let earliestPid = Infinity;
                readyQueue.forEach(pIndex => {
                    if (processes[pIndex].arrival < minArrival) {
                        minArrival = processes[pIndex].arrival;
                        selectedIndex = pIndex;
                        earliestPid = processes[pIndex].id;
                    } else if (processes[pIndex].arrival === minArrival) {
                        if(processes[pIndex].id < earliestPid) { // Tie-break by ID
                            selectedIndex = pIndex;
                            earliestPid = processes[pIndex].id;
                        }
                    }
                });
                break;

            case 'sjf': // Non-preemptive
            case 'srtf': // Preemptive (selection logic is the same, preemption handled on arrival/completion)
                 // Find the process in ready queue with the shortest remaining burst time
                 let minBurst = Infinity;
                 let sjfArrival = Infinity;
                 let sjfPid = Infinity;
                 readyQueue.forEach(pIndex => {
                     const p = processes[pIndex];
                     if (p.remaining_burst < minBurst) {
                         minBurst = p.remaining_burst;
                         selectedIndex = pIndex;
                         sjfArrival = p.arrival;
                         sjfPid = p.id;
                     } else if (p.remaining_burst === minBurst) {
                          // Tie-break: FCFS (earliest arrival), then ID
                          if (p.arrival < sjfArrival || (p.arrival === sjfArrival && p.id < sjfPid)) {
                             selectedIndex = pIndex;
                             sjfArrival = p.arrival;
                             sjfPid = p.id;
                          }
                     }
                 });
                break;

             case 'priority_np': // Non-preemptive
             case 'priority_p': // Preemptive (selection logic is the same)
                 // Find the process in ready queue with the highest priority (lowest number)
                 let bestPriority = Infinity;
                 let prioArrival = Infinity;
                 let prioPid = Infinity;
                 readyQueue.forEach(pIndex => {
                     const p = processes[pIndex];
                     if (p.priority < bestPriority) {
                         bestPriority = p.priority;
                         selectedIndex = pIndex;
                         prioArrival = p.arrival;
                         prioPid = p.id;
                     } else if (p.priority === bestPriority) {
                          // Tie-break: FCFS (earliest arrival), then ID
                           if (p.arrival < prioArrival || (p.arrival === prioArrival && p.id < prioPid)) {
                              selectedIndex = pIndex;
                              prioArrival = p.arrival;
                              prioPid = p.id;
                          }
                     }
                 });
                 break;

            case 'rr':
                // Simply take the next process from the front of the queue
                if (readyQueue.length > 0) {
                    selectedIndex = readyQueue[0]; // Peek, don't remove yet
                }
                break;

            default:
                console.error("Unknown algorithm:", selectedAlgorithm);
                return -1;
        }

         // Remove the selected process from ready queue
         if (selectedIndex !== -1) {
             const queueIdx = readyQueue.indexOf(selectedIndex);
             if (queueIdx > -1) {
                 readyQueue.splice(queueIdx, 1);
             } else {
                 // This might happen if a preempted process was selected again before being re-added
                 // console.warn("Selected process not found in ready queue?");
             }
         }


        return selectedIndex;
    }

    function finishSimulation() {
        clearInterval(simulationIntervalId);
        simulationIntervalId = null;
        isPaused = true; // Set to paused state
        playPauseButton.textContent = '▶️ Play';
        playPauseButton.classList.remove('pause');
        playPauseButton.classList.add('play');
        setStatus('Simulation Finished.', 'success');
        disableInputs(false); // Re-enable inputs
        disableControls(false); // Re-enable controls fully

        // Final calculation of averages
        calculateAndDisplayAverages();
        // Ensure final Gantt and monitor state is drawn
        updateUI();
    }


    // --- UI Update Functions ---

    function updateUI() {
        currentTimeValue.textContent = currentTime;
        updateReadyQueueDisplay();
        updateSystemMonitor();
        updateGanttChart(); // Re-render Gantt based on log
    }

    function updateReadyQueueDisplay() {
         if (readyQueue.length === 0) {
             readyQueueValue.textContent = '[Empty]';
         } else {
             // Sort by arrival time for display consistency (optional)
            const displayQueue = [...readyQueue].sort((aIdx, bIdx) => processes[aIdx].arrival - processes[bIdx].arrival);
             readyQueueValue.textContent = displayQueue.map(pIndex => `P${processes[pIndex].id}`).join(', ');
         }
    }

    function updateSystemMonitor() {
        // CPU Utilization
        const cpuUtil = (currentTime > 0) ? (totalCpuBusyTime / currentTime) * 100 : 0;
        cpuUtilizationBar.style.width = `${cpuUtil.toFixed(1)}%`;
        cpuUtilizationValue.textContent = `${cpuUtil.toFixed(1)}%`;

        // Memory Utilization
        let currentMemoryUsed = 0;
        processes.forEach(p => {
             // Count memory if process has arrived and is not yet completed
            if (p.arrival <= currentTime && p.status !== 'Completed') {
                currentMemoryUsed += p.memory_required;
            }
        });
        currentMemoryUsed = Math.min(currentMemoryUsed, TOTAL_SYSTEM_MEMORY); // Cap at total
        const memUtil = (TOTAL_SYSTEM_MEMORY > 0) ? (currentMemoryUsed / TOTAL_SYSTEM_MEMORY) * 100 : 0;
        memoryUtilizationBar.style.width = `${memUtil.toFixed(1)}%`;
        memoryUtilizationValue.textContent = `${memUtil.toFixed(1)}% (${currentMemoryUsed} / ${TOTAL_SYSTEM_MEMORY} MB)`;
    }


    // --- Gantt Chart Functions ---

    // Log an event for the Gantt chart
    function logGantt(pid, start, end) {
         // Try to merge with the last segment if it's the same process
         if (ganttLog.length > 0) {
             const lastSegment = ganttLog[ganttLog.length - 1];
             if (lastSegment.pid === pid && lastSegment.end === start) {
                 lastSegment.end = end; // Extend the last segment
                 return;
             }
         }
         // Otherwise, add a new segment
         ganttLog.push({ pid: pid, start: start, end: end });
    }


    // Re-renders the entire Gantt chart based on the log
    // This can become slow for very long simulations.
     function updateGanttChart() {
         ganttChartDiv.innerHTML = '';
         ganttTimelineDiv.innerHTML = '';

         if (ganttLog.length === 0) return;

         const totalDuration = currentTime; // Use current time as total duration
         if (totalDuration <= 0) return;

         // --- Color Assignment ---
         const pidColors = {};
         const availableColors = [
             '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
             '#1abc9c', '#e67e22', '#34495e', '#7f8c8d', '#d35400',
             '#27ae60', '#c0392b', '#8e44ad', '#2980b9'
         ];
         let colorIndex = 0;
         function getColorForPid(pid) {
             if (pid === 'Idle') return '#95a5a6'; // Consistent grey for idle (adjusted)
             if (!pidColors[pid]) {
                 pidColors[pid] = availableColors[colorIndex % availableColors.length];
                 colorIndex++;
             }
             return pidColors[pid];
         }
          // --- End Color Assignment ---


         let currentChartWidth = 0; // Keep track of rendered width

         // --- Create Segments ---
         ganttLog.forEach(segment => {
             const duration = segment.end - segment.start;
             if (duration <= 0) return; // Skip zero/negative duration

             const segmentWidth = (duration / totalDuration) * 100; // Calculate width percentage

             const segmentDiv = document.createElement('div');
             segmentDiv.classList.add('gantt-segment');
             // Use width relative to the container (flex handles the layout)
             segmentDiv.style.width = `${segmentWidth}%`;
             // segmentDiv.style.flexBasis = `${segmentWidth}%`; // Alternative with flex basis

             segmentDiv.style.backgroundColor = getColorForPid(segment.pid);
             segmentDiv.textContent = (segment.pid === 'Idle') ? '' : `P${segment.pid}`; // Show PId or nothing for Idle
             segmentDiv.title = `${segment.pid === 'Idle' ? 'Idle' : `P${segment.pid}`} (${segment.start} - ${segment.end})`;
             segmentDiv.dataset.pid = segment.pid;

             ganttChartDiv.appendChild(segmentDiv);
             currentChartWidth += segmentWidth;
         });
          // --- End Create Segments ---

         // --- Create Timeline Markers ---
         const timelineMarkers = new Set([0]); // Always include 0
         ganttLog.forEach(segment => {
             timelineMarkers.add(segment.start);
             timelineMarkers.add(segment.end);
         });
         // Add current time marker if simulation is ongoing
         if (!isPaused || completedProcesses < processes.length) {
              timelineMarkers.add(currentTime);
         }

         const sortedMarkers = Array.from(timelineMarkers)
                                    .filter(time => time <= totalDuration) // Only markers within current duration
                                    .sort((a, b) => a - b);

          // Simple marker rendering (can overlap, might need smarter logic for many markers)
          let lastMarkerPos = -50; // Avoid initial overlap
          sortedMarkers.forEach(time => {
              const positionPercentage = (time / totalDuration) * 100;

               // Basic collision avoidance: skip if too close to the last marker
               if (positionPercentage - lastMarkerPos < 2.5 && time !== 0) { // Adjust threshold as needed
                    return;
               }

              const marker = document.createElement('div');
              marker.classList.add('timeline-marker');
              marker.textContent = Number.isInteger(time) ? time : time.toFixed(1);
              marker.style.left = `${positionPercentage}%`;

              ganttTimelineDiv.appendChild(marker);
              lastMarkerPos = positionPercentage;
          });
           // --- End Timeline Markers ---

           // Ensure chart and timeline divs have minimum width matching content
            const minWidth = ganttChartDiv.scrollWidth;
            ganttChartDiv.style.minWidth = `${minWidth}px`;
            ganttTimelineDiv.style.minWidth = `${minWidth}px`;

     }

    // --- Final Calculation ---

    function calculateAndDisplayAverages() {
        let totalWT = 0;
        let totalTAT = 0;
        let validProcesses = 0;

        processes.forEach(p => {
            if (p.status === 'Completed') {
                totalWT += p.waiting_time;
                totalTAT += p.turnaround_time;
                validProcesses++;
            }
        });

        const avgWT = validProcesses > 0 ? totalWT / validProcesses : 0;
        const avgTAT = validProcesses > 0 ? totalTAT / validProcesses : 0;

        avgWaitTimeSpan.textContent = avgWT.toFixed(2);
        avgTatTimeSpan.textContent = avgTAT.toFixed(2);
    }

}); // End DOMContentLoaded