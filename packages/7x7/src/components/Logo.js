"use client";

import html2canvas from "html2canvas";
import styles from "./Logo.module.css";
import { useRef } from "react";

async function copyElementAsImage(
	element)
{
		// make the canvas background transparent
	const canvas = await html2canvas(element, { scale: 1.5, backgroundColor: null });

	canvas.toBlob((blob) => {
		const item = new ClipboardItem({ "image/png": blob });
		navigator.clipboard.write([item]);
	});
}

function charToBinaryArray(
	char)
{
	if (char.length !== 1) {
		throw new Error("Input must be a single character");
	}

	const asciiCode = char.charCodeAt(0);
	const binaryString = asciiCode.toString(2).padStart(8, "0");

	return binaryString.split("").map(Number);
}

function Bit({
	value })
{
	return <span className={value ? styles.bit1 : styles.bit0} />;
}

function Char({
	char })
{
		// only show the low order 7 bits, for the 7x7 theme
	const bits = charToBinaryArray(char).slice(1);

	return (
		<div className={styles.char}>
			{bits.map((bit, i) => <Bit key={i} value={bit} />)}
		</div>
	);
}

export default function Logo({
	string,
	style })
{
	const ref = useRef();
	const chars = [...string];

	const handleClick = () => copyElementAsImage(ref.current);

	return (
		<div className={`${styles.logo} ${styles.ltr}`}
			style={style}
			title={string}
			ref={ref}
			onClick={handleClick}
		>
		{/*<div className={styles.logo}>*/}
			{chars.map((char, i) => <Char key={i} char={char} />)}
		</div>
	);
}
