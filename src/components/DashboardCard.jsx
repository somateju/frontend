function DashboardCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <div className="dashboard-card">

      <div className="card-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button onClick={onClick}>
        View
      </button>

    </div>
  );
}

export default DashboardCard;