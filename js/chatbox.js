(function () {
    const API_ENDPOINT = 'api/chat.php';
    marked.setOptions({ breaks: true });

    const katexStyle = document.createElement('link');
    katexStyle.rel = 'stylesheet';
    katexStyle.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(katexStyle);

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };
    Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'),
    ]).then(() => {
        return loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js');
    }).then(() => {
        console.log("KaTeX Loaded");
    }).catch(err => console.error("Failed to load KaTeX", err));

    const style = document.createElement('style');
    style.innerHTML = `
        #ai-widget-container { position: fixed; top: 20px; bottom: 20px; right: 20px; width: 420px; z-index: 10000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; pointer-events: none; display: flex; flex-direction: column; justify-content: flex-end; transition: all 0.3s ease; }
        #ai-widget-container.ai-minimized { top: auto; height: auto; }
        #ai-widget-box { background: rgba(20, 20, 20, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; pointer-events: auto; transition: all 0.3s ease; height: 100%; }
        .ai-minimized #ai-widget-box { height: auto; border-radius: 20px; background: transparent; box-shadow: none; border: none; overflow: visible; }
        .ai-minimized #ai-widget-input-area { background: rgba(20, 20, 20, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        #ai-widget-messages { flex-grow: 1; padding: 20px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; scrollbar-color: #555 transparent; }
        .ai-msg { max-width: 85%; padding: 0px 16px; border-radius: 18px; font-size: 15px; line-height: 1.5; color: #fff; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; animation: popIn 0.3s ease-out; }
        .ai-msg img { max-width: 100%; height: auto; border-radius: 8px; }
        .ai-msg pre { max-width: 100%; overflow-x: auto; white-space: pre; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; }
        .ai-msg code { word-break: break-all; }
        .ai-msg-user { align-self: flex-end; background: linear-gradient(135deg, #007AFF, #00C6FF); border-bottom-right-radius: 4px; color: #fff; }
        .ai-msg-model { align-self: flex-start; background: rgba(255, 255, 255, 0.15); border-bottom-left-radius: 4px; }
        .ai-error { color: #ff6b6b; font-size: 13px; text-align: center; margin-top: 5px; font-style: italic; }
        #ai-widget-input-area { padding: 15px; display: flex; gap: 10px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1); position: relative; }
        #ai-widget-input { flex-grow: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 25px; padding: 12px 20px; color: #fff; outline: none; font-size: 14px; transition: background 0.2s; }
        #ai-widget-input:focus { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); }
        .ai-btn { background: none; border: none; cursor: pointer; color: #fff; padding: 10px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .ai-btn:hover { background: rgba(255,255,255,0.2); }
        .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-btn svg { width: 22px; height: 22px; fill: currentColor; }
        .typing-indicator { display: flex; gap: 5px; padding: 12px 16px; background: rgba(255,255,255,0.1); border-radius: 18px; width: fit-content; align-self: flex-start; margin-bottom: 5px; border-bottom-left-radius: 4px; }
        .typing-dot { width: 8px; height: 8px; background: #ddd; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; } .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        #ai-widget-header {
            padding: 15px 20px;
            background: rgba(0, 0, 0, 0.4);
            color: #fff;
            font-size: 18px;
            font-weight: bold;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex; justify-content: space-between; align-items: center;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
        }
        .status-dot { width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; display: inline-block; margin-right: 6px; box-shadow: 0 0 5px #2ecc71; }
        .status-text { font-size: 12px; color: #aaa; font-weight: normal; margin-left: 5px; }

        .ai-minimized #ai-widget-header, 
        .ai-minimized #ai-widget-messages,
        .ai-minimized #ai-file-preview { display: none !important; }
        
        #ai-btn-restore {
            display: none;
            position: absolute;
            top: -50px; /* Above the input bar */
            left: 50%;
            transform: translateX(-50%);
            width: 40px; height: 40px;
            border-radius: 50%;
            background: rgba(20, 20, 20, 0.9);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            align-items: center; justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            transition: all 0.2s;
            z-index: 10001;
        }
        #ai-btn-restore:hover { background: #00C6FF; border-color: #00C6FF; }
        .ai-minimized #ai-btn-restore { display: flex !important; }
        
        #ai-btn-minimize { background: none; border: none; color: #ccc; cursor: pointer; font-size: 20px; line-height: 1; display: flex; align-items: center; }
        #ai-btn-minimize:hover { color: #fff; }
        .katex { font-size: 1.1em; }
        .katex-display { margin: 10px 0; overflow-x: auto; overflow-y: hidden; }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'ai-widget-container';
    container.innerHTML = `
        <div id="ai-widget-box">
            <div id="ai-widget-header">
                <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden; margin-right: 10px;">
                    <button id="ai-btn-edit-title" title="Rename" style="background:none; border:none; color:#aaa; margin-right:5px; cursor:pointer; font-size: 14px;"><i class="bi bi-pencil-fill"></i></button>
                    <span id="ai-widget-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">Yuki Chat</span>
                    <input id="ai-widget-title-input" type="text" style="display:none; background: rgba(0,0,0,0.2); border: 1px solid #555; color: white; border-radius: 4px; padding: 2px 5px; flex-grow: 1; min-width: 0; font-size: 14px;" autocomplete="off">
                    <span class="status-dot" style="margin-left: 10px; flex-shrink: 0;" title="Online"></span>
                </div>
                <button id="ai-btn-minimize" title="Minimize"><i class="bi bi-dash-lg"></i></button>
            </div>
            <div id="ai-widget-messages">
                <div class="ai-msg ai-msg-model">Chào cậu! Tớ là Yuki đây, cậu cần tớ giúp gì không nhỉ?</div>
            </div>
            <div id="ai-file-preview" style="display: none; padding: 10px 20px; font-size: 14px; color: #aaa; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); cursor: pointer;"></div>
            
            <div id="ai-widget-input-area">
                <button id="ai-btn-restore" title="Restore"><i class="bi bi-chevron-up"></i></button>
                <input type="file" id="ai-widget-file-input" style="display: none;" accept="image/*, application/pdf">
                <button id="ai-btn-attach" class="ai-btn" title="Gửi ảnh/File">
                    <svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                </button>
                <input type="text" id="ai-widget-input" placeholder="Nhập tin nhắn..." autocomplete="off">
                <button id="ai-btn-voice" class="ai-btn" title="Nói chuyện"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>
                <button id="ai-btn-send" class="ai-btn" title="Gửi"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Toggle Minimize/Maximize Logic
    const btnMinimize = document.getElementById('ai-btn-minimize');
    const btnRestore = document.getElementById('ai-btn-restore');
    const widgetContainer = document.getElementById('ai-widget-container');

    if (btnMinimize) {
        btnMinimize.addEventListener('click', () => {
            widgetContainer.classList.add('ai-minimized');
        });
    }

    if (btnRestore) {
        btnRestore.addEventListener('click', () => {
            widgetContainer.classList.remove('ai-minimized');
        });
    }

    const input = document.getElementById('ai-widget-input');
    const msgContainer = document.getElementById('ai-widget-messages');
    const btnSend = document.getElementById('ai-btn-send');

    // --- Title Edit Logic ---
    const btnEditTitle = document.getElementById('ai-btn-edit-title');
    const titleSpan = document.getElementById('ai-widget-title');
    const titleInput = document.getElementById('ai-widget-title-input');

    btnEditTitle.addEventListener('click', () => {
        titleInput.value = titleSpan.innerText;
        titleSpan.style.display = 'none';
        titleInput.style.display = 'block';
        titleInput.focus();
    });

    const saveTitle = () => {
        const newTitle = titleInput.value.trim();
        if (newTitle && window.YukiChat && window.YukiChat.currentSessionId) {
            window.YukiChat.renameSession(window.YukiChat.currentSessionId, newTitle);
            titleSpan.innerText = newTitle;
        }
        titleInput.style.display = 'none';
        titleSpan.style.display = 'block';
    };

    titleInput.addEventListener('blur', saveTitle);
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveTitle();
    });

    let isProcessing = false;

    // --- INTEGRATION: Reload UI ---
    window.reloadChatUI = function (sessionId) {
        msgContainer.innerHTML = ''; // Clear current

        // Update Title
        if (window.YukiChat) {
            const session = window.YukiChat.getSession(sessionId);
            if (session) {
                titleSpan.innerText = session.title;
            }
        }

        const history = window.YukiChat.getHistory(sessionId);

        if (history.length === 0) {
            addMessage("Chào cậu! Tớ là Yuki đây, cậu cần tớ giúp gì không nhỉ?", 'model');
        } else {
            history.forEach(msg => {
                const text = msg.parts[0].text;
                addMessage(text, msg.role);
            });
        }
    };

    function addMessage(text, role) {
        const div = document.createElement('div');
        div.className = `ai-msg ai-msg-${role}`;
        div.innerHTML = marked.parse(text);
        msgContainer.appendChild(div);
        if (window.renderMathInElement) {
            try {
                renderMathInElement(div, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            } catch(e) {
                console.warn("KaTeX render error:", e);
            }
        }

        msgContainer.scrollTop = msgContainer.scrollHeight;
    }


    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    function createWavFile(audioData) {
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + audioData.byteLength, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
        view.setUint16(32, numChannels * (bitsPerSample / 8), true);
        view.setUint16(34, bitsPerSample, true);
        writeString(view, 36, 'data');
        view.setUint32(40, audioData.byteLength, true);

        // Ghép Header + Data lại thành 1 file hoàn chỉnh
        return new Blob([wavHeader, audioData], { type: 'audio/wav' });
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    function playAudio(base64Data) {
        if (!base64Data) return;

        try {
            // 1. Stop old audio
            if (window.currentAudio) {
                window.currentAudio.pause();
                window.currentAudio = null;
            }

            // 2. Convert to WAV
            const pcmBuffer = base64ToArrayBuffer(base64Data);
            const wavBlob = createWavFile(pcmBuffer);
            const audioUrl = URL.createObjectURL(wavBlob);

            // 3. Create Audio Object
            const audio = new Audio(audioUrl);
            // IMPORTANT: Allow Cross Origin for Web Audio API
            audio.crossOrigin = "anonymous";
            window.currentAudio = audio;

            // 4. === INTEGRATION POINT ===
            // Call the function defined in index.js
            if (typeof window.connectAudioToLive2D === 'function') {
                window.connectAudioToLive2D(audio);
            }
            // ============================

            audio.play().catch(e => {
                console.error("Autoplay blocked:", e);
                addMessage("(Tap to listen)", "model");
            });

            // Visual effects
            const box = document.getElementById('ai-widget-box');
            box.style.borderColor = "rgba(100, 200, 255, 0.8)";

            // Optional: Trigger a random motion when talking starts
            // if (typeof model4 !== 'undefined') model4.motion('TapBody');

            audio.onended = () => {
                box.style.borderColor = "rgba(255, 255, 255, 0.1)";
                URL.revokeObjectURL(audioUrl);

                // Reset mouth to closed when done
                if (typeof model4 !== 'undefined' && model4.internalModel) {
                    model4.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
                }
            };

        } catch (err) {
            console.error("Audio Error:", err);
        }
    }

    let typingEl = null;
    function showTyping(show) {
        if (show) {
            if (typingEl) return;
            typingEl = document.createElement('div');
            typingEl.className = 'typing-indicator';
            typingEl.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
            msgContainer.appendChild(typingEl);
            msgContainer.scrollTop = msgContainer.scrollHeight;
            input.disabled = true;
            btnSend.disabled = true;
        } else if (typingEl) {
            typingEl.remove();
            typingEl = null;
            input.disabled = false;
            btnSend.disabled = false;
            input.focus();
        }
    }
    //
    // Attach file
    //
    const fileInput = document.getElementById('ai-widget-file-input');
    const btnAttach = document.getElementById('ai-btn-attach');
    const filePreview = document.getElementById('ai-file-preview');
    let currentFile = null; // Biến lưu file hiện tại

    // 1. Click nút kẹp giấy -> Mở hộp thoại chọn file
    btnAttach.addEventListener('click', () => fileInput.click());

    // 2. Khi người dùng chọn file
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            currentFile = fileInput.files[0];
            filePreview.style.display = 'block';
            filePreview.innerHTML = `Đang chọn: ${currentFile.name} (Click để xóa)`;
            btnAttach.style.color = '#00C6FF'; // Đổi màu icon
        }
    });

    // 3. Xóa file nếu click vào tên file
    filePreview.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        filePreview.style.display = 'none';
        btnAttach.style.color = '#fff';
    });

    // 4. Hàm helper chuyển file sang Base64
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    // Expression Mapping
    const expressionMap = {
        'cry': '哭',
        'shy': '害羞',
        'panic': '慌张',
        'rolleyes': '白眼',
        'angry': '黑脸',
        'reset': null // Reset to default
    };

    // --- MAIN FUNCTION ---
    async function sendMessage() {
        const text = input.value.trim();
        if (!text && !currentFile || isProcessing) return;

        let userMsgHTML = text;
        if (currentFile) {
            userMsgHTML += `<br><i>[Đính kèm: ${currentFile.name}]</i>`;
        }
        addMessage(userMsgHTML, 'user');

        // Save User Message
        window.YukiChat.saveMessage('user', text);

        filePreview.style.display = 'none';
        input.value = '';
        showTyping(true);
        isProcessing = true;

        let fileData = null;
        if (currentFile) {
            try {
                const base64String = await toBase64(currentFile);
                const parts = base64String.split(',');
                const mimeType = parts[0].match(/:(.*?);/)[1];
                const base64Data = parts[1];

                fileData = {
                    mimeType: mimeType,
                    data: base64Data
                };
            } catch (e) {
                console.error("Lỗi đọc file", e);
            }
            // Reset UI
            currentFile = null;
            fileInput.value = '';
            btnAttach.style.color = '#fff';
        }

        // Get current history for payload
        const currentHistory = window.YukiChat.getHistory(window.YukiChat.currentSessionId);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: currentHistory, // Send full history
                    file: fileData
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            showTyping(false);

            if (data.error) {
                addMessage("Lỗi từ Yuki: " + data.error, "model");
                return;
            }

            // Handle Expression
            if (data.expression && expressionMap.hasOwnProperty(data.expression)) {
                const expFile = expressionMap[data.expression];
                if (window.triggerExpression) {
                    window.triggerExpression(expFile);
                }
            }

            if (data.text) {
                addMessage(data.text, 'model');
                // Save Model Message
                window.YukiChat.saveMessage('model', data.text);
            } else {
                addMessage("... (Yuki gật đầu)", "model");
            }

            if (data.audio) {
                playAudio(data.audio);
            }

        } catch (error) {
            showTyping(false);
            addMessage(`<span class="ai-error">Mất kết nối với Yuki (${error.message})</span>`, "model");
            console.error("Chat Error:", error);
        } finally {
            isProcessing = false;
        }
    }

    // Event Listeners
    btnSend.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isProcessing) {
            sendMessage();
        }
    });

    // Voice Recognition (Giữ nguyên)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;

        const btnVoice = document.getElementById('ai-btn-voice');

        recognition.onstart = () => {
            input.placeholder = "Đang nghe Yuki...";
            btnVoice.style.color = '#ff4b4b';
            btnVoice.style.animation = "pulse 1s infinite";
        };
        recognition.onend = () => {
            input.placeholder = "Nhập tin nhắn...";
            btnVoice.style.color = '#fff';
            btnVoice.style.animation = "none";
        };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            input.value = transcript;
            setTimeout(sendMessage, 500); // Tự động gửi sau 0.5s
        };

        btnVoice.onclick = () => {
            if (isProcessing) return;
            recognition.start();
        };
    } else {
        document.getElementById('ai-btn-voice').style.display = 'none'; // Ẩn nút mic nếu browser không hỗ trợ
    }

    // Initialize Session Manager
    if (window.YukiChat) {
        window.YukiChat.init();
    }

})();
