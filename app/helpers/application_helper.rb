module ApplicationHelper
  def nav_active_class(path, exact: false)
    paths = [path]
    paths << root_path if path == shoot_path
    active = paths.any? { |p| exact ? request.path == p : request.path.start_with?(p) }

    # Keep Archive active when viewing an archived roll detail
    if !active && path == archive_path && @roll&.status == "archived"
      active = true
    end

    # Keep Develop active when viewing a develop-stage roll detail
    if !active && path == develop_path && %w[lab scanned processed uploaded].include?(@roll&.status)
      active = true
    end

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
