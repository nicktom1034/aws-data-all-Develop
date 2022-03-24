import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Divider, List, ListItem, Typography } from '@material-ui/core';
import useClient from '../../hooks/useClient';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import getRedshiftClusterDatabaseCredentials from '../../api/RedshiftCluster/getClusterDatabaseCredentials';

const WarehouseCredentials = (props) => {
  const { warehouse } = props;
  const client = useClient();
  const dispatch = useDispatch();
  const [clusterCredentials, setClusterCredentials] = useState({ password: '-' });
  const getCredentials = async () => {
    const response = await client.query(
      getRedshiftClusterDatabaseCredentials(warehouse.clusterUri)
    );
    if (!response.errors) {
      setClusterCredentials({ ...response.data.getRedshiftClusterDatabaseCredentials });
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
  };

  useEffect(() => {
    if (client && warehouse) {
      getCredentials().catch((e) => dispatch({ type: SET_ERROR, error: e.message }));
    }
  }, [client]);

  return (
    <Card {...warehouse}>
      <CardHeader title="Credentials" />
      <Divider />
      <CardContent sx={{ pt: 0 }}>
        <List>
          <ListItem
            disableGutters
            divider
            sx={{
              justifyContent: 'space-between',
              padding: 2
            }}
          >
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              Cluster identifier
            </Typography>
            <Typography
              color="textPrimary"
              variant="body2"
            >
              {warehouse.name}
            </Typography>
          </ListItem>
          <ListItem
            disableGutters
            divider
            sx={{
              justifyContent: 'space-between',
              padding: 2
            }}
          >
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              Database name
            </Typography>
            <Typography
              color="textPrimary"
              variant="body2"
            >
              {warehouse.databaseName}
            </Typography>
          </ListItem>
          <ListItem
            disableGutters
            divider
            sx={{
              justifyContent: 'space-between',
              padding: 2
            }}
          >
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              Database user
            </Typography>
            <Typography
              color="textPrimary"
              variant="body2"
            >
              {warehouse.databaseUser}
            </Typography>
          </ListItem>
          <ListItem
            disableGutters
            divider
            sx={{
              justifyContent: 'space-between',
              padding: 2
            }}
          >
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              Database password
            </Typography>
            <Typography
              color="textPrimary"
              variant="body2"
            >
              {clusterCredentials?.password || '-'}
            </Typography>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

WarehouseCredentials.propTypes = {
  warehouse: PropTypes.object.isRequired
};

export default WarehouseCredentials;
