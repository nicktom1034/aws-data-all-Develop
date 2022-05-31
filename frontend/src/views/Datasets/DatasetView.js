import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { FaAws, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import {
  ForumOutlined,
  Info,
  LocalOffer,
  ShareOutlined,
  Upload,
  ViewArrayOutlined
} from '@mui/icons-material';
import useSettings from '../../hooks/useSettings';
import useClient from '../../hooks/useClient';
import ChevronRightIcon from '../../icons/ChevronRight';
import Stack from '../Stack/Stack';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import getDataset from '../../api/Dataset/getDataset';
import DatasetOverview from './DatasetOverview';
import PencilAltIcon from '../../icons/PencilAlt';
import DeleteObjectWithFrictionModal from '../../components/DeleteObjectWithFrictionModal';
import UpVoteButton from '../../components/UpVoteButton';
import deleteDataset from '../../api/Dataset/deleteDataset';
import ShareInboxList from '../Shares/ShareInboxList';
import DatasetUpload from './DatasetUpload';
import FeedComments from '../Feed/FeedComments';
import StackStatus from '../Stack/StackStatus';
import KeyValueTagList from '../KeyValueTags/KeyValueTagList';
import getVote from '../../api/Vote/getVote';
import upVote from '../../api/Vote/upVote';
import countUpVotes from '../../api/Vote/countUpVotes';
import DatasetData from './DatasetData';
import DatasetAWSActions from './DatasetAWSActions';

const DatasetView = () => {
  const dispatch = useDispatch();
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();
  const client = useClient();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('data');
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState(null);
  const [isDeleteObjectModalOpen, setIsDeleteObjectModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpVoted, setIsUpVoted] = useState(false);
  const [upVotes, setUpvotes] = useState(null);
  const [stack, setStack] = useState(null);
  const [openFeed, setOpenFeed] = useState(false);

  const getTabs = () => {
    const tabs = [
      {
        label: 'Data',
        value: 'data',
        icon: <ViewArrayOutlined fontSize="small" />
      },
      { label: 'Overview', value: 'overview', icon: <Info fontSize="small" /> }
    ];
    if (isAdmin) {
      tabs.push({
        label: 'Shares',
        value: 'shares',
        icon: <ShareOutlined fontSize="small" />
      });
      tabs.push({
        label: 'Upload',
        value: 'upload',
        icon: <Upload fontSize="small" />
      });
      if (settings.isAdvancedMode) {
        tabs.push({
          label: 'Tags',
          value: 'tags',
          icon: <LocalOffer fontSize="small" />
        });
        tabs.push({
          label: 'Stack',
          value: 'stack',
          icon: <FaAws size={20} />
        });
      }
    }
    return tabs;
  };

  const handleDeleteObjectModalOpen = () => {
    setIsDeleteObjectModalOpen(true);
  };

  const handleDeleteObjectModalClose = () => {
    setIsDeleteObjectModalOpen(false);
  };

  const getUserDatasetVote = useCallback(
    async (datasetUri) => {
      const response = await client.query(getVote(datasetUri, 'dataset'));
      if (!response.errors && response.data.getVote !== null) {
        setIsUpVoted(response.data.getVote.upvote);
      }
    },
    [client]
  );

  const reloadVotes = async () => {
    const response = await client.query(countUpVotes(params.uri, 'dataset'));
    if (!response.errors && response.data.countUpVotes !== null) {
      setUpvotes(response.data.countUpVotes);
    } else {
      setUpvotes(0);
    }
  };

  const upVoteDataset = async (datasetUri) => {
    const response = await client.mutate(
      upVote({
        targetUri: datasetUri,
        targetType: 'dataset',
        upvote: !isUpVoted
      })
    );
    if (!response.errors && response.data.upVote !== null) {
      setIsUpVoted(response.data.upVote.upvote);
    }
    reloadVotes().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
  };

  const fetchItem = useCallback(async () => {
    setLoading(true);
    const response = await client.query(getDataset(params.uri));
    if (!response.errors && response.data.getDataset !== null) {
      setDataset(response.data.getDataset);
      setIsAdmin(
        ['BusinessOwner', 'Admin', 'DataSteward', 'Creator'].indexOf(
          response.data.getDataset.userRoleForDataset
        ) !== -1
      );
      setUpvotes(response.data.getDataset.statistics.upvotes);
      if (response.data.getDataset.stack) {
        setStack(response.data.getDataset.stack);
      } else {
        setStack({ status: 'CREATE_FAILED' });
      }
    } else {
      const error = response.errors
        ? response.errors[0].message
        : 'Dataset not found';
      dispatch({ type: SET_ERROR, error });
    }
    setLoading(false);
  }, [client, dispatch, params.uri]);

  useEffect(() => {
    if (client) {
      getUserDatasetVote(params.uri).catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
      fetchItem().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
    }
  }, [client, fetchItem, getUserDatasetVote, dispatch, params.uri]);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const removeDataset = async (deleteFromAWS = false) => {
    const response = await client.mutate(
      deleteDataset(dataset.datasetUri, deleteFromAWS)
    );
    if (!response.errors) {
      handleDeleteObjectModalClose();
      enqueueSnackbar('Dataset deleted', {
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top'
        },
        variant: 'success'
      });
      navigate('/console/datasets');
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }
  if (!dataset) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Datasets: Dataset Details | data.all</title>
      </Helmet>
      {isAdmin && (
        <StackStatus
          stack={stack}
          setStack={setStack}
          environmentUri={dataset.environment?.environmentUri}
        />
      )}
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 8
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item>
              <Typography color="textPrimary" variant="h5">
                Dataset {dataset.label}
              </Typography>
              <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                <Typography color="textPrimary" variant="subtitle2">
                  Contribute
                </Typography>
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
                  to={`/console/datasets/${dataset.datasetUri}`}
                  variant="subtitle2"
                >
                  {dataset.label}
                </Link>
              </Breadcrumbs>
            </Grid>
            {isAdmin && (
              <Grid item>
                <Box sx={{ m: -1 }}>
                  <UpVoteButton
                    upVoted={isUpVoted}
                    onClick={() => upVoteDataset(dataset.datasetUri)}
                    upVotes={upVotes}
                  />
                  <Button
                    color="primary"
                    startIcon={<ForumOutlined fontSize="small" />}
                    sx={{ mt: 1, mr: 1 }}
                    onClick={() => setOpenFeed(true)}
                    type="button"
                    variant="outlined"
                  >
                    Chat
                  </Button>
                  <DatasetAWSActions dataset={dataset} isAdmin={isAdmin} />
                  <Button
                    color="primary"
                    component={RouterLink}
                    startIcon={<PencilAltIcon fontSize="small" />}
                    sx={{ mt: 1, mr: 1 }}
                    to={`/console/datasets/${dataset.datasetUri}/edit`}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    color="primary"
                    startIcon={<FaTrash size={15} />}
                    sx={{ mt: 1 }}
                    onClick={handleDeleteObjectModalOpen}
                    type="button"
                    variant="outlined"
                  >
                    Delete
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="fullWidth"
            >
              {getTabs().map((tab) => (
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
            {currentTab === 'data' && (
              <DatasetData dataset={dataset} isAdmin={isAdmin} />
            )}
            {currentTab === 'overview' && (
              <DatasetOverview dataset={dataset} isAdmin={isAdmin} />
            )}
            {isAdmin && currentTab === 'shares' && (
              <ShareInboxList dataset={dataset} />
            )}
            {isAdmin && currentTab === 'upload' && (
              <DatasetUpload dataset={dataset} isAdmin={isAdmin} />
            )}
            {isAdmin && currentTab === 'tags' && (
              <KeyValueTagList
                targetUri={dataset.datasetUri}
                targetType="dataset"
              />
            )}
            {isAdmin && currentTab === 'stack' && (
              <Stack
                environmentUri={dataset.environment.environmentUri}
                stackUri={dataset.stack.stackUri}
                targetUri={dataset.datasetUri}
                targetType="dataset"
              />
            )}
          </Box>
        </Container>
      </Box>
      {isAdmin && (
        <DeleteObjectWithFrictionModal
          objectName={dataset.label}
          onApply={handleDeleteObjectModalClose}
          onClose={handleDeleteObjectModalClose}
          open={isDeleteObjectModalOpen}
          deleteFunction={removeDataset}
          isAWSResource
        />
      )}
      {openFeed && (
        <FeedComments
          objectOwner={dataset.owner}
          targetType="Dataset"
          targetUri={dataset.datasetUri}
          open={openFeed}
          onClose={() => setOpenFeed(false)}
        />
      )}
    </>
  );
};

export default DatasetView;
