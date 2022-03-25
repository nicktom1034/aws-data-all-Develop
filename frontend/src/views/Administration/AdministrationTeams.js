import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import * as BsIcons from 'react-icons/bs';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/styles';
import { VscChecklist } from 'react-icons/vsc';
import useClient from '../../hooks/useClient';
import * as Defaults from '../../components/defaults';
import SearchIcon from '../../icons/Search';
import Scrollbar from '../../components/Scrollbar';
import RefreshTableMenu from '../../components/RefreshTableMenu';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import Pager from '../../components/Pager';
import listTenantGroups from '../../api/Tenant/listTenantGroups';
import TeamPermissionsEditForm from './TeamPermissionsEditForm';

function TeamRow({ team, fetchItems }) {
  const theme = useTheme();
  const [isTeamEditModalOpen, setIsTeamEditModalOpen] = useState(false);
  const handleTeamEditModalClose = () => {
    setIsTeamEditModalOpen(false);
  };

  const handleTeamEditModalOpen = () => {
    setIsTeamEditModalOpen(true);
  };
  return (
    <TableRow hover>
      <TableCell>{team.groupUri} </TableCell>
      <TableCell>
        <LoadingButton onClick={() => handleTeamEditModalOpen(team)}>
          <VscChecklist
            size={20}
            color={
              theme.palette.mode === 'dark'
                ? theme.palette.primary.contrastText
                : theme.palette.primary.main
            }
          />
        </LoadingButton>
        {isTeamEditModalOpen && (
          <TeamPermissionsEditForm
            team={team}
            open
            reloadTeams={fetchItems}
            onClose={handleTeamEditModalClose}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

TeamRow.propTypes = {
  team: PropTypes.any,
  fetchItems: PropTypes.any
};
const AdministrationTeams = () => {
  const client = useClient();
  const dispatch = useDispatch();
  const [items, setItems] = useState(Defaults.PagedResponseDefault);
  const [filter, setFilter] = useState(Defaults.DefaultFilter);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const fetchItems = async () => {
    try {
      const response = await client.query(listTenantGroups(filter));
      if (!response.errors) {
        setItems(response.data.listTenantGroups);
      } else {
        dispatch({ type: SET_ERROR, error: response.errors[0].message });
      }
    } catch (e) {
      dispatch({ type: SET_ERROR, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setFilter({ ...filter, term: event.target.value });
  };

  const handleInputKeyup = (event) => {
    if (event.code === 'Enter') {
      fetchItems().catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
    }
  };

  const handlePageChange = async (event, value) => {
    if (value <= items.pages && value !== items.page) {
      await setFilter({ ...filter, page: value });
    }
  };

  useEffect(() => {
    if (client) {
      fetchItems().catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
    }
  }, [client, filter.page]);

  return (
    <Box>
      <Card>
        <CardHeader
          action={<RefreshTableMenu refresh={fetchItems} />}
          title={
            <Box>
              <BsIcons.BsPeople style={{ marginRight: '10px' }} /> Tenant Teams
            </Box>
          }
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
          <Grid item md={10} sm={6} xs={12}>
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
          </Grid>
        </Box>
        <Scrollbar>
          <Box sx={{ minWidth: 600 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Permissions</TableCell>
                </TableRow>
              </TableHead>
              {loading ? (
                <CircularProgress sx={{ mt: 1 }} />
              ) : (
                <TableBody>
                  {items.nodes.length > 0 ? (
                    items.nodes.map((team) => (
                      <TeamRow team={team} fetchItems={fetchItems} />
                    ))
                  ) : (
                    <TableRow hover>
                      <TableCell>No Team invited</TableCell>
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
    </Box>
  );
};

AdministrationTeams.propTypes = {};

export default AdministrationTeams;
