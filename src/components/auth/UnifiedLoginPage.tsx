import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Globe, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { homePathForRole } from "@/lib/portal-auth";
import { unifiedLogin, verifyAdminMfa, PortalAuthError } from "@/lib/portal-auth-api";
import { PORTAL_CONFIG } from "@/types/portal";
import OtpStep from "@/components/auth/OtpStep";

const RESEND_COOLDOWN = 60;

const UnifiedLoginPage = () => {
  const navigate = useNavigate();
  const { session, role, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockSeconds, setLockSeconds] = useState(0);

  // MFA state
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [mfaExpiresAt, setMfaExpiresAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [mfaAttemptsLeft, setMfaAttemptsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading || !session || !role) return;
    navigate(homePathForRole(role), { replace: true });
  }, [isLoading, session, role, navigate]);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setLockSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockSeconds]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (lockSeconds > 0) {
      setErrorMessage(`Tài khoản tạm khóa. Thử lại sau ${lockSeconds}s.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await unifiedLogin(email.trim(), password);

      if ("requiresMfa" in result && result.requiresMfa) {
        setMfaToken(result.mfaToken);
        setMfaExpiresAt(Date.now() + result.expiresIn * 1000);
        setResendCooldown(RESEND_COOLDOWN);
        toast.info(result.message);
        return;
      }

      toast.success("Đăng nhập thành công");
      navigate(PORTAL_CONFIG[result.role].homePath, { replace: true });
    } catch (err) {
      if (err instanceof PortalAuthError) {
        if (err.retryAfterSeconds) {
          setLockSeconds(err.retryAfterSeconds);
        }
        setErrorMessage(err.message);
        toast.error(err.message);
      } else {
        const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mfaToken) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const result = await verifyAdminMfa(mfaToken, otp);
      toast.success("Đăng nhập thành công");
      navigate(PORTAL_CONFIG[result.role].homePath, { replace: true });
    } catch (err) {
      if (err instanceof PortalAuthError) {
        if (err.code === "MFA_LOCKED") {
          setMfaToken(null);
          setOtp("");
        }
        if (err.attemptsLeft != null) setMfaAttemptsLeft(err.attemptsLeft);
        setErrorMessage(err.message);
        toast.error(err.message);
      } else {
        const message = err instanceof Error ? err.message : "Xác minh OTP thất bại";
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaResend = async () => {
    if (!email) return;
    setErrorMessage("");
    setOtp("");
    setIsSubmitting(true);
    try {
      const result = await unifiedLogin(email.trim(), password);
      if ("requiresMfa" in result && result.requiresMfa) {
        setMfaToken(result.mfaToken);
        setMfaExpiresAt(Date.now() + result.expiresIn * 1000);
        setResendCooldown(RESEND_COOLDOWN);
        setMfaAttemptsLeft(null);
        toast.info("Đã gửi lại mã OTP mới");
      }
    } catch (err) {
      const message = err instanceof PortalAuthError ? err.message : "Không thể gửi lại OTP";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        <Link to="/" className="text-lg font-bold text-primary">
          Qcare Plus
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label="Language"
        >
          <Globe className="h-5 w-5 text-muted-foreground" />
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="grid w-full max-w-4xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="hidden flex-col items-center md:flex">
            <div className="flex aspect-[3/4] w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/40 p-8">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-16 w-16 text-primary" />
              </div>
              <p className="text-center text-lg font-bold leading-snug text-foreground">
                Một cổng đăng nhập cho mọi vai trò
              </p>
            </div>
          </div>

          <div>
            {mfaToken ? (
              <>
                <h1 className="mb-2 text-2xl font-bold leading-tight text-foreground md:text-3xl">
                  Xác minh hai bước
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tài khoản Admin yêu cầu xác minh OTP để tiếp tục.
                </p>
                <div className="mt-8 rounded-xl border bg-card p-6 md:p-8">
                  <OtpStep
                    email={email}
                    otp={otp}
                    isSubmitting={isSubmitting}
                    errorMessage={errorMessage}
                    lockSeconds={lockSeconds}
                    resendCooldown={resendCooldown}
                    otpExpiresAt={mfaExpiresAt}
                    attemptsLeft={mfaAttemptsLeft}
                    onOtpChange={setOtp}
                    onSubmit={handleMfaSubmit}
                    onBack={() => {
                      setMfaToken(null);
                      setOtp("");
                      setErrorMessage("");
                    }}
                    onResend={handleMfaResend}
                  />
                </div>
              </>
            ) : (
              <>
                <h1 className="mb-2 text-2xl font-bold leading-tight text-foreground md:text-3xl">
                  Đăng nhập Qcare Plus
                </h1>
                <p className="text-sm text-muted-foreground">
                  Nhập email và mật khẩu — hệ thống tự chuyển đến portal Bệnh nhân, Bác sĩ hoặc Quản trị.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 rounded-xl border bg-card p-6 md:p-8"
                >
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                  />

                  <label htmlFor="password" className="mb-2 mt-4 block text-sm font-medium text-foreground">
                    Mật khẩu
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                  />

                  {errorMessage ? (
                    <p className="mt-3 text-sm text-destructive" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}

                  {lockSeconds > 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tài khoản khóa còn {lockSeconds}s
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting || lockSeconds > 0}
                    className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="my-5 border-t" />

                  <p className="text-center text-sm text-muted-foreground">
                    <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </p>
                </form>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Chưa có tài khoản?{" "}
                  <Link to="/signup" className="font-semibold text-primary hover:underline">
                    Đăng ký (Bệnh nhân)
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnifiedLoginPage;
