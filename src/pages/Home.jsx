import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Users, CheckSquare, Shield } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../context/AuthContext';
import { PublicNavbar } from '../components/PublicNavbar';

export function Home() {
  const { user } = useAuth();

  useGSAP(() => {
    gsap.fromTo('.hero-text', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }
    );
    gsap.fromTo('.hero-img', 
      { opacity: 0, scale: 0.95, x: 20 }, 
      { opacity: 1, scale: 1, x: 0, duration: 1, delay: 0.4, ease: 'power3.out' }
    );
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.6, ease: 'power3.out' }
    );
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: 'Inter, sans-serif', 
      color: '#0f172a' 
    }}>
      
      {/* Background Gradient & Shapes to match mockup */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '800px',
        background: 'radial-gradient(circle at 15% 50%, rgba(224, 242, 254, 0.6) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(219, 234, 254, 0.8) 0%, transparent 50%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="hero-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4rem 5% 8rem 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ flex: '1 1 45%', maxWidth: '600px' }}>
          <h1 className="hero-text hero-title" style={{ fontSize: '3.75rem', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Streamline Your Accounting Practice
          </h1>
          <p className="hero-text hero-subtitle" style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '3rem', maxWidth: '500px', lineHeight: 1.6 }}>
            Automate reminders and manage clients with ease.
          </p>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary hero-text" style={{ padding: '1.125rem 2.5rem', fontSize: '1.125rem', display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4), 0 8px 10px -6px rgba(37,99,235,0.1)', borderRadius: '8px' }}>
              Go to your Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary hero-text" style={{ padding: '1.125rem 2.5rem', fontSize: '1.125rem', display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4), 0 8px 10px -6px rgba(37,99,235,0.1)', borderRadius: '8px' }}>
              Try the Send Reminder Demo
            </Link>
          )}
        </div>
        <div className="hero-img hero-img-container" style={{ flex: '1 1 55%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
           <img 
              src="/hero-illustration.png" 
              alt="CA Saathi Dashboard Illustration" 
              style={{ 
                width: '100%', 
                maxWidth: '750px', 
                height: 'auto', 
                objectFit: 'contain', 
                mixBlendMode: 'multiply',
                filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.05))' 
              }} 
           />
        </div>

        {/* Decorative Wave to match mockup */}
        <svg style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '120px', zIndex: 1 }} viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="white" d="M0,60 C320,120 420,0 720,60 C1020,120 1120,0 1440,60 L1440,120 L0,120 Z"></path>
        </svg>
      </section>

      {/* Features Section */}
      <section id="features" style={{ backgroundColor: 'white', padding: '6rem 5%', position: 'relative', zIndex: 2 }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4rem' }}>
          Key Features of CA Saathi
        </h2>
        
        <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Feature 1 */}
          <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '2rem', borderRadius: '12px', backgroundColor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ color: '#2563eb' }}>
              <Bell size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Automated Reminders</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>Easily schedule reminders for tax and compliance deadlines.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '2rem', borderRadius: '12px', backgroundColor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ color: '#0ea5e9' }}>
              <Users size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Client Management</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>Organize and track all your clients in one place.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '2rem', borderRadius: '12px', backgroundColor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ color: '#475569' }}>
              <CheckSquare size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Task Tracking</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>Monitor tasks and assignments with ease.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '2rem', borderRadius: '12px', backgroundColor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ color: '#2563eb' }}>
              <Shield size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Data Security</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>Secure and encrypted data protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ backgroundColor: '#f8fafc', padding: '6rem 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4rem' }}>
            About Us
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2563eb', marginBottom: '1rem' }}>Our Mission</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1.05rem' }}>
                We believe that Chartered Accountants and Accounting Professionals shouldn't spend their valuable time chasing clients for documents or worrying about missed deadlines. Our mission is to provide intelligent, automated tools that empower accounting firms to focus on what they do best: providing expert financial counsel.
              </p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>The Problem We Solve</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1.05rem' }}>
                Tracking GST, TDS, and ITR deadlines across hundreds of clients manually via spreadsheets is prone to human error and massive penalties. CA Saathi centralizes everything, automating reminders via WhatsApp and Email before due dates hit.
              </p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '2rem', textAlign: 'center' }}>Why Choose CA Saathi?</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#334155', fontSize: '1.05rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>✓</div>
                  <span><strong>Built for Professionals:</strong> Designed exactly for your accounting workflow.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#334155', fontSize: '1.05rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>✓</div>
                  <span><strong>Zero Learning Curve:</strong> Setup your firm in 5 minutes.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#334155', fontSize: '1.05rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>✓</div>
                  <span><strong>Bank-Level Security:</strong> Your client data is fully encrypted.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section - Redesigned to match horizontal layout */}
      <section style={{ 
        position: 'relative',
        padding: '5rem 5%', 
        overflow: 'hidden',
        background: '#ffffff'
      }}>
        {/* Soft background wave mimicking the screenshot */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center 150%, #e0f2fe 0%, #f0f9ff 40%, #ffffff 100%)',
          zIndex: 1
        }}></div>

        <div style={{ 
          position: 'relative', 
          zIndex: 2, 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center',
          gap: '3rem'
        }}>
          {/* Avatar floating in the soft blue circle */}
          <div style={{
             position: 'relative',
             width: '240px',
             height: '240px',
             flexShrink: 0,
             display: 'flex',
             alignItems: 'flex-end',
             justifyContent: 'center',
             background: 'linear-gradient(135deg, rgba(224,242,254,0.8), rgba(186,230,253,0.5))',
             borderRadius: '50%',
             overflow: 'hidden'
          }}>
             <img src="/avatar-rakesh.png" alt="Rakesh Mehta" style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '-10px' }} />
          </div>

          {/* Quote Text */}
          <div style={{ flex: 1 }}>
            <blockquote style={{ fontSize: '1.85rem', fontWeight: 600, color: '#1e3a8a', margin: '0 0 1rem 0', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              “<span style={{ color: '#1e293b' }}>CA Saathi</span> has transformed our practice. It's a game-changer for managing client reminders!”
            </blockquote>
            <p style={{ fontSize: '1.125rem', color: '#475569', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '20px', height: '2px', backgroundColor: '#94a3b8' }}></span>
              Rakesh Mehta, CPA
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'white', padding: '2.5rem 5%', textAlign: 'center', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>© {new Date().getFullYear()} CA Saathi. All rights reserved.</p>
      </footer>

    </div>
  );
}
