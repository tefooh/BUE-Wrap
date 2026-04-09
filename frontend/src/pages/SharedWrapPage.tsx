import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WrapPoster } from "@/components/wrap/WrapPoster";
import { RibbonElement } from "@/components/ui/RibbonElement";
import { demoResolveShare } from "@/lib/demoApi";

const SharedWrapPage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [wrapData, setWrapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedWrap = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      const decodedToken = decodeURIComponent(shareToken);

      try {
        const data = await demoResolveShare(decodedToken, submittedPassword ?? undefined);
        setWrapData(data);
        setPasswordRequired(false);
        setLoading(false);
      } catch (err) {
        const code = err instanceof Error ? err.message : "";
        if (code === "PASSWORD_REQUIRED") {
          setPasswordRequired(true);
          setError("This share link is password protected.");
        } else if (code === "EXPIRED_LINK") {
          setError("This share link has expired.");
        } else if (code === "INVALID_LINK") {
          setError("Invalid share link.");
        } else {
          setError("Failed to load wrap data. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchSharedWrap();
  }, [shareToken, submittedPassword]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          className="mb-12 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-8 bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-sm border border-white/50">
            <RibbonElement className="w-32 h-32" variant="loop" />
          </div>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-gray-600 font-medium tracking-tight relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Loading shared wrap...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[100dvh] w-full bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-lg text-gray-600 mb-8">{error}</p>

          {passwordRequired && (
            <div className="mb-6">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
              />
              <button
                onClick={() => {
                  setSubmittedPassword(password);
                  setLoading(true);
                  setError(null);
                }}
                className="mt-3 w-full px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Unlock
              </button>
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Render only the summary poster card for shared wraps
  return (
    <div className="min-h-[100dvh] w-full bg-[#FAFAFA] flex flex-col items-center justify-center py-12 px-6">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">BUE Wrap 2025</h1>
        <p className="text-gray-600">Someone shared their semester summary with you!</p>
      </motion.div>

      <div className="relative z-10">
        <WrapPoster data={wrapData} allowShare={false} isShared={true} />
      </div>

    </div>
  );
};

export default SharedWrapPage;
