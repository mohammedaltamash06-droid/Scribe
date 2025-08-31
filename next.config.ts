// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
	typedRoutes: true,
		// experimental: {
		//   allowedDevOrigins: [
		//     "http://localhost:3000",
		//     "http://127.0.0.1:3000",
		//     "http://192.168.29.53:3000", // your LAN IP
		//   ],
		// },
};
export default nextConfig;
