import React, { useEffect, useState } from "react";
import "./Home.css";

const gallery = [
  "https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg",
  "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg",
  "https://images.pexels.com/photos/97075/pexels-photo-97075.jpeg",
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
      {/* Hero section with background overlay */}
      <section className="hero">
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

      {/* Alternating info sections */}
      <section className="features">
        <article className="feature">
          <div className="feature__media">
            <img
              src="https://images.unsplash.com/photo-1580237072617-771c3ecc4a4a?q=80&w=1400&auto=format&fit=crop"
              alt="Bảo hành xe"
            />
          </div>
          <div className="feature__content">
            <h2>Bảo hành xe toàn diện</h2>
            <p>
              Dịch vụ bảo hành chính hãng giúp bạn yên tâm trên mọi hành trình.
              Chúng tôi kiểm tra hệ thống pin, động cơ điện và phần mềm điều
              khiển để đảm bảo an toàn và hiệu năng tối ưu.
            </p>
            <ul>
              <li>Kiểm tra định kỳ theo lịch sử dụng</li>
              <li>Chuẩn đoán phần mềm và cập nhật OTA</li>
              <li>Thay thế linh kiện chính hãng khi cần thiết</li>
            </ul>
          </div>
        </article>

        <article className="feature feature--reverse">
          <div className="feature__media">
            <img
              src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1400&auto=format&fit=crop"
              alt="Phụ tùng thay thế và sửa chữa"
            />
          </div>
          <div className="feature__content">
            <h2>Phụ tùng thay thế & sửa chữa</h2>
            <p>
              Kho phụ tùng đạt chuẩn giúp việc sửa chữa nhanh chóng, chính xác.
              Đội ngũ kỹ thuật viên giàu kinh nghiệm xử lý từ ngoại thất đến hệ
              thống điện – điện tử.
            </p>
            <ul>
              <li>Linh kiện chính hãng, bảo đảm tương thích</li>
              <li>Thi công theo quy trình tiêu chuẩn</li>
              <li>Bảo đảm chất lượng sau sửa chữa</li>
            </ul>
          </div>
        </article>

        <article className="feature">
          <div className="feature__media">
            <img
              src="https://images.unsplash.com/photo-1557825835-b4527f39f25a?q=80&w=1400&auto=format&fit=crop"
              alt="Chính sách bảo hành"
            />
          </div>
          <div className="feature__content">
            <h2>Chính sách bảo hành</h2>
            <p>
              Chính sách minh bạch, rõ ràng với tiêu chí lấy khách hàng làm
              trung tâm. Hỗ trợ trực tuyến, tra cứu lịch sử và nhắc lịch tự
              động.
            </p>
            <ul>
              <li>Thời hạn và phạm vi bảo hành công khai</li>
              <li>Hỗ trợ yêu cầu bảo hành trực tuyến</li>
              <li>Nhắc lịch bảo dưỡng định kỳ</li>
            </ul>
          </div>
        </article>
      </section>

      {/* Simple gallery (giữ carousel cũ) */}
      <div className="carousel">
        <img src={gallery[index]} alt="Bộ sưu tập" className="slide" />
      </div>
    </div>
  );
}

export default Home;
