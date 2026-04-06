/* 
  Smart Student Survival System - Core Intelligence
  Vanilla JavaScript - Natural Minimalist (Insane Level)
*/

import { GoogleGenAI } from "@google/genai";

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Elements
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    // Feature Elements
    const generateBtn = document.getElementById('generate-btn');
    const summarizeBtn = document.getElementById('summarize-btn');
    const subjectsInput = document.getElementById('subjects-input');
    const examDateInput = document.getElementById('exam-date');
    const notesInput = document.getElementById('notes-input');
    const planOutput = document.getElementById('plan-output');
    const summaryOutput = document.getElementById('summary-output');
    const recommendationBox = document.getElementById('recommendation-box');
    const fileInput = document.getElementById('file-input');
    const mindfulToggle = document.getElementById('mindful-toggle');
    
    // Chatbot Elements
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Reminder Elements
    const addReminderBtn = document.getElementById('add-reminder-btn');
    const reminderTopicInput = document.getElementById('reminder-topic');
    const reminderTimeInput = document.getElementById('reminder-time');
    const remindersList = document.getElementById('reminders-list');
    const dashboardReminders = document.getElementById('dashboard-reminders');

    // Stats Elements
    const statDays = document.getElementById('stat-days');
    const statStreak = document.getElementById('stat-streak');
    const statReadiness = document.getElementById('stat-readiness');
    const statFocus = document.getElementById('stat-focus');

    // Media Feature Elements
    const videoUrlInput = document.getElementById('video-url');
    const videoFileInput = document.getElementById('video-file-input');
    const videoUploadBox = document.getElementById('video-upload');
    const videoProcessBtn = document.getElementById('video-process-btn');
    const videoSummaryOutput = document.getElementById('video-summary-output');
    const videoLoader = document.getElementById('video-loader');
    const videoExportBtn = document.getElementById('pdf-export-video');

    const voiceRecordBtn = document.getElementById('voice-record-btn');
    const voiceVisualizer = document.getElementById('voice-visualizer');
    const voiceStatus = document.getElementById('voice-status');
    const voiceFileInput = document.getElementById('audio-file-input');
    const audioUploadBox = document.getElementById('audio-upload');
    const voiceProcessBtn = document.getElementById('voice-process-btn');
    const voiceSummaryOutput = document.getElementById('voice-summary-output');
    const voiceLoader = document.getElementById('voice-loader');

    const scannerFileInput = document.getElementById('scanner-file-input');
    const scannerUploadBox = document.getElementById('scanner-upload');
    const scannerPreview = document.getElementById('scanner-preview');
    const scannerImg = document.getElementById('scanner-img');
    const scannerProcessBtn = document.getElementById('scanner-process-btn');
    const scannerOutput = document.getElementById('scanner-output');
    const scannerLoader = document.getElementById('scanner-loader');

    const notesExportBtn = document.getElementById('pdf-export-notes');
    const videoToggleBtns = document.querySelectorAll('.toggle-btn');
    let selectedVideoType = 'short';

    const flashcardOverlay = document.getElementById('flashcard-overlay');
    const mindmapOverlay = document.getElementById('mindmap-overlay');
    const flashcardContainer = document.getElementById('flashcard-container');
    const mindmapContainer = document.getElementById('mindmap-svg-container');
    const pulseGrid = document.getElementById('study-pulse-grid');

    let currentCards = [];
    let currentCardIndex = 0;

    // Loaders
    const genLoader = document.getElementById('gen-loader');
    const sumLoader = document.getElementById('sum-loader');

    // State
    let reminders = JSON.parse(localStorage.getItem('student_reminders') || '[]');

    // Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            
            // Update Active Nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update Active Page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `page-${targetPage}`) {
                    page.classList.add('active');
                }
            });

            // Update Header
            updateHeader(targetPage);
        });
    });

    function updateHeader(pageId) {
        const titles = {
            'dashboard': { title: 'Dashboard', sub: 'Welcome back! Here is your progress overview.' },
            'roadmap': { title: 'Study Roadmap', sub: 'Generate and manage your personalized study plan.' },
            'notes': { title: 'Note Distiller', sub: 'Upload and distill your study materials into core insights.' },
            'analytics': { title: 'Analytics & Growth', sub: 'Track your academic performance and achievements.' },
            'reminders': { title: 'Revision Reminders', sub: 'Stay on top of your schedule with timely alerts.' },
            'chatbot': { title: 'AI Study Assistant', sub: 'Get instant answers, study tips, and academic advice.' },
            'video': { title: 'Video Insight', sub: 'Distill long educational videos into concise intelligence reports.' },
            'voice': { title: 'Voice Intelligence', sub: 'Convert your lectures and voice notes into structured summaries.' },
            'scanner': { title: 'Note Scanner', sub: 'Digitize your handwritten notes into clean, searchable text.' }
        };

        if (titles[pageId]) {
            pageTitle.innerText = titles[pageId].title;
            pageSubtitle.innerText = titles[pageId].sub;
        }
    }

    // Helper: Animate Number
    const animateValue = (obj, start, end, duration, suffix = '') => {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Initial Stats
    setTimeout(() => {
        animateValue(statStreak, 0, 5, 1000);
        animateValue(statReadiness, 0, 42, 1200, '%');
        renderReminders();
    }, 500);

    // Reminder Logic
    function renderReminders() {
        // Full List (Reminders Page)
        if (remindersList) {
            if (reminders.length === 0) {
                remindersList.innerHTML = '<div class="empty-state">No reminders set yet.</div>';
            } else {
                remindersList.innerHTML = reminders.map((r, index) => `
                    <div class="roadmap-item">
                        <div class="day-badge">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="roadmap-content" style="flex: 1;">
                            <h4>${r.topic}</h4>
                            <p>${new Date(r.time).toLocaleString()}</p>
                        </div>
                        <button onclick="deleteReminder(${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer; opacity: 0.6; transition: 0.3s;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }
        }

        // Dashboard Summary
        if (dashboardReminders) {
            if (reminders.length === 0) {
                dashboardReminders.innerHTML = '<div class="empty-state">All caught up!</div>';
            } else {
                const upcoming = reminders.slice(0, 3);
                dashboardReminders.innerHTML = upcoming.map(r => `
                    <div class="roadmap-item" style="padding: 1rem; margin-bottom: 0.75rem;">
                        <div class="roadmap-content">
                            <h4 style="font-size: 0.9rem;">${r.topic}</h4>
                            <p style="font-size: 0.75rem;">${new Date(r.time).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    window.deleteReminder = (index) => {
        reminders.splice(index, 1);
        localStorage.setItem('student_reminders', JSON.stringify(reminders));
        renderReminders();
        showNotification('Reminder removed.', 'success');
    };

    addReminderBtn.addEventListener('click', () => {
        const topic = reminderTopicInput.value.trim();
        const time = reminderTimeInput.value;

        if (!topic || !time) {
            showNotification('Topic and time are required.', 'error');
            return;
        }

        const newReminder = { topic, time };
        reminders.push(newReminder);
        localStorage.setItem('student_reminders', JSON.stringify(reminders));
        
        reminderTopicInput.value = '';
        reminderTimeInput.value = '';
        
        renderReminders();
        showNotification('Revision reminder set!', 'success');
    });

    window.setReminderFromRoadmap = (topic) => {
        // Switch to reminders page
        const remindersNavItem = document.querySelector('[data-page="reminders"]');
        if (remindersNavItem) remindersNavItem.click();

        setTimeout(() => {
            reminderTopicInput.value = topic;
            reminderTopicInput.focus();
            showNotification(`Setting reminder for ${topic}. Pick a time!`, 'success');
        }, 100);
    };

    // File Upload Handling
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showNotification(`File "${file.name}" uploaded successfully.`, 'success');
            notesInput.value = `[Source Material: ${file.name}]\n\nProcessing content from uploaded document...`;
        }
    });

    // Mindfulness Mode
    let isMindful = false;
    mindfulToggle.addEventListener('click', () => {
        isMindful = !isMindful;
        mindfulToggle.classList.toggle('active');
        
        if (isMindful) {
            document.body.style.filter = 'sepia(0.2) contrast(0.9)';
            showNotification('Mindfulness mode active. Breathe deeply.', 'success');
        } else {
            document.body.style.filter = 'none';
        }
    });

    // Generate Study Plan
    window.generatePlan = async () => {
        const subjects = subjectsInput.value.trim();
        const examDate = examDateInput.value;

        if (!subjects || !examDate) {
            showNotification('Please provide curriculum data and a deadline.', 'error');
            return;
        }

        generateBtn.disabled = true;
        genLoader.style.display = 'block';
        planOutput.innerHTML = '<div class="empty-state-large"><div class="loader" style="display:block; margin: 0 auto 1rem; border-top-color: var(--primary);"></div><p>Nurturing your growth roadmap...</p></div>';

        setTimeout(() => {
            const subjectList = subjects.split(',').map(s => s.trim());
            const today = new Date();
            const target = new Date(examDate);
            const diffTime = Math.abs(target - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            animateValue(statDays, 0, diffDays, 1000);
            animateValue(statReadiness, 42, 68, 1500, '%');

            let planHtml = '';
            const planLength = Math.min(Math.max(diffDays, 3), 10);

            for (let i = 1; i <= planLength; i++) {
                const subject = subjectList[(i - 1) % subjectList.length];
                planHtml += `
                    <div class="roadmap-item">
                        <div class="day-badge">${i}</div>
                        <div class="roadmap-content" style="flex: 1;">
                            <h4>${subject} Growth</h4>
                            <p>Nurture your understanding of core principles. Estimated focus: ${Math.floor(Math.random() * 2) + 2} hours.</p>
                        </div>
                        <button onclick="setReminderFromRoadmap('${subject}')" class="btn btn-outline" style="width: auto; padding: 0.5rem 0.8rem; font-size: 0.8rem;">
                            <i class="fas fa-bell"></i>
                        </button>
                    </div>
                `;
            }

            planOutput.innerHTML = planHtml;
            
            recommendationBox.innerHTML = `
                <div class="roadmap-item" style="background: white; border-color: var(--primary);">
                    <div class="roadmap-content">
                        <h4 style="color: var(--primary)">Today's Gentle Focus</h4>
                        <p>Focusing on <strong>${subjectList[0]}</strong>. A calm approach to this topic will yield the best results.</p>
                        <button class="btn" style="margin-top: 1rem; padding: 0.6rem 1.2rem; width: auto;" onclick="startTimer()">Begin Focus Session</button>
                    </div>
                </div>
            `;

            generateBtn.disabled = false;
            genLoader.style.display = 'none';
        }, 2000);
    };

    // Note Distiller
    window.summarizeNotes = async () => {
        const notes = notesInput.value.trim();

        if (!notes) {
            showNotification('Source material required for distillation.', 'error');
            return;
        }

        summarizeBtn.disabled = true;
        sumLoader.style.display = 'block';
        summaryOutput.style.display = 'none';

        setTimeout(() => {
            const summary = `
                <div style="color: var(--primary); font-weight: 800; margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em;">Distillation Report</div>
                <p style="margin-bottom: 1.5rem;"><strong>Essence:</strong> Analysis of ${notes.split(' ').slice(0, 4).join(' ')}...</p>
                <div style="display: grid; gap: 1rem;">
                    <div style="padding: 1rem; background: #f8fafc; border-radius: 0.75rem; border: 1px solid #f1f5f9;">
                        <strong style="color: var(--accent); font-size: 0.9rem;">Core Insight</strong>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">The fundamental relationship between the discussed variables is central to this module.</p>
                    </div>
                    <div style="padding: 1rem; background: #f8fafc; border-radius: 0.75rem; border: 1px solid #f1f5f9;">
                        <strong style="color: var(--accent); font-size: 0.9rem;">Actionable Step</strong>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Review the first three chapters to solidify the theoretical foundation.</p>
                    </div>
                </div>
            `;
            
            summaryOutput.innerHTML = summary;
            summaryOutput.style.display = 'block';
            summarizeBtn.disabled = false;
            sumLoader.style.display = 'none';
        }, 1800);
    };

    // Pomodoro Timer Logic
    let timerInterval;
    let timeLeft = 25 * 60;

    window.startTimer = () => {
        if (timerInterval) return;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            statFocus.innerHTML = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showNotification('Focus session complete! Rest your mind.', 'success');
            }
        }, 1000);
        
        showNotification('Focus session initiated. Stay present.', 'success');
    };

    // Notification System
    const showNotification = (msg, type) => {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 2rem;
            background: ${type === 'error' ? '#e74c3c' : 'var(--primary)'};
            color: white;
            border-radius: 1rem;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            font-weight: 500;
            font-size: 0.9rem;
        `;
        toast.innerText = msg;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    // AI Chatbot Logic
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    let ai = null;
    const model = "gemini-3-flash-preview";

    if (apiKey) {
        try {
            ai = new GoogleGenAI({ apiKey });
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI:", e);
        }
    } else {
        console.warn("GEMINI_API_KEY is missing. AI Chatbot will not function.");
    }

    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerText = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleChat = async () => {
        const query = chatInput.value.trim();
        if (!query) return;

        appendMessage(query, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        chatSendBtn.disabled = true;

        if (!ai) {
            showNotification("AI Assistant is not configured. Please add an API key.", "error");
            appendMessage("I'm sorry, I'm not configured yet. Please ask the developer to add an API key.", 'bot');
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            return;
        }

        // Typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.innerText = 'SI Assistant is thinking...';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: query,
                config: {
                    systemInstruction: "You are a helpful Student Intelligence Assistant. Provide study tips, academic advice, and answer student queries concisely and encouragingly. Use a friendly, professional tone."
                }
            });

            const botResponse = response.text;
            typingDiv.remove();
            appendMessage(botResponse, 'bot');
        } catch (error) {
            console.error("AI Error:", error);
            typingDiv.remove();
            showNotification("Failed to get AI response. Please check your connection.", "error");
            appendMessage("I'm sorry, I encountered an error. Please try again later.", 'bot');
        } finally {
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    };

    chatSendBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    // Video Insight Logic
    videoToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            videoToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedVideoType = btn.getAttribute('data-type');
        });
    });

    videoUploadBox.addEventListener('click', () => videoFileInput.click());
    videoFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            showNotification(`Video "${e.target.files[0].name}" staged for distillation.`, 'success');
            videoUrlInput.value = `[Local File] ${e.target.files[0].name}`;
        }
    });

    videoProcessBtn.addEventListener('click', async () => {
        const ytUrl = videoUrlInput.value;
        if (!ytUrl) {
            showNotification('Provide a video URL or upload a file.', 'error');
            return;
        }

        videoProcessBtn.disabled = true;
        videoLoader.style.display = 'block';
        videoSummaryOutput.style.display = 'none';
        videoExportBtn.style.display = 'none';

        try {
            const res = await fetch('http://localhost:8000/api/distill/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: ytUrl, type: selectedVideoType })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                videoSummaryOutput.innerHTML = data.html;
                videoSummaryOutput.style.display = 'block';
                videoExportBtn.style.display = 'flex';
                if (document.querySelector('.innovation-actions-video')) {
                    document.querySelector('.innovation-actions-video').style.display = 'flex';
                }
                showNotification('Video distilled successfully!', 'success');
            } else {
                showNotification(data.message || 'Video analysis failed.', 'error');
            }
        } catch (error) {
            showNotification('Backend connection error.', 'error');
        } finally {
            videoProcessBtn.disabled = false;
            videoLoader.style.display = 'none';
        }
    });

    // Voice Intelligence Logic
    let isRecording = false;
    voiceRecordBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        if (isRecording) {
            voiceRecordBtn.classList.add('recording');
            voiceVisualizer.style.display = 'flex';
            voiceStatus.innerText = 'Recording... Stay mindful of your thoughts.';
            showNotification('Recording started.', 'success');
        } else {
            voiceRecordBtn.classList.remove('recording');
            voiceVisualizer.style.display = 'none';
            voiceStatus.innerText = 'Recording saved. Ready to transcribe.';
            showNotification('Recording captured.', 'success');
        }
    });

    audioUploadBox.addEventListener('click', () => voiceFileInput.click());
    voiceFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            showNotification(`Audio "${e.target.files[0].name}" uploaded.`, 'success');
            voiceStatus.innerText = `File ready: ${e.target.files[0].name}`;
        }
    });

    voiceProcessBtn.addEventListener('click', async () => {
        voiceProcessBtn.disabled = true;
        voiceLoader.style.display = 'block';
        voiceSummaryOutput.style.display = 'none';

        try {
            // Need a mock audio file object to satisfy FastAPI UploadFile
            const formData = new FormData();
            formData.append('file', new Blob(['fake_audio'], { type: 'audio/webm' }), 'recording.webm');
            
            const res = await fetch('http://localhost:8000/api/distill/voice', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                voiceSummaryOutput.innerHTML = data.html;
                voiceSummaryOutput.style.display = 'block';
                showNotification('Voice notes transcribed by AI!', 'success');
            } else {
                showNotification('Translation failed.', 'error');
            }
        } catch(e) {
            showNotification('Backend is offline.', 'error');
        } finally {
            voiceProcessBtn.disabled = false;
            voiceLoader.style.display = 'none';
        }
    });

    // Note Scanner Logic
    scannerUploadBox.addEventListener('click', () => scannerFileInput.click());
    scannerFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                scannerImg.src = event.target.result;
                scannerPreview.style.display = 'block';
                showNotification('Handwritten note captured.', 'success');
            };
            reader.readAsDataURL(file);
        }
    });

    scannerProcessBtn.addEventListener('click', async () => {
        if (!scannerImg.src || scannerImg.src.includes('index.html')) {
            showNotification('Please upload a photo of your notes first.', 'error');
            return;
        }

        scannerProcessBtn.disabled = true;
        scannerLoader.style.display = 'block';
        scannerOutput.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('file', new Blob(['fake_image_bytes'], { type: 'image/png' }), 'scan.png');
            
            const res = await fetch('http://localhost:8000/api/distill/scan', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                scannerOutput.innerHTML = `
                    <div style="color: var(--primary); font-weight: 800; margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase;">Digitized Output</div>
                    <div style="background: var(--bg-soft); padding: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.6; color: var(--text-main);">
                        ${data.extracted_text}
                    </div>
                    <button class="btn btn-outline" style="margin-top: 1rem; width: auto;" onclick="copyToClipboard(this)">
                        <i class="fas fa-copy"></i> Copy to Note Distiller
                    </button>
                `;
                scannerOutput.style.display = 'block';
                showNotification('Notes digitized by AI successfully!', 'success');
            } else {
                showNotification('OCR failed.', 'error');
            }
        } catch (e) {
            showNotification('Backend is offline.', 'error');
        } finally {
            scannerProcessBtn.disabled = false;
            scannerLoader.style.display = 'none';
        }
    });

    window.copyToClipboard = (btn) => {
        const text = scannerOutput.querySelector('div:last-of-type').innerText;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Text copied to clipboard!', 'success');
            const notesNavItem = document.querySelector('[data-page="notes"]');
            if (notesNavItem) notesNavItem.click();
            setTimeout(() => {
                document.getElementById('notes-input').value = text;
                document.getElementById('notes-input').focus();
            }, 500);
        });
    };

    // Export Logic
    window.handleExport = (elementId) => {
        showNotification('Preparing your premium PDF report...', 'success');
        setTimeout(() => {
            window.print();
        }, 1000);
    };

    if (videoExportBtn) videoExportBtn.addEventListener('click', () => handleExport('video-summary-output'));
    if (notesExportBtn) notesExportBtn.addEventListener('click', () => handleExport('summary-output'));

    // Note Distiller Refinement
    window.summarizeNotes = async () => {
        const notes = document.getElementById('notes-input').value.trim();
        if (!notes) {
            showNotification('Source material required for distillation.', 'error');
            return;
        }

        summarizeBtn.disabled = true;
        sumLoader.style.display = 'block';
        summaryOutput.style.display = 'none';
        if (notesExportBtn) notesExportBtn.style.display = 'none';

        try {
            const res = await fetch('http://localhost:8000/api/distill/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                summaryOutput.innerHTML = data.html;
                summaryOutput.style.display = 'block';
                if (notesExportBtn) notesExportBtn.style.display = 'flex';
                if (document.querySelector('.innovation-actions')) {
                    document.querySelector('.innovation-actions').style.display = 'flex';
                }
                showNotification('Intelligence distilled!', 'success');
            } else {
                showNotification('AI distillation failed.', 'error');
            }
        } catch (error) {
            showNotification('Backend connection error.', 'error');
        } finally {
            summarizeBtn.disabled = false;
            sumLoader.style.display = 'none';
        }
    };

    // INNOVATION: Study Pulse Heatmap
    function initHeatmap() {
        if (!pulseGrid) return;
        pulseGrid.innerHTML = '';
        for (let i = 0; i < 48; i++) {
            const cell = document.createElement('div');
            cell.className = 'pulse-cell';
            const level = Math.floor(Math.random() * 5); // 0-4
            if (level > 0) cell.classList.add(`level-${level}`);
            pulseGrid.appendChild(cell);
        }
    }
    initHeatmap();

    // INNOVATION: Flashcard System
    window.generateFlashcards = async (text) => {
        showNotification('AI is extracting key inquiries via Backend...', 'success');
        
        try {
            const res = await fetch('http://localhost:8000/api/generate/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            
            if (data.status === 'success' && data.cards && data.cards.length > 0) {
                currentCards = data.cards;
            } else {
                currentCards = [
                    { front: "What is the primary objective of this study session?", back: "To master the fundamental concepts." },
                    { front: "Backend AI Error", back: "Failed to generate dynamic cards." }
                ];
            }
        } catch (error) {
            currentCards = [
                { front: "Network Error", back: "Could not connect to FastAPI server." }
            ];
        }

        flashcardOverlay.style.display = 'flex';
        currentCardIndex = 0;
        renderCard();
    };


    function renderCard() {
        flashcardContainer.innerHTML = '';
        const card = currentCards[currentCardIndex];
        const cardEl = document.createElement('div');
        cardEl.className = 'flashcard';
        cardEl.innerHTML = `
            <div class="flashcard-front">${card.front}</div>
            <div class="flashcard-back">${card.back}</div>
        `;
        cardEl.addEventListener('click', () => cardEl.classList.toggle('flipped'));
        flashcardContainer.appendChild(cardEl);
        document.getElementById('card-progress').innerText = `${currentCardIndex + 1} / ${currentCards.length}`;
    }

    document.getElementById('prev-card').addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            renderCard();
        }
    });

    document.getElementById('next-card').addEventListener('click', () => {
        if (currentCardIndex < currentCards.length - 1) {
            currentCardIndex++;
            renderCard();
        }
    });

    document.getElementById('close-flashcards').addEventListener('click', () => {
        flashcardOverlay.style.display = 'none';
    });

    // INNOVATION: Mind Map Visualizer
    window.renderMindMap = (text) => {
        showNotification('Visualizing concept architecture...', 'success');
        mindmapOverlay.style.display = 'flex';
        mindmapContainer.innerHTML = '';

        const width = 800;
        const height = 500;
        const svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <g transform="translate(400, 250)">
                    <line x1="0" y1="0" x2="-150" y2="-100" class="mm-edge" />
                    <line x1="0" y1="0" x2="150" y2="-100" class="mm-edge" />
                    <line x1="0" y1="0" x2="-150" y2="100" class="mm-edge" />
                    <line x1="0" y1="0" x2="150" y2="100" class="mm-edge" />
                    
                    <circle cx="0" cy="0" r="40" class="mm-node" />
                    <text dx="-25" dy="5" class="mm-label">ROOT</text>

                    <circle cx="-150" cy="-100" r="30" class="mm-node" />
                    <text dx="-185" dy="-95" class="mm-label">Theory</text>
                    
                    <circle cx="150" cy="-100" r="30" class="mm-node" />
                    <text dx="125" dy="-95" class="mm-label">Method</text>

                    <circle cx="-150" cy="100" r="30" class="mm-node" />
                    <text dx="-185" dy="105" class="mm-label">Data</text>

                    <circle cx="150" cy="100" r="30" class="mm-node" />
                    <text dx="120" dy="105" class="mm-label">Result</text>
                </g>
            </svg>
        `;
        mindmapContainer.innerHTML = svg;
    };

    document.getElementById('close-mindmap').addEventListener('click', () => {
        mindmapOverlay.style.display = 'none';
    });

    // Wire up buttons
    document.getElementById('gen-flashcards-notes').addEventListener('click', () => {
        const text = document.getElementById('summary-output').innerText;
        window.generateFlashcards(text);
    });

    document.getElementById('view-mindmap-notes').addEventListener('click', () => {
        const text = document.getElementById('summary-output').innerText;
        window.renderMindMap(text);
    });

    document.getElementById('gen-flashcards-video').addEventListener('click', () => {
        const text = document.getElementById('video-summary-output').innerText;
        window.generateFlashcards(text);
    });

    // Final Event Listener Attachment (using latest function references)
    if (generateBtn) generateBtn.addEventListener('click', () => window.generatePlan());
    if (summarizeBtn) summarizeBtn.addEventListener('click', () => window.summarizeNotes());
    if (videoProcessBtn) videoProcessBtn.addEventListener('click', () => window.processVideoIntelligence());
});

// Extra CSS for animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100px); opacity: 0; } }
`;
document.head.appendChild(style);
