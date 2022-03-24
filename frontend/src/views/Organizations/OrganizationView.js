import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ArchiveOutlined, Info, SupervisedUserCircleRounded, Warning } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import { FaAws } from 'react-icons/all';
import useSettings from '../../hooks/useSettings';
import ChevronRightIcon from '../../icons/ChevronRight';
import PencilAltIcon from '../../icons/PencilAlt';
import useClient from '../../hooks/useClient';
import getOrganization from '../../api/Organization/getOrganization';
import OrganizationEnvironments from './OrganizationEnvironments';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import archiveOrganization from '../../api/Organization/archiveOrganization';
import ArchiveObjectWithFrictionModal from '../../components/ArchiveObjectWithFrictionModal';
import OrganizationTeams from './OrganizationTeams';
import OrganizationOverview from './OrganizationOverview';

const tabs = [
  { label: 'Overview', value: 'overview', icon: <Info fontSize="small" /> },
  { label: 'Environments', value: 'environments', icon: <FaAws size={20} /> },
  { label: 'Teams', value: 'teams', icon: <SupervisedUserCircleRounded fontSize="small" /> }
];

const OrganizationView = () => {
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const dispatch = useDispatch();
  const params = useParams();
  const client = useClient();
  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isArchiveObjectModalOpen, setIsArchiveObjectModalOpen] = useState(false);
  const handleArchiveObjectModalOpen = () => {
    setIsArchiveObjectModalOpen(true);
  };

  const handleArchiveObjectModalClose = () => {
    setIsArchiveObjectModalOpen(false);
  };

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const archiveOrg = async () => {
    const response = await client.mutate(archiveOrganization(org.organizationUri));
    if (!response.errors) {
      enqueueSnackbar('Organization archived', {
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top'
        },
        variant: 'success'
      });
      navigate('/console/organizations');
      setLoading(false);
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
  };

  const fetchItem = async () => {
    const response = await client.query(getOrganization(params.uri));
    if (!response.errors) {
      setOrg(response.data.getOrganization);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (client) {
      fetchItem().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
    }
  }, [client]);

  if (!org) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Organizations: Organization Details | data.all</title>
      </Helmet>
      {loading ? <CircularProgress />
        : (
          <Box
            sx={{
              backgroundColor: 'background.default',
              minHeight: '100%',
              py: 8
            }}
          >
            <Container maxWidth={settings.compact ? 'xl' : false}>
              <Grid
                container
                justifyContent="space-between"
                spacing={3}
              >
                <Grid item>
                  <Typography
                    color="textPrimary"
                    variant="h5"
                  >
                    Organization
                    {' '}
                    {org.label}
                  </Typography>
                  <Breadcrumbs
                    aria-label="breadcrumb"
                    separator={<ChevronRightIcon fontSize="small" />}
                    sx={{ mt: 1 }}
                  >
                    <Link
                      color="textPrimary"
                      component={RouterLink}
                      to="/console/organizations"
                      variant="subtitle2"
                    >
                      Admin
                    </Link>
                    <Link
                      color="textPrimary"
                      component={RouterLink}
                      to="/console/organizations"
                      variant="subtitle2"
                    >
                      Organizations
                    </Link>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                    >
                      {org.label}
                    </Typography>
                  </Breadcrumbs>
                </Grid>
                <Grid item>
                  <Box sx={{ m: -1 }}>
                    <Button
                      color="primary"
                      component={RouterLink}
                      startIcon={<PencilAltIcon fontSize="small" />}
                      sx={{ m: 1 }}
                      variant="outlined"
                      to={`/console/organizations/${org.organizationUri}/edit`}
                    >
                      Edit
                    </Button>
                    <Button
                      color="primary"
                      startIcon={<ArchiveOutlined />}
                      sx={{ m: 1 }}
                      variant="outlined"
                      onClick={handleArchiveObjectModalOpen}
                    >
                      Archive
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Tabs
                  indicatorColor="primary"
                  onChange={handleTabsChange}
                  scrollButtons="auto"
                  textColor="primary"
                  value={currentTab}
                  variant="scrollable"
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                      icon={settings.tabIcons ? tab.icon : null}
                    />
                  ))}
                </Tabs>
              </Box>
              <Divider />
              <Box sx={{ mt: 3 }}>
                {currentTab === 'overview'
                && <OrganizationOverview organization={org} />}
                {currentTab === 'teams'
                && <OrganizationTeams organization={org} />}
                {currentTab === 'environments'
                && <OrganizationEnvironments organization={org} />}
              </Box>
            </Container>
          </Box>
        )}
      {isArchiveObjectModalOpen && (
      <ArchiveObjectWithFrictionModal
        objectName={org.label}
        onApply={handleArchiveObjectModalClose}
        onClose={handleArchiveObjectModalClose}
        open={isArchiveObjectModalOpen}
        archiveFunction={archiveOrg}
        archiveMessage={(
          <Card
            variant="outlined"
            color="error"
            sx={{ mb: 2 }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="error"
              >
                <Warning sx={{ mr: 1 }} />
                {' '}
                Remove all environments linked to the organization before archiving !
              </Typography>
            </CardContent>
          </Card>
              )}
      />
      )}
    </>
  );
};

export default OrganizationView;
