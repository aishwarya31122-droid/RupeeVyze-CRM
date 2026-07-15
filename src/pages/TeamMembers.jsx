import { useCrm } from "../crmContext.jsx";

function TeamMembers({ title = "Team Members", description = "" }) {
  const { teamMembers } = useCrm();

  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <div className="team-grid">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-card">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <p>{member.status}</p>
            <p>{member.email}</p>
            <p>{member.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamMembers;
