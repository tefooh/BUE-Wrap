import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Share2, Loader2, Check } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";
import QRCode from "qrcode";
import { useAuth } from "@/context/AuthContext";
import { demoCreateShare } from "@/lib/demoApi";

const StatBox = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

interface WrapPosterProps {
  data: any;
  allowShare?: boolean;
  isShared?: boolean;
}

export const WrapPoster = ({ data, allowShare = true, isShared = false }: WrapPosterProps) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { token } = useAuth();
  const [shareableUrl, setShareableUrl] = useState<string>("");

  useEffect(() => {
    // Generate QR code for the main website immediately
    QRCode.toDataURL("https://buewrap.com", {
      width: 300,
      margin: 0,
      color: {
        dark: '#27272a',
        light: '#ffffff'
      }
    }).then(setQrCodeUrl).catch(console.error);
  }, []);

  const handleDoWrap = () => {
    window.location.href = "/";
  };

  const handleDownload = async () => {
    if (posterRef.current) {
      setIsExporting(true);
      try {
        const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 3 });
        const link = document.createElement("a");
        link.download = `buewrap-${data.profile.id}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to export poster", err);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (!allowShare || !token) return;

      const createJson = await demoCreateShare(data);
      const shareToken = createJson?.share_token;
      const sharePath = createJson?.share_url;

      if (typeof shareToken !== "string" || typeof sharePath !== "string") {
        throw new Error("Invalid share response");
      }

      const url = `${window.location.origin}${sharePath.replace(shareToken, encodeURIComponent(shareToken))}`;
      setShareableUrl(url);

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'My BUE Wrap 2025',
            text: `Check out my BUE Wrap! Grade Energy: ${data.metrics.gradeEnergyScore}`,
            url
          });
        } else {
          throw new Error("Share API not supported");
        }
      } catch (shareError) {
        // Fallback to clipboard if share fails (e.g. permission denied or not supported)
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* Poster Canvas */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40, rotate: -5, filter: "blur(20px)" }}
        whileInView={{ scale: 1, opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],
          scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
          rotate: { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
        }}
        className="relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[32px] overflow-hidden mb-8"
      >
        <div
          ref={posterRef}
          className="w-[320px] aspect-[9/16] bg-zinc-950 relative p-5 flex flex-col justify-between text-white font-mono"
        >
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-white mix-blend-overlay"></div>

          {/* Header */}
          <div className="relative z-10 border-b border-zinc-800 pb-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tighter">BUE WRAP '25</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Official Transcript</span>
              </div>
              <div className="w-16 h-16 bg-zinc-800 rounded-full overflow-hidden border-2 border-zinc-700">
                {data.profile.picture && <img src={data.profile.picture} className="w-full h-full object-cover grayscale" alt="" />}
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase">
              <span>ID: {data.profile.id}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col gap-4">
            {/* Main Stat */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Grade Energy</p>
                <h1 className="text-5xl font-bold tracking-tighter text-yellow-500">{data.metrics.gradeEnergyScore}</h1>
              </div>
              <div className="h-12 w-12 flex items-center justify-center bg-zinc-950 rounded-full border border-zinc-800">
                <ZapIcon className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="GPA" value={data.profile.gpa} />
              <StatBox label="A+ Grades" value={data.metrics.aPlusCount} />
              <StatBox label="Activities" value={data.metrics.activitiesTotal} />
              <StatBox label="Courses" value={data.metrics.totalCourses} />
            </div>

            {/* Persona */}
            <div className="bg-zinc-100 text-zinc-950 rounded-xl p-4 flex flex-col items-center text-center mt-auto">
              <span className="text-4xl mb-2">{data.persona.emoji}</span>
              <h3 className="text-xl font-bold uppercase tracking-tight">{data.persona.name}</h3>
              <p className="text-[10px] opacity-70 leading-tight mt-1 max-w-[200px]">{data.persona.description}</p>
            </div>
          </div>

          {/* Footer with QR Code */}
          <div className="relative z-10 pt-4 border-t border-zinc-800 mt-4 flex flex-col items-center gap-2">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 rounded-lg" />
            ) : (
              <div className="w-20 h-20 bg-zinc-900 rounded-lg animate-pulse" />
            )}
            <p className="text-[8px] text-zinc-600 uppercase tracking-[0.3em]">Scan to View</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <PillButton size="lg" onClick={handleDownload} disabled={isExporting} className="w-full shadow-lg shadow-blue-500/20">
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Save Receipt
        </PillButton>

        {allowShare && token && !isShared && (
          <PillButton variant="secondary" size="lg" onClick={handleShare} disabled={isSharing} className="w-full">
            {shareSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Link Copied!
              </>
            ) : (
              <>
                {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                Share Link
              </>
            )}
          </PillButton>
        )}
      </div>
    </div>
  );
};
