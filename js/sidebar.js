(function () {
    // --- CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* Sidebar container */
        #app-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 260px;
            height: 100vh;
            background: #151515;
            color: #e3e3e3;
            display: flex;
            flex-direction: column;
            z-index: 9000;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            transition: width 0.3s ease; /* Animate width */
            box-shadow: 1px 0 10px rgba(0,0,0,0.3);
            overflow: hidden; /* Hide overflow content during transition */
        }

        #app-sidebar.collapsed {
            width: 70px;
        }

        /* Toggle Button */
        #sidebar-collapse-btn {
            background: transparent;
            border: none;
            color: #8e8e8e;
            cursor: pointer;
            font-size: 18px;
            padding: 5px;
            margin-right: 5px;
        }
        #sidebar-collapse-btn:hover { color: #fff; }

        /* Sidebar Header (New Chat) */
        .sidebar-header {
            padding: 20px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            white-space: nowrap;
        }
        
        .new-chat-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #282a2c;
            color: #e3e3e3;
            border: 1px solid transparent;
            border-radius: 20px;
            padding: 10px 15px;
            width: 100%;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            overflow: hidden;
        }
        .collapsed .new-chat-btn {
            justify-content: center;
            padding: 10px 0;
            width: 40px; /* Circle-ish */
            border-radius: 50%;
        }
        .collapsed .new-chat-btn span:last-child { display: none; } /* Hide text "New Chat" */
        
        .collapsed .sidebar-header {
            flex-direction: column-reverse; /* Put toggle button at bottom or adjust */
            gap: 10px;
            padding: 15px 10px;
        }

        /* Conversation List */
        .sidebar-nav {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px 15px;
            overflow-x: hidden;
        }
        .nav-label {
            font-size: 12px;
            font-weight: 500;
            color: #8e8e8e;
            margin-bottom: 10px;
            margin-top: 10px;
            white-space: nowrap;
        }
        .collapsed .nav-label { display: none; }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            color: #e3e3e3;
            white-space: nowrap;
            overflow: hidden;
            transition: background 0.2s;
        }
        .collapsed .nav-item {
            justify-content: center;
            padding: 10px 0;
        }
        .collapsed .nav-item span:last-child { display: none; } /* Hide text */
        
        .nav-item:hover, .nav-item.active {
            background: #282a2c;
        }

        /* Sidebar Footer (Settings & Emotes) */
        .sidebar-footer {
            padding: 15px;
            border-top: 1px solid #333;
            display: flex;
            gap: 10px;
            flex-direction: column;
        }
        .collapsed .sidebar-footer {
            flex-direction: column;
            padding: 10px;
            gap: 5px;
        }

        .footer-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-start; /* Align left */
            gap: 10px;
            background: transparent;
            border: none;
            color: #e3e3e3;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.2s;
            white-space: nowrap;
        }
        /* Icon container for alignment */
        .footer-btn span:first-child {
            width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .collapsed .footer-btn {
            justify-content: center; /* Center when collapsed */
        }
        .collapsed .footer-btn span:last-child { display: none; }
        
        .footer-btn:hover { background: #333; }

        /* --- Settings Modal --- */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 11000;
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .modal-overlay.open { display: flex; opacity: 1; }

        .modal-box {
            background: #1e1f20;
            width: 700px; /* Wider for 2 cols */
            max-width: 90%;
            height: 500px; /* Fixed height */
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            overflow: hidden;
            transform: scale(0.9);
            transition: transform 0.3s;
            display: flex;
            flex-direction: column;
            font-family: 'Segoe UI', system-ui, sans-serif; /* Cleaner font */
        }
        .modal-overlay.open .modal-box { transform: scale(1); }

        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            background: #252627;
        }
        .modal-close { background: none; border: none; color: #aaa; font-size: 20px; cursor: pointer; }
        .modal-close:hover { color: #fff; }

        .modal-body {
            display: flex;
            flex-grow: 1;
            overflow: hidden;
        }

        /* Left Category Sidebar */
        .settings-sidebar {
            width: 200px;
            background: #252627;
            border-right: 1px solid #333;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .settings-cat-btn {
            padding: 10px 20px;
            background: transparent;
            border: none;
            color: #aaa;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }
        .settings-cat-btn:hover { background: #2f3133; color: #e3e3e3; }
        .settings-cat-btn.active { background: #2f3133; color: #fff; border-left-color: #00C6FF; font-weight: 500; }

        /* Right Content Area */
        .settings-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto;
            color: #e3e3e3;
        }
        .settings-section { display: none; animation: fadeIn 0.3s ease; }
        .settings-section.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .modal-section-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; }

        .bg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .bg-option { height: 80px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; background-size: cover; background-position: center; transition: transform 0.2s; }
        .bg-option:hover { transform: scale(1.02); border-color: rgba(255,255,255,0.3); }
        .bg-option.selected { border-color: #00C6FF; box-shadow: 0 0 10px rgba(0, 198, 255, 0.3); }

        /* ... existing emote bar ... */
        #emote-bar {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px); /* Hidden up top */
            background: rgba(30, 31, 32, 0.9);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            display: flex;
            gap: 10px;
            z-index: 10500;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #emote-bar.visible {
            transform: translateX(-50%) translateY(0);
        }

        .emote-btn {
            background: #333;
            color: #fff;
            border: 1px solid #444;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .emote-btn:hover { background: #444; transform: translateY(-2px); }
        .emote-btn:active { transform: scale(0.95); }

    `;
    document.head.appendChild(style);

    // --- HTML Structure ---

    // 1. Sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'app-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <button id="sidebar-collapse-btn" title="Collapse Sidebar"><i class="bi bi-chevron-left"></i></button>
            <button class="new-chat-btn">
                <span><i class="bi bi-plus-lg"></i></span> <span>Đoạn chat mới</span>
            </button>
        </div>
        <div class="sidebar-nav">
            <div class="nav-label">Gần đây</div>
            <div class="nav-item active">
                <span><i class="bi bi-chat-dots-fill"></i></span> <span>Cuộc trò chuyện hiện tại</span>
            </div>
        </div>
        <div class="sidebar-footer">
            <button class="footer-btn" id="btn-settings" title="Settings">
                <span><i class="bi bi-gear-fill"></i></span> <span>Cài đặt</span>
            </button>
            <button class="footer-btn" id="btn-emotes" title="Emotes">
                <span><i class="bi bi-emoji-smile-fill"></i></span> <span>Biểu cảm</span>
            </button>
        </div>
    `;
    document.body.appendChild(sidebar);

    // 2. Settings Modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <span>Settings</span>
                <button class="modal-close"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body">
                <div class="settings-sidebar">
                    <button class="settings-cat-btn active" data-target="sect-background"><i class="bi bi-image"></i> Appearance</button>
                    <button class="settings-cat-btn" data-target="sect-about"><i class="bi bi-info-circle"></i> About</button>
                </div>
                <div class="settings-content">
                    <div id="sect-background" class="settings-section active">
                        <div class="modal-section-title">Background</div>
                        <div class="bg-grid" id="bg-options-grid"></div>
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            <input type="text" id="custom-bg-input" placeholder="Paste image URL..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: #fff; font-size: 14px;">
                            <button id="btn-custom-bg" style="padding: 10px 20px; background: #00C6FF; border: none; border-radius: 6px; color: #fff; cursor: pointer; font-weight: 500;">Set</button>
                        </div>
                    </div>
                    
                    <div id="sect-about" class="settings-section">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="margin: 0; color: #fff; font-weight: 700; letter-spacing: 1px;">Yuki Project</h2>
                            <p style="margin: 5px 0 0; color: #00C6FF; font-size: 13px;">Simply a hobbyist project.</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; font-size: 14px;">
                                <div style="color: #888;">Version</div>
                                <div style="color: #eee;">0.36.18-alpha</div>
                                
                                <div style="color: #888;">Model</div>
                                <div style="color: #eee;">Vivian (<a href="https://booth.pm/en/items/7811941">Booth.pm</a>)</div>
                                
                                <div style="color: #888;">Engine</div>
                                <div style="color: #eee;">PixiJS + Live2D SDK</div>
                                
                                <div style="color: #888;">Chat AI</div>
                                <div style="color: #eee;">Gemini 2.0 Flash</div>
                                
                                <div style="color: #888;">TTS AI</div>
                                <div style="color: #eee;">Gemini 2.5 Flash TTS</div>
                            </div>
                        </div>

                        <div class="modal-section-title" style="font-size: 16px; margin-bottom: 10px;">Credits</div>
                        <p style="color: #aaa; font-size: 13px;">
                            Made with ❤️ by <a href="https://thanhcong2k7.auroramusicvietnam.net/" style="color: #00C6FF; text-decoration: none;">Etheriaa</a>.
                        </p>
                        <p style="color: #aaa; font-size: 13px; line-height: 1.6; margin-bottom: 5px;">
                            Hosted by <a href="https://auroramusicvietnam.net"><strong style="color: #fff;">Aurora Music Vietnam</strong></a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 3. Emote Bar
    const emoteBar = document.createElement('div');
    emoteBar.id = 'emote-bar';
    document.body.appendChild(emoteBar);

    // --- Logic ---

    // Render Session List
    function renderSessionList() {
        // Keep the "Recent" label
        const navContainer = document.querySelector('.sidebar-nav');
        navContainer.innerHTML = '<div class="nav-label">Recent</div>';

        const sessions = window.YukiChat ? window.YukiChat.sessions : [];
        const currentId = window.YukiChat ? window.YukiChat.currentSessionId : null;

        sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = `nav-item ${session.id === currentId ? 'active' : ''}`;
            item.innerHTML = `
                <span><i class="bi bi-chat-dots-fill"></i></span>
                <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis;">${session.title}</span>
                <button class="delete-chat-btn" style="background:none; border:none; color:#666; cursor:pointer; font-size:12px; display:none;">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            // Hover to show delete
            item.addEventListener('mouseenter', () => {
                const delBtn = item.querySelector('.delete-chat-btn');
                if (delBtn) delBtn.style.display = 'block';
            });
            item.addEventListener('mouseleave', () => {
                const delBtn = item.querySelector('.delete-chat-btn');
                if (delBtn) delBtn.style.display = 'none';
            });

            // Click to load
            item.addEventListener('click', (e) => {
                if (e.target.closest('.delete-chat-btn')) {
                    e.stopPropagation();
                    if (confirm('Delete this chat?')) {
                        window.YukiChat.deleteSession(session.id);
                    }
                    return;
                }
                window.YukiChat.loadSession(session.id);
            });

            navContainer.appendChild(item);
        });
    }

    // New Chat Button
    const btnNewChat = document.querySelector('.new-chat-btn');
    btnNewChat.onclick = () => {
        if (window.YukiChat) window.YukiChat.newSession();
    };

    // Listen for Session Updates
    window.addEventListener('yuki-sessions-updated', renderSessionList);
    window.addEventListener('yuki-session-changed', renderSessionList);

    // Initial Render
    // We wait a bit to ensure YukiChat is loaded, though script order should handle it.
    setTimeout(renderSessionList, 100);

    // Load Settings from LocalStorage

    // Settings Navigation Logic
    const catBtns = document.querySelectorAll('.settings-cat-btn');
    const sections = document.querySelectorAll('.settings-section');

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            catBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active to current
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Load Settings from LocalStorage
    function loadSettings() {
        // Sidebar State
        const isCollapsed = localStorage.getItem('yuki_sidebar_collapsed') === 'true';
        if (isCollapsed) {
            toggleSidebar(true);
        }

        // Background
        const savedBg = localStorage.getItem('yuki_bg_color');
        if (savedBg) {
            document.body.style.background = savedBg;
            document.body.style.backgroundSize = "cover";
        } else {
            document.body.style.background = 'url("./assets/bg1.jpg")';
            document.body.style.backgroundSize = "cover";
        }
    }

    // Toggle Sidebar Function
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    function toggleSidebar(forceCollapse = null) {
        const isCollapsed = forceCollapse !== null ? forceCollapse : !sidebar.classList.contains('collapsed');

        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            collapseBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
        } else {
            sidebar.classList.remove('collapsed');
            collapseBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        }

        // Save State
        localStorage.setItem('yuki_sidebar_collapsed', isCollapsed);

        // Trigger resize so Canvas adjusts
        window.dispatchEvent(new Event('resize'));
    }

    collapseBtn.addEventListener('click', () => toggleSidebar());

    // Settings Modal Logic
    const btnSettings = document.getElementById('btn-settings');
    const btnCloseModal = modal.querySelector('.modal-close');

    btnSettings.addEventListener('click', () => {
        modal.classList.add('open');
    });
    btnCloseModal.addEventListener('click', () => {
        modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });

    // Backgrounds
    const backgrounds = [
        { color: 'url("./assets/bg1.jpg")', name: 'Sakura' },
        { color: '#1a1a1a', name: 'Dark' },
        { color: '#f0f0f0', name: 'Light' },
        { color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Gradient 1' },
        { color: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)', name: 'Gradient 2' }
    ];
    const bgGrid = document.getElementById('bg-options-grid');
    
    // Get current saved bg to highlight
    const currentSavedBg = localStorage.getItem('yuki_bg_color');
    // Default is Sakura if nothing saved
    const activeBg = currentSavedBg || 'url("./assets/bg1.jpg")';

    backgrounds.forEach(bg => {
        const div = document.createElement('div');
        div.className = 'bg-option';
        div.style.background = bg.color;
        div.title = bg.name;
        
        // Highlight active
        if (bg.color === activeBg) {
            div.classList.add('selected');
        }

        div.onclick = () => {
            document.body.style.background = bg.color;
            document.body.style.backgroundSize = "cover";
            document.querySelectorAll('.bg-option').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            localStorage.setItem('yuki_bg_color', bg.color);
        };
        bgGrid.appendChild(div);
    });

    // Custom Background Logic
    const btnCustomBg = document.getElementById('btn-custom-bg');
    const inputCustomBg = document.getElementById('custom-bg-input');
    btnCustomBg.addEventListener('click', () => {
        const url = inputCustomBg.value.trim();
        if (url) {
            const bgValue = `url("${url}")`;
            document.body.style.background = bgValue;
            document.body.style.backgroundSize = "cover";
            document.querySelectorAll('.bg-option').forEach(el => el.classList.remove('selected'));
            localStorage.setItem('yuki_bg_color', bgValue);
        }
    });

    // Emotes Logic
    const btnEmotes = document.getElementById('btn-emotes');
    let emoteTimeout;

    btnEmotes.addEventListener('click', () => {
        const bar = document.getElementById('emote-bar');
        bar.classList.toggle('visible');

        // Auto hide after 8 seconds if no interaction
        clearTimeout(emoteTimeout);
        if (bar.classList.contains('visible')) {
            emoteTimeout = setTimeout(() => {
                bar.classList.remove('visible');
            }, 8000);
        }
    });

    // Vivian Emotions (mapped from filenames)
    const emotions = [
        { name: 'Reset', file: null },
        { name: 'Cry', file: '哭' },
        { name: 'Shy', file: '害羞' },
        { name: 'Panic', file: '慌张' },
        { name: 'Roll Eyes', file: '白眼' },
        { name: 'Dark Face', file: '黑脸' },
        { name: 'Close Umbrella', file: '伞关闭' }
    ];

    emotions.forEach(emo => {
        const btn = document.createElement('button');
        btn.className = 'emote-btn';
        btn.innerText = emo.name;
        btn.onclick = () => {
            triggerExpression(emo.file);
            // Optional: Hide bar after selection
            // document.getElementById('emote-bar').classList.remove('visible');
        };
        emoteBar.appendChild(btn);
    });

    function triggerExpression(expName) {
        if (!window.model4) {
            console.warn("Model not loaded yet");
            return;
        }

        try {
            console.log("Attempting expression:", expName);

            if (expName === null) {
                // Reset is complex, usually we just set a neutral expression if exists
                // or we rely on the idle motion to take over.
                // There isn't a direct "clearExpression" in the high level API easily accessible without digging.
                console.log("Resetting expression...");
                // Just try setting an empty one or undefined
                window.model4.internalModel.motionManager.expressionManager.setExpression(0);
            } else {
                // Try 1: Direct name
                window.model4.expression(expName);

                // Debugging: List available expressions
                if (window.model4.internalModel && window.model4.internalModel.motionManager && window.model4.internalModel.motionManager.expressionManager) {
                    const definitions = window.model4.internalModel.motionManager.expressionManager.definitions;
                    console.log("Available Expressions:", definitions);
                }
            }
        } catch (e) {
            console.error("Expression Error:", e);
        }
    }

    // Global actions
    window.triggerExpression = triggerExpression;

    window.clearChat = function () {
        if (confirm("Start a new chat? This will clear current history.")) {
            localStorage.removeItem('yuki_chat_history');
            location.reload();
        }
    };

    // Resize helper for Canvas (updated from previous)
    // We attach this as a global function so index.js can access if needed, or index.js will read DOM
    window.getSidebarWidth = function () {
        return sidebar.classList.contains('collapsed') ? 70 : 260;
    };

    // Initialize
    loadSettings();

})();