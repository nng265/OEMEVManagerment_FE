import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu user đã login → redirect về dashboard
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username, password);
    setLoading(false);

    if (success) {
      navigate("/");
    } else {
      setError("Đăng nhập thất bại. Kiểm tra Tên đăng nhập hoặc Mật khẩu.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Đăng nhập</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";

// const LoginSchema = Yup.object().shape({
//   username: Yup.string().required("Tên đăng nhập là bắt buộc"),
//   password: Yup.string().required("Mật khẩu là bắt buộc"),
// });

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
//     const success = await login(values.username, values.password);

//     if (success) {
//       navigate("/dashboard");
//     } else {
//       setFieldError("password", "Sai tài khoản hoặc mật khẩu");
//     }

//     setSubmitting(false);
//   };

//   return (
//     <div className="login-container">
//       <h2>Đăng nhập hệ thống</h2>
//       <Formik
//         initialValues={{ username: "", password: "" }}
//         validationSchema={LoginSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ isSubmitting }) => (
//           <Form className="login-form">
//             <div className="form-group">
//               <label htmlFor="username">Tên đăng nhập</label>
//               <Field
//                 id="username"
//                 name="username"
//                 type="text"
//                 placeholder="Nhập username"
//               />
//               <ErrorMessage
//                 name="username"
//                 component="div"
//                 className="error-text"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="password">Mật khẩu</label>
//               <Field
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="Nhập mật khẩu"
//               />
//               <ErrorMessage
//                 name="password"
//                 component="div"
//                 className="error-text"
//               />
//             </div>

//             <button type="submit" className="login-btn" disabled={isSubmitting}>
//               {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
//             </button>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// }
