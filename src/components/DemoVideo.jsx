import React from 'react';
import { BellRing, CalendarDays, CheckCircle2, FileCheck2, Pause, Play, Send, Users, X } from 'lucide-react';

export function DemoVideo({ isOpen, isPaused, onClose, onTogglePause }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="demo-video-modal" onClick={e => e.stopPropagation()}>
        <div className="demo-video-header">
          <div>
            <h2 className="demo-video-title">CA Saathi Demo</h2>
            <p className="demo-video-subtitle">Practice workflow preview</p>
          </div>
          <button className="action-icon" onClick={onClose} aria-label="Close demo video">
            <X size={20} />
          </button>
        </div>

        <div className={`demo-video-stage ${isPaused ? 'is-paused' : ''}`}>
          <div className="demo-video-topbar">
            <span>CA Saathi</span>
            <span>Live practice workspace</span>
          </div>

          <div className="demo-video-scene scene-clients">
            <div className="demo-video-stat">
              <Users size={20} />
              <div>
                <span>Total clients</span>
                <strong>128</strong>
              </div>
            </div>
            <div className="demo-video-table">
              <span>Client</span>
              <span>Business</span>
              <span>Status</span>
              <b>Rakesh Sharma</b>
              <b>Sharma Traders</b>
              <em>Added</em>
              <b>Kartikey Singh</b>
              <b>Singh Traders</b>
              <em>Synced</em>
            </div>
          </div>

          <div className="demo-video-scene scene-deadlines">
            <div className="demo-video-card">
              <CalendarDays size={22} />
              <div>
                <span>Upcoming deadline</span>
                <strong>GST Return</strong>
                <small>Due in 5 days</small>
              </div>
            </div>
            <div className="demo-video-deadline-row">
              <span>Rakesh Sharma</span>
              <b>Due Soon</b>
            </div>
          </div>

          <div className="demo-video-scene scene-reminder">
            <div className="demo-video-message">
              <BellRing size={22} />
              <p>Reminder ready for WhatsApp, SMS, and email.</p>
            </div>
            <div className="demo-video-send">
              <Send size={18} />
              <span>Sending reminder</span>
            </div>
          </div>

          <div className="demo-video-scene scene-complete">
            <CheckCircle2 size={44} />
            <strong>Reminder sent successfully</strong>
            <span>Documents and deadline status updated.</span>
            <FileCheck2 size={24} />
          </div>

          <div className="demo-video-progress">
            <span></span>
          </div>
        </div>

        <div className="demo-video-controls">
          <button className="btn btn-primary" onClick={onTogglePause}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Play' : 'Pause'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
