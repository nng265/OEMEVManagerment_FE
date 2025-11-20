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
            Đặt lịch hẹn
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
            Đặt lịch hẹn
          </a>
        </div>
      </nav>

      <section className="hero" style={{ marginTop: "86px" }}>
        <div className="hero__content">
          <h1>EVM Service</h1>
          <p>
            Đặt lịch bảo dưỡng, sửa chữa xe điện nhanh chóng và chính xác với
            đội ngũ kỹ thuật viên chuyên nghiệp.
          </p>
          <a className="hero__cta" href="/cusappointmentform">
            Đặt lịch ngay
          </a>
        </div>
      </section>

      <section className="features">
        <article className="feature">
          <div className="feature__media">
            <img src="https://images.pexels.com/photos/4489736/pexels-photo-4489736.jpeg?auto=compress&cs=tinysrgb&w=1600" />
          </div>
          <div className="feature__content">
            <h2>Bảo hành xe toàn diện</h2>
            <p>
              Dịch vụ bảo hành chính hãng giúp bạn yên tâm trên mọi hành trình…
            </p>
            <ul>
              <li>Kiểm tra định kỳ</li>
              <li>Cập nhật phần mềm</li>
              <li>Thay thế linh kiện</li>
            </ul>
          </div>
        </article>

        <article className="feature feature--reverse">
          <div className="feature__media">
            <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1400&auto=format&fit=crop" />
          </div>
          <div className="feature__content">
            <h2>Phụ tùng & sửa chữa</h2>
            <p>
              Kho phụ tùng đạt chuẩn giúp việc sửa chữa nhanh chóng và chính
              xác.
            </p>
            <ul>
              <li>Linh kiện chính hãng</li>
              <li>Quy trình tiêu chuẩn</li>
              <li>Bảo hành sau sửa chữa</li>
            </ul>
          </div>
        </article>

        <article className="feature">
          <div className="feature__media">
            <img
              src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1600

"
            />
          </div>
          <div className="feature__content">
            <h2>Chính sách bảo hành</h2>
            <p>Minh bạch – rõ ràng – hỗ trợ khách hàng tối đa…</p>
            <ul>
              <li>Thông tin công khai</li>
              <li>Yêu cầu bảo hành online</li>
              <li>Nhắc lịch bảo dưỡng</li>
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
            <p>Nền tảng quản lý bảo hành – sửa chữa – chiến dịch xe điện.</p>
          </div>
          <div className="footer__links">
            <h4>Dịch vụ</h4>
            <ul>
              <li>
                <a href="/cusappointmentform">Đặt lịch</a>
              </li>
            </ul>
          </div>
          <div className="footer__contact">
            <h4>Liên hệ</h4>
            <ul>
              <li>Email: support@evsystem.vn</li>
              <li>Hotline: 1900-1234</li>
              <li>Địa chỉ: 123 EV Avenue, HCM</li>
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
