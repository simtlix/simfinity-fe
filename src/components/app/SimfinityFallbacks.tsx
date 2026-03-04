"use client";

import React from "react";
import SimfinityClient from "@simtlix/simfinity-js-client";

const keyframes = `
@keyframes sfGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes sfPulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%      { transform: scale(1.12); opacity: 0.85; }
}

@keyframes sfOrbit {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes sfBounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-10px); }
}

@keyframes sfFadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes sfShake {
  0%, 100%       { transform: translateX(0); }
  10%, 30%, 50%  { transform: translateX(-6px); }
  20%, 40%       { transform: translateX(6px); }
  60%            { transform: translateX(0); }
}

@keyframes sfBreath {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,83,80,0.45); }
  50%      { box-shadow: 0 0 28px 8px rgba(239,83,80,0.18); }
}

@keyframes sfRingPulse {
  0%   { transform: scale(0.8); opacity: 0.6; }
  50%  { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0; }
}
`;

const viewport: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  margin: 0,
  fontFamily:
    "Inter, Nunito, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  overflow: "hidden",
};

export function LoadingFallback() {
  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          ...viewport,
          background:
            "linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 25%, #f3e5f5 50%, #fff3e0 75%, #e8f5e9 100%)",
          backgroundSize: "400% 400%",
          animation: "sfGradientShift 8s ease infinite",
        }}
      >
        {/* Orbiting ring */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "#1976d2",
              borderRightColor: "#9c27b0",
              animation: "sfOrbit 1.6s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderBottomColor: "#4caf50",
              borderLeftColor: "#ff9800",
              animation: "sfOrbit 2.4s linear infinite reverse",
            }}
          />
          {/* Pulsing ring behind logo */}
          <div
            style={{
              position: "absolute",
              inset: 16,
              borderRadius: "50%",
              background: "rgba(25,118,210,0.08)",
              animation: "sfRingPulse 2s ease-in-out infinite",
            }}
          />
          {/* Center brand circle */}
          <div
            style={{
              position: "absolute",
              inset: 20,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1976d2, #7c4dff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "sfPulse 2s ease-in-out infinite",
              boxShadow: "0 8px 32px rgba(25,118,210,0.3)",
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: -1,
                userSelect: "none",
              }}
            >
              S
            </span>
          </div>
        </div>

        {/* Bouncing dots */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1976d2, #7c4dff)",
                animation: `sfBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>

        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "#546e7a",
            letterSpacing: 0.5,
            margin: 0,
            animation: "sfFadeInUp 0.6s ease-out both",
          }}
        >
          Connecting to Simfinity&hellip;
        </p>
      </div>
    </>
  );
}

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          ...viewport,
          background:
            "linear-gradient(135deg, #ffebee 0%, #fce4ec 30%, #fff3e0 70%, #ffebee 100%)",
          backgroundSize: "400% 400%",
          animation: "sfGradientShift 10s ease infinite",
        }}
      >
        {/* Error icon */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ef5350, #e53935)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            animation:
              "sfShake 0.7s ease-out, sfBreath 2.5s ease-in-out 0.7s infinite",
            boxShadow: "0 8px 32px rgba(239,83,80,0.25)",
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#c62828",
            margin: "0 0 8px",
            animation: "sfFadeInUp 0.5s ease-out 0.3s both",
          }}
        >
          Connection Failed
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#78909c",
            margin: "0 0 24px",
            animation: "sfFadeInUp 0.5s ease-out 0.45s both",
          }}
        >
          Unable to reach the Simfinity backend
        </p>

        <div
          style={{
            maxWidth: 440,
            width: "90%",
            padding: "14px 20px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(239,83,80,0.18)",
            marginBottom: 28,
            animation: "sfFadeInUp 0.5s ease-out 0.55s both",
          }}
        >
          <code
            style={{
              fontSize: 13,
              color: "#d32f2f",
              wordBreak: "break-word",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {error.message}
          </code>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 32px",
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            background: "linear-gradient(135deg, #ef5350, #e53935)",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(239,83,80,0.3)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            animation: "sfFadeInUp 0.5s ease-out 0.65s both",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 10px 28px rgba(239,83,80,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(239,83,80,0.3)";
          }}
        >
          Retry
        </button>
      </div>
    </>
  );
}

/**
 * Pre-initialises a SimfinityClient and shows animated fallbacks.
 * Once the endpoint responds and introspection succeeds, children
 * (including the real SimfinityClientProvider) are rendered.
 */
export function InitGuard({
  endpoint,
  children,
}: {
  endpoint: string;
  children: React.ReactNode;
}) {
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const client = new SimfinityClient(endpoint);
    client
      .init()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (status === "error" && error) return <ErrorFallback error={error} />;
  if (status === "loading") return <LoadingFallback />;
  return <>{children}</>;
}
