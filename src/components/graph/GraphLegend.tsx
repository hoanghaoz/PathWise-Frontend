interface GraphLegendProps {
  withTarget?: boolean;
}

const GraphLegend = ({ withTarget = false }: GraphLegendProps) => (
  <div className="legend" aria-label="Chú giải">
    <span>
      <i className="sw sw-m" aria-hidden="true" />
      Đã nắm
    </span>
    <span>
      <i className="sw sw-p" aria-hidden="true" />
      Nắm một phần
    </span>
    <span>
      <i className="sw sw-n" aria-hidden="true" />
      Chưa nắm
    </span>
    <span>
      <i className="sw sw-i" aria-hidden="true" />
      Viền nét đứt: suy luận qua tiên quyết
    </span>
    {withTarget && (
      <span>
        <i className="sw sw-t" aria-hidden="true" />
        Viền đậm + vòng tròn: kỹ năng mục tiêu
      </span>
    )}
  </div>
);

export default GraphLegend;
