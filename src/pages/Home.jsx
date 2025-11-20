import React, { useEffect, useState } from "react";
import "./Home.css";

const gallery = [
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80",
];

function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home">
      <nav className="main-nav">
        <a href="/home" className="logo">
          EVM Service
        </a>
        <div className="nav-links">
          <a href="/home">Home</a>
          <a href="/cusappointmentform" className="btn">
            Book Appointment
          </a>
        </div>
      </nav>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          padding: "12px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.7)",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1b4b66",
            textDecoration: "none",
          }}
        >
          EVM Service
        </a>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a
            href="/home"
            style={{
              fontSize: "16px",
              textDecoration: "none",
              color: "#333",
              fontWeight: 500,
            }}
          >
            Home
          </a>

          <a
            href="/cusappointmentform"
            style={{
              background: "#1b4b66",
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              fontSize: "15px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Book Appointment
          </a>
        </div>
      </nav>

      <section className="hero" style={{ marginTop: "86px" }}>
        <div className="hero__content">
          <h1>EVM Service</h1>
          <p>
            Schedule maintenance and repair for your electric vehicle quickly
            and accurately with our team of professional technicians.
          </p>
          <a className="hero__cta" href="/cusappointmentform">
            Book Now
          </a>
        </div>
      </section>

      <section className="features">
        <article className="feature">
          <div className="feature__media">
            <img src="https://images.pexels.com/photos/4489736/pexels-photo-4489736.jpeg?auto=compress&cs=tinysrgb&w=1600" />
          </div>
          <div className="feature__content">
            <h2>Comprehensive Vehicle Warranty</h2>
            <p>
              Official warranty service ensures peace of mind on every journey…
            </p>
            <ul>
              <li>Periodic inspection</li>
              <li>Software updates</li>
              <li>Component replacement</li>
            </ul>
          </div>
        </article>

        <article className="feature feature--reverse">
          <div className="feature__media">
            <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1400&auto=format&fit=crop" />
          </div>
          <div className="feature__content">
            <h2>Parts & Repair</h2>
            <p>
              A certified parts warehouse enables fast and accurate repairs.
            </p>
            <ul>
              <li>Genuine components</li>
              <li>Standardized processes</li>
              <li>Post-repair warranty</li>
            </ul>
          </div>
        </article>

        <article className="feature">
          <div className="feature__media">
            <img
              src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1600"
            />
          </div>
          <div className="feature__content">
            <h2>Warranty Policies</h2>
            <p>Transparent – clear – maximum customer support…</p>
            <ul>
              <li>Public information</li>
              <li>Online warranty requests</li>
              <li>Maintenance reminders</li>
            </ul>
          </div>
        </article>
      </section>

      <div className="carousel">
        <img src={gallery[index]} className="slide" />
      </div>

      <footer className="site-footer">
        <div className="footer__top">
          <div className="footer__brand">
            <h3>EV System</h3>
            <p>
              The platform for managing warranty – repair – electric vehicle
              service campaigns.
            </p>
          </div>
          <div className="footer__links">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="/cusappointmentform">Book Appointment</a>
              </li>
            </ul>
          </div>
          <div className="footer__contact">
            <h4>Contact</h4>
            <ul>
              <li>Email: support@evsystem.vn</li>
              <li>Hotline: 1900-1234</li>
              <li>Address: 123 EV Avenue, HCM</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          © {new Date().getFullYear()} EV System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
