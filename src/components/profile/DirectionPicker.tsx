import type { Direction } from "../../types/skillGraphTypes";
import Icon from "../Icon";

interface DirectionPickerProps {
  directions: Direction[];
  value: string;
  onChange: (publicId: string) => void;
  /** Id of the heading that names this group. */
  labelledBy: string;
  error?: string;
}

/** Direction cards (design's `.dir-card`); exactly one can be pressed. */
const DirectionPicker = ({
  directions,
  value,
  onChange,
  labelledBy,
  error = "",
}: DirectionPickerProps) => (
  <fieldset
    className="fieldset-plain od-stack"
    id="direction-picker"
    tabIndex={-1}
    aria-labelledby={labelledBy}
  >
    <div className="grid-2">
      {directions.map((d) => (
        <button
          key={d.publicId}
          type="button"
          className="dir-card"
          aria-pressed={d.publicId === value}
          onClick={() => onChange(d.publicId)}
        >
          <span className="dir-head">
            <span className="dir-tile">
              <Icon name="compass" />
            </span>
            <span className="od-field">
              <span className="strong">{d.name}</span>
              <span
                className={
                  d.maturity === "FULL" ? "chip chip-info" : "chip chip-outline"
                }
              >
                {d.maturity === "FULL" ? "Đầy đủ" : "Thử nghiệm"}
              </span>
            </span>
            <span className="dir-check" aria-hidden="true">
              <Icon name="check" />
            </span>
          </span>
          {d.description && (
            <span className="muted small">{d.description}</span>
          )}
        </button>
      ))}
    </div>
    <p className="error-text" hidden={!error}>
      {error}
    </p>
  </fieldset>
);

export default DirectionPicker;
