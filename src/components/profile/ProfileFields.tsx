import type { ComponentProps } from "react";

import { useLoad } from "../../hooks/useLoad";
import type { useProfileSelection } from "../../hooks/useProfileSelection";
import { skillGraphService } from "../../services/skillGraphService";
import {
  HOURS_PER_WEEK_MAX,
  HOURS_PER_WEEK_MIN,
} from "../../shared/validators";
import type { Direction } from "../../types/skillGraphTypes";
import FormField from "../form/FormField";
import { SkeletonRows } from "../Skeleton";
import DirectionPicker from "./DirectionPicker";
import ProfileStep from "./ProfileStep";
import SkillChecklist from "./SkillChecklist";

type FieldProps = Pick<
  ComponentProps<typeof FormField>,
  "id" | "name" | "value" | "onChange" | "onBlur" | "error"
>;

interface ProfileFieldsProps {
  deadline: FieldProps;
  hoursPerWeek: FieldProps;
  directions: Direction[];
  selection: ReturnType<typeof useProfileSelection>;
  errors: { direction?: string; targets?: string; known?: string };
  /** Onboarding: numbered raised steps. Edit form: plain sections. */
  onboarding?: boolean;
}

/**
 * Fields shared by onboarding (create) and the profile screen (edit):
 * deadline, hours per week, direction, target skills, skills already known.
 */
const ProfileFields = ({
  deadline,
  hoursPerWeek,
  directions,
  selection,
  errors,
  onboarding = false,
}: ProfileFieldsProps) => {
  const graph = useLoad(selection.directionId || null, () =>
    skillGraphService.getDirectionGraph(selection.directionId),
  );
  const step = (n: number) => (onboarding ? n : undefined);

  return (
    <>
      <ProfileStep
        id="ps-time"
        number={step(1)}
        raised={onboarding}
        title="Thời gian học"
        lead="Bạn muốn học xong khi nào và dành được bao nhiêu giờ mỗi tuần?"
      >
        <div className="grid-2">
          <FormField
            {...deadline}
            label="Hạn hoàn thành"
            type="date"
            required
          />
          <FormField
            {...hoursPerWeek}
            label="Số giờ học mỗi tuần"
            required
            inputMode="numeric"
            help={`Từ ${HOURS_PER_WEEK_MIN} đến ${HOURS_PER_WEEK_MAX} giờ.`}
          />
        </div>
      </ProfileStep>

      <ProfileStep
        id="ps-direction"
        number={step(2)}
        raised={onboarding}
        title="Hướng học"
        lead={
          onboarding
            ? "Chọn một hướng. Bạn có thể đổi lại sau trong Hồ sơ."
            : "Đổi hướng sẽ xóa lựa chọn kỹ năng bên dưới để bạn chọn lại."
        }
      >
        <DirectionPicker
          directions={directions}
          value={selection.directionId}
          onChange={selection.chooseDirection}
          labelledBy="ps-direction-h"
          error={errors.direction}
        />
      </ProfileStep>

      {selection.directionId && graph.status === "loading" && (
        <SkeletonRows rows={4} label="Đang tải danh sách kỹ năng" />
      )}
      {graph.status === "error" && (
        <div className="alert alert-danger" role="alert">
          <div className="alert-body">
            <span className="alert-title">
              Không tải được danh sách kỹ năng
            </span>
            <p>{graph.error}</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={graph.retry}
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
      {graph.status === "ready" && graph.data && (
        <>
          <ProfileStep
            id="ps-target"
            number={step(3)}
            raised={onboarding}
            title="Kỹ năng mục tiêu"
            lead="Chọn ít nhất một kỹ năng bạn muốn đạt được."
          >
            <SkillChecklist
              id="target-skills"
              labelledBy="ps-target-h"
              skills={graph.data.skills}
              selected={selection.targetIds}
              onToggle={selection.toggleTarget}
              error={errors.targets}
            />
          </ProfileStep>
          <ProfileStep
            id="ps-known"
            number={step(4)}
            raised={onboarding}
            title="Kỹ năng đã biết"
            lead="Không bắt buộc. Những kỹ năng bạn đã nắm sẽ được bỏ qua khi lập lộ trình."
          >
            <SkillChecklist
              id="known-skills"
              labelledBy="ps-known-h"
              skills={graph.data.skills}
              selected={selection.knownIds}
              onToggle={selection.toggleKnown}
              error={errors.known}
            />
          </ProfileStep>
        </>
      )}
    </>
  );
};

export default ProfileFields;
