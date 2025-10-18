"use client";

import React from "react";
import styles from "./page.css";
import AuthGuard from "../../lib/AuthGuard";

function HomeContent() {
  return (
    <main>
      <header>
        <h1></h1>
        <p>感じるAI~写真が語る感情~</p>
      </header>
      <body>
        <div></div>
      </body>
    </main>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
