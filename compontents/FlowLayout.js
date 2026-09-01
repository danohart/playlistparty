import { Button } from "react-bootstrap";
import { ChevronLeft } from "react-bootstrap-icons";

// Reusable shell for the create/join flow (design handoff 2a "template
// structure"): full-bleed orange header with an optional back button + step
// indicator and a poster heading, over a dark body.
//
// Props:
//   heading    - node, the poster headline (may contain <br/>)
//   onBack     - fn | undefined, shows the Back button when provided
//   step       - number | undefined, current step (1-based); shows the bars
//   totalSteps - number, default 3
export default function FlowLayout({
  heading,
  onBack,
  step,
  totalSteps = 3,
  children,
}) {
  return (
    <div className="flow-screen">
      <header className="flow-header">
        <div className="pp-wrap">
          {(onBack || step) && (
            <div className="flow-header-top">
              {onBack ? (
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="flow-back"
                  onClick={onBack}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  Back
                </Button>
              ) : (
                <span />
              )}
              {step && (
                <div
                  className="flow-steps"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuenow={step}
                  aria-valuemax={totalSteps}
                  aria-label={`Step ${step} of ${totalSteps}`}
                >
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <span key={i} className={i < step ? "is-on" : undefined} />
                  ))}
                </div>
              )}
            </div>
          )}
          <h2 className="flow-heading">{heading}</h2>
        </div>
      </header>

      <div className="flow-body">
        <div className="pp-wrap">{children}</div>
      </div>
    </div>
  );
}
