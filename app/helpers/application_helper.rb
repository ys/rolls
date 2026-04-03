module ApplicationHelper
  def nav_active_class(path, exact: false)
    active = exact ? (request.path == path) : request.path.start_with?(path)
    active ? 'nav-link nav-link-active' : 'nav-link'
  end

  def status_badge(status)
    content_tag :span, status.upcase, class: "status-badge status-#{status}"
  end

  def format_date(date)
    return '-' unless date.present?
    date.strftime('%b %d, %Y')
  end

  def format_datetime(dt)
    return '-' unless dt.present?
    dt.strftime('%b %d, %Y')
  end

  def push_pull_label(pp)
    return '' unless pp.present?
    pp > 0 ? "+#{pp}" : pp.to_s
  end
end
