import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import * as PropTypes from 'prop-types';
import { FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { ForumOutlined, Warning } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import useSettings from '../../hooks/useSettings';
import useClient from '../../hooks/useClient';
import ChevronRightIcon from '../../icons/ChevronRight';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import DeleteObjectModal from '../../components/DeleteObjectModal';
import deleteDatasetStorageLocation from '../../api/Dataset/removeDatasetStorageLocation';
import getDatasetStorageLocation from '../../api/Dataset/getDatasetStorageLocation';
import FolderOverview from './FolderOverview';
import PencilAltIcon from '../../icons/PencilAlt';
import FeedComments from '../Feed/FeedComments';
import getDatasetAdminConsoleUrl from '../../api/Dataset/getDatasetAdminConsoleUrl';

const tabs = [{ label: 'Overview', value: 'overview' }];

function FolderPageHeader(props) {
  const { folder, handleDeleteObjectModalOpen, isAdmin } = props;
  const client = useClient();
  const dispatch = useDispatch();
  const [isLoadingUI, setIsLoadingUI] = useState(false);
  const [openFeed, setOpenFeed] = useState(false);

  const goToS3Console = async () => {
    setIsLoadingUI(true);
    const response = await client.query(
      getDatasetAdminConsoleUrl(folder.dataset.datasetUri)
    );
    if (!response.errors) {
      window.open(response.data.getDatasetAssumeRoleUrl, '_blank');
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
    setIsLoadingUI(false);
  };
  return (
    <Grid container justifyContent="space-between" spacing={3}>
      <Grid item>
        <Typography color="textPrimary" variant="h5">
          Folder {folder.label}
        </Typography>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<ChevronRightIcon fontSize="small" />}
          sx={{ mt: 1 }}
        >
          <Link
            underline="hover"
            component={RouterLink}
            color="textPrimary"
            variant="subtitle2"
            to="/console/catalog"
          >
            Discover
          </Link>
          <Link
            underline="hover"
            color="textPrimary"
            component={RouterLink}
            to="/console/datasets"
            variant="subtitle2"
          >
            Datasets
          </Link>
          <Link
            underline="hover"
            color="textPrimary"
            component={RouterLink}
            to={`/console/datasets/${folder?.dataset?.datasetUri}`}
            variant="subtitle2"
          >
            {folder?.dataset?.name}
          </Link>
          <Link
            underline="hover"
            color="textPrimary"
            component={RouterLink}
            to={`/console/datasets/folder/${folder.locationUri}`}
            variant="subtitle2"
          >
            {folder.label}
          </Link>
        </Breadcrumbs>
      </Grid>
      {isAdmin && (
        <Grid item>
          <Box sx={{ m: -1 }}>
            <Button
              color="primary"
              startIcon={<ForumOutlined fontSize="small" />}
              sx={{ m: 1 }}
              onClick={() => setOpenFeed(true)}
              type="button"
              variant="outlined"
            >
              Chat
            </Button>
            {isAdmin && (
              <LoadingButton
                loading={isLoadingUI}
                startIcon={<FaExternalLinkAlt size={15} />}
                variant="outlined"
                color="primary"
                sx={{ m: 1 }}
                onClick={goToS3Console}
              >
                S3 Bucket
              </LoadingButton>
            )}
            <Button
              color="primary"
              component={RouterLink}
              startIcon={<PencilAltIcon fontSize="small" />}
              sx={{ m: 1 }}
              to={`/console/datasets/folder/${folder.locationUri}/edit`}
              variant="outlined"
            >
              Edit
            </Button>
            <Button
              color="primary"
              startIcon={<FaTrash size={15} />}
              sx={{ m: 1 }}
              onClick={handleDeleteObjectModalOpen}
              type="button"
              variant="outlined"
            >
              Delete
            </Button>
          </Box>
        </Grid>
      )}
      {openFeed && (
        <FeedComments
          objectOwner={folder.dataset.owner}
          targetType="DatasetStorageLocation"
          targetUri={folder.locationUri}
          open={openFeed}
          onClose={() => setOpenFeed(false)}
        />
      )}
    </Grid>
  );
}

FolderPageHeader.propTypes = {
  folder: PropTypes.object.isRequired,
  handleDeleteObjectModalOpen: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
};
const FolderView = () => {
  const dispatch = useDispatch();
  const { settings } = useSettings();
  const params = useParams();
  const client = useClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [folder, setFolder] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isDeleteObjectModalOpen, setIsDeleteObjectModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleDeleteObjectModalOpen = () => {
    setIsDeleteObjectModalOpen(true);
  };
  const handleDeleteObjectModalClose = () => {
    setIsDeleteObjectModalOpen(false);
  };

  const deleteFolder = async () => {
    const response = await client.mutate(
      deleteDatasetStorageLocation({ locationUri: folder.locationUri })
    );
    if (!response.errors) {
      enqueueSnackbar('Folder deleted', {
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top'
        },
        variant: 'success'
      });
      navigate(`/console/datasets/${folder.dataset.datasetUri}`);
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
  };

  const fetchItem = async () => {
    setLoading(true);
    const response = await client.query(getDatasetStorageLocation(params.uri));
    if (!response.errors && response.data.getDatasetStorageLocation !== null) {
      setFolder(response.data.getDatasetStorageLocation);
      setIsAdmin(
        ['Creator', 'Admin', 'Owner'].indexOf(
          response.data.getDatasetStorageLocation.dataset.userRoleForDataset
        ) !== -1
      );
    } else {
      setFolder(null);
      const error = response.errors[0].message;
      dispatch({ type: SET_ERROR, error });
    }
    setLoading(false);
  };
  useEffect(() => {
    if (client) {
      fetchItem().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
    }
  }, [client]);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  if (loading) {
    return <CircularProgress />;
  }
  if (!folder) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Folders: Folder Details | data.all</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <FolderPageHeader
            folder={folder}
            handleDeleteObjectModalOpen={handleDeleteObjectModalOpen}
            isAdmin={isAdmin}
          />
          <Box sx={{ mt: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="fullWidth"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  icon={settings.tabIcons ? tab.icon : null}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>
          <Divider />
          <Box sx={{ mt: 3 }}>
            {currentTab === 'overview' && (
              <FolderOverview folder={folder} isAdmin={isAdmin} />
            )}
          </Box>
        </Container>
      </Box>
      {isAdmin && (
        <DeleteObjectModal
          objectName={folder.label}
          onApply={handleDeleteObjectModalClose}
          onClose={handleDeleteObjectModalClose}
          open={isDeleteObjectModalOpen}
          deleteFunction={deleteFolder}
          deleteMessage={
            <Card>
              <CardContent>
                <Typography gutterBottom variant="body2">
                  <Warning /> Folder will be deleted from data.all catalog, but
                  will still be available on Amazon S3.
                </Typography>
              </CardContent>
            </Card>
          }
        />
      )}
    </>
  );
};

export default FolderView;
