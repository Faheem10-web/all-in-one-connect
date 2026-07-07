"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import QRCodeLib from "qrcode";
import { updateQRStyle } from "@/features/qr/actions";
import { Download, Printer, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface QRManagerProps {
  businessId: string;
  qrCode: {
    shortUrl: string;
    style: {
      primaryColor: string;
      backgroundColor: string;
      eyeStyle: "SQUARE" | "CIRCLE" | "ROUNDED";
    };
  };
  businessSlug: string;
}

export function QRManager({ businessId, qrCode, businessSlug }: QRManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Styling states
  const [primaryColor, setPrimaryColor] = useState(qrCode.style.primaryColor);
  const [backgroundColor, setBackgroundColor] = useState(qrCode.style.backgroundColor);
  const [eyeStyle, setEyeStyle] = useState(qrCode.style.eyeStyle);

  // Redirection URL target pointer
  const redirectUrl = `http://localhost:3000/api/v1/qr/${qrCode.shortUrl}`;

  // Redraw QR code on canvas when style settings change
  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        redirectUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: primaryColor,
            light: backgroundColor,
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        },
      );
    }
  }, [redirectUrl, primaryColor, backgroundColor]);

  const handleSaveStyle = () => {
    startTransition(async () => {
      const result = await updateQRStyle(businessId, {
        primaryColor,
        backgroundColor,
        eyeStyle,
      });

      if (result.success) {
        alert("QR styling saved successfully!");
        router.refresh();
      } else {
        alert(result.message || "Failed to update QR style.");
      }
    });
  };

  const handleResetStyle = () => {
    setPrimaryColor("#0f172a");
    setBackgroundColor("#ffffff");
    setEyeStyle("SQUARE");
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `connect-qr-${businessSlug}.png`;
      a.click();
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCodeLib.toString(redirectUrl, {
        type: "svg",
        margin: 2,
        color: {
          dark: primaryColor,
          light: backgroundColor,
        },
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `connect-qr-${businessSlug}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("SVG generation failed:", err);
      alert("Failed to download SVG QR asset.");
    }
  };

  const handlePrint = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code - ${businessSlug}</title>
              <style>
                body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                img { width: 300px; height: 300px; }
                h1 { margin-top: 20px; font-size: 20px; color: #333; }
              </style>
            </head>
            <body>
              <img src="${url}" />
              <h1>All In One Connect: Scan to connect</h1>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Left panel: Live preview and download actions */}
      <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Dynamic QR Code Preview
        </h3>

        {/* Render Canvas */}
        <div className="p-4 bg-white rounded-xl border border-border shadow-xs">
          <canvas ref={canvasRef} className="w-[240px] h-[240px]" />
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-xs break-all">
          Redirect URL:{" "}
          <span className="font-semibold text-foreground underline">{redirectUrl}</span>
        </p>

        {/* Action buttons triggers */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <button
            onClick={handleDownloadPNG}
            className="flex flex-col items-center justify-center gap-1.5 h-16 border border-border hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            className="flex flex-col items-center justify-center gap-1.5 h-16 border border-border hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download SVG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1.5 h-16 border border-border hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Code</span>
          </button>
        </div>
      </div>

      {/* Right panel: Custom style settings controls */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-foreground">Customize Design</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              QR Code Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                maxLength={7}
                className="input-minimal text-xs font-semibold h-10 w-28 uppercase text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                maxLength={7}
                className="input-minimal text-xs font-semibold h-10 w-28 uppercase text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Eye Corner Style (Future-ready metadata)
            </label>
            <select
              value={eyeStyle}
              onChange={(e) => setEyeStyle(e.target.value as "SQUARE" | "CIRCLE" | "ROUNDED")}
              className="w-full h-10 px-3 border border-border rounded-md bg-secondary/20 outline-none focus:border-ring text-xs font-semibold text-foreground cursor-pointer"
            >
              <option value="SQUARE">Classic Square</option>
              <option value="CIRCLE">Rounded Circle</option>
              <option value="ROUNDED">Soft Rounded Rectangle</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={handleResetStyle}
            type="button"
            className="flex items-center gap-1 h-9 px-3 rounded-md hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            onClick={handleSaveStyle}
            disabled={isPending}
            className="flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
export default QRManager;
