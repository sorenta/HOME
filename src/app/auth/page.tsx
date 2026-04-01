import { AuthScreen } from "@/components/auth/auth-screen";

export default function AuthPage() {
  return (
    <div className="maj-auth-shell relative flex h-[100dvh] min-h-[100dvh] flex-1 flex-col overflow-hidden px-4 pb-8 pt-8">
      <div className="maj-auth-ambient maj-auth-ambient--rose" aria-hidden />
      <div className="maj-auth-ambient maj-auth-ambient--sage" aria-hidden />
      <div className="maj-auth-ambient maj-auth-ambient--pearl" aria-hidden />
      <div className="maj-auth-ambient maj-auth-ambient--blush" aria-hidden />
      <div className="maj-auth-ambient maj-auth-ambient--cream" aria-hidden />
      <div className="maj-auth-ambient maj-auth-ambient--mist" aria-hidden />
      <div className="maj-auth-grain" aria-hidden />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col">
        <p className="maj-auth-soft-copy">
          Mājas ir tavas dvēseles un spēka balsts. Palīdzi sev un ģimenei tās
          padarīt stiprākas un emocionāli vieglākas.
        </p>

        <div className="maj-auth-card-wrap">
          <AuthScreen />
        </div>
      </div>
    </div>
  );
}
