module ApplicationHelper
  def nav_active_class(path, exact: false)
    paths = [ path ]
    paths << root_path if path == shoot_path
    active = paths.any? { |p| exact ? request.path == p : request.path.start_with?(p) }
    active ? "nav-link nav-link-active" : "nav-link"
  end

  def status_badge(status)
    content_tag :span, status.upcase, class: "status-badge status-#{status}"
  end

  def format_date(date)
    return "-" unless date.present?
    date.strftime("%b %d, %Y")
  end

  def format_datetime(dt)
    return "-" unless dt.present?
    dt.strftime("%b %d, %Y")
  end

  def push_pull_label(pp)
    return "" unless pp.present?
    (pp > 0) ? "+#{pp}" : pp.to_s
  end
end
