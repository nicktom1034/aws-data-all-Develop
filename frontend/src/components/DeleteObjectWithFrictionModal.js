import PropTypes from 'prop-types';
import {
  Box,
  Button,
  CardContent,
  Dialog,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

const DeleteObjectWithFrictionModal = (props) => {
  const {
    objectName,
    deleteMessage,
    onApply,
    onClose,
    open,
    deleteFunction,
    isAWSResource = true,
    ...other
  } = props;
  const [confirmValue, setConfirmValue] = useState(null);
  const [deleteFromAWS, setDeleteFromAWS] = useState(false);
  const handleChange = (event) => {
    setConfirmValue(event.target.value);
  };
  return (
    <Dialog maxWidth="sm" fullWidth onClose={onClose} open={open} {...other}>
      <Box sx={{ p: 3 }}>
        <Typography
          align="center"
          color="textPrimary"
          gutterBottom
          variant="h4"
        >
          Delete {objectName} ?
        </Typography>

        {deleteMessage && <Box sx={{ mt: 1 }}>{deleteMessage}</Box>}
        {isAWSResource && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <FormGroup>
              <FormControlLabel
                color="primary"
                control={
                  <Switch
                    color="primary"
                    onChange={() => {
                      setDeleteFromAWS(!deleteFromAWS);
                    }}
                    edge="start"
                    name="deleteFromAWS"
                  />
                }
                label="Delete associated AWS CloudFormation stack"
                labelPlacement="end"
                value={deleteFromAWS}
              />
            </FormGroup>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography align="center" variant="subtitle2" color="textSecondary">
            To confirm deletion, type <i>permanently delete</i> in the text
            input field.
          </Typography>
          <CardContent>
            <TextField
              fullWidth
              label="permanently delete"
              name="confirm"
              onChange={handleChange}
              value={confirmValue}
              variant="outlined"
            />
          </CardContent>
          <CardContent>
            <Button
              fullWidth
              disabled={confirmValue !== 'permanently delete'}
              startIcon={<FaTrash size={15} />}
              color="error"
              type="submit"
              variant="contained"
              onClick={() => {
                deleteFunction(deleteFromAWS);
              }}
            >
              Delete
            </Button>
          </CardContent>
        </Box>
      </Box>
    </Dialog>
  );
};

DeleteObjectWithFrictionModal.propTypes = {
  objectName: PropTypes.string.isRequired,
  deleteMessage: PropTypes.string,
  onApply: PropTypes.func,
  onClose: PropTypes.func,
  deleteFunction: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  isAWSResource: PropTypes.bool
};

export default DeleteObjectWithFrictionModal;
