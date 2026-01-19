(function () {
    // 1. Create and Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #debug-console-container {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 9999;
            box-sizing: border-box;
            pointer-events: none; /* Let clicks pass through empty areas */
        }

        #debug-console-toggle {
            position: absolute;
            bottom: 10px;
            left: 10px;
            width: 40px;
            height: 40px;
            background: #333;
            color: #fff;
            border-radius: 50%;
            border: 2px solid #555;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            pointer-events: auto;
            transition: transform 0.2s;
            z-index: 10001;
        }

        #debug-console-toggle:hover {
            transform: scale(1.1);
            background: #444;
        }

        #debug-console-main {
            background-color: rgba(30, 30, 30, 0.95);
            color: #d4d4d4;
            height: 300px; /* Default open height */
            width: 100%;
            display: none; /* Hidden by default */
            flex-direction: column;
            border-top: 2px solid #444;
            box-shadow: 0 -4px 10px rgba(0,0,0,0.5);
            pointer-events: auto;
        }

        #debug-console-header {
            background: #252526;
            padding: 5px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            user-select: none;
        }

        #debug-console-header span {
            font-weight: bold;
            color: #aaa;
        }

        #debug-console-actions button {
            background: transparent;
            border: 1px solid #555;
            color: #ccc;
            cursor: pointer;
            margin-left: 5px;
            padding: 2px 8px;
            font-size: 11px;
            border-radius: 3px;
        }
        
        #debug-console-actions button:hover {
            background: #444;
        }

        #debug-console-output {
            flex: 1;
            overflow-y: auto;
            padding: 5px 0;
            scroll-behavior: smooth;
        }

        .log-entry {
            padding: 4px 10px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.4;
        }

        .log-entry:hover {
            background-color: rgba(255,255,255,0.05);
        }

        /* Log Levels Colors */
        .log-type-log { color: #d4d4d4; }
        .log-type-info { color: #9cdcfe; background-color: rgba(156, 220, 254, 0.1); }
        .log-type-warn { color: #dcdcaa; background-color: rgba(220, 220, 170, 0.1); }
        .log-type-error { color: #f14c4c; background-color: rgba(241, 76, 76, 0.1); }
        .log-type-debug { color: #b5cea8; }

        .log-timestamp {
            color: #666;
            margin-right: 8px;
            font-size: 11px;
        }
    `;
    document.head.appendChild(style);

    // 2. Create HTML Structure
    const container = document.createElement('div');
    container.id = 'debug-console-container';
    container.innerHTML = `
        <div id="debug-console-toggle" title="Open Console">
            &gt;_
        </div>
        <div id="debug-console-main">
            <div id="debug-console-header">
                <span>Console Output</span>
                <div id="debug-console-actions">
                    <button id="btn-clear-console">Clear</button>
                    <button id="btn-close-console">Minimize</button>
                </div>
            </div>
            <div id="debug-console-output"></div>
        </div>
    `;
    document.body.appendChild(container);

    // 3. Logic & Event Listeners
    const toggleBtn = document.getElementById('debug-console-toggle');
    const mainWin = document.getElementById('debug-console-main');
    const outputDiv = document.getElementById('debug-console-output');
    const clearBtn = document.getElementById('btn-clear-console');
    const closeBtn = document.getElementById('btn-close-console');

    // UI Toggles
    toggleBtn.addEventListener('click', () => {
        mainWin.style.display = 'flex';
        toggleBtn.style.display = 'none';
        scrollToBottom();
    });

    closeBtn.addEventListener('click', () => {
        mainWin.style.display = 'none';
        toggleBtn.style.display = 'flex';
    });

    clearBtn.addEventListener('click', () => {
        outputDiv.innerHTML = '';
    });

    function scrollToBottom() {
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    // 4. Intercept Console Methods
    const originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

    function formatArgument(arg) {
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(arg, null, 2);
            } catch (e) {
                return '[Circular Object]';
            }
        }
        return String(arg);
    }

    function addLogEntry(type, args) {
        const entry = document.createElement('div');
        entry.className = `log-entry log-type-${type}`;

        const time = new Date().toLocaleTimeString([], { hour12: false });
        
        // Convert all arguments to strings/JSON and join them
        const message = Array.from(args).map(formatArgument).join(' ');

        entry.innerHTML = `<span class="log-timestamp">[${time}]</span> ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
        
        outputDiv.appendChild(entry);
        scrollToBottom();
    }

    // Proxy the console methods
    ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
        console[method] = function (...args) {
            // 1. Call the original console method (so it still shows in DevTools)
            originalConsole[method].apply(console, args);
            // 2. Add to our custom UI
            addLogEntry(method, args);
        };
    });

    // Optional: Capture unhandled errors
    window.addEventListener('error', function(event) {
        addLogEntry('error', [`[Uncaught Error] ${event.message} at ${event.filename}:${event.lineno}`]);
    });
    toggleBtn.click();
})();