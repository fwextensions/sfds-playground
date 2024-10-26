import styles from "./page.module.css";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
				<Logo string="CCSFDDS" />
				<Logo string="ccsfdds" />
				<Logo string="ddsccsf" style={{
					"--color": "4deg, 62%",
					"--light0": "78%",
					"--light1": "46%"
				}} />
				<Logo string="DDSCCSF" />
				<Logo string="SanFran" style={{
					"--gap": "3px",
					"--radius": "0",
				}} />
				<Logo string="SanFran" style={{
					"--radius": "33%",
					"--spacing": ".25",
					"--border0": ".25rem solid var(--color0)",
					"--fill0": "none",
					"--light1": "50%"
				}} />
				<Logo string="DigiSrv" style={{
					"--color": "4deg, 62%",
					"--light0": "78%",
					"--light1": "46%"
				}} />
				<Logo string="@sf.gov" style={{
					"--color": "4deg, 62%",
					"--light0": "78%",
					"--light1": "46%"
				}} />
				<Logo string="49sq.mi" style={{
					"--color": "4deg, 62%",
					"--light0": "78%",
					"--light1": "46%"
				}} />
			</main>
    </div>
  );
}
