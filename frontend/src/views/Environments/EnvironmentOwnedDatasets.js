import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router';
import useClient from '../../hooks/useClient';
import * as Defaults from '../../components/defaults';
import SearchIcon from '../../icons/Search';
import Scrollbar from '../../components/Scrollbar';
import StackStatus from '../../components/StackStatus';
import ArrowRightIcon from '../../icons/ArrowRight';
import listDatasetsCreatedInEnvironment from '../../api/Environment/listDatasetsCreatedInEnvironment';
import RefreshTableMenu from '../../components/RefreshTableMenu';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import Pager from '../../components/Pager';

const EnvironmentOwnedDatasets = ({ environment }) => {
  const client = useClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [items, setItems] = useState(Defaults.PagedResponseDefault);
  const [filter, setFilter] = useState(Defaults.DefaultFilter);
  const [loading, setLoading] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const response = await client.query(
      listDatasetsCreatedInEnvironment({
        filter,
        environmentUri: environment.environmentUri
      })
    );
    if (!response.errors) {
      setItems({ ...response.data.listDatasetsCreatedInEnvironment });
    }
    setLoading(false);
  }, [client, environment, filter]);

  useEffect(() => {
    if (client) {
      fetchItems().catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
    }
  }, [client, filter.page, fetchItems, dispatch]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setFilter({ ...filter, term: event.target.value });
  };

  const handleInputKeyup = (event) => {
    if (event.code === 'Enter') {
      fetchItems();
    }
  };

  const handlePageChange = async (event, value) => {
    if (value <= items.pages && value !== items.page) {
      await setFilter({ ...filter, page: value });
    }
  };

  return (
    <Card>
      <CardHeader
        action={<RefreshTableMenu refresh={fetchItems} />}
        title="Datasets You Own"
      />
      <Divider />
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          m: -1,
          p: 2
        }}
      >
        <Box
          sx={{
            m: 1,
            maxWidth: '100%',
            width: 500
          }}
        >
          <TextField
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            onChange={handleInputChange}
            onKeyUp={handleInputKeyup}
            placeholder="Search"
            value={inputValue}
            variant="outlined"
          />
        </Box>
      </Box>
      <Scrollbar>
        <Box sx={{ minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>AWS Account</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <CircularProgress sx={{ mt: 1 }} />
            ) : (
              <TableBody>
                {items.nodes.length > 0 ? (
                  items.nodes.map((dataset) => (
                    <TableRow hover key={dataset.environmentUri}>
                      <TableCell>{dataset.label}</TableCell>
                      <TableCell>{dataset.AwsAccountId}</TableCell>
                      <TableCell>{dataset.region}</TableCell>
                      <TableCell>
                        <StackStatus
                          status={
                            dataset.stack ? dataset.stack.status : 'NOT_FOUND'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            navigate(`/console/datasets/${dataset.datasetUri}`);
                          }}
                        >
                          <ArrowRightIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow hover>
                    <TableCell>No datasets found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
          {!loading && items.nodes.length > 0 && (
            <Pager
              mgTop={2}
              mgBottom={2}
              items={items}
              onChange={handlePageChange}
            />
          )}
        </Box>
      </Scrollbar>
    </Card>
  );
};

EnvironmentOwnedDatasets.propTypes = {
  environment: PropTypes.object.isRequired
};

export default EnvironmentOwnedDatasets;
