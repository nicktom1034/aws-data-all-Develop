import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Container, Grid, Link, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Helmet } from 'react-helmet-async';
import useClient from '../../hooks/useClient';
import * as Defaults from '../../components/defaults';
import ChevronRightIcon from '../../icons/ChevronRight';
import PlusIcon from '../../icons/Plus';
import useSettings from '../../hooks/useSettings';
import SearchInput from '../../components/SearchInput';
import Pager from '../../components/Pager';
import { useDispatch } from '../../store';
import { SET_ERROR } from '../../store/errorReducer';
import NotebookListItem from './NotebookListItem';
import listSagemakerStudioUserProfiles from '../../api/SagemakerStudio/listSagemakerStudioUserProfiles';

function NotebookPageHeader() {
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
          ML Studio
        </Typography>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<ChevronRightIcon fontSize="small" />}
          sx={{ mt: 1 }}
        >
          <Link
            color="textPrimary"
            variant="subtitle2"
          >
            Play
          </Link>
          <Link
            color="textPrimary"
            component={RouterLink}
            to="/console/mlstudio"
            variant="subtitle2"
          >
            ML Studio
          </Link>
        </Breadcrumbs>
      </Grid>
      <Grid item>
        <Box sx={{ m: -1 }}>
          <Button
            color="primary"
            component={RouterLink}
            startIcon={<PlusIcon fontSize="small" />}
            sx={{ m: 1 }}
            to="/console/mlstudio/new"
            variant="contained"
          >
            Create
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

const NotebookList = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState(Defaults.PagedResponseDefault);
  const [filter, setFilter] = useState(Defaults.DefaultFilter);
  const { settings } = useSettings();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const client = useClient();

  const fetchItems = async () => {
    setLoading(true);
    const response = await client.query(listSagemakerStudioUserProfiles(filter));
    if (!response.errors) {
      setItems(response.data.listSagemakerStudioUserProfiles);
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
    if ((event.code === 'Enter')) {
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
        <title>ML Studio | data.all</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 5
        }}
      >
        <Container maxWidth={settings.compact ? 'xl' : false}>
          <NotebookPageHeader />
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
                      <NotebookListItem notebook={node} />
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

export default NotebookList;
