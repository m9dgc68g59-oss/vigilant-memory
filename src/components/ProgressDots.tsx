export default function ProgressDots({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isCurrent = step === currentStep;
        return (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className={`block h-2 w-2 rounded-full ${
                isDone || isCurrent
                  ? "bg-primary" + (isCurrent ? " shadow-[0_0_0_3px_rgba(46,125,50,0.25)]" : "")
                  : "bg-gray-300"
              }`}
            />
            {step < totalSteps && (
              <span className={`block h-[1.5px] w-4 ${isDone ? "bg-primary" : "bg-gray-300"}`} />
            )}
          </span>
        );
      })}
    </div>
  );
}
