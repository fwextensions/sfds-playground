"use client";

import styles from "./page.module.css";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
				<Logo string="CCSFDDS" />
				<Logo string="CCSFDDS" style={{ "--spacing": ".35" }} />
				<Logo string="CCSFDDS" style={{ "--spacing": ".35", "--color": "4deg, 62%" }} />
				<Logo string="DDSCCSF" />
				<Logo string="SanFran" style={{ "--radius": "0" }} />
				<Logo string="SanFran" style={{ "--radius": "33%", "--spacing": ".25" }} />
				<Logo string="digisrv" style={{ "--color": "90deg, 100%" }} />
			</main>
    </div>
  );
}
