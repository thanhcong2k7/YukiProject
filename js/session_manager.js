/**
 * Yuki Chat Session Manager
 * Handles logic for multiple chat sessions and rendering logic updates.
 */

window.YukiChat = {
    sessions: [],
    currentSessionId: null,
    
    init: function() {
        // Load sessions list
        this.sessions = JSON.parse(localStorage.getItem('yuki_sessions')) || [];
        
        // Load last active session or create new one
        const lastSessionId = localStorage.getItem('yuki_current_session_id');
        if (lastSessionId && this.sessions.find(s => s.id === lastSessionId)) {
            this.loadSession(lastSessionId);
        } else {
            this.newSession();
        }
    },

    newSession: function() {
        const newId = 'session_' + Date.now();
        const newSession = {
            id: newId,
            title: 'New Chat',
            timestamp: Date.now()
        };
        this.sessions.unshift(newSession); // Add to top
        this.saveSessions();
        this.loadSession(newId);
    },

    loadSession: function(sessionId) {
        this.currentSessionId = sessionId;
        localStorage.setItem('yuki_current_session_id', sessionId);
        
        // Dispatch event for sidebar to update active state
        window.dispatchEvent(new CustomEvent('yuki-session-changed', { detail: { id: sessionId } }));
        
        // Trigger chatbox UI reload
        // We need chatbox.js to listen to this or expose a reload method.
        if (window.reloadChatUI) {
            window.reloadChatUI(sessionId);
        }
    },

    saveMessage: function(role, text) {
        if (!this.currentSessionId) return;
        
        let history = this.getHistory(this.currentSessionId);
        history.push({ role: role, parts: [{ text: text }] });
        localStorage.setItem('yuki_history_' + this.currentSessionId, JSON.stringify(history));
        
        // Update Title if it's the first user message
        if (role === 'user' && history.length <= 2) { // 1 user msg, maybe 1 model greeting (if preserved)
             // Simple title logic: first 30 chars of message
             const session = this.sessions.find(s => s.id === this.currentSessionId);
             if (session && session.title === 'New Chat') {
                 this.renameSession(this.currentSessionId, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
             }
        }
    },

    renameSession: function(sessionId, newTitle) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            session.title = newTitle;
            this.saveSessions();
        }
    },

    getSession: function(sessionId) {
        return this.sessions.find(s => s.id === sessionId);
    },

    getHistory: function(sessionId) {
        return JSON.parse(localStorage.getItem('yuki_history_' + sessionId)) || [];
    },

    saveSessions: function() {
        localStorage.setItem('yuki_sessions', JSON.stringify(this.sessions));
        window.dispatchEvent(new CustomEvent('yuki-sessions-updated'));
    },
    
    deleteSession: function(sessionId) {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.saveSessions();
        localStorage.removeItem('yuki_history_' + sessionId);
        
        if (this.currentSessionId === sessionId) {
            this.newSession();
        } else {
            // Just update sidebar
            window.dispatchEvent(new CustomEvent('yuki-sessions-updated'));
        }
    }
};
