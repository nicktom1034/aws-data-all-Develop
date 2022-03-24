import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { Autocomplete, Box, CardContent, Dialog, FormHelperText, TextField, Typography } from '@material-ui/core';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LoadingButton } from '@material-ui/lab';
import React from 'react';
import SendIcon from '@material-ui/icons/Send';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import useClient from '../../hooks/useClient';
import requestDashboardShare from '../../api/Dashboard/requestDashboardShare';
import useGroups from '../../hooks/useGroups';

const RequestDashboardAccessModal = (props) => {
  const { hit, onApply, onClose, open, stopLoader, ...other } = props;
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const client = useClient();
  const groups = useGroups();
  const idpGroupOptions = groups ? groups.map((g) => ({ value: g, label: g })) : [];

  async function submit(values, setStatus, setSubmitting, setErrors) {
    try {
      const response = await client.mutate(requestDashboardShare(hit._id, values.groupUri));
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

    <Dialog
      maxWidth="md"
      fullWidth
      onClose={onClose}
      open={open}
      {...other}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          align="center"
          color="textPrimary"
          gutterBottom
          variant="h4"
        >
          Request Access
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          variant="subtitle2"
        >
          Your request will be submitted to the data owners
        </Typography>
        <Box sx={{ p: 3 }}>
          <Formik
            initialValues={{
              environment: '',
              comment: ''
            }}
            validationSchema={Yup
              .object()
              .shape({
                groupUri: Yup.string().required('*Team is required'),
                comment: Yup.string().max(5000)
              })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
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
              <form
                onSubmit={handleSubmit}
              >
                <Box>
                  <CardContent>
                    <TextField
                      fullWidth
                      disabled
                      label="Dashboard name"
                      name="dashboard"
                      value={hit.label}
                      variant="outlined"
                    />
                  </CardContent>
                  <CardContent>
                    <Autocomplete
                      id="teams"
                      freeSolo
                      options={idpGroupOptions.map((option) => option.value)}
                      onChange={(event, value) => {
                        setFieldValue('groupUri', value);
                      }}
                      renderInput={(renderParams) => (
                        <TextField
                          {...renderParams}
                          error={Boolean(touched.groupUri && errors.groupUri)}
                          helperText={touched.groupUri && errors.groupUri}
                          label="Team"
                          margin="normal"
                          onChange={handleChange}
                          value={values.groupUri}
                          variant="outlined"
                        />
                      )}
                    />
                  </CardContent>
                  <CardContent>
                    <TextField
                      FormHelperTextProps={{
                        sx: {
                          textAlign: 'right',
                          mr: 0
                        }
                      }}
                      fullWidth
                      helperText={`${200 - values.comment.length} characters left`}
                      label="Request purpose"
                      name="comment"
                      multiline
                      onBlur={handleBlur}
                      onChange={handleChange}
                      rows={5}
                      value={values.comment}
                      variant="outlined"
                    />
                    {(touched.comment && errors.comment) && (
                    <Box sx={{ mt: 2 }}>
                      <FormHelperText error>
                        {errors.comment}
                      </FormHelperText>
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

RequestDashboardAccessModal.propTypes = {
  hit: PropTypes.object.isRequired,
  onApply: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  stopLoader: PropTypes.func
};

export default RequestDashboardAccessModal;
