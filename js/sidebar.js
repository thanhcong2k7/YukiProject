(function () {
    // --- CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Inter:wght@300;500&family=JetBrains+Mono:wght@500&family=Playfair+Display:wght@600&family=Orbitron:wght@500&display=swap');
        
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

        /* --- Custom Music Player (Floating Bottom Bar) --- */
        #custom-music-player {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            min-width: 400px;
            max-width: 90%;
            height: auto;
            background: rgba(20, 20, 20, 0.85);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 15px 30px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9500;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        #custom-music-player:hover {
            transform: translateX(-50%) translateY(-2px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .player-main { 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            width: 100%;
        }
        
        .player-thumbnail {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.1);
            animation: spin 10s linear infinite;
            animation-play-state: paused;
        }
        .player-thumbnail.playing {
            animation-play-state: running;
            border-color: #00C6FF;
        }
        
        .track-info { 
            text-align: left; 
            width: 140px; 
            overflow: hidden; 
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .track-title { 
            font-size: 14px; 
            font-weight: bold; 
            color: #fff; 
            white-space: nowrap; 
            display: block; 
        }
        .track-title.scrolling { animation: marquee 10s linear infinite; }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        
        .player-controls { display: flex; gap: 15px; align-items: center; margin: 0; }
        .player-controls button {
            background: none; border: none; color: #ccc; cursor: pointer; transition: all 0.2s; font-size: 20px;
            display: flex; align-items: center; justify-content: center;
        }
        .player-controls button:hover { color: #fff; transform: scale(1.1); }
        .player-controls button.active { color: #00C6FF; }
        #btn-play { 
            font-size: 32px; 
            color: #fff; 
            background: rgba(255,255,255,0.1);
            width: 45px; height: 45px; border-radius: 50%;
        }
        #btn-play:hover { background: rgba(255,255,255,0.2); }

        .progress-container { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            font-size: 11px; 
            color: #888; 
            width: 100%;
        }
        .progress-bar-bg { flex-grow: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; position: relative; cursor: pointer; overflow: hidden; }
        .progress-bar-fill { width: 0%; height: 100%; background: #00C6FF; border-radius: 2px; transition: width 0.1s linear; }

        /* --- Sidebar Playlist Area --- */
        #playlist-sidebar-container {
            padding: 15px;
            border-bottom: 1px solid #333;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .collapsed #playlist-sidebar-container { display: none; }

        .playlist-input-container {
            display: flex;
            gap: 5px;
        }
        #yt-playlist-input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: #eee;
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
        }
        #yt-playlist-input:focus { border-color: #00C6FF; }
        
        #btn-load-yt {
            background: #333;
            border: none;
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px;
            transition: background 0.2s;
        }
        #btn-load-yt:hover { background: #00C6FF; }

        .player-playlist {
            max-height: 200px;
            overflow-y: auto;
            display: flex; flex-direction: column; gap: 4px;
            scrollbar-width: thin; scrollbar-color: #444 transparent;
        }
        .playlist-item {
            display: flex; align-items: center; gap: 10px;
            padding: 6px 10px; border-radius: 8px;
            cursor: pointer; transition: background 0.2s;
        }
        .pi-thumb {
            width: 40px; height: 40px; object-fit: cover; border-radius: 4px; flex-shrink: 0;
        }
        .playlist-item:hover { background: rgba(255,255,255,0.05); }
        .playlist-item.active { background: rgba(0, 198, 255, 0.15); }
        .playlist-item.active .pi-title { color: #00C6FF; }
        
        .collapsed #player-playlist .pi-info,
        .collapsed #player-playlist .pi-duration { display: none; }
        .collapsed #player-playlist .playlist-item { justify-content: center; padding: 6px 0; }
        .collapsed #player-playlist .pi-thumb { margin: 0; }
        
        .pi-info { display: flex; flex-direction: column; overflow: hidden; width: 100%; }
        .pi-title { font-size: 12px; color: #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pi-artist { font-size: 10px; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pi-duration { margin-left: auto; font-size: 10px; color: #555; display: none; } /* Hide duration in list for cleaner look */


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

        /* --- Floating Clock --- */
        #floating-clock-container {
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: row; /* Side by side */
            align-items: center;
            gap: 20px;
            background: rgba(20, 20, 20, 0.75);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            padding: 15px 25px;
            border-radius: 20px;
            color: #fff;
            z-index: 8000;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: opacity 0.3s, visibility 0.3s;
            box-shadow: 0 5px 20px rgba(0,0,0,0.4);
            pointer-events: none; /* Allow clicking through */
            font-family: 'Inter', sans-serif; /* Default */
        }
        #floating-clock-container.hidden {
            opacity: 0;
            visibility: hidden;
        }

        /* Columns */
        .clock-left-col {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
        }
        .clock-right-col {
            display: flex;
            align-items: center;
            justify-content: center;
            border-left: 1px solid rgba(255,255,255,0.1);
            padding-left: 30px;
        }
        
        /* Visibility helpers */
        #floating-clock-container.hide-time .clock-left-col { display: none; }
        #floating-clock-container.hide-cal .clock-right-col { display: none; }
        /* Remove border if one is hidden */
        #floating-clock-container.hide-time .clock-right-col { border-left: none; padding-left: 0; }


        .clock-time {
            font-size: 48px;
            font-weight: 500;
            letter-spacing: -1px;
            line-height: 1;
            margin-bottom: 5px;
            background: linear-gradient(to bottom, #fff, #bbb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .clock-date {
            font-size: 16px;
            color: #ccc;
            margin-bottom: 8px;
            font-weight: 400;
        }
        .clock-weather {
            font-size: 14px;
            color: #00C6FF;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        /* Mini Calendar */
        #mini-calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
            text-align: center;
            background: rgba(255, 255, 255, 0.03);
            padding: 8px;
            border-radius: 10px;
        }
        .cal-header {
            font-size: 10px;
            color: #888;
            font-weight: 600;
            padding-bottom: 4px;
        }
        .cal-day {
            font-size: 11px;
            color: #ddd;
            width: 20px;
            height: 20px;
            line-height: 20px;
            border-radius: 4px;
        }
        .cal-day.today {
            background: #00C6FF;
            color: #fff;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(0, 198, 255, 0.3);
        }
        .cal-day.empty { background: none; }

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

        <!-- Moved Music Player Here -->
        <div id="custom-music-player">
            <div class="player-main">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img id="player-thumbnail" class="player-thumbnail" src="assets/favicon.png" alt="Thumb">
                    <div class="track-info">
                        <div class="track-title" id="player-title">Not Playing</div>
                        <div class="track-artist" id="player-artist">...</div>
                    </div>
                </div>
                <div class="player-controls">
                    <button id="btn-shuffle" title="Shuffle"><i class="bi bi-shuffle"></i></button>
                    <button id="btn-prev" title="Previous"><i class="bi bi-skip-start-fill"></i></button>
                    <button id="btn-play" title="Play"><i class="bi bi-play-fill"></i></button>
                    <button id="btn-next" title="Next"><i class="bi bi-skip-end-fill"></i></button>
                    <button id="btn-loop" title="Loop"><i class="bi bi-repeat"></i></button>
                </div>
            </div>
            <div class="progress-container">
                <span class="time-text" id="curr-time">0:00</span>
                <div class="progress-bar-bg"><div class="progress-bar-fill" id="progress-fill"></div></div>
                <span class="time-text" id="total-time">0:00</span>
            </div>
        </div>
        <div class="sidebar-nav">
            <div class="nav-label">Gần đây</div>
            <div class="nav-item active">
                <span><i class="bi bi-chat-dots-fill"></i></span> <span>Cuộc trò chuyện hiện tại</span>
            </div>
        </div>
        <div id="playlist-header-label" class="nav-label" style="padding: 0 15px; margin-top: 10px;">Playlist</div>
        <div class="player-playlist" id="player-playlist" style="border-top: 1px solid #333; padding: 10px;">
            <!-- Playlist generated by JS -->
        </div>
        <div class="sidebar-footer">
            <button class="footer-btn" id="btn-settings" title="Settings">
                <span><i class="bi bi-gear-fill"></i></span> <span>Cài đặt</span>
            </button>
            <button class="footer-btn" id="btn-emotes" title="Emotes">
                <span><i class="bi bi-emoji-smile-fill"></i></span> <span>Biểu cảm</span>
            </button>
            <button class="footer-btn" id="btn-fullscreen" title="Fullscreen">
                <span><i class="bi bi-arrows-fullscreen"></i></span> <span>Toàn màn hình</span>
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
                    <button class="settings-cat-btn" data-target="sect-music"><i class="bi bi-music-note-beamed"></i> Music</button>
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
                        
                        <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px;">
                            <div class="modal-section-title" style="font-size: 16px;">Widgets</div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #eee; margin-bottom: 8px;">
                                    <input type="checkbox" id="toggle-clock-widget"> Enable Widget
                                </label>
                            </div>

                            <div id="widget-settings-panel" style="padding-left: 10px; border-left: 2px solid #333; display: flex; flex-direction: column; gap: 15px;">
                                <!-- Font -->
                                <div>
                                    <label style="display:block; color:#aaa; font-size:12px; margin-bottom:5px;">Font Style</label>
                                    <select id="clock-font-select" style="background:#2a2a2a; color:#fff; border:1px solid #444; padding:8px; border-radius:4px; width:100%; outline:none;">
                                        <option value="'Inter', sans-serif">Modern (Inter)</option>
                                        <option value="'JetBrains Mono', monospace">Digital (Mono)</option>
                                        <option value="'Playfair Display', serif">Elegant (Serif)</option>
                                        <option value="'Caveat', cursive">Handwritten</option>
                                        <option value="'Orbitron', sans-serif">Retro Sci-Fi</option>
                                    </select>
                                </div>

                                <!-- Components -->
                                <div>
                                    <label style="display:block; color:#aaa; font-size:12px; margin-bottom:5px;">Visibility</label>
                                    <div style="display: flex; gap: 20px;">
                                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #ccc; font-size: 13px;">
                                            <input type="checkbox" id="toggle-clock-time" checked> Time & Weather
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #ccc; font-size: 13px;">
                                            <input type="checkbox" id="toggle-clock-cal" checked> Calendar
                                        </label>
                                    </div>
                                </div>

                                <!-- Format -->
                                <div>
                                    <label style="display:block; color:#aaa; font-size:12px; margin-bottom:5px;">Time Format</label>
                                    <div style="display: flex; gap: 20px;">
                                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #ccc; font-size: 13px;">
                                            <input type="radio" name="clock-fmt" value="12"> 12H
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #ccc; font-size: 13px;">
                                            <input type="radio" name="clock-fmt" value="24" checked> 24H
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="sect-music" class="settings-section">
                        <div class="modal-section-title"><i class="fa-brands fa-youtube"></i>YouTube Music</div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; color:#aaa; font-size:13px; margin-bottom:5px;">YouTube URL</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="yt-playlist-input" placeholder="e.g., PLMC9KNkIncK..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: #fff; font-size: 14px;">
                                <button id="btn-save-yt" style="padding: 10px 20px; background: #ff0000; border: none; border-radius: 6px; color: #fff; cursor: pointer; font-weight: 500;">Load</button>
                            </div>
                            <p style="color:#666; font-size:12px; margin-top:5px;">Dán link tới playlist hoặc video YouTube để load danh sách.</p>
                            <p style="color:#666; font-size:12px; margin-top:5px;">API powered by Aurora Music Vietnam.</p>
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
                                <div style="color: #eee;">Vivian (<a href="https://booth.pm/en/items/7811941" style="color: #00C6FF; text-decoration: none;">booth.pm</a>)</div>
                                
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

    // 4. Floating Clock
    const clockDiv = document.createElement('div');
    clockDiv.id = 'floating-clock-container';
    clockDiv.innerHTML = `
        <div class="clock-left-col">
            <div class="clock-time" id="clock-time">00:00</div>
            <div class="clock-date" id="clock-date">Mon, Jan 1</div>
            <div class="clock-weather" id="clock-weather"><i class="bi bi-cloud"></i> Loading...</div>
        </div>
        <div class="clock-right-col">
            <div id="mini-calendar"></div>
        </div>
    `;
    document.body.appendChild(clockDiv);

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

        // Clock Widget
        const isClockEnabled = localStorage.getItem('yuki_clock_enabled') !== 'false'; // Default true
        const toggleClock = document.getElementById('toggle-clock-widget');
        const clock = document.getElementById('floating-clock-container');
        const panel = document.getElementById('widget-settings-panel');
        
        if (toggleClock) toggleClock.checked = isClockEnabled;
        
        // Initialize panel state based on enabled status
        if (panel) {
            if (isClockEnabled) {
                panel.style.opacity = '1';
                panel.style.pointerEvents = 'auto';
            } else {
                panel.style.opacity = '0.5';
                panel.style.pointerEvents = 'none';
            }
        }

        if (clock) {
            if (!isClockEnabled) {
                clock.classList.add('hidden');
            } else {
                clock.classList.remove('hidden');
            }
        }
        
        // Load Font
        const savedFont = localStorage.getItem('yuki_clock_font');
        const fontSel = document.getElementById('clock-font-select');
        if(savedFont && fontSel) fontSel.value = savedFont;
        
        // Load Sub Toggles
        const savedShowTime = localStorage.getItem('yuki_show_time') !== 'false';
        const savedShowCal = localStorage.getItem('yuki_show_cal') !== 'false';
        
        const togTime = document.getElementById('toggle-clock-time');
        const togCal = document.getElementById('toggle-clock-cal');
        if(togTime) togTime.checked = savedShowTime;
        if(togCal) togCal.checked = savedShowCal;
        
        // Load Format
        const savedFmt = localStorage.getItem('yuki_time_format');
        if(savedFmt) {
            const rad = document.querySelector(`input[name="clock-fmt"][value="${savedFmt}"]`);
            if(rad) rad.checked = true;
        }

        // Apply visual
        applyWidgetSettings();
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

    // Fullscreen Logic
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }

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

    // --- Clock & Weather Logic ---
    function updateClock() {
        const now = new Date();
        
        // 12/24H Format
        const is12H = localStorage.getItem('yuki_time_format') === '12';
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: is12H };
        const timeStr = now.toLocaleTimeString([], timeOptions);
        
        const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        const timeEl = document.getElementById('clock-time');
        const dateEl = document.getElementById('clock-date');
        
        if (timeEl) timeEl.innerText = timeStr;
        if (dateEl) dateEl.innerText = dateStr;
        
        // Update calendar once a minute (or if date changes)
        if (!window.lastCalDate || window.lastCalDate !== now.getDate()) {
            renderCalendar(now);
            window.lastCalDate = now.getDate();
        }
    }

    function renderCalendar(date) {
        const cal = document.getElementById('mini-calendar');
        if (!cal) return;

        const year = date.getFullYear();
        const month = date.getMonth();
        const today = date.getDate();

        // Days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // First day of week (0 = Sun, 1 = Mon...)
        const firstDay = new Date(year, month, 1).getDay();

        let html = '';
        
        // Headers
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(d => html += `<div class="cal-header">${d}</div>`);

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="cal-day empty"></div>`;
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today ? 'today' : '';
            html += `<div class="cal-day ${isToday}">${i}</div>`;
        }

        cal.innerHTML = html;
    }
    
    // Function to apply visual widget settings (font, visibility)
    function applyWidgetSettings() {
        const container = document.getElementById('floating-clock-container');
        if (!container) return;
        
        // Font
        const font = localStorage.getItem('yuki_clock_font') || "'Inter', sans-serif";
        container.style.fontFamily = font;
        
        // Some fonts look better smaller/larger? (Optional tweaks)
        const timeEl = document.getElementById('clock-time');
        if (timeEl) {
             // Apply font to time specifically if needed
             timeEl.style.fontFamily = font; 
        }

        // Sub-visibility
        const showTime = localStorage.getItem('yuki_show_time') !== 'false';
        const showCal = localStorage.getItem('yuki_show_cal') !== 'false';
        
        if (showTime) container.classList.remove('hide-time');
        else container.classList.add('hide-time');
        
        if (showCal) container.classList.remove('hide-cal');
        else container.classList.add('hide-cal');
    }

    setInterval(updateClock, 1000);
    updateClock(); // Initial call

    async function fetchWeather() {
        const weatherEl = document.getElementById('clock-weather');
        if (!weatherEl) return;
        
        // Helper to update UI
        const updateUI = async (lat, lon) => {
             try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await res.json();
                if(data.current_weather) {
                    const temp = Math.round(data.current_weather.temperature);
                    const code = data.current_weather.weathercode;
                    // Map code to icon (simplified)
                    let icon = 'bi-cloud';
                    if (code <= 1) icon = 'bi-sun';
                    else if (code <= 3) icon = 'bi-cloud-sun';
                    else if (code <= 67) icon = 'bi-cloud-rain';
                    else if (code <= 99) icon = 'bi-cloud-lightning-rain';
                    
                    weatherEl.innerHTML = `<i class="bi ${icon}"></i> ${temp}°C`;
                }
            } catch(e) { console.error("Weather fetch error:", e); }
        };

        // Try geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => updateUI(position.coords.latitude, position.coords.longitude),
                (err) => {
                    // Default to Ho Chi Minh City if denied/error
                    console.warn("Geolocation denied/error, defaulting to HCMC.");
                    updateUI(10.8231, 106.6297);
                }
            );
        } else {
             updateUI(10.8231, 106.6297);
        }
    }
    
    // Fetch weather initially and every 30 mins
    setTimeout(fetchWeather, 1000); // Slight delay
    setInterval(fetchWeather, 30 * 60 * 1000);

    // Clock Toggle Logic & Settings Listeners
    const toggleClock = document.getElementById('toggle-clock-widget');
    if (toggleClock) {
        toggleClock.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const clock = document.getElementById('floating-clock-container');
            const panel = document.getElementById('widget-settings-panel');
            if (clock) {
                if (isChecked) {
                    clock.classList.remove('hidden');
                    if(panel) { panel.style.opacity = '1'; panel.style.pointerEvents = 'auto'; }
                } else {
                    clock.classList.add('hidden');
                    if(panel) { panel.style.opacity = '0.5'; panel.style.pointerEvents = 'none'; }
                }
            }
            localStorage.setItem('yuki_clock_enabled', isChecked);
        });
    }
    
    // Font Select
    const fontSelect = document.getElementById('clock-font-select');
    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            localStorage.setItem('yuki_clock_font', e.target.value);
            applyWidgetSettings();
        });
    }
    
    // Sub Toggles
    const toggleTime = document.getElementById('toggle-clock-time');
    if (toggleTime) {
        toggleTime.addEventListener('change', (e) => {
            localStorage.setItem('yuki_show_time', e.target.checked);
            applyWidgetSettings();
        });
    }
    
    const toggleCal = document.getElementById('toggle-clock-cal');
    if (toggleCal) {
        toggleCal.addEventListener('change', (e) => {
            localStorage.setItem('yuki_show_cal', e.target.checked);
            applyWidgetSettings();
        });
    }
    
    // Format Radio
    const formatRadios = document.querySelectorAll('input[name="clock-fmt"]');
    formatRadios.forEach(r => {
        r.addEventListener('change', (e) => {
            if (e.target.checked) {
                localStorage.setItem('yuki_time_format', e.target.value);
                updateClock();
            }
        });
    });

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

    // --- Music Player Logic (YouTube Integration) ---
    const BACKEND_API_URL = 'https://yukibackend.onrender.com/api/playlist'; // User provided backend API URL
    
    // Inject YouTube API
    if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = function() {
        musicPlayer.initYouTube();
    };

    const musicPlayer = {
        currentId: localStorage.getItem('yuki_yt_id') || 'PLOzDu-MXXLlg5384VEAWMzgXSdU8HFwbS',
        currentType: localStorage.getItem('yuki_yt_type') || 'playlist', // 'playlist' or 'video'
        ytPlayer: null,
        updateTimer: null,
        isPlaying: false,
        isLooping: false,
        isShuffling: false,
        tracks: [], // Store full track data from backend
        
        elements: {
             get title() { return document.getElementById('player-title'); },
             get artist() { return document.getElementById('player-artist'); },
             get playBtn() { return document.getElementById('btn-play'); },
             get prevBtn() { return document.getElementById('btn-prev'); },
             get nextBtn() { return document.getElementById('btn-next'); },
             get shuffleBtn() { return document.getElementById('btn-shuffle'); },
             get loopBtn() { return document.getElementById('btn-loop'); },
             get playlistContainer() { return document.getElementById('player-playlist'); },
             get currTime() { return document.getElementById('curr-time'); },
             get totalTime() { return document.getElementById('total-time'); },
             get progressFill() { return document.getElementById('progress-fill'); },
             get progressBarBg() { return document.querySelector('.progress-bar-bg'); }
        },

        init() {
            // Load ID into input
            const input = document.getElementById('yt-playlist-input');
            if(input) input.value = this.currentId;

            // Create hidden player div if not exists
            if (!document.getElementById('yt-player-hidden')) {
                const playerDiv = document.createElement('div');
                playerDiv.id = 'yt-player-hidden';
                playerDiv.style.display = 'none'; // Keep it hidden
                document.body.appendChild(playerDiv);
            }
            
            // Listeners
            if(this.elements.playBtn) this.elements.playBtn.onclick = () => this.togglePlay();
            if(this.elements.prevBtn) this.elements.prevBtn.onclick = () => this.prevTrack();
            if(this.elements.nextBtn) this.elements.nextBtn.onclick = () => this.nextTrack();
            if(this.elements.shuffleBtn) this.elements.shuffleBtn.onclick = () => this.toggleShuffle();
            if(this.elements.loopBtn) this.elements.loopBtn.onclick = () => this.toggleLoop();
            
            // Progress Bar Seek
            if (this.elements.progressBarBg) {
                this.elements.progressBarBg.addEventListener('click', (e) => {
                    if (!this.ytPlayer || !this.ytPlayer.seekTo) return;
                    const rect = this.elements.progressBarBg.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const percentage = clickX / width;
                    const duration = this.ytPlayer.getDuration();
                    if (duration) {
                        this.ytPlayer.seekTo(duration * percentage, true);
                    }
                });
            }

            // Load Button (Sidebar)
            const loadBtn = document.getElementById('btn-load-yt');
            if(loadBtn) {
                loadBtn.onclick = async () => {
                    const inputVal = document.getElementById('yt-playlist-input').value.trim();
                    if(inputVal) {
                        const result = this.extractInputData(inputVal);
                        if (result) {
                            if (result.id !== this.currentId) {
                                this.currentId = result.id;
                                this.currentType = result.type;
                                localStorage.setItem('yuki_yt_id', result.id);
                                localStorage.setItem('yuki_yt_type', result.type);
                                await this.loadMedia(result.id, result.type);
                                alert(`YouTube ${result.type === 'playlist' ? 'Playlist' : 'Video'} loaded!`);
                            } else {
                                alert("Media is already loaded.");
                            }
                        } else {
                            alert("Please enter a valid YouTube Playlist/Video URL or ID.");
                        }
                    }
                };
            }
            
            // Add debounced input listener for auto-loading
            const inputYtPlaylist = document.getElementById('yt-playlist-input');
            let debounceTimer;
            if (inputYtPlaylist) {
                inputYtPlaylist.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async () => {
                        const inputValue = inputYtPlaylist.value.trim();
                        if (inputValue) {
                            const result = this.extractInputData(inputValue);
                            if (result && result.id !== this.currentId) {
                                console.log(`Auto-loading new ${result.type}:`, result.id);
                                this.currentId = result.id;
                                this.currentType = result.type;
                                localStorage.setItem('yuki_yt_id', result.id);
                                localStorage.setItem('yuki_yt_type', result.type);
                                await this.loadMedia(result.id, result.type);
                            }
                        }
                    }, 2000); 
                });
            }
            
            // Initial load
            if (window.YT && window.YT.Player) {
                this.initYouTube();
            }
        },

        initYouTube() {
            if (!this.ytPlayer && window.YT && window.YT.Player) {
                this.ytPlayer = new YT.Player('yt-player-hidden', {
                    height: '0',
                    width: '0',
                    playerVars: {
                        'playsinline': 1,
                        'autoplay': 1, // Auto-play on load
                        'controls': 0,
                        'disablekb': 1,
                        'modestbranding': 1,
                        'rel': 0
                    },
                    events: {
                        'onReady': (event) => {
                            this.onPlayerReady(event);
                            this.loadMedia(this.currentId, this.currentType);
                        },
                        'onStateChange': (event) => this.onPlayerStateChange(event),
                        'onError': (event) => console.error("YT Error:", event.data)
                    }
                });
            } else if (this.ytPlayer) {
                this.loadMedia(this.currentId, this.currentType);
            }
        },

        async loadMedia(id, type) {
            this.elements.playlistContainer.innerHTML = `
                <div class="playlist-item">
                    <div class="pi-info">
                        <span class="pi-title">Loading...</span>
                        <span class="pi-artist">Please wait</span>
                    </div>
                </div>
            `;
            
            this.tracks = []; // Clear current tracks

            if (type === 'playlist') {
                // Backend Fetch for Playlist
                try {
                    const response = await fetch(`${BACKEND_API_URL}?id=${id}`);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    this.tracks = data.tracks;
                    if(data.title) {
                        const lbl = document.getElementById('playlist-header-label');
                        if(lbl) lbl.innerText = "Playing: " + data.title;
                    }
                    this.renderPlaylist();
                    
                    if (this.ytPlayer && this.ytPlayer.loadPlaylist) {
                        const videoIds = this.tracks.map(t => t.id);
                        // Use loadPlaylist to auto-play
                        this.ytPlayer.loadPlaylist({ playlist: videoIds });
                    }
                } catch (error) {
                    console.error("Error fetching playlist:", error);
                    this.renderError(error.message);
                }
            } else {
                // Single Video (Local)
                this.tracks = [{
                    id: id,
                    title: "Loading Video...",
                    artist: "YouTube",
                    duration: 0
                }];
                this.renderPlaylist();

                if (this.ytPlayer && this.ytPlayer.loadVideoById) {
                    // Use loadVideoById to auto-play
                    this.ytPlayer.loadVideoById(id);
                }
            }
        },

        renderError(msg) {
            this.elements.playlistContainer.innerHTML = `
                <div class="playlist-item">
                    <div class="pi-info">
                        <span class="pi-title">Error</span>
                        <span class="pi-artist">${msg}</span>
                    </div>
                </div>
            `;
        },

        onPlayerReady(event) {
            event.target.setVolume(50);
            event.target.playVideo(); // Ensure play on ready
        },

        onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.updatePlayBtn();
                this.startProgressTimer();
                this.updateTrackInfo();
                this.renderPlaylist(); 
            } else if (event.data === YT.PlayerState.PAUSED) {
                this.isPlaying = false;
                this.updatePlayBtn();
                this.stopProgressTimer();
            } else if (event.data === YT.PlayerState.ENDED) {
                if (this.isLooping) {
                    if (this.currentType === 'playlist' && this.ytPlayer.getPlaylistIndex() === this.tracks.length - 1) {
                         this.ytPlayer.playVideoAt(0);
                    } else if (this.currentType === 'video') {
                         this.ytPlayer.playVideo();
                    }
                } else {
                    // Check if it's the end of playlist
                    if (this.currentType === 'video' || (this.currentType === 'playlist' && this.ytPlayer.getPlaylistIndex() === this.tracks.length - 1)) {
                         this.isPlaying = false;
                         this.updatePlayBtn();
                         this.stopProgressTimer();
                         this.ytPlayer.stopVideo();
                         this.updateTrackInfo();
                    }
                }
            } else if (event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.CUED) {
                 this.updateTrackInfo(); // Update metadata if available
                 this.renderPlaylist();
            }
        },

        updateTrackInfo() {
            if(!this.ytPlayer || !this.ytPlayer.getVideoData) return;
            
            const data = this.ytPlayer.getVideoData();
            let trackIndex = 0;
            
            if (this.currentType === 'playlist') {
                trackIndex = this.ytPlayer.getPlaylistIndex();
            }

            // Update internal track data with real data from player if placeholder
            if (this.tracks[trackIndex]) {
                if (data.title && (this.tracks[trackIndex].title === "Loading Video..." || this.tracks[trackIndex].title !== data.title)) {
                    this.tracks[trackIndex].title = data.title;
                    this.tracks[trackIndex].artist = data.author || "YouTube";
                }
                const dur = this.ytPlayer.getDuration();
                if (dur) this.tracks[trackIndex].duration = dur;
            }

            // Update UI
            const track = this.tracks[trackIndex];
            if(track) {
                 if(this.elements.title) this.elements.title.innerText = track.title;
                 if(this.elements.artist) this.elements.artist.innerText = track.artist;
            } else if (data.title) {
                 if(this.elements.title) this.elements.title.innerText = data.title;
                 if(this.elements.artist) this.elements.artist.innerText = data.author;
            }
            
            // Update Thumbnail
            const thumbEl = document.getElementById('player-thumbnail');
            if (thumbEl && data.video_id) {
                const thumbUrl = `https://img.youtube.com/vi/${data.video_id}/mqdefault.jpg`;
                if (thumbEl.src !== thumbUrl) thumbEl.src = thumbUrl;
                
                if (this.isPlaying) thumbEl.classList.add('playing');
                else thumbEl.classList.remove('playing');
            }

            // Handle Scrolling Title
            if (this.elements.title) {
                const titleEl = this.elements.title;
                // Reset to check natural width
                titleEl.classList.remove('scrolling');
                
                // Check overflow: scrollWidth > clientWidth (of parent)
                // We need to compare title's full width against the container width
                const containerWidth = titleEl.parentElement ? titleEl.parentElement.clientWidth : 0;
                if (titleEl.scrollWidth > containerWidth) {
                    titleEl.classList.add('scrolling');
                }
            }
            
            const duration = this.ytPlayer.getDuration();
            if(this.elements.totalTime && duration) this.elements.totalTime.innerText = this.formatTime(duration);
        },


        loadPlaylist(id) {
             this.loadMedia(id, 'playlist');
        },

        togglePlay() {
            if(!this.ytPlayer || !this.ytPlayer.getPlayerState) return;
            
            const state = this.ytPlayer.getPlayerState();
            if(state === YT.PlayerState.PLAYING) {
                this.ytPlayer.pauseVideo();
            } else {
                this.ytPlayer.playVideo();
            }
        },

        nextTrack() {
            if (!this.ytPlayer) return;
            
            if (this.currentType === 'playlist') {
                this.ytPlayer.nextVideo();
            } else {
                this.ytPlayer.seekTo(0);
                this.ytPlayer.playVideo();
            }
        },

        prevTrack() {
            if (!this.ytPlayer) return;
            
            if (this.currentType === 'playlist') {
                this.ytPlayer.previousVideo();
            } else {
                this.ytPlayer.seekTo(0);
                this.ytPlayer.playVideo();
            }
        },

        toggleShuffle() {
            this.isShuffling = !this.isShuffling;
            if (this.elements.shuffleBtn) {
                if (this.isShuffling) this.elements.shuffleBtn.classList.add('active');
                else this.elements.shuffleBtn.classList.remove('active');
            }
            if (this.ytPlayer && this.ytPlayer.setShuffle) {
                this.ytPlayer.setShuffle(this.isShuffling);
            }
        },

        
        toggleLoop() {
            this.isLooping = !this.isLooping;
            if(this.elements.loopBtn) {
                if (this.isLooping) this.elements.loopBtn.classList.add('active');
                else this.elements.loopBtn.classList.remove('active');
            }
            // For playlist looping, setLoop(true) makes the entire playlist loop.
            // If we want to loop a single track, we'd need custom logic in onStateChange (ENDED).
            // For now, assume isLooping applies to the playlist.
            if(this.ytPlayer && this.ytPlayer.setLoop) {
                this.ytPlayer.setLoop(this.isLooping);
            }
        },

        updatePlayBtn() {
            if(this.elements.playBtn) {
                this.elements.playBtn.innerHTML = this.isPlaying ? '<i class="bi bi-pause-fill"></i>' : '<i class="bi bi-play-fill"></i>';
            }
        },

        startProgressTimer() {
            this.stopProgressTimer();
            this.updateProgress(); // Immediate update
            this.updateTimer = setInterval(() => this.updateProgress(), 500);
        },

        stopProgressTimer() {
            if(this.updateTimer) clearInterval(this.updateTimer);
        },

        updateProgress() {
            if(!this.ytPlayer || !this.ytPlayer.getCurrentTime) return;
            
            const current = this.ytPlayer.getCurrentTime();
            const duration = this.ytPlayer.getDuration();
            
            if(this.elements.currTime) this.elements.currTime.innerText = this.formatTime(current);
            // Total time from YT player's actual duration, not static track data
            if(this.elements.totalTime && duration) this.elements.totalTime.innerText = this.formatTime(duration);
            
            if(this.elements.progressFill && duration > 0) {
                const percent = (current / duration) * 100;
                this.elements.progressFill.style.width = `${percent}%`;
            }
        },

        formatTime(seconds) {
            if (isNaN(seconds) || seconds === 0) return "0:00"; // Handle non-numeric or zero seconds
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        },

        renderPlaylist() {
            if(!this.elements.playlistContainer) return;
            this.elements.playlistContainer.innerHTML = '';
            
            if (this.tracks.length === 0) {
                this.elements.playlistContainer.innerHTML = `
                    <div class="playlist-item">
                        <div class="pi-info">
                            <span class="pi-title">No playlist loaded.</span>
                            <span class="pi-artist">Enter a YouTube Playlist URL or ID in settings.</span>
                        </div>
                    </div>
                `;
                return;
            }

            let currentPlaylistIndex = -1;
            try {
                if (this.ytPlayer && typeof this.ytPlayer.getPlaylistIndex === 'function') {
                    currentPlaylistIndex = this.ytPlayer.getPlaylistIndex();
                }
            } catch(e) { /* Ignore */ }

            this.tracks.forEach((track, index) => {
                const el = document.createElement('div');
                el.className = `playlist-item ${index === currentPlaylistIndex ? 'active' : ''}`;
                el.setAttribute('data-index', index);
                el.innerHTML = `
                    <img src="https://img.youtube.com/vi/${track.id}/default.jpg" class="pi-thumb" loading="lazy">
                    <div class="pi-info">
                        <span class="pi-title">${track.title}</span>
                        <span class="pi-artist">${track.artist}</span>
                    </div>
                    <span class="pi-duration">${this.formatTime(track.duration)}</span>
                `;
                el.onclick = () => {
                    if (this.ytPlayer) {
                        if (this.currentType === 'playlist') {
                            this.ytPlayer.playVideoAt(index);
                        } else {
                            this.ytPlayer.playVideo();
                        }
                        this.play(); 
                    }
                };
                this.elements.playlistContainer.appendChild(el);
            });
        },
        
        extractInputData(input) {
            // 1. Check for full URL
            try {
                const url = new URL(input);
                
                // Playlist: list=...
                if (url.searchParams.has('list')) {
                    return { id: url.searchParams.get('list'), type: 'playlist' };
                }
                
                // Video: v=... or short URL
                if (url.hostname === 'youtu.be') {
                     return { id: url.pathname.slice(1), type: 'video' };
                }
                if (url.searchParams.has('v')) {
                    return { id: url.searchParams.get('v'), type: 'video' };
                }
                
                // Embed URL
                if (url.pathname.startsWith('/embed/')) {
                    return { id: url.pathname.split('/')[2], type: 'video' };
                }

            } catch (e) {
                // Not a valid URL, treat as ID
            }
            
            // 2. Check IDs
            // Playlist ID usually starts with PL, FL, RD, OL... and is long
            if (/^(PL|FL|RD|UL|OL)[a-zA-Z0-9_-]+$/.test(input)) {
                return { id: input, type: 'playlist' };
            }
            
            // Video ID is usually 11 chars
            if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
                return { id: input, type: 'video' };
            }
            
            return null;
        }
    };
    
    // Defer init slightly to ensure DOM elements from string injection are ready
    setTimeout(() => musicPlayer.init(), 100);

    // Initialize
    loadSettings();

})();