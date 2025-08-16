import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const mono = Roboto_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata = {
	title: "Genome Insight",
	description: "Safe demo UI for genomic candidate predictions",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${inter.variable} ${mono.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
}
