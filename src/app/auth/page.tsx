import { AuthScreen } from "@/components/auth/auth-screen";

export default function AuthPage() {
  return (
    <div
      className="relative flex h-[100dvh] min-h-[100dvh] flex-1 flex-col overflow-hidden px-4 pb-8 pt-8 transition-colors duration-500"
      style={{ background: "var(--color-auth-background)" }}
    >
      
      {/* Skaisti, tēmai pielāgoti fona atspīdumi (Ambient glow) */}
      <div className="absolute -left-[20%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[100px] animate-pulse" aria-hidden />
      <div className="absolute -right-[20%] bottom-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[100px] animate-pulse" aria-hidden />
      
      {/* Viegla "grauda" tekstūra vizuālam dziļumam (ja vajag) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} aria-hidden />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col justify-center gap-8">
        
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-center text-foreground/80 text-sm md:text-base font-medium leading-relaxed px-4 drop-shadow-sm">
            Mājas ir tavas dvēseles un spēka balsts. Palīdzi sev un ģimenei tās
            padarīt stiprākas un emocionāli vieglākas.
          </p>
        </div>

        {/* Galvenais autorizācijas panelis (Pielāgojas tēmai) */}
        <div className="mb-auto w-full">
          <AuthScreen />
        </div>
        
      </div>
    </div>
  );
}