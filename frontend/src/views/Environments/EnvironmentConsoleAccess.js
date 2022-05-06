import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography
} from '@mui/material';
import { CopyAll } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import getEnvironmentAssumeRoleUrl from '../../api/Environment/getEnvironmentAssumeRoleUrl';
import generateEnvironmentAccessToken from '../../api/Environment/generateEnvironmentAccessToken';
import useClient from '../../hooks/useClient';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';

const EnvironmentConsoleAccess = ({ environment }) => {
  const client = useClient();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoadingUI, setIsLoadingUI] = useState(false);
  const [loadingCreds, setLoadingCreds] = useState(false);

  const generateCredentials = async () => {
    setLoadingCreds(true);
    const response = await client.query(
      generateEnvironmentAccessToken({
        environmentUri: environment.environmentUri
      })
    );
    if (!response.errors) {
      await navigator.clipboard.writeText(
        response.data.generateEnvironmentAccessToken
      );
      enqueueSnackbar('Credentials copied to clipboard', {
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top'
        },
        variant: 'success'
      });
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
    setLoadingCreds(false);
  };

  const goToAWSConsole = async () => {
    setIsLoadingUI(true);
    const response = await client.query(
      getEnvironmentAssumeRoleUrl({
        environmentUri: environment.environmentUri
      })
    );
    if (!response.errors) {
      window.open(response.data.getEnvironmentAssumeRoleUrl, '_blank');
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
    setIsLoadingUI(false);
  };

  return (
    <Card>
      <CardHeader title="AWS Information" />
      <Divider />
      <CardContent>
        <Typography color="textSecondary" variant="subtitle2">
          Account
        </Typography>
        <Typography color="textPrimary" variant="body2">
          {environment.AwsAccountId}
        </Typography>
      </CardContent>
      <CardContent>
        <Typography color="textSecondary" variant="subtitle2">
          S3 bucket
        </Typography>
        <Typography color="textPrimary" variant="body2">
          arn:aws:s3:::
          {environment.EnvironmentDefaultBucketName}
        </Typography>
      </CardContent>
      <CardContent>
        <Typography color="textSecondary" variant="subtitle2">
          Admin Team IAM role
        </Typography>
        <Typography color="textPrimary" variant="body2">
          {environment.EnvironmentDefaultIAMRoleArn}
        </Typography>
      </CardContent>
    </Card>
  );
};
EnvironmentConsoleAccess.propTypes = {
  environment: PropTypes.object.isRequired
};

export default EnvironmentConsoleAccess;
