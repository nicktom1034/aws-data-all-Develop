import { Box, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import ObjectBrief from '../../components/ObjectBrief';
import ObjectMetadata from '../../components/ObjectMetadata';
import PipelineCodeCommit from './PipelineCodeCommit';

const PipelineOverview = (props) => {
  const { pipeline, ...other } = props;

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
            uri={pipeline.sqlPipelineUri || '-'}
            name={pipeline.label || '-'}
            description={pipeline.description || 'No description provided'}
            tags={pipeline.tags && pipeline.tags.length > 0 ? pipeline.tags : ['-']}
          />
        </Box>
        <Box sx={{ sx: 3 }}>
          <PipelineCodeCommit pipeline={pipeline} />
        </Box>

      </Grid>
      <Grid
        item
        lg={4}
        xl={3}
        xs={12}
      >
        <ObjectMetadata
          environment={pipeline.environment}
          region={pipeline.environment?.region}
          organization={pipeline.organization}
          owner={pipeline.owner}
          admins={pipeline.SamlGroupName || '-'}
          created={pipeline.created}
          status={pipeline.stack?.status}
        />
      </Grid>
    </Grid>
  );
};

PipelineOverview.propTypes = {
  pipeline: PropTypes.object.isRequired
};

export default PipelineOverview;
