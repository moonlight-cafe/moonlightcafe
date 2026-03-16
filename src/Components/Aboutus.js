import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState } from "react";
import "./Aboutus.css";
import Navbar from "./Navbar";


const Methods = SharedMethod;
const APIs = SharedAPI;

const AboutPage = () => {
  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Methods.initAOS?.();
    const getData = async () => {
      setLoading(true);
      const result = await APIs.FetchAboutUsData();
      if (result?.status === 200) {
        setAboutData(result.data || []);
      } else {
        setError(result?.message || "Error fetching about us data");
      }
      setLoading(false);
    };
    getData();
  }, []);

  // Hero section = first plain string body
  const heroItem =
    aboutData.find((s) => typeof s.body === "string") ||
    aboutData[0] ||
    null;

  return (
    <>
      <Navbar />

      {loading ? (
        <div className="full-height-page">
          <div className="loader-wrap">{Methods.showLoader()}</div>
        </div>
      ) : error ? (
        <div className="full-height-page">
          <div className="error-wrap">
            <div className="error-card">
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
        <main className="mlc-about-page">

          {/* ✅ HERO */}
          <header
            className="mlc-hero"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(32,50,45,0.10), rgba(11,20,18,0.10)))",
            }}
            data-aos="fade-down"
          >
            <div className="mlc-hero-inner">
              <h1 className="mlc-title">{heroItem?.title || "MoonLight Café"}</h1>
              <p className="mlc-sub">
                {heroItem?.body ||
                  "A cozy corner for great coffee, warm vibes, and delicious treats — crafted with love since 2010."}
              </p>

              <div className="mlc-cta">
                <button className="btn-primary" onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}>
                  Our Story
                </button>
                <button className="btn-outline" onClick={() => window.location.href = "/view-menu"}>
                  View Menu
                </button>
              </div>
            </div>
          </header>

          <section className="mlc-content">
            <div className="mlc-grid">
              {aboutData.map((section, idx) => {
                const isArray = Array.isArray(section.body);
                if (isArray) {
                  return (
                    <article
                      className={`mlc-card mlc-full`}
                      key={idx}
                    >
                      <h2 className="section-title">{section.title}</h2>

                      <div
                        className="values-grid dynamic-grid"
                      >
                        {section.body.map((item, i) => (
                          <div key={i} className="value-item" style={{
                            textAlign: "center",
                            alignItems: "center",
                            width: "100%"
                          }}>
                            {item.icon && <div className="value-icon">{item.icon}</div>}
                            <div className="value-text">
                              <h4 className="mt-0">{item.title}</h4>
                              {item.description && <p>{item.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                }
                return (
                  <article className="mlc-card mlc-full" key={idx}>
                    <h2 className="section-title">{section.title}</h2>
                    <p className="section-body">{section.body}</p>
                  </article>
                );
              })}

            </div>
          </section>

          {/* ✅ FOOTER CTA */}
          <aside className="mlc-footer-cta" data-aos="fade-up">
            <div className="cta-inner">
              <h3>Drop by MoonLight Café today</h3>
              <p>Warm seats, brighter vibes, and a cup that feels like home.</p>
              <div className="mlc-cta">
                <button className="btn-primary" onClick={() => window.location.href = "/reservation"}>
                  Reserve a Table
                </button>
                <button className="btn-outline" onClick={() => window.location.href = "/contactus"}>
                  Contact Us
                </button>
              </div>
            </div>
          </aside>
        </main>
      )}
    </>
  );
};

export default AboutPage;
