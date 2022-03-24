import { Box, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import ObjectBrief from '../../components/ObjectBrief';
import ObjectMetadata from '../../components/ObjectMetadata';
import FolderS3Properties from './FolderS3Properties';

const FolderOverview = (props) => {
  const { folder, isAdmin, ...other } = props;

  return (
    <Grid
      container
      spacing={3}
      {...other}
    >
      <Grid
        item
        lg={8}
        xl={9}
        xs={12}
      >
        <Box sx={{ mb: 3 }}>
          <ObjectBrief
            title="Details"
            uri={folder.locationUri || '-'}
            name={folder.label || '-'}
            description={folder.description || 'No description provided'}
            tags={folder.tags && folder.tags.length > 0 ? folder.tags : ['-']}
            terms={folder.terms && folder.terms.nodes.length > 0 ? folder.terms.nodes : [{ label: '-', nodeUri: '-' }]}
          />
        </Box>
        <FolderS3Properties
          folder={folder}
          isAdmin={isAdmin}
        />
      </Grid>
      <Grid
        item
        lg={4}
        xl={3}
        xs={12}
      >
        <ObjectMetadata
          environment={folder.dataset.environment.label}
          region={folder.dataset.region}
          organization={folder.dataset.organization.label}
          owner={folder.owner}
          admins={folder.dataset.SamlAdminGroupName || '-'}
          created={folder.created}
        />
      </Grid>
    </Grid>
  );
};

FolderOverview.propTypes = {
  folder: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default FolderOverview;
