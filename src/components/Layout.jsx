import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import { useEffect, useRef } from "react";

export default function Layout() {
    const canvasRef = useRef(null);
    useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function drawPixelCloud(cx, cy, size) {
      const s = Math.max(30, size / 3) | 0;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      for (let y = -s; y <= s; y += 8) {
        for (let x = -s; x <= s; x += 8) {
          const d = Math.hypot(x, y);
          if (d < size * 0.6 + (Math.sin((x + y) / 8) + 1) * 6) {
            ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 8, 8);
          }
        }
      }
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(255,255,255,0.02)");
      g.addColorStop(1, "rgba(0,0,0,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      const t = Date.now() / 6000;
      for (let i = 0; i < 8; i++) {
        const x = ((i * 257) % W) + Math.sin(t * (0.5 + i * 0.1)) * 150;
        const y = 80 + (i % 3) * 40 + Math.sin(t * (0.3 + i * 0.05)) * 20;
        drawPixelCloud(x % W, y, Math.max(60, 80 - i * 4));
      }
      requestAnimationFrame(draw);
    }

    draw();
    return () => window.removeEventListener("resize", resize);
  }, []);
    return (
        <>
            <canvas ref={canvasRef} id="bg-canvas"></canvas>
            
            <div className="layout">
                <Header />
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
        
    );
}