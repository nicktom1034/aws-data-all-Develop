import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Container, Grid, Link, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Helmet } from 'react-helmet-async';
import { CloudDownloadOutlined } from '@material-ui/icons';
import { MdShowChart } from 'react-icons/md';
import useClient from '../../hooks/useClient';
import * as Defaults from '../../components/defaults';
import ChevronRightIcon from '../../icons/ChevronRight';
import useSettings from '../../hooks/useSettings';
import SearchInput from '../../components/SearchInput';
import Pager from '../../components/Pager';
import { useDispatch } from '../../store';
import { SET_ERROR } from '../../store/errorReducer';
import DashboardListItem from './DashboardListItem';
import searchDashboards from '../../api/Dashboard/searchDashboards';

function DashboardPageHeader() {
  return (
    <Grid
      alignItems="center"
      container
      justifyContent="space-between"
      spacing={3}
    >
      <Grid item>
        <Typography
          color="textPrimary"
          variant="h5"
        >
          Dashboards
        </Typography>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<ChevronRightIcon fontSize="small" />}
          sx={{ mt: 1 }}
        >
          <Typography
            color="textPrimary"
            variant="subtitle2"
          >
            Play
          </Typography>
          <Link
            color="textPrimary"
            component={RouterLink}
            to="/console/dashboards"
            variant="subtitle2"
          >
            Dashboards
          </Link>
        </Breadcrumbs>
      </Grid>
      <Grid item>
        <Box sx={{ m: -1 }}>
          <Button
            color="primary"
            component={RouterLink}
            startIcon={<CloudDownloadOutlined fontSize="small" />}
            sx={{ m: 1 }}
            to="/console/dashboards/import"
            variant="outlined"
          >
            Import
          </Button>
          <Button
            color="primary"
            component={RouterLink}
            startIcon={<MdShowChart size={20} />}
            sx={{ m: 1 }}
            to="/console/dashboards/session"
            variant="contained"
          >
            QuickSight
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

const DashboardList = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState(Defaults.PagedResponseDefault);
  const [filter, setFilter] = useState(Defaults.DefaultFilter);
  const { settings } = useSettings();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const client = useClient();

  const fetchItems = async () => {
    setLoading(true);
    const response = await client.query(searchDashboards(filter));
    if (!response.errors) {
      setItems(response.data.searchDashboards);
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
    setLoading(false);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setFilter({ ...filter, term: event.target.value });
  };

  const handleInputKeyup = (event) => {
    if (event.code === 'Enter') {
      fetchItems().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
    }
  };

  const handlePageChange = async (event, value) => {
    if (value <= items.pages && value !== items.page) {
      await setFilter({ ...filter, page: value });
    }
  };

  useEffect(() => {
    if (client) {
      fetchItems().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
    }
  }, [client, filter.page]);

  return (
    <>
      <Helmet>
        <title>Dashboards | data.all</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 5
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <DashboardPageHeader />
          <Box sx={{ mt: 3 }}>
            <SearchInput
              onChange={handleInputChange}
              onKeyUp={handleInputKeyup}
              value={inputValue}
            />
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              mt: 3
            }}
          >
            {loading ? <CircularProgress />
              : (
                <Box>
                  <Grid
                    container
                    spacing={3}
                  >
                    {items.nodes.map((node) => (
                      <DashboardListItem dashboard={node} />
                    ))}
                  </Grid>

                  <Pager
                    items={items}
                    onChange={handlePageChange}
                  />
                </Box>
              )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default DashboardList;
