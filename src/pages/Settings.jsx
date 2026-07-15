import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useCrm } from "../crmContext.jsx";
import { businessConfigs } from "../data/config.js";

function Settings({ title = "Business Settings", description = "Manage your business information, workflow profile, and platform preferences." }) {
  const { selectedConfigId, setSelectedConfigId, settings, setSettings } = useCrm();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalSettings((current) => ({ ...current, [name]: value }));
  };

  const handleSave = () => setSettings(localSettings);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>{title}</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>{description}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ bgcolor: "#2563eb15", color: "#2563eb", borderRadius: "50%", p: 1 }}>
                <SettingsIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Business Configuration</Typography>
                <Typography variant="body2" color="text.secondary">Choose the workflow profile that best matches the operating model.</Typography>
              </Box>
            </Stack>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Workflow Profile</InputLabel>
              <Select value={selectedConfigId} label="Workflow Profile" onChange={(event) => setSelectedConfigId(event.target.value)}>
                {businessConfigs.map((config) => (
                  <MenuItem key={config.id} value={config.id}>{config.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {businessConfigs.filter((config) => config.id === selectedConfigId).map((config) => (
              <Card key={config.id} elevation={0} sx={{ borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{config.description}</Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2"><strong>Recruiter team:</strong> {config.recruiter}</Typography>
                    <Typography variant="body2"><strong>Default source:</strong> {config.defaultSource}</Typography>
                    <Typography variant="body2"><strong>Follow-up window:</strong> {config.followUpWindowDays} days</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Platform Settings</Typography>
            <Stack spacing={2}>
              <TextField label="Business Name" name="businessName" value={localSettings.businessName || ""} onChange={handleChange} fullWidth />
              <TextField label="Follow-up Reminder Days" name="followUpReminderDays" type="number" value={localSettings.followUpReminderDays || 0} onChange={handleChange} fullWidth />
              <TextField label="Contact Email" name="contactEmail" value={localSettings.contactEmail || ""} onChange={handleChange} fullWidth />
              <Button variant="contained" onClick={handleSave}>Save Settings</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Settings;
