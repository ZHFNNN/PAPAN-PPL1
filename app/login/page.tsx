"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // Import Toast

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    // 1. Validasi frontend
    if (!email || !password) {
      toast.error("Harap isi email dan password.");
      return;
    }

    // 2. Mulai loading
    setIsLoading(true);

    try {
      // 3. Panggil endpoint API Login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      // 4. Handle Response
      if (response.ok) {
        toast.success("Login berhasil! Mengalihkan...");

        // Jeda 1.5 detik agar notifikasi terlihat sebelum pindah halaman
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error(
          data.message ||
            "Login gagal, periksa kembali email dan password Anda.",
        );
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan. Coba lagi nanti.");
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Komponen Toaster untuk memunculkan pop-up melayang */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className={styles.bgOverlay} />

      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.subtitle}>Masuk ke akun Anda untuk melanjutkan</p>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="Masukkan email Anda"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Masukkan kata sandi"
              style={{ width: "100%", paddingRight: "80px" }} // Memberi ruang agar teks tidak tertimpa tombol
            />
            {/* Tombol toggle untuk show/hide password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#666",
              }}
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          <div className={styles.forgotRow}>
            <span className={styles.forgotLink} style={{ cursor: "pointer" }}>
              Lupa kata sandi?
            </span>
          </div>
        </div>

        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Login"}
        </button>

        <button className={styles.googleBtn}>
          <GoogleIcon />
          <span>Google</span>
        </button>

        <p className={styles.footerText}>
          Belum punya akun?{" "}
          <span
            className={styles.footerLink}
            onClick={() => router.push("/register")}
            style={{ cursor: "pointer" }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
