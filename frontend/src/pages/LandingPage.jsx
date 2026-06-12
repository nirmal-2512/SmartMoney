import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const stylesheetRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    stylesheetRef.current = link;
    return () => {
      if (stylesheetRef.current)
        document.head.removeChild(stylesheetRef.current);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0A0A0F",
        color: "#F0F0F5",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      <style>{`
        .sm-gradient-text {
          background: linear-gradient(135deg, #00C896 0%, #4F8EF7 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sm-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          background: linear-gradient(135deg, #00C896, #4F8EF7);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .sm-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .sm-btn-primary.sm { padding: 10px 22px; font-size: 14px; border-radius: 10px; }
        .sm-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          color: #F0F0F5;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .sm-btn-outline:hover { background: rgba(255,255,255,0.06); transform: translateY(-1px); }
        .sm-btn-outline.sm { padding: 10px 22px; font-size: 14px; border-radius: 10px; }
        .sm-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .sm-nav-links a {
          text-decoration: none;
          color: #8888A0;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .sm-nav-links a:hover { color: #F0F0F5; }
        .sm-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00C896;
          animation: sm-pulse 2s infinite;
        }
        @keyframes sm-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .sm-glow {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }
        .sm-feature-card {
          background: #16161F;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 2rem;
          transition: border-color 0.3s, transform 0.3s;
        }
        .sm-feature-card:hover {
          border-color: rgba(0,200,150,0.3);
          transform: translateY(-4px);
        }
        .sm-testimonial {
          background: #16161F;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.75rem;
        }
        .sm-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(180deg, #00C896, #4F8EF7);
          opacity: 0.8;
        }
        .sm-preview-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #8888A0;
        }
        .sm-preview-nav-item.active {
          background: rgba(0,200,150,0.1);
          color: #00C896;
        }
        .sm-step-num {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00C896, #4F8EF7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0 auto 1.25rem;
        }
        .sm-footer-link {
          font-size: 13px;
          color: #8888A0;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sm-footer-link:hover { color: #F0F0F5; }
        @media (max-width: 768px) {
          .sm-nav-links { display: none; }
          .sm-preview-sidebar { display: none; }
          .sm-preview-body { grid-template-columns: 1fr !important; }
          .sm-preview-cards { grid-template-columns: 1fr !important; }
          .sm-cta-box { padding: 2.5rem 1.5rem !important; }
          .sm-footer { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="sm-nav">
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src="/smartMoney_logo_purple.png"
              alt="SM"
              style={{
                width: 34,
                height: 34,
                objectFit: "cover",
              }}
            />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              background: "linear-gradient(135deg, #00C896, #4F8EF7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SmartMoney
          </span>
        </Link>
        <div
          className="sm-nav-links"
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
        >
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/login" className="sm-btn-outline sm">
            Sign in
          </Link>
          <Link to="/register" className="sm-btn-primary sm">
            Get started free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "8rem 2rem 4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="sm-glow"
          style={{ background: "#00C896", top: -100, left: -100 }}
        />
        <div
          className="sm-glow"
          style={{ background: "#4F8EF7", top: 100, right: -150 }}
        />
        <div
          className="sm-glow"
          style={{ background: "#8B5CF6", bottom: -100, left: "30%" }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 100,
            background: "rgba(0,200,150,0.1)",
            border: "1px solid rgba(0,200,150,0.3)",
            color: "#00C896",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          <div className="sm-badge-dot" />
          AI-powered personal finance
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
            maxWidth: 800,
          }}
        >
          Your money,
          <br />
          <span className="sm-gradient-text">finally under control</span>
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#8888A0",
            maxWidth: 540,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          Track expenses, set budgets, analyze spending patterns, and get
          AI-powered insights — all in one beautiful app.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/register" className="sm-btn-primary">
            Start for free &rarr;
          </Link>
          <a href="#features" className="sm-btn-outline">
            See features
          </a>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            marginTop: "4rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            ["100%", "Free to use"],
            ["13+", "Powerful features"],
            ["AI", "Powered insights"],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #00C896, #4F8EF7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: 13, color: "#8888A0", marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <div
        style={{
          padding: "2rem 2rem 6rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "#16161F",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "#12121A",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#FF5F57",
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#FEBC2E",
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#28C840",
              }}
            />
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 12,
                color: "#8888A0",
              }}
            >
              app.smartmoney.in
            </div>
          </div>
          <div
            className="sm-preview-body"
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              minHeight: 400,
            }}
          >
            <div
              className="sm-preview-sidebar"
              style={{
                background: "#1A1A26",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                padding: "1.5rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "linear-gradient(135deg, #00C896, #4F8EF7)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  S
                </div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  SmartMoney
                </span>
              </div>
              {[
                "Dashboard",
                "Transactions",
                "Budgets",
                "Reports",
                "AI Chat",
                "Loans",
              ].map((item, i) => (
                <div
                  key={item}
                  className={`sm-preview-nav-item${i === 0 ? " active" : ""}`}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "currentColor",
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
            <div style={{ padding: "1.5rem" }}>
              <h3
                style={{ fontSize: 16, fontWeight: 700, marginBottom: "1rem" }}
              >
                Dashboard
              </h3>
              <div
                className="sm-preview-cards"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  ["Total income", "₹65,000", "#00C896"],
                  ["Total expenses", "₹31,240", "#FF6B6B"],
                  ["Net savings", "₹33,760", "#4F8EF7"],
                ].map(([label, val, color]) => (
                  <div
                    key={label}
                    style={{
                      background: "#1A1A26",
                      borderRadius: 12,
                      padding: 14,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#8888A0",
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "#1A1A26",
                  borderRadius: 12,
                  padding: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  height: 120,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
                  <div key={i} className="sm-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section
        id="features"
        style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto" }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#00C896",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Features
        </div>
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(1.8rem,4vw,3rem)",
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}
        >
          Everything you need to manage money
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#8888A0",
            fontSize: "1.1rem",
            maxWidth: 540,
            margin: "0 auto 4rem",
            lineHeight: 1.7,
          }}
        >
          Built for Indians who want serious control over their finances without
          the complexity.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            [
              "📊",
              "Smart Dashboard",
              "Get a real-time overview of your income, expenses, and savings with beautiful charts and instant insights.",
              "rgba(0,200,150,0.12)",
            ],
            [
              "💸",
              "Transaction Tracking",
              "Log every rupee with ease. Search, filter, and categorize all your transactions in one place.",
              "rgba(79,142,247,0.12)",
            ],
            [
              "🎯",
              "Budget Management",
              "Set monthly or weekly budgets per category. Get notified at 80% and 100% so you never overspend.",
              "rgba(139,92,246,0.12)",
            ],
            [
              "🤖",
              "AI Financial Advisor",
              "Chat with a Gemini-powered AI that knows your spending patterns and gives personalized financial advice.",
              "rgba(236,72,153,0.12)",
            ],
            [
              "📥",
              "Bank Statement Import",
              "Upload CSV or PDF bank statements. AI auto-categorizes every transaction — saving hours of manual work.",
              "rgba(245,158,11,0.12)",
            ],
            [
              "🤝",
              "Loans Tracker",
              "Track money you lent or borrowed. Calculates simple or compound interest automatically with daily updates.",
              "rgba(20,184,166,0.12)",
            ],
            [
              "📈",
              "Monthly AI Reports",
              "Get a narrative financial report every month written by AI — trends, warnings, and actionable advice.",
              "rgba(0,200,150,0.12)",
            ],
            [
              "🌍",
              "Multi-Currency",
              "Track transactions in any currency. Live exchange rates keep everything accurate in your base currency (INR).",
              "rgba(79,142,247,0.12)",
            ],
            [
              "🔍",
              "Anomaly Detection",
              "AI detects unusual spending patterns, duplicate transactions, and budget overrun risks before they happen.",
              "rgba(139,92,246,0.12)",
            ],
          ].map(([icon, title, desc, bg]) => (
            <div key={title} className="sm-feature-card">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: "1.25rem",
                }}
              >
                {icon}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: "0.6rem",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: 14, color: "#8888A0", lineHeight: 1.7 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        style={{ background: "#12121A", padding: "6rem 2rem" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#00C896",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            How it works
          </div>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.8rem,4vw,3rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            Up and running in minutes
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#8888A0",
              fontSize: "1.1rem",
              maxWidth: 540,
              margin: "0 auto 4rem",
              lineHeight: 1.7,
            }}
          >
            No complex setup. No spreadsheets. Just sign up and start tracking.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "2rem",
            }}
          >
            {[
              [
                "1",
                "Create your account",
                "Sign up in 30 seconds with email or Google. Your account is verified and ready instantly.",
              ],
              [
                "2",
                "Import or add transactions",
                "Upload your bank statement CSV or add transactions manually. AI categorizes everything for you.",
              ],
              [
                "3",
                "Set budgets and goals",
                "Define spending limits per category. SmartMoney alerts you before you hit your limits.",
              ],
              [
                "4",
                "Get AI insights",
                "Chat with your AI advisor, generate monthly reports, and make smarter money decisions.",
              ],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ textAlign: "center" }}>
                <div className="sm-step-num">{num}</div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: "#8888A0", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {/* <section
        id="testimonials"
        style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto" }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#00C896",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Reviews
        </div>
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(1.8rem,4vw,3rem)",
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}
        >
          Loved by people who take money seriously
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#8888A0",
            fontSize: "1.1rem",
            maxWidth: 540,
            margin: "0 auto 4rem",
            lineHeight: 1.7,
          }}
        >
          Join thousands who have transformed their relationship with money.
        </p> */}

      {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            [
              "MS",
              "linear-gradient(135deg,#00C896,#4F8EF7)",
              "Mahaveer",
              "Software Engineer, Bangalore",
              "Finally an app that actually understands Indian banking. The CSV import + AI categorisation saved me 3 hours every month.",
            ],
            [
              "PD",
              "linear-gradient(135deg,#8B5CF6,#EC4899)",
              "Priti Das",
              "Product Manager, Mumbai",
              "The AI chat feature is like having a personal CA on call. It noticed I was spending 40% more on food than last month before I even realized.",
            ],
            [
              "KM",
              "linear-gradient(135deg,#F59E0B,#EF4444)",
              "Karan Mehta",
              "Freelancer, Delhi",
              "The loans tracker alone is worth it. I lend money to friends and family often — now I never lose track of who owes what.",
            ],
          ].map(([initials, gradient, name, role, quote]) => (
            <div key={name} className="sm-testimonial">
              <div
                style={{
                  color: "#FBBF24",
                  fontSize: 14,
                  marginBottom: "1rem",
                  letterSpacing: 2,
                }}
              >
                ★★★★★
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: "#8888A0",
                  lineHeight: 1.7,
                  marginBottom: "1.25rem",
                }}
              >
                "{quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#8888A0" }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div> */}
      {/* </section> */}

      {/* CTA */}
      <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
        <div
          className="sm-cta-box"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            background: "#16161F",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: "4rem 3rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(0,200,150,0.15), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            Start tracking your money{" "}
            <span className="sm-gradient-text">today</span>
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#8888A0",
              marginBottom: "2rem",
              lineHeight: 1.7,
            }}
          >
            Free forever. No credit card required. Set up in under 2 minutes.
          </p>
          <Link to="/register" className="sm-btn-primary">
            Create free account &rarr;
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="sm-footer"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "2.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src="/smartMoney_logo_purple.png"
              alt="SM"
              style={{
                width: 34,
                height: 34,
                objectFit: "cover",
              }}
            />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#F0F0F5" }}>
            SmartMoney
          </span>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="#features" className="sm-footer-link">
            Features
          </a>
          <a href="#how-it-works" className="sm-footer-link">
            How it works
          </a>
          <Link to="/login" className="sm-footer-link">
            Sign in
          </Link>
          <Link to="/register" className="sm-footer-link">
            Get started
          </Link>
        </div>
        <div style={{ fontSize: 13, color: "#8888A0" }}>
          &copy; 2026 SmartMoney. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
