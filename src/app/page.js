'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { Shield, Zap, Lock, Terminal, Check, Copy, Cpu, Globe, FileText, Link, Server, ChevronDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [formData, setFormData] = useState({
    email: '',
    configName: '',
    transport: 'TCP',
    // Dynamic Fields
    path: '',
    host: '',
    sni: '',
    earlyData: false,
    domain: '',
    shortId: '',
    fingerprint: 'chrome',
    serviceName: 'grpc',
    multiMode: false,
    region: 'india-hyderabad',
    quotaLimit: 200
  });
  const [transports, setTransports] = useState({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isTransportDropdownOpen, setIsTransportDropdownOpen] = useState(false);
  const featuresRef = useRef(null);

  const fetchTransports = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.success) {
        setTransports(data.config?.transports || {});
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setAdminSettings(data.settings);
        // Update form defaults from admin settings
        setFormData(prev => ({
          ...prev,
          quotaLimit: data.settings.quota.default
        }));
      }
    } catch (err) {
      console.error('Failed to fetch admin settings:', err);
    }
  };

  useEffect(() => {
    fetchTransports();
    fetchAdminSettings();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll(`.${styles.featureCard}`);
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, []);

  const addLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  const getSecurityType = (transport) => {
    switch (transport) {
      case 'TCP': return 'TLS';
      case 'WS': return 'TLS';
      case 'GRPC': return 'TLS';
      case 'H2': return 'TLS';
      case 'REALITY': return 'REALITY';
      default: return 'NONE';
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validation removed as per user request

    setLoading(true); setLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);

    try {
      addLog('> Initiating secure handshake...');
      await new Promise(r => setTimeout(r, 800));

      addLog(`> Configuring transport: ${formData.transport}...`);
      await new Promise(r => setTimeout(r, 800));

      addLog('> Allocating encrypted tunnel resources...');
      await new Promise(r => setTimeout(r, 1000));

      const res = await fetch('/api/proxy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        addLog('> ACCESS GRANTED. CONFIGURATION GENERATED.');
        await new Promise(r => setTimeout(r, 500));
        setResult(data);
      } else {
        throw new Error(data.error || 'System Failure');
      }
    } catch (err) {
      setError(err.message || 'Connection Lost');
      addLog(`> ERROR: ${err.message || 'Connection Lost'} `);
    } finally {
      setLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (result?.config) {
      // Fallback method that works over HTTP
      const textArea = document.createElement('textarea');
      textArea.value = result.config;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }

      document.body.removeChild(textArea);
    }
  };

  // Render Dynamic Fields based on Transport
  const renderTransportFields = () => {
    const type = formData.transport;

    if (type === 'TCP') {
      return (
        <>
          <div>
            <label className={styles.label}>Path</label>
            <div className={styles.inputWrapper}>
              <FileText size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/ws-path" />
            </div>
          </div>
          <div>
            <label className={styles.label}>Host Header</label>
            <div className={styles.inputWrapper}>
              <Link size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} placeholder="sub.domain.com" />
            </div>
          </div>
          <div>
            <label className={styles.label}>SNI / ServerName</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.sni} onChange={(e) => setFormData({ ...formData, sni: e.target.value })} placeholder="cdn.discordapp.com" />
            </div>
          </div>
        </>
      );
    }

    if (type === 'WS') {
      return (
        <>
          <div>
            <label className={styles.label}>WS Path</label>
            <div className={styles.inputWrapper}>
              <FileText size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/ws-path" />
            </div>
          </div>
          <div>
            <label className={styles.label}>Host Header</label>
            <div className={styles.inputWrapper}>
              <Link size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} placeholder="sub.domain.com" />
            </div>
          </div>
          <div>
            <label className={styles.label}>SNI / ServerName</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.sni} onChange={(e) => setFormData({ ...formData, sni: e.target.value })} placeholder="cdn.discordapp.com" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={formData.earlyData} onChange={(e) => setFormData({ ...formData, earlyData: e.target.checked })} />
            <label className={styles.label} style={{ marginBottom: 0 }}>Enable EarlyData</label>
          </div>
        </>
      );
    }

    if (type === 'REALITY') {
      return (
        <>
          <div>
            <label className={styles.label}>REALITY Domain (SNI)</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="www.microsoft.com" />
            </div>
          </div>
          <div>
            <label className={styles.label}>ShortID</label>
            <div className={styles.inputWrapper}>
              <Cpu size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.shortId} onChange={(e) => setFormData({ ...formData, shortId: e.target.value })} placeholder="Auto-generated" />
            </div>
          </div>
          <div>
            <label className={styles.label}>Fingerprint</label>
            <select className={styles.input} value={formData.fingerprint} onChange={(e) => setFormData({ ...formData, fingerprint: e.target.value })}>
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
              <option value="safari">Safari</option>
            </select>
          </div>
          <div>
            <label className={styles.label}>Public Key</label>
            <input type="text" className={styles.input} value={transports['REALITY']?.publicKey || 'Not Configured'} disabled style={{ background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--color-text-muted))' }} />
          </div>
        </>
      );
    }

    if (type === 'GRPC') {
      return (
        <>
          <div>
            <label className={styles.label}>Service Name</label>
            <div className={styles.inputWrapper}>
              <Server size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} placeholder="grpc-service" />
            </div>
          </div>
          <div>
            <label className={styles.label}>SNI</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.sni} onChange={(e) => setFormData({ ...formData, sni: e.target.value })} placeholder="cdn.discordapp.com" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={formData.multiMode} onChange={(e) => setFormData({ ...formData, multiMode: e.target.checked })} />
            <label className={styles.label} style={{ marginBottom: 0 }}>MultiMode</label>
          </div>
        </>
      );
    }

    if (type === 'H2') {
      return (
        <>
          <div>
            <label className={styles.label}>H2 Path</label>
            <div className={styles.inputWrapper}>
              <FileText size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/h2-path" />
            </div>
          </div>
          <div>
            <label className={styles.label}>Host Header</label>
            <div className={styles.inputWrapper}>
              <Link size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} placeholder="sub.domain.com" />
            </div>
          </div>
          <div>
            <label className={styles.label}>SNI</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" className={styles.input} value={formData.sni} onChange={(e) => setFormData({ ...formData, sni: e.target.value })} placeholder="cdn.discordapp.com" />
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1
          className={styles.heroTitle}
          dangerouslySetInnerHTML={{
            __html: adminSettings?.content?.hero?.title || 'Secure Connectivity for the <br /> <span class="gradientText">Modern Web</span>'
          }}
        />
        <p className={styles.heroSubtitle}>
          {adminSettings?.content?.hero?.subtitle || 'Experience the next generation of proxy infrastructure. High-speed, encrypted, and reliable connections deployed instantly.'}
        </p>
        <a href="#get-started" className={styles.ctaButton}>
          {adminSettings?.content?.hero?.ctaText || 'Get Connected Now'}
        </a>
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollMouse}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection} ref={featuresRef}>
        <h2 className={styles.sectionTitle}>Why Choose {adminSettings?.ui?.brandName || 'V-Nexus'}</h2>
        <div className={styles.grid}>
          {(adminSettings?.content?.features || [
            { id: 'speed', title: 'Lightning Fast', description: 'Optimized routing protocols ensure minimal latency and maximum throughput for all your data needs.', icon: 'Zap' },
            { id: 'security', title: 'Bank-Grade Security', description: 'End-to-end encryption protects your traffic from prying eyes, ensuring complete privacy and security.', icon: 'Shield' },
            { id: 'global', title: 'Global Network', description: 'Access content from anywhere in the world with our distributed network of high-performance nodes.', icon: 'Globe' }
          ]).map((feature, index) => {
            const IconComponent = { Zap, Shield, Globe }[feature.icon] || Shield;
            return (
              <div key={feature.id || index} className={`${styles.featureCard} fade-in-up`} style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                <div className={styles.featureIcon}><IconComponent size={24} /></div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Generator Section */}
      <section id="get-started" className={styles.generatorSection}>
        <h2 className={styles.sectionTitle}>Initialize Connection</h2>
        <div className={styles.generatorCard}>
          {!loading && !result ? (
            <>
              <h3 className={styles.formTitle}>Create Your Secure Proxy</h3>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Basic Info */}
                  <div>
                    <label className={styles.label}>Config Name</label>
                    <div className={styles.inputWrapper}>
                      <FileText size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="My Secure Connection"
                        value={formData.configName}
                        onChange={(e) => setFormData({ ...formData, configName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Transport Selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className={styles.label}>Transport Type</label>
                      <div className={styles.inputWrapper}>
                        <Server size={18} className={styles.inputIcon} />
                        <div
                          className={styles.input}
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => setIsTransportDropdownOpen(!isTransportDropdownOpen)}
                        >
                          <span>{formData.transport}</span>
                          <ChevronDown size={16} style={{ transform: isTransportDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />

                          {/* Dropdown Menu */}
                          {isTransportDropdownOpen && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '8px',
                              background: 'hsl(var(--color-bg-surface))',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '4px',
                              zIndex: 100,
                              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                              {Object.entries(transports)
                                .filter(([_, config]) => config.enabled)
                                .map(([type, config]) => (
                                  <div
                                    key={type}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFormData({ ...formData, transport: type });
                                      setIsTransportDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: '10px 12px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      background: formData.transport === type ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    onMouseLeave={(e) => {
                                      if (formData.transport !== type) e.currentTarget.style.background = 'transparent';
                                    }}
                                  >
                                    <span style={{ color: '#fff' }}>{type}</span>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={styles.label}>Security</label>
                      <div className={styles.input} style={{ background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--color-text-muted))', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '1rem' }}>
                        <Lock size={18} />
                        {getSecurityType(formData.transport)}
                      </div>
                    </div>
                  </div>

                  {/* AllowInsecure Indicator */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className={styles.label}>Region</label>
                      <div className={styles.inputWrapper}>
                        <Globe size={18} className={styles.inputIcon} />
                        <div
                          className={styles.input}
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Glowing Dot for Selected Region */}
                            {(() => {
                              const selectedRegion = adminSettings?.regions.find(r => r.id === formData.region);
                              const isEnabled = selectedRegion?.enabled;
                              return (
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: isEnabled ? '#00cc66' : '#ff3333',
                                  boxShadow: isEnabled ? '0 0 10px #00cc66' : '0 0 10px #ff3333',
                                  transition: 'all 0.3s ease'
                                }}></div>
                              );
                            })()}
                            <span>
                              {adminSettings?.regions.find(r => r.id === formData.region)?.name || 'Select Region'}
                            </span>
                          </div>
                          <ChevronDown size={16} style={{ transform: isRegionDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />

                          {/* Dropdown Menu */}
                          {isRegionDropdownOpen && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '8px',
                              background: 'hsl(var(--color-bg-surface))',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '4px',
                              zIndex: 100,
                              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}>
                              {adminSettings?.regions.map(region => (
                                <div
                                  key={region.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (region.enabled) {
                                      setFormData({ ...formData, region: region.id });
                                      setIsRegionDropdownOpen(false);
                                    }
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    cursor: region.enabled ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: formData.region === region.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    opacity: region.enabled ? 1 : 0.5,
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (region.enabled) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (formData.region !== region.id) e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  {/* Glowing Dot for List Items */}
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: region.enabled ? '#00cc66' : '#ff3333',
                                    boxShadow: region.enabled ? '0 0 10px #00cc66' : '0 0 10px #ff3333'
                                  }}></div>
                                  <span style={{ color: region.enabled ? '#fff' : '#888' }}>
                                    {region.name}
                                  </span>
                                  {!region.enabled && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      background: 'rgba(255, 51, 51, 0.1)',
                                      color: '#ff3333',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      marginLeft: 'auto'
                                    }}>
                                      OFFLINE
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={styles.label}>Allow Insecure</label>
                      <div className={styles.input} style={{ background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--color-text-muted))', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '1rem' }}>
                        <div style={{ width: '18px', height: '18px', border: '2px solid hsl(var(--color-primary))', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--color-primary))' }}>
                          <Check size={14} color="#000" />
                        </div>
                        <span>Enabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Quota Limit Slider */}
                  <div>
                    <label className={styles.label}>Quota Limit: {formData.quotaLimit}GB</label>
                    <input
                      type="range"
                      min={adminSettings?.quota.minimum || 100}
                      max={adminSettings?.quota.maximum || 500}
                      step="10"
                      value={formData.quotaLimit}
                      onChange={(e) => setFormData({ ...formData, quotaLimit: parseInt(e.target.value) })}
                      className={styles.slider}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))', marginTop: '0.25rem' }}>
                      <span>{adminSettings?.quota.minimum || 100}GB</span>
                      <span>{adminSettings?.quota.maximum || 500}GB</span>
                    </div>
                  </div>

                  {/* Dynamic Transport Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {renderTransportFields()}
                  </div>

                </div>

                <button type="submit" className={styles.generateButton} style={{ marginTop: '1.5rem' }}>
                  Generate Configuration
                </button>
                {error && <p style={{ color: 'var(--color-error)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
              </form>
            </>
          ) : (
            <div className={styles.resultBox}>
              {loading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  gap: '2rem'
                }}>
                  {/* Animated Logo/Icon */}
                  <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px'
                  }}>
                    {/* Outer rotating ring */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      border: '3px solid transparent',
                      borderTopColor: 'hsl(var(--color-primary))',
                      borderRightColor: 'hsl(var(--color-primary))',
                      borderRadius: '50%',
                      animation: 'spin 1.5s linear infinite'
                    }}></div>

                    {/* Middle rotating ring */}
                    <div style={{
                      position: 'absolute',
                      inset: '10px',
                      border: '3px solid transparent',
                      borderBottomColor: 'hsl(var(--color-success))',
                      borderLeftColor: 'hsl(var(--color-success))',
                      borderRadius: '50%',
                      animation: 'spin 2s linear infinite reverse'
                    }}></div>

                    {/* Center icon */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield
                        size={48}
                        color="hsl(var(--color-primary))"
                        strokeWidth={2}
                        style={{
                          animation: 'pulse 2s ease-in-out infinite',
                          filter: 'drop-shadow(0 0 20px rgba(0, 204, 102, 0.5))'
                        }}
                      />
                    </div>
                  </div>

                  {/* Loading Text */}
                  <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#fff',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      Generating Configuration
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      color: 'hsl(var(--color-text-muted))',
                      fontSize: '0.875rem'
                    }}>
                      <Cpu size={16} className="spin-slow" />
                      <span>Establishing secure tunnel...</span>
                    </div>
                  </div>

                  {/* Progress Dots */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center'
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'hsl(var(--color-primary))',
                          animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                          boxShadow: '0 0 15px rgba(0, 204, 102, 0.5)'
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Status Messages */}
                  <div style={{
                    background: 'rgba(0, 204, 102, 0.05)',
                    border: '1px solid rgba(0, 204, 102, 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem 2rem',
                    maxWidth: '500px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem'
                    }}>
                      {logs.slice(-3).map((log, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'hsl(var(--color-primary))',
                            opacity: 0,
                            animation: `fadeInUp 0.5s forwards ${i * 0.2}s`,
                            wordBreak: 'break-word',
                            width: '100%'
                          }}
                        >
                          <Check size={14} color="hsl(var(--color-success))" strokeWidth={3} style={{ flexShrink: 0 }} />
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Toast Notification */}
                  {copied && (
                    <div style={{
                      position: 'fixed',
                      top: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, hsl(var(--color-success)) 0%, hsl(var(--color-primary)) 100%)',
                      color: '#000',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 204, 102, 0.4)',
                      zIndex: 9999,
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'slideDown 0.3s ease-out',
                      letterSpacing: '0.05em'
                    }}>
                      <Check size={18} strokeWidth={3} />
                      COPIED TO CLIPBOARD!
                    </div>
                  )}

                  {/* Professional Terminal-Style Success Screen */}
                  <div className={styles.successCard}>
                    {/* Terminal Header Bar */}
                    <div className={styles.terminalHeader}>
                      <div className={styles.terminalDot} style={{ background: '#ff5f56' }}></div>
                      <div className={styles.terminalDot} style={{ background: '#ffbd2e' }}></div>
                      <div className={styles.terminalDot} style={{ background: '#27c93f' }}></div>
                      <span className={styles.terminalTitle}>v-nexus-terminal</span>
                    </div>

                    {/* Content with top padding for header */}
                    <div className={styles.successContent}>
                      {/* Success Header */}
                      <div className={styles.successHeader}>
                        <div className={styles.successIcon}>
                          <Check size={28} color="#000" strokeWidth={3} />
                        </div>
                        <div>
                          <h3 className={styles.successTitle}>
                            {result.isExisting ? 'Endpoint Retrieved' : 'Endpoint Provisioned'}
                          </h3>
                          <p className={styles.successSubtitle}>
                            <span style={{ color: 'hsl(var(--color-primary))' }}>▸</span> {result.email}
                            <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                            {result.transport}
                          </p>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div className={styles.qrSection}>
                        <div className={styles.qrCode}>
                          <QRCodeSVG
                            value={result.config}
                            size={180}
                            level="H"
                            includeMargin={true}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>

                        {/* Connection Info */}
                        <div className={styles.connectionInfo}>
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Protocol</span>
                            <span className={styles.infoValue} style={{ color: 'hsl(var(--color-primary))' }}>VLESS</span>
                          </div>

                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Security</span>
                            <span className={styles.infoValue} style={{ color: 'hsl(var(--color-success))' }}>
                              <Lock size={14} />
                              {getSecurityType(result.transport)}
                            </span>
                          </div>

                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Quota Limit</span>
                            <span className={styles.infoValue} style={{ color: 'hsl(var(--color-primary))' }}>{formData.quotaLimit} GB</span>
                          </div>

                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Status</span>
                            <span className={styles.infoValue} style={{ color: 'hsl(var(--color-success))' }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'hsl(var(--color-success))',
                                boxShadow: '0 0 10px hsl(var(--color-success))',
                                animation: 'pulse 2s ease-in-out infinite'
                              }}></div>
                              ACTIVE
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Configuration String */}
                      <div className={styles.configSection}>
                        <div className={styles.configHeader}>
                          <span className={styles.infoLabel}>Configuration String</span>
                          <button
                            onClick={copyToClipboard}
                            className={styles.miniCopyButton}
                            style={copied ? { background: 'rgba(0, 204, 102, 0.2)', borderColor: 'hsl(var(--color-primary))' } : {}}
                          >
                            <Copy size={12} /> {copied ? 'COPIED!' : 'COPY'}
                          </button>
                        </div>
                        <div
                          className={styles.configBox}
                          onClick={copyToClipboard}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = 'rgba(0, 204, 102, 0.5)';
                            e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                          }}
                        >
                          {result.config}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={styles.actionButtons}>
                        <button
                          onClick={copyToClipboard}
                          className={styles.mainCopyButton}
                        >
                          <Copy size={16} /> Copy Config
                        </button>

                        <button
                          onClick={() => setResult(null)}
                          className={styles.newEndpointButton}
                        >
                          <Terminal size={16} /> New Endpoint
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
