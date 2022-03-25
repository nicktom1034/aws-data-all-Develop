import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import {
  Box,
  CardContent,
  CardHeader,
  Dialog,
  FormHelperText,
  Grid,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import React, { useEffect, useState } from 'react';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import useClient from '../../hooks/useClient';
import ChipInput from '../../components/TagsInput';
import listEnvironmentGroups from '../../api/Environment/listEnvironmentGroups';
import createNetwork from '../../api/Vpc/createNetwork';
import * as Defaults from '../../components/defaults';

const NetworkCreateModal = (props) => {
  const { environment, onApply, onClose, open, reloadNetworks, ...other } =
    props;
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const client = useClient();
  const [groupOptions, setGroupOptions] = useState([]);

  const fetchGroups = async () => {
    try {
      const response = await client.query(
        listEnvironmentGroups({
          filter: Defaults.SelectListFilter,
          environmentUri: environment.environmentUri
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
    }
  };

  async function submit(values, setStatus, setSubmitting, setErrors) {
    try {
      const response = await client.mutate(
        createNetwork({
          environmentUri: environment.environmentUri,
          tags: values.tags,
          description: values.description,
          label: values.label,
          vpcId: values.vpcId,
          SamlGroupName: values.SamlGroupName,
          privateSubnetIds: values.privateSubnetIds,
          publicSubnetIds: values.publicSubnetIds
        })
      );
      if (!response.errors) {
        setStatus({ success: true });
        setSubmitting(false);
        enqueueSnackbar('Network added', {
          anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
          },
          variant: 'success'
        });
        if (reloadNetworks) {
          reloadNetworks();
        }
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

  useEffect(() => {
    if (client) {
      fetchGroups().catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
    }
  }, [client]);

  if (!environment) {
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
          Create a new network configuration
        </Typography>
        <Typography align="center" color="textSecondary" variant="subtitle2">
          Networks are VPC and subnets information required for AWS resources
          created under a VPC.
        </Typography>
        <Box sx={{ p: 3 }}>
          <Formik
            initialValues={{
              label: '',
              vpcId: '',
              SamlGroupName: '',
              privateSubnetIds: [],
              publicSubnetIds: [],
              tags: []
            }}
            validationSchema={Yup.object().shape({
              label: Yup.string().max(255).required('*VPC name is required'),
              vpcId: Yup.string().max(255).required('*VPC ID is required'),
              SamlGroupName: Yup.string()
                .max(255)
                .required('*Team is required'),
              privateSubnetIds: Yup.array().nullable(),
              publicSubnetIds: Yup.array().nullable(),
              tags: Yup.array().nullable()
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
                <Grid container spacing={3}>
                  <Grid item lg={8} md={6} xs={12}>
                    <Box>
                      <CardHeader title="Details" />
                      <CardContent>
                        <TextField
                          error={Boolean(touched.label && errors.label)}
                          fullWidth
                          helperText={touched.label && errors.label}
                          label="VPC name"
                          name="label"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.label}
                          variant="outlined"
                        />
                      </CardContent>
                      <CardContent>
                        <TextField
                          error={Boolean(touched.vpcId && errors.vpcId)}
                          fullWidth
                          helperText={touched.vpcId && errors.vpcId}
                          label="VPC ID"
                          name="vpcId"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values.vpcId}
                          variant="outlined"
                        />
                      </CardContent>
                      <CardContent>
                        <ChipInput
                          fullWidth
                          defaultValue={values.publicSubnetIds}
                          error={Boolean(
                            touched.publicSubnetIds && errors.publicSubnetIds
                          )}
                          helperText={
                            touched.publicSubnetIds && errors.publicSubnetIds
                          }
                          variant="outlined"
                          label="Public subnets"
                          placeholder="Hit enter after typing value"
                          onChange={(chip) => {
                            setFieldValue('publicSubnetIds', [...chip]);
                          }}
                        />
                      </CardContent>
                      <CardContent>
                        <ChipInput
                          fullWidth
                          defaultValue={values.privateSubnetIds}
                          error={Boolean(
                            touched.privateSubnetIds && errors.privateSubnetIds
                          )}
                          helperText={
                            touched.privateSubnetIds && errors.privateSubnetIds
                          }
                          variant="outlined"
                          label="Private subnets"
                          placeholder="Hit enter after typing value"
                          onChange={(chip) => {
                            setFieldValue('privateSubnetIds', [...chip]);
                          }}
                        />
                      </CardContent>
                    </Box>
                  </Grid>
                  <Grid item lg={4} md={6} xs={12}>
                    <Box>
                      <CardHeader title="Organize" />
                      <CardContent>
                        <TextField
                          fullWidth
                          error={Boolean(
                            touched.SamlGroupName && errors.SamlGroupName
                          )}
                          helperText={
                            touched.SamlGroupName && errors.SamlGroupName
                          }
                          label="Team"
                          name="SamlGroupName"
                          onChange={handleChange}
                          select
                          value={values.SamlGroupName}
                          variant="outlined"
                        >
                          {groupOptions.map((group) => (
                            <MenuItem key={group.value} value={group.value}>
                              {group.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </CardContent>
                      <CardContent>
                        <ChipInput
                          error={Boolean(touched.tags && errors.tags)}
                          fullWidth
                          helperText={touched.tags && errors.tags}
                          variant="outlined"
                          label="Tags"
                          placeholder="Hit enter after typing value"
                          onChange={(chip) => {
                            setFieldValue('tags', [...chip]);
                          }}
                        />
                      </CardContent>
                    </Box>
                    {errors.submit && (
                      <Box sx={{ mt: 3 }}>
                        <FormHelperText error>{errors.submit}</FormHelperText>
                      </Box>
                    )}
                    <CardContent>
                      <LoadingButton
                        color="primary"
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                      >
                        Create
                      </LoadingButton>
                    </CardContent>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </Box>
    </Dialog>
  );
};

NetworkCreateModal.propTypes = {
  environment: PropTypes.object.isRequired,
  onApply: PropTypes.func,
  onClose: PropTypes.func,
  reloadNetworks: PropTypes.func,
  open: PropTypes.bool.isRequired
};

export default NetworkCreateModal;
