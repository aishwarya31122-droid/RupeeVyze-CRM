import { useCrm } from "../crmContext.jsx";

function TeamMembers() {
  const { teamMembers } = useCrm();

  return (
    <div>
      <h1>Team Members</h1>
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
