import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Breadcrumbs,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { RiInboxArchiveLine } from 'react-icons/ri';
import { FiSend } from 'react-icons/fi';
import useSettings from '../../hooks/useSettings';
import ChevronRightIcon from '../../icons/ChevronRight';
import ShareInboxList from './ShareInboxList';
import ShareOutboxList from './ShareOutboxList';

const tabs = [
  { label: 'Received', value: 'inbox', icon: <RiInboxArchiveLine size={20} /> },
  { label: 'Sent', value: 'outbox', icon: <FiSend size={20} /> }
];

const ShareList = () => {
  const { settings } = useSettings();
  const [currentTab, setCurrentTab] = useState('inbox');

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  return (
    <>
      <Helmet>
        <title>Shares: Share Requests Management | data.all</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 5
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item>
              <Typography color="textPrimary" variant="h5">
                Share Requests
              </Typography>
              <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Typography color="textPrimary" variant="subtitle2">
                  Shares
                </Typography>
                <Link
                  underline="hover"
                  color="textPrimary"
                  component={RouterLink}
                  to="/console/shares"
                  variant="subtitle2"
                >
                  Share Requests
                </Link>
              </Breadcrumbs>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="fullWidth"
              centered
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  icon={tab.icon}
                />
              ))}
            </Tabs>
          </Box>
          <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === 'inbox' && <ShareInboxList />}
            {currentTab === 'outbox' && <ShareOutboxList />}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ShareList;
