const ProfileSummary = () => {
  return (
    <div className="rounded-xl p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(345 85% 35%), hsl(345 70% 50%))" }}>
      <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-80">Blood Type</span>
          <span className="text-sm font-bold">O Positive</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-80">Preferred Language</span>
          <span className="text-sm font-bold">English</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-80">Emergency Contact</span>
          <div className="text-right">
            <p className="text-sm font-bold">M. Johnson</p>
            <p className="text-xs opacity-80">555-0123</p>
          </div>
        </div>
      </div>
      <button className="mt-5 w-full rounded-lg bg-primary-foreground/20 backdrop-blur py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/30 transition-colors border border-primary-foreground/20">
        Verify Identity
      </button>
    </div>
  );
};

export default ProfileSummary;
