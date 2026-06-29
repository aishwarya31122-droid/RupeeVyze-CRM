import { useState } from "react";
import { useCrm } from "../crmContext.jsx";
import { businessConfigs } from "../data/config.js";

function Settings() {
  const {
    selectedConfigId,
    setSelectedConfigId,
    settings,
    setSettings
  } = useCrm();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalSettings((current) => ({ ...current, [name]: value }));
  };

  const handleSave = () => setSettings(localSettings);

  return (
    <div>
      <h1>CRM Settings</h1>

      <div className="settings-panel">
        <section>
          <h2>Business Configuration</h2>
          <label>
            Choose workflow profile
            <select value={selectedConfigId} onChange={(e) => setSelectedConfigId(e.target.value)}>
              {businessConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
          </label>

          <div className="config-summary">
            {businessConfigs
              .filter((config) => config.id === selectedConfigId)
              .map((config) => (
                <div key={config.id}>
                  <p>{config.description}</p>
                  <p>Recruiter team: {config.recruiter}</p>
                  <p>Default source: {config.defaultSource}</p>
                  <p>Follow-up window: {config.followUpWindowDays} days</p>
                </div>
              ))}
          </div>
        </section>

        <section>
          <h2>Platform Settings</h2>
          <label>
            Business name
            <input name="businessName" value={localSettings.businessName} onChange={handleChange} />
          </label>
          <label>
            Follow-up reminder days
            <input
              type="number"
              name="followUpReminderDays"
              value={localSettings.followUpReminderDays}
              onChange={handleChange}
            />
          </label>
          <label>
            Contact email
            <input name="contactEmail" value={localSettings.contactEmail} onChange={handleChange} />
          </label>
          <button className="primary" onClick={handleSave}>
            Save Settings
          </button>
        </section>
      </div>
    </div>
  );
}

export default Settings;
