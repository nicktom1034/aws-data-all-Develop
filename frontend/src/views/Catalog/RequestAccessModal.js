import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import {
  Box,
  CardContent,
  CircularProgress,
  Dialog,
  FormHelperText,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import React, { useCallback, useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import useClient from '../../hooks/useClient';
import listEnvironments from '../../api/Environment/listEnvironments';
import createShareObject from '../../api/ShareObject/createShareObject';
import listEnvironmentGroups from '../../api/Environment/listEnvironmentGroups';
import requestDashboardShare from '../../api/Dashboard/requestDashboardShare';
import * as Defaults from '../../components/defaults';

const RequestAccessModal = (props) => {
  const { hit, onApply, onClose, open, stopLoader, ...other } = props;
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const client = useClient();
  const [environmentOptions, setEnvironmentOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);

  const fetchEnvironments = useCallback(async () => {
    const response = await client.query(
      listEnvironments({
        filter: Defaults.SelectListFilter
      })
    );
    if (!response.errors) {
      setEnvironmentOptions(
        response.data.listEnvironments.nodes.map((e) => ({
          ...e,
          value: e.environmentUri,
          label: e.label
        }))
      );
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
    if (stopLoader) {
      stopLoader();
    }
  }, [client, dispatch, stopLoader]);

  const fetchGroups = async (environmentUri) => {
    setLoadingGroups(true);
    try {
      const response = await client.query(
        listEnvironmentGroups({
          filter: Defaults.SelectListFilter,
          environmentUri
        })
      );
      if (!response.errors) {
        setGroupOptions(
          response.data.listEnvironmentGroups.nodes.map((g) => ({
            value: g.groupUri,
            label: g.groupUri
          }))
        );
      } else {
        dispatch({ type: SET_ERROR, error: response.errors[0].message });
      }
    } catch (e) {
      dispatch({ type: SET_ERROR, error: e.message });
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (client && open) {
      fetchEnvironments().catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
    }
  }, [client, open, fetchEnvironments, dispatch]);

  async function submit(values, setStatus, setSubmitting, setErrors) {
    try {
      let response;
      if (hit.resourceKind === 'dataset') {
        response = await client.mutate(
          createShareObject({
            datasetUri: hit._id,
            input: {
              environmentUri: values.environment.environmentUri,
              principalId: values.groupUri,
              principalType: 'Group'
            }
          })
        );
      }
      if (hit.resourceKind === 'table') {
        response = await client.mutate(
          createShareObject({
            datasetUri: hit.datasetUri,
            itemUri: hit._id,
            itemType: 'DatasetTable',
            input: {
              environmentUri: values.environment.environmentUri,
              principalId: values.groupUri,
              principalType: 'Group'
            }
          })
        );
      }
      if (hit.resourceKind === 'folder') {
        response = await client.mutate(
          createShareObject({
            datasetUri: hit.datasetUri,
            itemUri: hit._id,
            itemType: 'DatasetStorageLocation',
            input: {
              environmentUri: values.environment.environmentUri,
              principalId: values.groupUri,
              principalType: 'Group'
            }
          })
        );
      }
      if (hit.resourceKind === 'dashboard') {
        response = await client.mutate(
          requestDashboardShare(hit._id, values.groupUri)
        );
      }
      if (response && !response.errors) {
        setStatus({ success: true });
        setSubmitting(false);
        enqueueSnackbar('Request sent', {
          anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
          },
          variant: 'success'
        });
        if (onApply) {
          onApply();
        }
      } else {
        dispatch({ type: SET_ERROR, error: response.errors[0].message });
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
      dispatch({ type: SET_ERROR, error: err.message });
    }
  }

  if (!hit) {
    return null;
  }

  return (
    <Dialog maxWidth="md" fullWidth onClose={onClose} open={open} {...other}>
      <Box sx={{ p: 3 }}>
        <Typography
          align="center"
          color="textPrimary"
          gutterBottom
          variant="h4"
        >
          Request Access
        </Typography>
        <Typography align="center" color="textSecondary" variant="subtitle2">
          Your request will be submitted to the data owners
        </Typography>
        <Box sx={{ p: 3 }}>
          <Formik
            initialValues={{
              environment: '',
              comment: ''
            }}
            validationSchema={Yup.object().shape({
              environment: Yup.object().required('*Environment is required'),
              groupUri: Yup.string().required('*Team is required'),
              comment: Yup.string().max(5000)
            })}
            onSubmit={async (
              values,
              { setErrors, setStatus, setSubmitting }
            ) => {
              await submit(values, setStatus, setSubmitting, setErrors);
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box>
                  <CardContent>
                    {hit.resourceKind === 'table' && (
                      <TextField
                        fullWidth
                        disabled
                        label="Table name"
                        name="table"
                        value={hit.label}
                        variant="outlined"
                      />
                    )}
                    {hit.resourceKind === 'folder' && (
                      <TextField
                        fullWidth
                        disabled
                        label="Folder name"
                        name="folder"
                        value={hit.label}
                        variant="outlined"
                      />
                    )}
                    {hit.resourceKind === 'dataset' && (
                      <TextField
                        fullWidth
                        disabled
                        label="Dataset name"
                        name="dataset"
                        value={hit.label}
                        variant="outlined"
                      />
                    )}
                    {hit.resourceKind === 'dashboard' && (
                      <TextField
                        fullWidth
                        disabled
                        label="Dashboard name"
                        name="dashboard"
                        value={hit.label}
                        variant="outlined"
                      />
                    )}
                  </CardContent>
                  {hit.resourceKind !== 'dashboard' && (
                    <Box>
                      <CardContent>
                        <TextField
                          fullWidth
                          error={Boolean(
                            touched.environment && errors.environment
                          )}
                          helperText={touched.environment && errors.environment}
                          label="Environment"
                          name="environment"
                          onChange={(event) => {
                            setFieldValue('groupUri', '');
                            fetchGroups(
                              event.target.value.environmentUri
                            ).catch((e) =>
                              dispatch({ type: SET_ERROR, error: e.message })
                            );
                            setFieldValue('environment', event.target.value);
                          }}
                          select
                          value={values.environment}
                          variant="outlined"
                        >
                          {environmentOptions.map((environment) => (
                            <MenuItem
                              key={environment.environmentUri}
                              value={environment}
                            >
                              {environment.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </CardContent>
                      <CardContent>
                        {loadingGroups ? (
                          <CircularProgress size={10} />
                        ) : (
                          <Box>
                            {groupOptions.length > 0 ? (
                              <TextField
                                error={Boolean(
                                  touched.groupUri && errors.groupUri
                                )}
                                helperText={touched.groupUri && errors.groupUri}
                                fullWidth
                                label="Team"
                                name="groupUri"
                                onChange={handleChange}
                                select
                                value={values.groupUri}
                                variant="outlined"
                              >
                                {groupOptions.map((group) => (
                                  <MenuItem
                                    key={group.value}
                                    value={group.value}
                                  >
                                    {group.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              <TextField
                                error={Boolean(
                                  touched.groupUri && errors.groupUri
                                )}
                                helperText={touched.groupUri && errors.groupUri}
                                fullWidth
                                disabled
                                label="Team"
                                value="No teams found for this environment"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Box>
                  )}
                  <CardContent>
                    <TextField
                      FormHelperTextProps={{
                        sx: {
                          textAlign: 'right',
                          mr: 0
                        }
                      }}
                      fullWidth
                      helperText={`${
                        200 - values.comment.length
                      } characters left`}
                      label="Request purpose"
                      name="comment"
                      multiline
                      onBlur={handleBlur}
                      onChange={handleChange}
                      rows={5}
                      value={values.comment}
                      variant="outlined"
                    />
                    {touched.comment && errors.comment && (
                      <Box sx={{ mt: 2 }}>
                        <FormHelperText error>{errors.comment}</FormHelperText>
                      </Box>
                    )}
                  </CardContent>
                </Box>
                <CardContent>
                  <LoadingButton
                    fullWidth
                    startIcon={<SendIcon fontSize="small" />}
                    color="primary"
                    disabled={isSubmitting}
                    type="submit"
                    variant="contained"
                  >
                    Send Request
                  </LoadingButton>
                </CardContent>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
    </Dialog>
  );
};

RequestAccessModal.propTypes = {
  hit: PropTypes.object.isRequired,
  onApply: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  stopLoader: PropTypes.func
};

export default RequestAccessModal;
