import type { Skill } from "../../types/skillGraphTypes";

interface SkillChecklistProps {
  /** DOM id of the fieldset (focus target for errors). */
  id: string;
  /** Id of the heading that names this group. */
  labelledBy: string;
  skills: Skill[];
  selected: string[];
  onToggle: (publicId: string) => void;
  error?: string;
}

const Difficulty = ({ level }: { level: number }) => (
  <span
    className="difficulty"
    role="img"
    aria-label={`Độ khó ${level} trên 5`}
    title={`Độ khó ${level}/5`}
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <i key={n} className={n <= level ? "on" : undefined} />
    ))}
  </span>
);

const SkillRow = ({
  skill,
  checked,
  onToggle,
}: {
  skill: Skill;
  checked: boolean;
  onToggle: () => void;
}) => (
  <label className="check-row">
    <input type="checkbox" checked={checked} onChange={onToggle} />
    <span className="od-field">
      <span className="strong">{skill.name}</span>
      <span className="check-meta">
        <Difficulty level={skill.difficulty} />
        <span>khoảng {skill.estimatedHours} giờ</span>
      </span>
    </span>
  </label>
);

/**
 * Checkbox list of a direction's skills. Shared ("kiến thức chung") skills
 * are listed in their own group, using the API's `isShared` flag.
 */
const SkillChecklist = ({
  id,
  labelledBy,
  skills,
  selected,
  onToggle,
  error = "",
}: SkillChecklistProps) => {
  const own = skills.filter((s) => !s.isShared);
  const shared = skills.filter((s) => s.isShared);
  const group = (title: string, list: Skill[]) =>
    list.length > 0 && (
      <div className="skill-group">
        <h3>{title}</h3>
        <div className="skill-list">
          {list.map((s) => (
            <SkillRow
              key={s.publicId}
              skill={s}
              checked={selected.includes(s.publicId)}
              onToggle={() => onToggle(s.publicId)}
            />
          ))}
        </div>
      </div>
    );

  return (
    <fieldset
      className="fieldset-plain od-stack"
      id={id}
      tabIndex={-1}
      aria-labelledby={labelledBy}
    >
      {group("Kỹ năng của hướng này", own)}
      {group("Kiến thức chung", shared)}
      <p className="error-text" hidden={!error}>
        {error}
      </p>
    </fieldset>
  );
};

export default SkillChecklist;
