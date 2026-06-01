"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (value: string) => void;
  active: boolean;
}

export default function QrScanner({ onScan, active }: QrScannerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!active) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        scanner = new Html5Qrcode("qr-scanner-container");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text: string) => {
            onScan(text);
          },
          () => {}
        );
        setStarted(true);
        setError(null);
      } catch (err) {
        setError(
          "Kamera konnte nicht gestartet werden. Bitte erlaube den Kamerazugriff."
        );
        console.error(err);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
        setStarted(false);
      }
    };
  }, [active, onScan]);

  if (!active) return null;

  return (
    <div className="w-full">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm font-sans mb-4">
          {error}
        </div>
      )}
      <div className="relative rounded-2xl overflow-hidden border border-gold/20">
        <div
          id="qr-scanner-container"
          ref={containerRef}
          className="w-full"
          style={{ minHeight: "300px" }}
        />
        {started && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-gold/70 rounded-xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold rounded-br" />
            </div>
          </div>
        )}
      </div>
      {started && (
        <p className="text-cream-muted text-xs text-center mt-3 font-sans">
          Halte den QR-Code in den markierten Bereich
        </p>
      )}
    </div>
  );
}
