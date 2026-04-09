import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { RoundedInput } from "@/components/ui/RoundedInput";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MagicCard } from "@/components/ui/MagicCard";
import { BlurFade } from "@/components/ui/BlurFade";
import Spline from "@splinetool/react-spline";
import { demoLogin, demoLogout, getDemoCredentials } from "@/lib/demoApi";

const EntryPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [introComplete, setIntroComplete] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: boolean; password?: boolean }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const cameraControls = useAnimation();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartRef = useRef<number | null>(null);
  const holdRafRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);

  const HOLD_DURATION = 2200; // ms

  // Cinematic intro sequence
  useEffect(() => {
    const runIntro = async () => {
      // Camera zoom in effect
      await cameraControls.start({
        scale: 1,
        opacity: 1,
        transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
      });
      setIntroComplete(true);
    };
    runIntro();
  }, [cameraControls]);

  const completeHold = () => {
    if (!isHoldingRef.current) return;
    setIsHolding(false);
    isHoldingRef.current = false;
    setHoldProgress(1);
    setShowAuth(true);
  };

  const cancelHoldAnimation = () => {
    setIsHolding(false);
    isHoldingRef.current = false;
    holdStartRef.current = null;
    if (holdRafRef.current !== null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    setHoldProgress(0);
  };

  const startHold = () => {
    if (isHolding) return;
    setIsHolding(true);
    isHoldingRef.current = true;
    holdStartRef.current = performance.now();

    const step = (now: number) => {
      if (!holdStartRef.current || !isHoldingRef.current) return;
      const elapsed = now - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION);
      setHoldProgress(progress);

      if (elapsed >= HOLD_DURATION) {
        completeHold();
      } else {
        holdRafRef.current = requestAnimationFrame(step);
      }
    };

    holdRafRef.current = requestAnimationFrame(step);
  };

  const handleBack = () => {
    setShowAuth(false);
    setUsername("");
    setPassword("");
    setErrors({});
    setLoginError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { username?: boolean; password?: boolean } = {};
    if (!username.trim()) newErrors.username = true;
    if (!password.trim()) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoginError(null);
      setTimeout(() => setErrors({}), 600);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setLoginError(null);

    try {
      try {
        const existingToken = window.sessionStorage.getItem("buewrap_session_token");
        if (existingToken) {
          await demoLogout(existingToken);
          window.sessionStorage.removeItem("buewrap_session_token");
        }
      } catch {
        // Best effort
      }

      const data = await demoLogin(username, password);

      login(data.token);
      try {
        window.sessionStorage.setItem("buewrap_session_token", data.token);
      } catch {
        // Best effort
      }
      navigate("/loading");
    } catch (err: any) {
      console.error('Login error:', err);
      setErrors({ username: true, password: true });
      if (err instanceof Error && err.message) {
        setLoginError(err.message);
      } else {
        setLoginError('Unable to sign in right now. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-[100dvh] bg-background/40 flex flex-col items-center justify-center relative overflow-hidden selection:bg-black/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Spline Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showAuth ? 0 : 0.35 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 0)' }}>
          <Spline scene="https://prod.spline.design/pzGRFj7ZgBjIrtkf/scene.splinecode" />
        </div>
      </motion.div>

      {/* Cinematic Camera Container */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.3, opacity: 0 }}
        animate={cameraControls}
      >
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(240,240,240,0.8) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Main Content with Cinematic Reveal */}
      <div className="relative z-10 w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          {!showAuth ? (
            /* Landing - Cinematic Intro */
            <motion.div
              key="landing"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Logo with 3D perspective entrance */}
              <motion.div
                className="relative mb-10 transform-gpu"
                initial={{ opacity: 0, scale: 1.4, filter: "blur(10px)", y: 40 }}
                animate={{
                  opacity: 1,
                  scale: isHolding ? 1.2 : 1,
                  filter: "blur(0px)",
                  y: isHolding ? 150 : 45
                }}
                transition={{
                  type: "spring",
                  stiffness: isHolding ? 60 : 100,
                  damping: isHolding ? 14 : 18,
                  mass: isHolding ? 1.2 : 1,
                  delay: isHolding ? 0.4 : 0
                }}
                style={{ perspective: 1000 }}
              >
                <motion.img
                  src="/Assets/Logo raw.png"
                  alt="BUEWrap Logo"
                  className="w-56 h-56 object-contain"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.06, rotateY: 6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                />
              </motion.div>

              {/* Title with staggered letter reveal */}
              <motion.div
                className="mb-4 transform-gpu"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHolding ? 0 : 1 }}
                transition={{
                  delay: isHolding ? 0 : 0.4,
                  duration: isHolding ? 0.3 : 0.4
                }}
              >
                <motion.h1
                  className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
                  initial={{ y: 40, filter: "blur(8px)", opacity: 0, scale: 1.1 }}
                  animate={{ y: 0, filter: "blur(0px)", opacity: 1, scale: 1 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.35,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  BUE Wrap
                </motion.h1>
              </motion.div>

              {/* Tagline with smooth fade */}
              <motion.p
                className="text-base text-muted-foreground mb-10 max-w-[280px] leading-relaxed font-light transform-gpu"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: isHolding ? 0 : 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: isHolding ? 0.3 : 1.0,
                  delay: isHolding ? 0.05 : 0.5,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                Your academic semester in review.
                <br />
                <span className="text-foreground/70">Beautifully summarized.</span>
              </motion.p>

              <motion.p
                className="text-xs text-muted-foreground/80 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHolding ? 0 : 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 }}
              >
                Demo login: {getDemoCredentials().username} / {getDemoCredentials().password}
              </motion.p>

              {/* CTA Button - Press and hold to continue */}
              <motion.button
                onMouseDown={startHold}
                onMouseUp={cancelHoldAnimation}
                onMouseLeave={cancelHoldAnimation}
                onTouchStart={startHold}
                onTouchEnd={cancelHoldAnimation}
                className="group relative flex items-center justify-center bg-foreground text-background text-sm font-medium shadow-lg transform-gpu"
                style={{ borderRadius: 9999 }}
                initial={{ opacity: 0, scale: 0.9, y: 20, width: 260, height: 52, filter: "blur(4px)" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  width: isHolding ? 96 : 260,
                  height: isHolding ? 96 : 52,
                  filter: "blur(0px)",
                  borderRadius: 9999,
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 0.8, delay: 0.7, type: "spring", stiffness: 100, damping: 15 },
                  filter: { duration: 0.6, delay: 0.7 },
                  scale: { duration: 0.8, delay: 0.7, type: "spring", stiffness: 100, damping: 15 },
                  width: { type: "spring", stiffness: 180, damping: 22 },
                  height: { type: "spring", stiffness: 180, damping: 22 },
                }}
                whileHover={!isHolding ? { scale: 1.03 } : undefined}
                whileTap={!isHolding ? { scale: 0.98 } : undefined}
              >
                <div className="relative flex items-center justify-center w-full h-full">
                  <motion.div
                    className="flex items-center gap-2 px-7"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isHolding ? 0 : 1 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span>Start Your Wrap</span>
                    <motion.div
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-background/20"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </motion.div>
                  </motion.div>

                  {isHolding && (
                    <>
                      <motion.div
                        className="absolute inset-2 rounded-full border-2 border-background/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full border-2 border-background"
                        style={{ clipPath: "inset(0 100% 0 0)" }}
                        animate={{ clipPath: `inset(0 ${100 - holdProgress * 100}% 0 0)` }}
                        transition={{ duration: 0.05, ease: "linear" }}
                      />
                    </>
                  )}
                </div>
              </motion.button>

              {/* Year badge */}
              <motion.div
                className="mt-10 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <div className="w-8 h-[1px] bg-muted-foreground/30" />
                <p className="text-xs text-muted-foreground/50 uppercase tracking-[0.4em] font-medium">
                  2025 Semester 1
                </p>
                <div className="w-8 h-[1px] bg-muted-foreground/30" />
              </motion.div>
            </motion.div>
          ) : (
            /* Auth Content - Slide in from right */
            <motion.div
              key="auth"
              className="w-full"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Back button */}
              <motion.button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 p-2 -ml-2 rounded-xl"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>

              <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-black/20 relative overflow-hidden">
                <div className="text-center mb-8">
                  <BlurFade delay={0.15}>
                    <h1 className="text-2xl font-bold tracking-tight mb-2 text-gray-900">Sign in to BUE Wrap</h1>
                  </BlurFade>
                  <BlurFade delay={0.2}>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Portfolio demo mode with mock data. Use the demo credentials shown above.
                    </p>
                  </BlurFade>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <BlurFade delay={0.25}>
                    <div className="space-y-4">
                      <RoundedInput
                        label="Username"
                        placeholder="Username (e.g. name123456)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={errors.username}
                        autoFocus
                      />
                      <RoundedInput
                        label="Password"
                        type="password"
                        placeholder="Portal Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                      />
                    </div>
                  </BlurFade>

                  <BlurFade delay={0.3}>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gray-900 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-gray-900/20 disabled:opacity-70 disabled:shadow-none transition-all hover:bg-gray-800"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </motion.button>
                  </BlurFade>
                </form>
              </div>

              <BlurFade delay={0.4}>
                <div className="mt-8 text-center text-xs min-h-[2.25rem] flex flex-col items-center justify-center gap-2">
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="font-semibold text-red-500 text-[11px]"
                    >
                      {loginError}
                    </motion.p>
                  )}
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="font-semibold text-muted-foreground/60"
                  >
                    Demo mode only: no real backend, no external data source, and no personal credentials required. By signing in, you agree to the
                    {" "}
                    <Link to="/privacy" className="underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    {" "}
                    and
                    {" "}
                    <Link to="/terms" className="underline underline-offset-2">
                      Terms of Service
                    </Link>
                    .
                  </motion.p>
                </div>
              </BlurFade>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legal / disclaimer note - landing only */}
      {!showAuth && (
        <div className="pointer-events-none absolute bottom-4 left-6 max-w-xs">
          <p className="text-[10px] leading-snug font-semibold text-muted-foreground/70 text-left">
            This is a portfolio demo project. Authentication and wrap analytics run on mock data in the browser only.
            {" "}
            <span className="pointer-events-auto">
              By continuing to sign in, you agree to the
              {" "}
              <Link to="/terms" className="underline underline-offset-2">
                Terms of Service
              </Link>
              {" "}
              and
              {" "}
              <Link to="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </span>
          </p>
        </div>
      )}

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default EntryPage;
